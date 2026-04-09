import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { productsAPI, ordersAPI, messagesAPI, usersAPI } from "../api/api"
import {
  ROLES, PERMISSIONS, ROLE_META, ROLE_PERMISSIONS,
} from "../rbac/permissions"

const salesData = [
  { month: "Jan", sales: 12000 }, { month: "Feb", sales: 19000 },
  { month: "Mar", sales: 15000 }, { month: "Apr", sales: 28000 },
  { month: "May", sales: 22000 }, { month: "Jun", sales: 35000 },
]

const statusColor = { Delivered: "#16a34a", Shipped: "#2563eb", Pending: "#d97706", Cancelled: "#dc2626" }
const statusBg    = { Delivered: "#f0fdf4", Shipped: "#eff6ff", Pending: "#fffbeb", Cancelled: "#fef2f2" }

const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.sales))
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "120px", padding: "0 8px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.65rem", color: "#9ca3af" }}>₹{(d.sales/1000).toFixed(0)}k</span>
          <div style={{ width: "100%", background: "linear-gradient(to top, #111, #555)", borderRadius: "4px 4px 0 0", height: `${(d.sales/max)*80}px` }} />
          <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{d.month}</span>
        </div>
      ))}
    </div>
  )
}

const AdminDashboard = () => {
  const { user, logout, createUser, updateUserRole, deleteUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState("dashboard")
  const [products, setProducts] = useState([])
  const [orders, setOrders]     = useState([])
  const [messages, setMessages] = useState([])
  const [users, setUsers]       = useState([])
  const [toast, setToast]       = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)

  // Product form
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct]   = useState(null)
  const [productForm, setProductForm] = useState({ name: "", price: "", category: "Electronics", stock: "" })

  // User form
  const [showUserForm, setShowUserForm]   = useState(false)
  const [userForm, setUserForm]           = useState({ name: "", email: "", password: "", role: ROLES.USER })
  const [userFormError, setUserFormError] = useState("")
  const [previewRole, setPreviewRole]     = useState(null)

  // Contact inbox
  const [selectedMsg, setSelectedMsg] = useState(null)
  const [replyText, setReplyText]     = useState("")
  const [msgFilter, setMsgFilter]     = useState("All")

  // Contact settings
  const [contactSettings, setContactSettings] = useState({
    supportEmail: "support@shoplux.edu",
    supportPhone: "+91 98765 43210",
    address:      "CS Dept, ABC College, Bengaluru, Karnataka 560001",
    workingHours: "Mon–Sat, 9 AM – 6 PM IST",
    autoReply:    true,
    notifyAdmin:  true,
    autoReplyMsg: "Thank you for contacting ShopLux! We will get back to you within 24 hours.",
  })

  // ── Load all data from MongoDB on mount ───────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true)
        const [p, o, m, u] = await Promise.all([
          productsAPI.getAll(),
          ordersAPI.getAll(),
          messagesAPI.getAll(),
          usersAPI.getAll(),
        ])
        if (p.success) setProducts(p.products)
        if (o.success) setOrders(o.orders)
        if (m.success) setMessages(m.messages)
        if (u.success) setUsers(u.users)
      } catch (err) {
        showToast("Failed to load data", "error")
      } finally {
        setDataLoading(false)
      }
    }
    loadData()
  }, [])

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // ── Product CRUD ──────────────────────────────────────────────
  const handleProductSubmit = async () => {
    if (!productForm.name || !productForm.price || !productForm.stock) return
    try {
      if (editingProduct) {
        const res = await productsAPI.update(editingProduct._id, {
          ...productForm, price: +productForm.price, stock: +productForm.stock
        })
        if (res.success) {
          setProducts(prev => prev.map(p => p._id === editingProduct._id ? res.product : p))
          showToast("Product updated!")
        }
      } else {
        const res = await productsAPI.create({
          ...productForm, price: +productForm.price, stock: +productForm.stock
        })
        if (res.success) {
          setProducts(prev => [...prev, res.product])
          showToast("Product added!")
        }
      }
      setShowProductForm(false)
      setEditingProduct(null)
      setProductForm({ name: "", price: "", category: "Electronics", stock: "" })
    } catch (err) {
      showToast("Failed to save product", "error")
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return
    try {
      await productsAPI.delete(id)
      setProducts(prev => prev.filter(p => p._id !== id))
      showToast("Product deleted!", "error")
    } catch (err) {
      showToast("Failed to delete product", "error")
    }
  }

  // ── User Management ───────────────────────────────────────────
  const handleCreateUser = async () => {
    setUserFormError("")
    if (!userForm.name || !userForm.email || !userForm.password) {
      setUserFormError("All fields are required.")
      return
    }
    try {
      const result = await createUser(userForm)
      if (!result.success) { setUserFormError(result.message); return }
      setUsers(prev => [...prev, result.user])
      showToast(`User "${userForm.name}" created!`)
      setShowUserForm(false)
      setUserForm({ name: "", email: "", password: "", role: ROLES.USER })
    } catch (err) {
      setUserFormError("Failed to create user")
    }
  }

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role)
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u))
      showToast("Role updated!")
    } catch (err) {
      showToast("Failed to update role", "error")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return
    try {
      await deleteUser(userId)
      setUsers(prev => prev.filter(u => u._id !== userId))
      showToast("User deleted!", "error")
    } catch (err) {
      showToast("Failed to delete user", "error")
    }
  }

  // ── Orders ────────────────────────────────────────────────────
  const handleStatusChange = async (id, status) => {
    try {
      const res = await ordersAPI.updateStatus(id, status)
      if (res.success) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o))
        showToast("Status updated!")
      }
    } catch (err) {
      showToast("Failed to update status", "error")
    }
  }

  // ── Contact Inbox ─────────────────────────────────────────────
  const handleMarkRead = async (id) => {
    try {
      await messagesAPI.markRead(id)
      setMessages(prev => prev.map(m => m._id === id ? { ...m, status: "Read" } : m))
    } catch (err) {}
  }

  const handleDeleteMsg = async (id) => {
    if (!window.confirm("Delete this message?")) return
    try {
      await messagesAPI.delete(id)
      setMessages(prev => prev.filter(m => m._id !== id))
      if (selectedMsg?._id === id) setSelectedMsg(null)
      showToast("Message deleted!", "error")
    } catch (err) {
      showToast("Failed to delete message", "error")
    }
  }

  const handleReply = async () => {
    if (!replyText.trim()) return
    try {
      await messagesAPI.reply(selectedMsg._id, replyText)
      setMessages(prev => prev.map(m => m._id === selectedMsg._id ? { ...m, replied: true, status: "Read" } : m))
      setSelectedMsg(prev => ({ ...prev, replied: true }))
      setReplyText("")
      showToast("Reply sent! 📧")
    } catch (err) {
      showToast("Failed to send reply", "error")
    }
  }

  const filteredMsgs = messages.filter(m =>
    msgFilter === "All" ? true :
    msgFilter === "Unread" ? m.status === "Unread" :
    msgFilter === "Replied" ? m.replied : !m.replied
  )
  const unreadCount  = messages.filter(m => m.status === "Unread").length
  const totalRevenue = orders.filter(o => o.status === "Delivered").reduce((s, o) => s + o.amount, 0)

  const navItems = [
    { key: "dashboard", label: "Dashboard",       icon: "📊" },
    { key: "products",  label: "Products",         icon: "📦" },
    { key: "users",     label: "Users & Roles",    icon: "👥" },
    { key: "orders",    label: "Orders",           icon: "🛒" },
    { key: "analytics", label: "Analytics",        icon: "📈" },
    { key: "inbox",     label: "Contact Inbox",    icon: "📬", badge: unreadCount },
    { key: "contact",   label: "Contact Settings", icon: "⚙️" },
    { key: "rbac",      label: "RBAC Config",      icon: "🔐" },
  ]

  if (dataLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif", fontSize: "1.1rem", color: "#6b7280" }}>
      ⏳ Loading dashboard...
    </div>
  )

  return (
    <div style={s.root}>
      {toast && <div style={{ ...s.toast, background: toast.type === "error" ? "#dc2626" : "#16a34a" }}>{toast.msg}</div>}

      {/* ── Sidebar ── */}
      <aside style={{ ...s.sidebar, width: sidebarOpen ? "240px" : "64px" }}>
        <div style={s.sidebarHeader}>
          {sidebarOpen && <span style={s.sidebarTitle}>⚡ Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={s.toggleBtn}>{sidebarOpen ? "◀" : "▶"}</button>
        </div>

        <nav style={s.nav}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActiveSection(item.key)}
              style={activeSection === item.key ? { ...s.navItem, ...s.navActive } : s.navItem} title={item.label}>
              <span style={s.navIcon}>{item.icon}</span>
              {sidebarOpen && <span style={{ flex: 1 }}>{item.label}</span>}
              {sidebarOpen && item.badge > 0 && <span style={s.navBadge}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        {/* Logout at bottom of sidebar */}
        <div style={s.sidebarFooter}>
          {sidebarOpen && user && (
            <div style={s.userInfo}>
              <div style={s.userAvatar}>{user.name?.[0]?.toUpperCase() || "A"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={s.userName}>{user.name || "Admin"}</p>
                <p style={s.userEmail}>{user.email}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={sidebarOpen ? s.logoutBtn : s.logoutBtnCollapsed} title="Logout">
            <span style={{ fontSize: "1rem" }}>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={s.main}>
        <div style={s.topbar}>
          <h2 style={s.pageTitle}>{navItems.find(n => n.key === activeSection)?.icon} {navItems.find(n => n.key === activeSection)?.label}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={s.adminBadge}>Admin Panel</span>
            <button onClick={handleLogout} style={s.topbarLogoutBtn}>🚪 Logout</button>
          </div>
        </div>

        {/* ────────── DASHBOARD ────────── */}
        {activeSection === "dashboard" && (
          <div style={s.content}>
            <div style={s.statsGrid}>
              {[
                { label: "Products", value: products.length,                     icon: "📦", color: "#eff6ff" },
                { label: "Users",    value: users.length,                         icon: "👥", color: "#f0fdf4" },
                { label: "Orders",   value: orders.length,                        icon: "🛒", color: "#fffbeb" },
                { label: "Revenue",  value: `₹${totalRevenue.toLocaleString()}`,  icon: "💰", color: "#fdf4ff" },
                { label: "Messages", value: messages.length,                      icon: "📬", color: "#fff7ed" },
                { label: "Unread",   value: unreadCount,                          icon: "🔴", color: "#fef2f2" },
              ].map((stat, i) => (
                <div key={i} style={{ ...s.statCard, background: stat.color }}>
                  <span style={s.statIcon}>{stat.icon}</span>
                  <div><p style={s.statValue}>{stat.value}</p><p style={s.statLabel}>{stat.label}</p></div>
                </div>
              ))}
            </div>
            <div style={s.dashGrid}>
              <div style={s.card}>
                <h3 style={s.cardTitle}>Recent Orders</h3>
                {orders.slice(0,4).map(o => (
                  <div key={o._id} style={s.orderRow}>
                    <span style={s.orderId}>{o._id?.slice(-6).toUpperCase()}</span>
                    <span style={s.orderCustomer}>{o.customer}</span>
                    <span style={{ ...s.pill, color: statusColor[o.status], background: statusBg[o.status] }}>{o.status}</span>
                  </div>
                ))}
              </div>
              <div style={s.card}><h3 style={s.cardTitle}>Monthly Sales</h3><BarChart data={salesData} /></div>
            </div>
            <div style={{ ...s.card, marginTop: "16px" }}>
              <h3 style={s.cardTitle}>Recent Messages</h3>
              {messages.slice(0,3).map(m => (
                <div key={m._id} style={s.msgPreviewRow} onClick={() => { setActiveSection("inbox"); setSelectedMsg(m); handleMarkRead(m._id) }}>
                  <div style={{ ...s.msgAvatar, background: m.status === "Unread" ? "#e11d48" : "#9ca3af" }}>{m.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: m.status === "Unread" ? "700" : "500", fontSize: "0.9rem" }}>{m.name}</span>
                      <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "400px" }}>{m.subject}</p>
                  </div>
                  {m.status === "Unread" && <span style={s.unreadDot} />}
                </div>
              ))}
              <button onClick={() => setActiveSection("inbox")} style={s.viewAllBtn}>View All Messages →</button>
            </div>
          </div>
        )}

        {/* ────────── PRODUCTS ────────── */}
        {activeSection === "products" && (
          <div style={s.content}>
            <div style={s.sectionHeader}>
              <p style={s.count}>{products.length} products</p>
              <button onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ name:"", price:"", category:"Electronics", stock:"" }) }} style={s.addBtn}>+ Add Product</button>
            </div>
            {showProductForm && (
              <div style={s.modal}>
                <div style={s.modalBox}>
                  <h3 style={s.modalTitle}>{editingProduct ? "Edit Product" : "Add Product"}</h3>
                  {[
                    { label:"Name",  key:"name",  type:"text",   placeholder:"e.g. Laptop" },
                    { label:"Price", key:"price", type:"number", placeholder:"e.g. 50000" },
                    { label:"Stock", key:"stock", type:"number", placeholder:"e.g. 10" },
                  ].map(f => (
                    <div key={f.key} style={s.formGroup}>
                      <label style={s.label}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} value={productForm[f.key]}
                        onChange={e => setProductForm(p => ({ ...p, [f.key]: e.target.value }))} style={s.input} />
                    </div>
                  ))}
                  <div style={s.formGroup}>
                    <label style={s.label}>Category</label>
                    <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} style={s.input}>
                      <option>Electronics</option><option>Accessories</option><option>Clothing</option>
                    </select>
                  </div>
                  <div style={s.modalBtns}>
                    <button onClick={() => setShowProductForm(false)} style={s.cancelBtn}>Cancel</button>
                    <button onClick={handleProductSubmit} style={s.saveBtn}>{editingProduct ? "Update" : "Add"}</button>
                  </div>
                </div>
              </div>
            )}
            <div style={s.card}>
              <table style={s.table}>
                <thead><tr style={s.thead}>{["Name","Category","Price","Stock","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} style={s.tr}>
                      <td style={s.td}><strong>{p.name}</strong></td>
                      <td style={s.td}><span style={s.catTag}>{p.category}</span></td>
                      <td style={s.td}>₹{p.price.toLocaleString()}</td>
                      <td style={s.td}><span style={{ color: p.stock<10?"#dc2626":"#16a34a", fontWeight:"600" }}>{p.stock}{p.stock<10&&" ⚠️"}</span></td>
                      <td style={s.td}>
                        <button onClick={() => { setEditingProduct(p); setProductForm({ name:p.name, price:p.price, category:p.category, stock:p.stock }); setShowProductForm(true) }} style={s.editBtn}>✏️ Edit</button>
                        <button onClick={() => handleDeleteProduct(p._id)} style={s.deleteBtn}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────────── USERS ────────── */}
        {activeSection === "users" && (
          <div style={s.content}>
            <div style={s.sectionHeader}>
              <p style={s.count}>{users.length} users</p>
              <button onClick={() => setShowUserForm(true)} style={s.addBtn}>+ Create User</button>
            </div>
            {showUserForm && (
              <div style={s.modal}>
                <div style={s.modalBox}>
                  <h3 style={s.modalTitle}>Create New User</h3>
                  {userFormError && <div style={s.errorBox}>{userFormError}</div>}
                  {[
                    { label:"Full Name", key:"name",     type:"text",     placeholder:"John Doe" },
                    { label:"Email",     key:"email",    type:"email",    placeholder:"john@example.com" },
                    { label:"Password",  key:"password", type:"password", placeholder:"Min. 6 characters" },
                  ].map(f => (
                    <div key={f.key} style={s.formGroup}>
                      <label style={s.label}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} value={userForm[f.key]}
                        onChange={e => setUserForm(p => ({ ...p, [f.key]: e.target.value }))} style={s.input} />
                    </div>
                  ))}
                  <div style={s.formGroup}>
                    <label style={s.label}>Assign Role</label>
                    <div style={s.roleCards}>
                      {Object.values(ROLES).map(role => {
                        const meta = ROLE_META[role]
                        return (
                          <div key={role} onClick={() => setUserForm(p => ({ ...p, role }))}
                            style={userForm.role === role ? { ...s.roleCard, ...s.roleCardActive, borderColor: meta.color } : s.roleCard}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                              <span style={{ ...s.roleBadge, color:meta.color, background:meta.bg }}>{meta.label}</span>
                              {userForm.role === role && <span style={{ color:meta.color }}>✓</span>}
                            </div>
                            <p style={s.roleDesc}>{meta.description}</p>
                            <button onClick={e => { e.stopPropagation(); setPreviewRole(previewRole===role?null:role) }} style={s.previewBtn}>
                              {previewRole===role ? "Hide ▲" : "View permissions ▼"}
                            </button>
                            {previewRole===role && (
                              <div style={s.permList}>
                                {ROLE_PERMISSIONS[role].map(p => <span key={p} style={s.permTag}>✓ {p.replace(/_/g," ")}</span>)}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div style={s.modalBtns}>
                    <button onClick={() => { setShowUserForm(false); setUserFormError("") }} style={s.cancelBtn}>Cancel</button>
                    <button onClick={handleCreateUser} style={s.saveBtn}>Create User</button>
                  </div>
                </div>
              </div>
            )}
            <div style={s.card}>
              <table style={s.table}>
                <thead><tr style={s.thead}>{["Name","Email","Role","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {users.map(u => {
                    const meta = ROLE_META[u.role] || {}
                    return (
                      <tr key={u._id} style={s.tr}>
                        <td style={s.td}>
                          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                            <div style={{ ...s.miniAvatar, background:meta.color||"#111" }}>{(u.name||u.email)[0].toUpperCase()}</div>
                            <strong>{u.name||"—"}</strong>
                          </div>
                        </td>
                        <td style={s.td}>{u.email}</td>
                        <td style={s.td}>
                          <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                            style={{ ...s.roleBadge, color:meta.color, background:meta.bg, border:"none", cursor:"pointer", padding:"4px 10px" }}>
                            {Object.values(ROLES).map(r => <option key={r} value={r}>{ROLE_META[r]?.label||r}</option>)}
                          </select>
                        </td>
                        <td style={s.td}><button onClick={() => handleDeleteUser(u._id)} style={s.deleteBtn}>🗑️ Delete</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────────── ORDERS ────────── */}
        {activeSection === "orders" && (
          <div style={s.content}>
            <p style={s.count}>{orders.length} orders</p>
            <div style={s.card}>
              <table style={s.table}>
                <thead><tr style={s.thead}>{["Order ID","Customer","Product","Amount","Date","Status"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id} style={s.tr}>
                      <td style={s.td}><strong>#{o._id?.slice(-6).toUpperCase()}</strong></td>
                      <td style={s.td}>{o.customer}</td>
                      <td style={s.td}>{o.product}</td>
                      <td style={s.td}>₹{o.amount.toLocaleString()}</td>
                      <td style={s.td}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td style={s.td}>
                        <select value={o.status} onChange={e => handleStatusChange(o._id, e.target.value)}
                          style={{ color:statusColor[o.status], background:statusBg[o.status], border:"none", borderRadius:"20px", padding:"4px 10px", fontWeight:"600", cursor:"pointer", fontSize:"0.8rem" }}>
                          {["Pending","Shipped","Delivered","Cancelled"].map(st=><option key={st}>{st}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────────── ANALYTICS ────────── */}
        {activeSection === "analytics" && (
          <div style={s.content}>
            <div style={s.statsGrid}>
              {[
                { label:"Total Revenue", value:`₹${orders.reduce((s,o)=>s+o.amount,0).toLocaleString()}`, icon:"💰", color:"#f0fdf4" },
                { label:"Delivered",     value:orders.filter(o=>o.status==="Delivered").length, icon:"✅", color:"#eff6ff" },
                { label:"Pending",       value:orders.filter(o=>o.status==="Pending").length,   icon:"⏳", color:"#fffbeb" },
                { label:"Cancelled",     value:orders.filter(o=>o.status==="Cancelled").length, icon:"❌", color:"#fef2f2" },
              ].map((stat,i) => (
                <div key={i} style={{ ...s.statCard, background:stat.color }}>
                  <span style={s.statIcon}>{stat.icon}</span>
                  <div><p style={s.statValue}>{stat.value}</p><p style={s.statLabel}>{stat.label}</p></div>
                </div>
              ))}
            </div>
            <div style={s.dashGrid}>
              <div style={s.card}><h3 style={s.cardTitle}>Monthly Sales</h3><BarChart data={salesData} /></div>
              <div style={s.card}>
                <h3 style={s.cardTitle}>Top Products</h3>
                {[...products].sort((a,b)=>b.price-a.price).slice(0,5).map((p,i) => (
                  <div key={p._id} style={s.orderRow}>
                    <span style={{ fontWeight:"bold", color:"#9ca3af", width:"24px" }}>#{i+1}</span>
                    <span style={{flex:1}}>{p.name}</span>
                    <div style={{flex:2,margin:"0 12px"}}><div style={{background:"#f3f4f6",borderRadius:"4px",height:"8px"}}><div style={{background:"#111",borderRadius:"4px",height:"8px",width:`${(p.price/50000)*100}%`}} /></div></div>
                    <span style={{fontWeight:"bold",fontSize:"0.85rem"}}>₹{p.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ────────── INBOX ────────── */}
        {activeSection === "inbox" && (
          <div style={s.content}>
            <div style={s.inboxLayout}>
              <div style={s.inboxList}>
                <div style={s.inboxFilters}>
                  {["All","Unread","Replied","Pending"].map(f => (
                    <button key={f} onClick={() => setMsgFilter(f)}
                      style={msgFilter===f ? {...s.filterBtn,...s.filterActive} : s.filterBtn}>
                      {f} {f==="Unread" && unreadCount>0 && <span style={s.filterBadge}>{unreadCount}</span>}
                    </button>
                  ))}
                </div>
                <p style={s.inboxCount}>{filteredMsgs.length} message{filteredMsgs.length!==1?"s":""}</p>
                {filteredMsgs.length===0 && <p style={s.emptyInbox}>📭 No messages</p>}
                {filteredMsgs.map(m => (
                  <div key={m._id} onClick={() => { setSelectedMsg(m); handleMarkRead(m._id) }}
                    style={selectedMsg?._id===m._id ? {...s.msgCard,...s.msgCardActive} : s.msgCard}>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
                      <div style={{ ...s.msgAvatar, background:m.status==="Unread"?"#e11d48":"#9ca3af", flexShrink:0 }}>{m.name[0]}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", justifyContent:"space-between" }}>
                          <span style={{ fontWeight:m.status==="Unread"?"700":"600", fontSize:"0.88rem" }}>{m.name}</span>
                          <span style={{ fontSize:"0.72rem", color:"#9ca3af" }}>{new Date(m.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin:0, fontSize:"0.78rem", color:"#6b7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.subject}</p>
                      </div>
                      {m.status==="Unread" && <span style={s.unreadDot}/>}
                    </div>
                    {m.replied && <span style={s.repliedTag}>✓ Replied</span>}
                  </div>
                ))}
              </div>
              <div style={s.msgDetail}>
                {!selectedMsg ? (
                  <div style={s.noMsgSelected}><p style={{fontSize:"3rem"}}>📬</p><p style={{color:"#9ca3af"}}>Select a message to view</p></div>
                ) : (
                  <>
                    <div style={s.msgDetailHeader}>
                      <div style={{...s.msgAvatarLg, background:"#1a1a2e"}}>{selectedMsg.name[0]}</div>
                      <div style={{flex:1}}>
                        <h3 style={{margin:"0 0 2px",fontSize:"1.1rem",fontWeight:"800"}}>{selectedMsg.name}</h3>
                        <p style={{margin:0,fontSize:"0.82rem",color:"#6b7280"}}>{selectedMsg.email}{selectedMsg.phone&&` · ${selectedMsg.phone}`}</p>
                      </div>
                      <button onClick={() => handleDeleteMsg(selectedMsg._id)} style={s.deleteBtn}>🗑️ Delete</button>
                    </div>
                    <div style={s.msgMeta}>
                      <span style={s.subjectTag}>{selectedMsg.subject}</span>
                      <span style={{...s.pill, color:selectedMsg.status==="Unread"?"#dc2626":"#16a34a", background:selectedMsg.status==="Unread"?"#fef2f2":"#f0fdf4"}}>{selectedMsg.status}</span>
                    </div>
                    <div style={s.msgBody}>{selectedMsg.message}</div>
                    <div style={s.replyBox}>
                      <h4 style={s.replyTitle}>📧 Reply to {selectedMsg.name}</h4>
                      <div style={s.replyTo}>To: <strong>{selectedMsg.email}</strong></div>
                      <textarea placeholder="Type your reply..." value={replyText} onChange={e=>setReplyText(e.target.value)} style={s.replyTextarea}/>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:"0.8rem",color:"#9ca3af"}}>{selectedMsg.replied?"✅ Already replied":"Reply will be sent via email"}</span>
                        <button onClick={handleReply} style={s.sendBtn} disabled={!replyText.trim()}>Send Reply ✉️</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ────────── CONTACT SETTINGS ────────── */}
        {activeSection === "contact" && (
          <div style={s.content}>
            <div style={s.settingsGrid}>
              <div style={s.card}>
                <h3 style={s.cardTitle}>📋 Contact Information</h3>
                {[
                  { label:"Support Email", key:"supportEmail", type:"email", icon:"📧" },
                  { label:"Support Phone", key:"supportPhone", type:"text",  icon:"📞" },
                  { label:"Address",       key:"address",      type:"text",  icon:"📍" },
                  { label:"Working Hours", key:"workingHours", type:"text",  icon:"🕐" },
                ].map(f => (
                  <div key={f.key} style={s.settingField}>
                    <label style={s.label}>{f.icon} {f.label}</label>
                    <input type={f.type} value={contactSettings[f.key]}
                      onChange={e => setContactSettings(prev => ({...prev,[f.key]:e.target.value}))} style={s.input}/>
                  </div>
                ))}
                <button onClick={() => showToast("Contact info saved!")} style={s.saveBtn}>Save Changes ✓</button>
              </div>
              <div style={s.card}>
                <h3 style={s.cardTitle}>📧 Email Settings</h3>
                {[
                  { key:"autoReply",   label:"Auto-Reply to User",  sub:"Send thank-you email after form submission" },
                  { key:"notifyAdmin", label:"Notify Admin",         sub:"Email admin when new message arrives" },
                ].map(t => (
                  <div key={t.key} style={s.toggleRow}>
                    <div><p style={s.toggleLabel}>{t.label}</p><p style={s.toggleSub}>{t.sub}</p></div>
                    <div onClick={() => setContactSettings(prev=>({...prev,[t.key]:!prev[t.key]}))}
                      style={{...s.toggle, background:contactSettings[t.key]?"#16a34a":"#d1d5db"}}>
                      <div style={{...s.toggleThumb, transform:contactSettings[t.key]?"translateX(22px)":"translateX(2px)"}}/>
                    </div>
                  </div>
                ))}
                <button onClick={() => showToast("Settings saved!")} style={{...s.saveBtn, marginTop:"16px"}}>Save Settings ✓</button>
              </div>
            </div>
          </div>
        )}

        {/* ────────── RBAC ────────── */}
        {activeSection === "rbac" && (
          <div style={s.content}>
            <h3 style={{fontSize:"1.3rem",fontWeight:"bold",color:"#111",margin:"0 0 20px"}}>🔐 Role-Based Access Control</h3>
            <div style={s.rbacGrid}>
              {Object.values(ROLES).map(role => {
                const meta = ROLE_META[role]
                const perms = ROLE_PERMISSIONS[role]
                const all = Object.values(PERMISSIONS)
                return (
                  <div key={role} style={s.rbacCard}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                      <span style={{...s.roleBadge,color:meta.color,background:meta.bg,fontSize:"0.9rem",padding:"5px 14px"}}>{meta.label}</span>
                      <span style={s.permCount}>{perms.length}/{all.length} perms</span>
                    </div>
                    <p style={s.roleDesc}>{meta.description}</p>
                    <div style={{display:"flex",flexDirection:"column",gap:"5px",marginTop:"12px"}}>
                      {all.map(p => {
                        const allowed = perms.includes(p)
                        return (
                          <div key={p} style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"0.78rem",opacity:allowed?1:0.3}}>
                            <span style={{color:allowed?"#16a34a":"#dc2626",fontWeight:"bold"}}>{allowed?"✓":"✗"}</span>
                            <span style={{color:"#374151",textTransform:"capitalize"}}>{p.replace(/_/g," ")}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const s = {
  root:{ display:"flex", minHeight:"100vh", background:"#f8fafc", fontFamily:"sans-serif" },
  toast:{ position:"fixed", top:"20px", right:"20px", color:"#fff", padding:"12px 24px", borderRadius:"10px", zIndex:9999, fontWeight:"600", boxShadow:"0 4px 20px rgba(0,0,0,0.2)" },
  sidebar:{ background:"#111", color:"#fff", display:"flex", flexDirection:"column", transition:"width 0.2s", minHeight:"100vh", flexShrink:0, overflow:"hidden" },
  sidebarHeader:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 16px", borderBottom:"1px solid #333" },
  sidebarTitle:{ fontWeight:"bold", fontSize:"1.1rem" },
  toggleBtn:{ background:"none", border:"none", color:"#fff", cursor:"pointer", fontSize:"0.8rem" },
  nav:{ display:"flex", flexDirection:"column", gap:"4px", padding:"16px 8px", flex:1 },
  navItem:{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 12px", borderRadius:"8px", border:"none", background:"none", color:"#9ca3af", cursor:"pointer", fontSize:"0.9rem", fontWeight:"500", textAlign:"left" },
  navActive:{ background:"#222", color:"#fff" },
  navIcon:{ fontSize:"1.1rem", flexShrink:0 },
  navBadge:{ background:"#dc2626", color:"#fff", borderRadius:"50%", width:"18px", height:"18px", fontSize:"0.7rem", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold" },
  sidebarFooter:{ borderTop:"1px solid #333", padding:"12px 8px" },
  userInfo:{ display:"flex", alignItems:"center", gap:"10px", padding:"8px", marginBottom:"8px" },
  userAvatar:{ width:"32px", height:"32px", borderRadius:"50%", background:"#6c63ff", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", fontSize:"0.85rem", flexShrink:0 },
  userName:{ fontSize:"0.85rem", fontWeight:"600", color:"#fff", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  userEmail:{ fontSize:"0.72rem", color:"#9ca3af", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  logoutBtn:{ display:"flex", alignItems:"center", gap:"10px", width:"100%", padding:"10px 12px", borderRadius:"8px", border:"none", background:"rgba(220,38,38,0.12)", color:"#f87171", cursor:"pointer", fontSize:"0.88rem", fontWeight:"600" },
  logoutBtnCollapsed:{ display:"flex", alignItems:"center", justifyContent:"center", width:"100%", padding:"10px", borderRadius:"8px", border:"none", background:"rgba(220,38,38,0.12)", color:"#f87171", cursor:"pointer", fontSize:"1rem" },
  topbarLogoutBtn:{ background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", borderRadius:"8px", padding:"8px 16px", fontWeight:"600", cursor:"pointer", fontSize:"0.85rem" },
  main:{ flex:1, overflow:"auto" },
  topbar:{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"24px 32px", borderBottom:"1px solid #e5e7eb", background:"#fff" },
  pageTitle:{ fontSize:"1.4rem", fontWeight:"bold", color:"#111", margin:0 },
  adminBadge:{ background:"#111", color:"#fff", padding:"6px 16px", borderRadius:"20px", fontSize:"0.8rem", fontWeight:"600" },
  content:{ padding:"24px 32px" },
  statsGrid:{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"12px", marginBottom:"24px" },
  statCard:{ borderRadius:"12px", padding:"16px", display:"flex", alignItems:"center", gap:"12px" },
  statIcon:{ fontSize:"1.6rem" },
  statValue:{ fontSize:"1.4rem", fontWeight:"bold", color:"#111", margin:0 },
  statLabel:{ color:"#6b7280", fontSize:"0.78rem", margin:0 },
  dashGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" },
  card:{ background:"#fff", borderRadius:"12px", padding:"20px", boxShadow:"0 1px 8px rgba(0,0,0,0.06)" },
  cardTitle:{ fontSize:"1rem", fontWeight:"700", color:"#111", marginBottom:"16px", marginTop:0 },
  orderRow:{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 0", borderBottom:"1px solid #f3f4f6" },
  orderId:{ fontWeight:"bold", fontSize:"0.85rem", color:"#374151" },
  orderCustomer:{ color:"#6b7280", fontSize:"0.85rem", flex:1 },
  pill:{ fontSize:"0.75rem", fontWeight:"600", padding:"3px 10px", borderRadius:"20px" },
  msgPreviewRow:{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 0", borderBottom:"1px solid #f3f4f6", cursor:"pointer" },
  msgAvatar:{ width:"32px", height:"32px", borderRadius:"50%", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", fontSize:"0.85rem", flexShrink:0 },
  msgAvatarLg:{ width:"48px", height:"48px", borderRadius:"50%", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", fontSize:"1.2rem", flexShrink:0 },
  unreadDot:{ width:"8px", height:"8px", borderRadius:"50%", background:"#dc2626", flexShrink:0 },
  viewAllBtn:{ marginTop:"12px", background:"none", border:"none", color:"#2563eb", fontWeight:"600", cursor:"pointer", fontSize:"0.85rem", padding:0 },
  inboxLayout:{ display:"grid", gridTemplateColumns:"320px 1fr", gap:"20px" },
  inboxList:{ background:"#fff", borderRadius:"12px", boxShadow:"0 1px 8px rgba(0,0,0,0.06)", overflow:"hidden" },
  inboxFilters:{ display:"flex", borderBottom:"1px solid #f3f4f6" },
  filterBtn:{ flex:1, padding:"10px 6px", border:"none", background:"#fff", cursor:"pointer", fontSize:"0.78rem", fontWeight:"600", color:"#6b7280", borderBottom:"2px solid transparent", display:"flex", alignItems:"center", justifyContent:"center", gap:"4px" },
  filterActive:{ color:"#111", borderBottom:"2px solid #111" },
  filterBadge:{ background:"#dc2626", color:"#fff", borderRadius:"50%", width:"16px", height:"16px", fontSize:"0.65rem", display:"flex", alignItems:"center", justifyContent:"center" },
  inboxCount:{ padding:"10px 14px 6px", color:"#9ca3af", fontSize:"0.78rem", margin:0 },
  emptyInbox:{ padding:"40px", textAlign:"center", color:"#9ca3af" },
  msgCard:{ padding:"14px", borderBottom:"1px solid #f3f4f6", cursor:"pointer" },
  msgCardActive:{ background:"#f0f9ff", borderLeft:"3px solid #2563eb" },
  repliedTag:{ display:"inline-block", marginTop:"4px", background:"#f0fdf4", color:"#16a34a", padding:"2px 8px", borderRadius:"10px", fontSize:"0.7rem", fontWeight:"600" },
  msgDetail:{ background:"#fff", borderRadius:"12px", boxShadow:"0 1px 8px rgba(0,0,0,0.06)", padding:"24px", minHeight:"500px" },
  noMsgSelected:{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"400px", gap:"8px" },
  msgDetailHeader:{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"16px", paddingBottom:"16px", borderBottom:"1px solid #f3f4f6" },
  msgMeta:{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px", flexWrap:"wrap" },
  subjectTag:{ background:"#eff6ff", color:"#2563eb", padding:"4px 12px", borderRadius:"20px", fontSize:"0.8rem", fontWeight:"700" },
  msgBody:{ background:"#f8fafc", borderRadius:"10px", padding:"16px", fontSize:"0.9rem", lineHeight:1.7, color:"#374151", marginBottom:"20px", borderLeft:"3px solid #e5e7eb" },
  replyBox:{ background:"#f8fafc", borderRadius:"10px", padding:"16px" },
  replyTitle:{ fontSize:"0.95rem", fontWeight:"700", color:"#111", margin:"0 0 8px" },
  replyTo:{ fontSize:"0.8rem", color:"#9ca3af", marginBottom:"10px" },
  replyTextarea:{ width:"100%", height:"100px", padding:"10px 12px", border:"1.5px solid #e5e7eb", borderRadius:"8px", fontSize:"0.88rem", resize:"vertical", outline:"none", fontFamily:"sans-serif", boxSizing:"border-box", marginBottom:"10px" },
  sendBtn:{ background:"#111", color:"#fff", border:"none", borderRadius:"8px", padding:"10px 20px", fontWeight:"700", cursor:"pointer", fontSize:"0.88rem" },
  settingsGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" },
  settingField:{ marginBottom:"14px" },
  toggleRow:{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #f3f4f6" },
  toggleLabel:{ fontSize:"0.9rem", fontWeight:"700", color:"#111", margin:"0 0 2px" },
  toggleSub:{ fontSize:"0.78rem", color:"#9ca3af", margin:0 },
  toggle:{ width:"46px", height:"26px", borderRadius:"13px", cursor:"pointer", transition:"background 0.2s", position:"relative", flexShrink:0 },
  toggleThumb:{ position:"absolute", top:"3px", width:"20px", height:"20px", borderRadius:"50%", background:"#fff", transition:"transform 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" },
  sectionHeader:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" },
  count:{ color:"#6b7280", fontSize:"0.9rem", margin:0 },
  addBtn:{ background:"#111", color:"#fff", border:"none", borderRadius:"8px", padding:"10px 20px", fontWeight:"600", cursor:"pointer", fontSize:"0.9rem" },
  saveBtn:{ background:"#111", color:"#fff", border:"none", borderRadius:"8px", padding:"10px 20px", fontWeight:"600", cursor:"pointer", fontSize:"0.88rem", marginTop:"8px" },
  table:{ width:"100%", borderCollapse:"collapse" },
  thead:{ background:"#f8fafc" },
  th:{ padding:"12px 16px", textAlign:"left", fontSize:"0.78rem", fontWeight:"700", color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em" },
  tr:{ borderBottom:"1px solid #f3f4f6" },
  td:{ padding:"14px 16px", fontSize:"0.9rem", color:"#374151" },
  catTag:{ background:"#f3f4f6", color:"#374151", padding:"3px 10px", borderRadius:"20px", fontSize:"0.78rem", fontWeight:"600" },
  editBtn:{ background:"#eff6ff", color:"#2563eb", border:"none", borderRadius:"6px", padding:"6px 12px", cursor:"pointer", marginRight:"6px", fontSize:"0.8rem", fontWeight:"600" },
  deleteBtn:{ background:"#fef2f2", color:"#dc2626", border:"none", borderRadius:"6px", padding:"6px 12px", cursor:"pointer", fontSize:"0.8rem", fontWeight:"600" },
  miniAvatar:{ width:"30px", height:"30px", borderRadius:"50%", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", fontSize:"0.8rem", flexShrink:0 },
  roleBadge:{ padding:"3px 10px", borderRadius:"20px", fontSize:"0.8rem", fontWeight:"700" },
  permCount:{ background:"#f3f4f6", color:"#6b7280", padding:"3px 10px", borderRadius:"20px", fontSize:"0.78rem" },
  modal:{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, overflowY:"auto", padding:"20px" },
  modalBox:{ background:"#fff", borderRadius:"16px", padding:"32px", width:"500px", maxWidth:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.2)", maxHeight:"90vh", overflowY:"auto" },
  modalTitle:{ fontSize:"1.3rem", fontWeight:"bold", marginBottom:"24px", color:"#111", marginTop:0 },
  errorBox:{ background:"#fef2f2", color:"#dc2626", padding:"10px 14px", borderRadius:"8px", fontSize:"0.85rem", marginBottom:"16px", fontWeight:"600" },
  formGroup:{ marginBottom:"16px" },
  label:{ display:"block", fontSize:"0.85rem", fontWeight:"600", color:"#374151", marginBottom:"6px" },
  input:{ width:"100%", padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:"8px", fontSize:"0.9rem", outline:"none", boxSizing:"border-box", fontFamily:"sans-serif" },
  roleCards:{ display:"flex", flexDirection:"column", gap:"10px" },
  roleCard:{ border:"1.5px solid #e5e7eb", borderRadius:"10px", padding:"12px 14px", cursor:"pointer" },
  roleCardActive:{ background:"#fafafa", borderWidth:"2px" },
  roleDesc:{ fontSize:"0.8rem", color:"#9ca3af", margin:"6px 0 6px" },
  previewBtn:{ background:"none", border:"none", color:"#2563eb", fontSize:"0.78rem", cursor:"pointer", padding:0, fontWeight:"600" },
  permList:{ display:"flex", flexWrap:"wrap", gap:"6px", marginTop:"8px" },
  permTag:{ background:"#f0fdf4", color:"#16a34a", padding:"2px 8px", borderRadius:"10px", fontSize:"0.72rem", fontWeight:"600" },
  modalBtns:{ display:"flex", gap:"12px", marginTop:"24px" },
  cancelBtn:{ flex:1, padding:"12px", border:"1.5px solid #e5e7eb", borderRadius:"8px", background:"#fff", cursor:"pointer", fontWeight:"600" },
  rbacGrid:{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"20px" },
  rbacCard:{ background:"#fff", borderRadius:"12px", padding:"20px", boxShadow:"0 1px 8px rgba(0,0,0,0.06)" },
}

export default AdminDashboard