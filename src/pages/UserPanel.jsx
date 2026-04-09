import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { ordersAPI } from "../api/api"
import products from "../data/products"

// ── Mock Data ──────────────────────────────────────────────────
const MOCK_ORDERS = []

const MOCK_ADDRESSES = [
  { id: 1, label: "Home",   name: "Priya Sharma", line1: "42, MG Road",        line2: "Koramangala", city: "Bengaluru", state: "Karnataka", pin: "560034", phone: "+91 98765 43210", default: true  },
  { id: 2, label: "Office", name: "Priya Sharma", line1: "Tech Park, Block A", line2: "Whitefield",  city: "Bengaluru", state: "Karnataka", pin: "560066", phone: "+91 98765 43210", default: false },
]

const MOCK_RECENTLY_VIEWED = [
  { id: 101, name: "Sony WH-1000XM5",      price: 29999, category: "Audio",       image: "https://picsum.photos/seed/sony/300/200", rating: 4.8, reviews: 2341 },
  { id: 102, name: "Apple Watch Series 9", price: 41999, category: "Wearables",   image: "https://picsum.photos/seed/applewatch/300/200", rating: 4.9, reviews: 5621 },
  { id: 103, name: "Logitech MX Master 3", price: 9999,  category: "Accessories", image: "https://picsum.photos/seed/mouse/300/200", rating: 4.7, reviews: 876  },
  { id: 104, name: "iPad Air M2",          price: 64999, category: "Tablets",     image: "https://picsum.photos/seed/ipad/300/200", rating: 4.9, reviews: 3102 },
]

const MOCK_RECOMMENDATIONS = [
  { id: 201, name: "Bose QuietComfort 45",  price: 24999, category: "Audio",       image: "https://picsum.photos/seed/sony/300/200", rating: 4.7, reviews: 1832, reason: "Based on your purchase"    },
  { id: 202, name: "Fitbit Charge 6",       price: 14999, category: "Wearables",   image: "https://picsum.photos/seed/applewatch/300/200", rating: 4.5, reviews: 921,  reason: "Popular in your area"      },
  { id: 203, name: "JBL Flip 6",           price: 11999, category: "Audio",       image: "https://picsum.photos/seed/jbl/300/200", rating: 4.6, reviews: 2103, reason: "Trending now"              },
  { id: 204, name: "Anker PowerBank 26800", price: 4999,  category: "Accessories", image: "https://picsum.photos/seed/powerbank/300/200", rating: 4.8, reviews: 4521, reason: "Frequently bought together" },
  { id: 205, name: "Kindle Paperwhite",     price: 13999, category: "E-Readers",   image: "https://picsum.photos/seed/kindle/300/200", rating: 4.8, reviews: 7832, reason: "Top rated"                 },
  { id: 206, name: "Mi Robot Vacuum",       price: 19999, category: "Smart Home",  image: "https://picsum.photos/seed/robot/300/200", rating: 4.4, reviews: 654,  reason: "New arrival"               },
]

const statusColor = { Delivered: "#16a34a", Shipped: "#2563eb", Pending: "#d97706", Cancelled: "#dc2626" }
const statusBg    = { Delivered: "#f0fdf4", Shipped: "#eff6ff", Pending: "#fffbeb", Cancelled: "#fef2f2" }
const statusIcon  = { Delivered: "✅", Shipped: "🚚", Pending: "⏳", Cancelled: "❌" }

const Stars = ({ rating }) => (
  <span style={{ color: "#f59e0b", fontSize: "0.78rem" }}>
    {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
    <span style={{ color: "#9ca3af", marginLeft: "4px" }}>{rating}</span>
  </span>
)

// ── Main Component ─────────────────────────────────────────────
const UserPanel = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen]     = useState(true)
  const [toast, setToast]                 = useState(null)
  const [orders, setOrders]               = useState([])
  const [loading, setLoading]             = useState(true)

  // Cart & Wishlist
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [wishlist, setWishlist] = useState([])

  // Products
  const [search, setSearch] = useState("")

  // Profile
  const [profile, setProfile] = useState({
    name:    user?.name || user?.email?.split("@")[0] || "User",
    email:   user?.email || "",
    phone:   "",
    address: "",
    city:    "",
  })

  // Load orders from backend
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await ordersAPI.getAll()
        if (res.success) {
          // Transform backend orders to UI format
          const transformedOrders = res.orders.map(order => ({
            id: `ORD-${order._id.slice(-6).toUpperCase()}`,
            date: new Date(order.createdAt).toISOString().split('T')[0],
            status: order.status,
            total: order.amount,
            image: order.image || "https://picsum.photos/seed/order/80/80",
            items: order.items && order.items.length > 0 ? order.items : [
              { name: order.product, qty: 1, price: order.amount }
            ]
          }))
          setOrders(transformedOrders)
        }
      } catch (err) {
        console.error("Failed to load orders:", err)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])
  const [profileSaved, setProfileSaved] = useState(false)

  // Orders
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [orderFilter, setOrderFilter]     = useState("All")

  // Addresses
  const [addresses, setAddresses]             = useState(MOCK_ADDRESSES)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress]   = useState(null)
  const [addressForm, setAddressForm]         = useState({ label: "Home", name: "", line1: "", line2: "", city: "", state: "", pin: "", phone: "", default: false })

  // ── Toast ────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // ── Cart ─────────────────────────────────────────────────────
  const addToCart = (product) => {
    if (!product) return
    const id = product.id || product._id
    if (!id) return
    const exists = cart.find(c => (c.id || c._id) === id)
    if (exists) {
      setCart(prev => prev.map(c => (c.id || c._id) === id ? { ...c, qty: c.qty + 1 } : c))
    } else {
      setCart(prev => [...prev, { ...product, id, qty: 1 }])
    }
    showToast(`🛒 "${product.name}" added to cart!`)
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(c => (c.id || c._id) !== id))
    showToast("Removed from cart", "error")
  }

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id)
    setCart(prev => prev.map(c => (c.id || c._id) === id ? { ...c, qty } : c))
  }

  const handleBulkInput = (id, raw) => {
    if (raw === "" || raw === "0") {
      setCart(prev => prev.map(c => (c.id || c._id) === id ? { ...c, qty: raw } : c))
      return
    }
    const val = parseInt(raw)
    if (!isNaN(val) && val >= 1) setCart(prev => prev.map(c => (c.id || c._id) === id ? { ...c, qty: val } : c))
  }

  const handleBulkBlur = (id, raw) => {
    const val = parseInt(raw)
    if (!raw || isNaN(val) || val < 1) setCart(prev => prev.map(c => (c.id || c._id) === id ? { ...c, qty: 1 } : c))
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.price * (parseInt(c.qty) || 0), 0)

  // ── Wishlist ─────────────────────────────────────────────────
  const toggleWishlist = (product) => {
    const id = product.id || product._id
    setWishlist(prev => {
      if (prev.find(w => (w.id || w._id) === id)) {
        showToast("Removed from wishlist", "error")
        return prev.filter(w => (w.id || w._id) !== id)
      }
      showToast("Added to wishlist ❤️")
      return [...prev, { ...product, id }]
    })
  }
  const isWishlisted = (id) => wishlist.some(w => (w.id || w._id) === id)

  // ── Reorder ──────────────────────────────────────────────────
  const handleReorder = (order) => {
    order.items.forEach(item => {
      const exists = cart.find(c => c.name === item.name)
      if (exists) {
        setCart(prev => prev.map(c => c.name === item.name ? { ...c, qty: c.qty + item.qty } : c))
      } else {
        setCart(prev => [...prev, { id: Date.now() + Math.random(), name: item.name, price: item.price, qty: item.qty, image: order.image, category: "Reordered" }])
      }
    })
    showToast(`🛒 ${order.items.length} item(s) added to cart!`)
    setActiveSection("cart")
  }

  // ── Address ──────────────────────────────────────────────────
  const handleSaveAddress = () => {
    if (!addressForm.name || !addressForm.line1 || !addressForm.city || !addressForm.pin) {
      showToast("Fill all required fields", "error"); return
    }
    if (editingAddress) {
      setAddresses(prev => prev.map(a => a.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : a))
      showToast("Address updated!")
    } else {
      if (addressForm.default) setAddresses(prev => prev.map(a => ({ ...a, default: false })))
      setAddresses(prev => [...prev, { ...addressForm, id: Date.now() }])
      showToast("Address saved!")
    }
    setShowAddressForm(false)
    setEditingAddress(null)
    setAddressForm({ label: "Home", name: "", line1: "", line2: "", city: "", state: "", pin: "", phone: "", default: false })
  }

  const handleDeleteAddress = (id) => {
    setAddresses(prev => prev.filter(a => a.id !== id))
    showToast("Address removed", "error")
  }

  const handleSetDefault = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, default: a.id === id })))
    showToast("Default address updated!")
  }

  const filteredProducts = (products || []).filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const filteredOrders   = orders.filter(o => orderFilter === "All" ? true : o.status === orderFilter)

  const navItems = [
    { key: "dashboard", label: "Dashboard",       icon: "🏠" },
    { key: "products",  label: "Products",         icon: "📦" },
    { key: "cart",      label: "Cart",             icon: "🛒", badge: cart.length },
    { key: "wishlist",  label: "Wishlist",         icon: "❤️",  badge: wishlist.length },
    { key: "orders",    label: "My Orders",        icon: "📋" },
    { key: "addresses", label: "My Addresses",     icon: "📍" },
    { key: "recent",    label: "Recently Viewed",  icon: "👁️" },
    { key: "recs",      label: "Recommended",      icon: "⭐" },
    { key: "profile",   label: "Profile",          icon: "👤" },
  ]

  return (
    <div style={s.root}>
      {toast && (
        <div style={{ ...s.toast, background: toast.type === "error" ? "#dc2626" : "#16a34a" }}>
          {toast.msg}
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside style={{ ...s.sidebar, width: sidebarOpen ? "240px" : "64px" }}>
        <div style={s.sidebarHeader}>
          {sidebarOpen && <span style={s.sidebarTitle}>🛍️ ShopLux</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={s.toggleBtn}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {sidebarOpen && (
          <div style={s.userInfo}>
            <div style={s.avatar}>{(profile.name || "U")[0].toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <p style={s.userName}>{profile.name}</p>
              <p style={s.userEmail}>{profile.email}</p>
            </div>
          </div>
        )}

        <nav style={s.nav}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActiveSection(item.key)}
              style={activeSection === item.key ? { ...s.navItem, ...s.navActive } : s.navItem}
              title={item.label}>
              <span style={s.navIcon}>{item.icon}</span>
              {sidebarOpen && <span style={{ flex: 1 }}>{item.label}</span>}
              {sidebarOpen && item.badge > 0 && <span style={s.badge}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div style={s.logoutWrap}>
            <button onClick={() => { logout(); navigate("/login") }} style={s.logoutBtn}>
              🚪 Logout
            </button>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <main style={s.main}>
        {/* Topbar */}
        <div style={s.topbar}>
          <h2 style={s.pageTitle}>
            {navItems.find(n => n.key === activeSection)?.icon}{" "}
            {navItems.find(n => n.key === activeSection)?.label}
          </h2>
          <span style={s.roleBadge}>User Panel</span>
        </div>

        {/* ══════════ DASHBOARD ══════════ */}
        {activeSection === "dashboard" && (
          <div style={s.content}>
            <div style={s.welcome}>
              <h3 style={s.welcomeTitle}>Welcome back, {profile.name}! 👋</h3>
              <p style={s.welcomeSub}>Here's a summary of your account activity.</p>
            </div>
            <div style={s.statsGrid}>
              {[
                { label: "Cart Items",  value: cart.length,                       icon: "🛒", color: "#eff6ff", action: "cart"     },
                { label: "Wishlist",    value: wishlist.length,                   icon: "❤️", color: "#fff0f0", action: "wishlist" },
                { label: "My Orders",   value: orders.length,                     icon: "📋", color: "#f0fdf4", action: "orders"   },
                { label: "Cart Total",  value: `₹${cartTotal.toLocaleString()}`,  icon: "💰", color: "#fffbeb", action: "cart"     },
              ].map((stat, i) => (
                <div key={i} onClick={() => setActiveSection(stat.action)}
                  style={{ ...s.statCard, background: stat.color, cursor: "pointer" }}>
                  <span style={s.statIcon}>{stat.icon}</span>
                  <div>
                    <p style={s.statValue}>{stat.value}</p>
                    <p style={s.statLabel}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={s.dashGrid}>
              <div style={s.card}>
                <h3 style={s.cardTitle}>Recent Orders</h3>
                {orders.slice(0, 3).map(o => (
                  <div key={o.id} style={s.orderRow}>
                    <img src={o.image} alt={o.id} style={s.orderThumb} />
                    <div style={{ flex: 1 }}>
                      <p style={s.orderName}>{o.items[0].name}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ""}</p>
                      <p style={s.orderDate}>{o.date}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={s.orderAmt}>₹{o.total.toLocaleString()}</p>
                      <span style={{ ...s.pill, color: statusColor[o.status], background: statusBg[o.status] }}>{o.status}</span>
                    </div>
                  </div>
                ))}
                <button onClick={() => setActiveSection("orders")} style={s.linkBtn}>View All Orders →</button>
              </div>
              <div style={s.card}>
                <h3 style={s.cardTitle}>Cart Summary</h3>
                {cart.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <p style={{ fontSize: "2.5rem" }}>🛒</p>
                    <p style={s.emptyMsg}>Your cart is empty</p>
                    <button onClick={() => setActiveSection("products")} style={s.shopNowBtn}>Shop Now</button>
                  </div>
                ) : (
                  <>
                    {cart.slice(0, 3).map(c => (
                      <div key={c.id} style={s.orderRow}>
                        {c.image && <img src={c.image} alt={c.name} style={s.orderThumb} />}
                        <span style={{ flex: 1, fontSize: "0.88rem", fontWeight: "600" }}>{c.name}</span>
                        <span style={{ fontWeight: "bold" }}>₹{(c.price * (parseInt(c.qty) || 0)).toLocaleString()}</span>
                      </div>
                    ))}
                    <div style={s.totalRow}>
                      <span>Total</span>
                      <span style={{ fontWeight: "bold" }}>₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <button onClick={() => navigate("/checkout")} style={s.checkoutBtn}>Checkout →</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ PRODUCTS ══════════ */}
        {activeSection === "products" && (
          <div style={s.content}>
            <div style={s.searchWrap}>
              <span style={s.searchIcon}>🔍</span>
              <input type="text" placeholder="Search products..." value={search}
                onChange={e => setSearch(e.target.value)} style={s.searchInput} />
            </div>
            <div style={s.grid}>
              {filteredProducts.map(product => {
                const pid = product.id || product._id
                return (
                  <div key={pid} style={s.productCard}>
                    <div style={s.productImgWrap}>
                      <img src={product.image} alt={product.name} style={s.productImg} />
                      <button onClick={() => toggleWishlist(product)}
                        style={isWishlisted(pid) ? { ...s.heartBtn, background: "#fff0f0" } : s.heartBtn}>
                        {isWishlisted(pid) ? "❤️" : "🤍"}
                      </button>
                    </div>
                    <div style={s.productBody}>
                      <h3 style={s.productName}>{product.name}</h3>
                      <p style={s.productDesc}>{(product.description || "").slice(0, 55)}...</p>
                      <div style={s.productFooter}>
                        <span style={s.productPrice}>₹{product.price.toLocaleString()}</span>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link to={`/product/${pid}`} style={s.viewBtn}>View</Link>
                          <button onClick={() => addToCart(product)} style={s.addBtn}>+ Cart</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ══════════ CART ══════════ */}
        {activeSection === "cart" && (
          <div style={s.content}>
            {cart.length === 0 ? (
              <div style={s.emptyState}>
                <p style={{ fontSize: "4rem" }}>🛒</p>
                <p style={s.emptyMsg}>Your cart is empty</p>
                <button onClick={() => setActiveSection("products")} style={s.shopNowBtn}>Browse Products</button>
              </div>
            ) : (
              <div style={s.cartLayout}>
                <div style={s.cartItems}>
                  {cart.map(item => {
                    const itemId = item.id || item._id
                    return (
                      <div key={itemId} style={s.cartItem}>
                        {item.image && <img src={item.image} alt={item.name} style={s.cartImg} />}
                        <div style={{ flex: 1 }}>
                          <h4 style={s.cartItemName}>{item.name}</h4>
                          <p style={s.cartItemCat}>{item.category}</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          <div style={s.qtyControls}>
                            <button onClick={() => updateQty(itemId, (parseInt(item.qty) || 1) - 1)} style={s.qtyBtn}>−</button>
                            <span style={s.qtyNum}>{item.qty}</span>
                            <button onClick={() => updateQty(itemId, (parseInt(item.qty) || 0) + 1)} style={s.qtyBtn}>+</button>
                          </div>
                          <input type="number" min="1" value={item.qty}
                            onChange={e => handleBulkInput(itemId, e.target.value)}
                            onBlur={e => handleBulkBlur(itemId, e.target.value)}
                            style={s.bulkInput} />
                          <span style={s.bulkLabel}>Enter qty</span>
                        </div>
                        <div style={{ textAlign: "right", minWidth: "110px" }}>
                          <p style={s.cartItemPrice}>₹{(item.price * (parseInt(item.qty) || 0)).toLocaleString()}</p>
                          <button onClick={() => removeFromCart(itemId)} style={s.removeBtn}>Remove</button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Cart Summary */}
                <div style={s.cartSummary}>
                  <h3 style={s.cardTitle}>Order Summary</h3>
                  {cart.map(item => (
                    <div key={item.id} style={s.summaryRow}>
                      <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{item.name} × {item.qty}</span>
                      <span style={{ fontSize: "0.85rem" }}>₹{(item.price * (parseInt(item.qty) || 0)).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={s.divider} />
                  <div style={s.summaryRow}>
                    <span style={{ fontWeight: "bold" }}>Total</span>
                    <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <button onClick={() => navigate("/checkout")} style={s.proceedBtn}>
                    Proceed to Checkout →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ WISHLIST ══════════ */}
        {activeSection === "wishlist" && (
          <div style={s.content}>
            {wishlist.length === 0 ? (
              <div style={s.emptyState}>
                <p style={{ fontSize: "4rem" }}>❤️</p>
                <p style={s.emptyMsg}>Your wishlist is empty</p>
                <button onClick={() => setActiveSection("products")} style={s.shopNowBtn}>Discover Products</button>
              </div>
            ) : (
              <div style={s.grid}>
                {wishlist.map(product => {
                  const pid = product.id || product._id
                  return (
                    <div key={pid} style={s.productCard}>
                      <div style={s.productImgWrap}>
                        <img src={product.image} alt={product.name} style={s.productImg} />
                        <button onClick={() => toggleWishlist(product)}
                          style={{ ...s.heartBtn, background: "#fff0f0" }}>❤️</button>
                      </div>
                      <div style={s.productBody}>
                        <h3 style={s.productName}>{product.name}</h3>
                        <div style={s.productFooter}>
                          <span style={s.productPrice}>₹{product.price.toLocaleString()}</span>
                          <button onClick={() => { addToCart(product); toggleWishlist(product) }} style={s.addBtn}>
                            Move to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════ MY ORDERS ══════════ */}
        {activeSection === "orders" && (
          <div style={s.content}>
            <div style={s.filterRow}>
              <p style={s.sectionCount}>{filteredOrders.length} orders</p>
              <div style={s.filterBtns}>
                {["All", "Pending", "Shipped", "Delivered", "Cancelled"].map(f => (
                  <button key={f} onClick={() => setOrderFilter(f)}
                    style={orderFilter === f ? { ...s.filterBtn, ...s.filterActive } : s.filterBtn}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 && (
              <div style={s.emptyState}>
                <p style={{ fontSize: "3rem" }}>📭</p>
                <p style={s.emptyMsg}>No {orderFilter} orders</p>
              </div>
            )}

            {filteredOrders.map(o => {
              const isExpanded = expandedOrder === o.id
              return (
                <div key={o.id} style={s.orderCard}>
                  <img src={o.image} alt={o.id} style={s.orderCardImg} />
                  <div style={{ flex: 1 }}>
                    <div style={s.orderCardHeader}>
                      <span style={s.orderCardId}>{o.id}</span>
                      <span style={{ ...s.pill, color: statusColor[o.status], background: statusBg[o.status] }}>
                        {statusIcon[o.status]} {o.status}
                      </span>
                    </div>
                    <p style={s.orderCardProduct}>
                      {o.items[0].name}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ""}
                    </p>
                    <p style={s.orderDate}>Ordered on {o.date}</p>

                    {isExpanded && (
                      <div style={s.expandedBox}>
                        <table style={s.itemTable}>
                          <thead>
                            <tr style={{ background: "#f8fafc" }}>
                              {["Item", "Qty", "Price", "Subtotal"].map(h => (
                                <th key={h} style={s.ith}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {o.items.map((item, i) => (
                              <tr key={i}>
                                <td style={s.itd}>{item.name}</td>
                                <td style={s.itd}>{item.qty}</td>
                                <td style={s.itd}>₹{item.price.toLocaleString()}</td>
                                <td style={s.itd}><strong>₹{(item.price * item.qty).toLocaleString()}</strong></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 12px 4px" }}>
                          <strong>Total: ₹{o.total.toLocaleString()}</strong>
                        </div>
                      </div>
                    )}

                    <div style={s.orderActionRow}>
                      <button onClick={() => setExpandedOrder(isExpanded ? null : o.id)} style={s.detailsBtn}>
                        {isExpanded ? "▲ Hide" : "▼ Details"}
                      </button>
                      <button onClick={() => handleReorder(o)} style={s.reorderBtn}>🔄 Reorder</button>
                      {o.status === "Delivered" && <button style={s.reviewBtn}>⭐ Review</button>}
                      {o.status === "Pending" && (
                        <button onClick={() => {
                          setOrders(prev => prev.map(ord => ord.id === o.id ? { ...ord, status: "Cancelled" } : ord))
                          showToast("Order cancelled", "error")
                        }} style={s.cancelOrderBtn}>✕ Cancel</button>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: "100px" }}>
                    <p style={s.orderCardAmt}>₹{o.total.toLocaleString()}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ══════════ MY ADDRESSES ══════════ */}
        {activeSection === "addresses" && (
          <div style={s.content}>
            <div style={s.filterRow}>
              <p style={s.sectionCount}>{addresses.length} saved addresses</p>
              <button onClick={() => {
                setShowAddressForm(true)
                setEditingAddress(null)
                setAddressForm({ label: "Home", name: "", line1: "", line2: "", city: "", state: "", pin: "", phone: "", default: false })
              }} style={s.addAddrBtn}>+ Add New Address</button>
            </div>

            {showAddressForm && (
              <div style={s.addrFormCard}>
                <h3 style={s.cardTitle}>{editingAddress ? "✏️ Edit Address" : "📍 Add New Address"}</h3>
                <div style={s.addrFormGrid}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Label</label>
                    <select value={addressForm.label}
                      onChange={e => setAddressForm(p => ({ ...p, label: e.target.value }))} style={s.input}>
                      <option>Home</option><option>Office</option><option>Other</option>
                    </select>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Full Name *</label>
                    <input placeholder="Your name" value={addressForm.name}
                      onChange={e => setAddressForm(p => ({ ...p, name: e.target.value }))} style={s.input} />
                  </div>
                  <div style={{ ...s.formGroup, gridColumn: "1/-1" }}>
                    <label style={s.label}>Address Line 1 *</label>
                    <input placeholder="House no., Street" value={addressForm.line1}
                      onChange={e => setAddressForm(p => ({ ...p, line1: e.target.value }))} style={s.input} />
                  </div>
                  <div style={{ ...s.formGroup, gridColumn: "1/-1" }}>
                    <label style={s.label}>Address Line 2</label>
                    <input placeholder="Area, Landmark" value={addressForm.line2}
                      onChange={e => setAddressForm(p => ({ ...p, line2: e.target.value }))} style={s.input} />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>City *</label>
                    <input placeholder="City" value={addressForm.city}
                      onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} style={s.input} />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>State</label>
                    <input placeholder="State" value={addressForm.state}
                      onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))} style={s.input} />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>PIN Code *</label>
                    <input placeholder="560001" value={addressForm.pin}
                      onChange={e => setAddressForm(p => ({ ...p, pin: e.target.value }))} style={s.input} />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Phone</label>
                    <input placeholder="+91 XXXXX XXXXX" value={addressForm.phone}
                      onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))} style={s.input} />
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", margin: "12px 0 16px", cursor: "pointer", fontSize: "0.88rem" }}>
                  <input type="checkbox" checked={addressForm.default}
                    onChange={e => setAddressForm(p => ({ ...p, default: e.target.checked }))} />
                  Set as default address
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => { setShowAddressForm(false); setEditingAddress(null) }}
                    style={s.cancelBtn}>Cancel</button>
                  <button onClick={handleSaveAddress} style={s.saveBtn}>
                    {editingAddress ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </div>
            )}

            <div style={s.addrGrid}>
              {addresses.map(addr => (
                <div key={addr.id}
                  style={addr.default ? { ...s.addrCard, border: "2px solid #1a1a2e" } : s.addrCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>
                        {addr.label === "Home" ? "🏠" : addr.label === "Office" ? "🏢" : "📍"} {addr.label}
                      </span>
                      {addr.default && <span style={s.defaultTag}>✓ Default</span>}
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button onClick={() => { setEditingAddress(addr); setAddressForm(addr); setShowAddressForm(true) }}
                        style={s.addrEditBtn}>✏️</button>
                      <button onClick={() => handleDeleteAddress(addr.id)} style={s.addrDeleteBtn}>🗑️</button>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 2px", fontWeight: "700", fontSize: "0.9rem" }}>{addr.name}</p>
                  <p style={s.addrText}>{addr.line1}</p>
                  {addr.line2 && <p style={s.addrText}>{addr.line2}</p>}
                  <p style={s.addrText}>{addr.city}, {addr.state} - {addr.pin}</p>
                  {addr.phone && <p style={{ ...s.addrText, marginTop: "6px" }}>📞 {addr.phone}</p>}
                  {!addr.default && (
                    <button onClick={() => handleSetDefault(addr.id)} style={s.setDefaultBtn}>
                      Set as Default
                    </button>
                  )}
                </div>
              ))}
              <div onClick={() => { setShowAddressForm(true); setEditingAddress(null) }} style={s.addAddrCard}>
                <span style={{ fontSize: "2rem", color: "#9ca3af" }}>+</span>
                <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: "6px 0 0" }}>Add New Address</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ RECENTLY VIEWED ══════════ */}
        {activeSection === "recent" && (
          <div style={s.content}>
            <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: "0.9rem" }}>Based on your browsing history</p>
            <div style={s.grid}>
              {MOCK_RECENTLY_VIEWED.map(product => (
                <div key={product.id} style={s.productCard}>
                  <div style={s.productImgWrap}>
                    <img src={product.image} alt={product.name} style={s.productImg} />
                    <button onClick={() => toggleWishlist(product)}
                      style={isWishlisted(product.id) ? { ...s.heartBtn, background: "#fff0f0" } : s.heartBtn}>
                      {isWishlisted(product.id) ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div style={s.productBody}>
                    <span style={s.catChip}>{product.category}</span>
                    <h3 style={s.productName}>{product.name}</h3>
                    <Stars rating={product.rating} />
                    <p style={{ margin: "2px 0 8px", fontSize: "0.72rem", color: "#9ca3af" }}>
                      ({product.reviews.toLocaleString()} reviews)
                    </p>
                    <div style={s.productFooter}>
                      <span style={s.productPrice}>₹{product.price.toLocaleString()}</span>
                      <button onClick={() => addToCart(product)} style={s.addBtn}>+ Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ RECOMMENDATIONS ══════════ */}
        {activeSection === "recs" && (
          <div style={s.content}>
            <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: "0.9rem" }}>Personalised picks based on your activity</p>
            <div style={s.grid}>
              {MOCK_RECOMMENDATIONS.map(product => (
                <div key={product.id} style={s.productCard}>
                  <div style={s.productImgWrap}>
                    <img src={product.image} alt={product.name} style={s.productImg} />
                    <button onClick={() => toggleWishlist(product)}
                      style={isWishlisted(product.id) ? { ...s.heartBtn, background: "#fff0f0" } : s.heartBtn}>
                      {isWishlisted(product.id) ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div style={s.productBody}>
                    <span style={s.reasonChip}>{product.reason}</span>
                    <h3 style={s.productName}>{product.name}</h3>
                    <Stars rating={product.rating} />
                    <p style={{ margin: "2px 0 8px", fontSize: "0.72rem", color: "#9ca3af" }}>
                      ({product.reviews.toLocaleString()} reviews)
                    </p>
                    <div style={s.productFooter}>
                      <span style={s.productPrice}>₹{product.price.toLocaleString()}</span>
                      <button onClick={() => addToCart(product)} style={s.addBtn}>+ Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ PROFILE ══════════ */}
        {activeSection === "profile" && (
          <div style={s.content}>
            <div style={s.profileCard}>
              <div style={s.profileHeader}>
                <div style={s.profileAvatar}>{(profile.name || "U")[0].toUpperCase()}</div>
                <div>
                  <h3 style={s.profileName}>{profile.name}</h3>
                  <p style={s.profileEmail}>{profile.email}</p>
                  <span style={s.roleBadge}>User</span>
                </div>
              </div>
              <div style={s.divider} />
              <h4 style={{ margin: "0 0 16px", fontSize: "0.95rem", fontWeight: "700" }}>Personal Information</h4>
              <div style={s.formGrid}>
                {[
                  { label: "Full Name", key: "name",  placeholder: "Your name" },
                  { label: "Email",     key: "email", placeholder: "your@email.com", type: "email" },
                  { label: "Phone",     key: "phone", placeholder: "+91 XXXXX XXXXX" },
                  { label: "City",      key: "city",  placeholder: "Mumbai" },
                ].map(field => (
                  <div key={field.key} style={s.formGroup}>
                    <label style={s.label}>{field.label}</label>
                    <input type={field.type || "text"} placeholder={field.placeholder}
                      value={profile[field.key]}
                      onChange={e => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={s.input} />
                  </div>
                ))}
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Address</label>
                <textarea placeholder="Enter your full address" value={profile.address}
                  onChange={e => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  style={{ ...s.input, height: "80px", resize: "vertical" }} />
              </div>
              <button onClick={() => {
                setProfileSaved(true)
                showToast("Profile saved!")
                setTimeout(() => setProfileSaved(false), 2000)
              }} style={profileSaved ? { ...s.saveProfileBtn, background: "#16a34a" } : s.saveProfileBtn}>
                {profileSaved ? "✓ Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────
const s = {
  root:          { display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif" },
  toast:         { position: "fixed", top: "20px", right: "20px", color: "#fff", padding: "12px 24px", borderRadius: "10px", zIndex: 1000, fontWeight: "600", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" },
  sidebar:       { background: "#1a1a2e", color: "#fff", display: "flex", flexDirection: "column", transition: "width 0.2s", minHeight: "100vh", flexShrink: 0, overflow: "hidden" },
  sidebarHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 16px", borderBottom: "1px solid #333" },
  sidebarTitle:  { fontWeight: "bold", fontSize: "1.05rem" },
  toggleBtn:     { background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "0.8rem" },
  userInfo:      { display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderBottom: "1px solid #333" },
  avatar:        { width: "40px", height: "40px", borderRadius: "50%", background: "#e11d48", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 },
  userName:      { margin: 0, fontWeight: "600", fontSize: "0.9rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userEmail:     { margin: 0, color: "#9ca3af", fontSize: "0.75rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  nav:           { display: "flex", flexDirection: "column", gap: "4px", padding: "16px 8px", flex: 1 },
  navItem:       { display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", border: "none", background: "none", color: "#9ca3af", cursor: "pointer", fontSize: "0.9rem", fontWeight: "500", textAlign: "left" },
  navActive:     { background: "#ffffff15", color: "#fff" },
  navIcon:       { fontSize: "1.1rem", flexShrink: 0 },
  badge:         { background: "#e11d48", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
  logoutWrap:    { padding: "16px" },
  logoutBtn:     { width: "100%", padding: "10px", background: "#ffffff10", border: "1px solid #ffffff20", borderRadius: "8px", color: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" },
  main:          { flex: 1, overflow: "auto" },
  topbar:        { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderBottom: "1px solid #e5e7eb", background: "#fff" },
  pageTitle:     { fontSize: "1.4rem", fontWeight: "bold", color: "#111", margin: 0 },
  roleBadge:     { background: "#1a1a2e", color: "#fff", padding: "5px 14px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600" },
  content:       { padding: "24px 32px" },
  welcome:       { background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: "14px", padding: "24px 28px", color: "#fff", marginBottom: "24px" },
  welcomeTitle:  { margin: 0, fontSize: "1.4rem", fontWeight: "bold" },
  welcomeSub:    { margin: "6px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" },
  statsGrid:     { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  statCard:      { borderRadius: "12px", padding: "18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" },
  statIcon:      { fontSize: "1.8rem" },
  statValue:     { fontSize: "1.4rem", fontWeight: "bold", color: "#111", margin: 0 },
  statLabel:     { color: "#6b7280", fontSize: "0.8rem", margin: 0 },
  dashGrid:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  card:          { background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" },
  cardTitle:     { fontSize: "1rem", fontWeight: "700", color: "#111", marginBottom: "16px", marginTop: 0 },
  orderRow:      { display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f3f4f6" },
  orderThumb:    { width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover" },
  orderName:     { margin: 0, fontWeight: "600", fontSize: "0.88rem" },
  orderDate:     { margin: 0, color: "#9ca3af", fontSize: "0.78rem" },
  orderAmt:      { margin: 0, fontWeight: "bold", fontSize: "0.9rem" },
  pill:          { fontSize: "0.72rem", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" },
  totalRow:      { display: "flex", justifyContent: "space-between", padding: "12px 0 0", borderTop: "1px solid #e5e7eb", marginTop: "8px" },
  linkBtn:       { marginTop: "12px", background: "none", border: "none", color: "#2563eb", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem", padding: 0 },
  checkoutBtn:   { width: "100%", marginTop: "12px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "0.9rem" },
  emptyMsg:      { color: "#9ca3af", fontSize: "0.9rem" },
  shopNowBtn:    { background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem", marginTop: "8px" },
  searchWrap:    { position: "relative", marginBottom: "24px" },
  searchIcon:    { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" },
  searchInput:   { width: "100%", padding: "12px 16px 12px 42px", border: "1.5px solid #e5e7eb", borderRadius: "10px", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" },
  grid:          { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" },
  productCard:   { background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  productImgWrap:{ position: "relative", height: "180px", overflow: "hidden" },
  productImg:    { width: "100%", height: "100%", objectFit: "cover" },
  heartBtn:      { position: "absolute", top: "10px", right: "10px", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "34px", height: "34px", fontSize: "1rem", cursor: "pointer" },
  productBody:   { padding: "14px" },
  productName:   { margin: "4px 0 4px", fontWeight: "700", fontSize: "0.95rem", color: "#111" },
  productDesc:   { margin: "0 0 12px", fontSize: "0.8rem", color: "#9ca3af", lineHeight: "1.4" },
  productFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  productPrice:  { fontWeight: "bold", fontSize: "1.05rem", color: "#111" },
  viewBtn:       { background: "#fff", color: "#111", border: "1.5px solid #111", borderRadius: "6px", padding: "6px 10px", fontSize: "0.8rem", fontWeight: "600", textDecoration: "none" },
  addBtn:        { background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 10px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" },
  emptyState:    { textAlign: "center", padding: "80px 0" },
  cartLayout:    { display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", alignItems: "start" },
  cartItems:     { display: "flex", flexDirection: "column", gap: "12px" },
  cartItem:      { background: "#fff", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" },
  cartImg:       { width: "70px", height: "70px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 },
  cartItemName:  { margin: "0 0 4px", fontWeight: "700", fontSize: "0.95rem" },
  cartItemCat:   { margin: 0, color: "#9ca3af", fontSize: "0.8rem" },
  qtyControls:   { display: "flex", alignItems: "center", gap: "10px" },
  qtyBtn:        { background: "#f3f4f6", border: "none", borderRadius: "6px", width: "30px", height: "30px", fontSize: "1rem", cursor: "pointer", fontWeight: "bold" },
  qtyNum:        { fontWeight: "bold", minWidth: "20px", textAlign: "center" },
  bulkInput:     { width: "80px", padding: "6px 8px", border: "1.5px solid #1a1a2e", borderRadius: "6px", fontSize: "0.9rem", textAlign: "center", outline: "none", fontWeight: "600", boxSizing: "border-box" },
  bulkLabel:     { fontSize: "0.7rem", color: "#9ca3af" },
  cartItemPrice: { margin: "0 0 6px", fontWeight: "bold", fontSize: "1rem" },
  removeBtn:     { background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" },
  cartSummary:   { background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", position: "sticky", top: "20px" },
  summaryRow:    { display: "flex", justifyContent: "space-between", padding: "8px 0" },
  divider:       { height: "1px", background: "#e5e7eb", margin: "12px 0" },
  proceedBtn:    { width: "100%", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", marginTop: "16px" },
  filterRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" },
  sectionCount:  { margin: 0, color: "#6b7280", fontSize: "0.9rem" },
  filterBtns:    { display: "flex", gap: "6px", flexWrap: "wrap" },
  filterBtn:     { padding: "6px 14px", border: "1.5px solid #e5e7eb", borderRadius: "20px", background: "#fff", cursor: "pointer", fontSize: "0.82rem", fontWeight: "600", color: "#6b7280" },
  filterActive:  { border: "1.5px solid #1a1a2e", color: "#1a1a2e", background: "#f0f0ff" },
  orderCard:     { background: "#fff", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "16px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)", marginBottom: "12px" },
  orderCardImg:  { width: "70px", height: "70px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 },
  orderCardHeader:{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" },
  orderCardId:   { fontWeight: "bold", fontSize: "0.85rem", color: "#6b7280" },
  orderCardProduct:{ margin: "0 0 4px", fontWeight: "700", fontSize: "1rem" },
  orderCardAmt:  { fontWeight: "bold", fontSize: "1.1rem", margin: 0 },
  expandedBox:   { marginTop: "12px", background: "#f8fafc", borderRadius: "8px", overflow: "hidden" },
  itemTable:     { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" },
  ith:           { padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase" },
  itd:           { padding: "8px 12px", borderTop: "1px solid #e5e7eb", color: "#374151" },
  orderActionRow:{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" },
  detailsBtn:    { background: "#f3f4f6", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", color: "#374151" },
  reorderBtn:    { background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" },
  reviewBtn:     { background: "#fffbeb", color: "#d97706", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" },
  cancelOrderBtn:{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" },
  addrGrid:      { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" },
  addrCard:      { background: "#fff", borderRadius: "12px", padding: "18px", border: "1.5px solid #e5e7eb", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" },
  defaultTag:    { background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700" },
  addrEditBtn:   { background: "#eff6ff", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "0.8rem" },
  addrDeleteBtn: { background: "#fef2f2", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "0.8rem" },
  addrText:      { margin: "0 0 2px", fontSize: "0.85rem", color: "#6b7280" },
  setDefaultBtn: { marginTop: "12px", background: "none", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "600", color: "#6b7280" },
  addAddrCard:   { background: "#fff", borderRadius: "12px", padding: "18px", border: "2px dashed #e5e7eb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", minHeight: "160px" },
  addAddrBtn:    { background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" },
  addrFormCard:  { background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.08)", border: "1.5px solid #e5e7eb" },
  addrFormGrid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "4px" },
  catChip:       { display: "inline-block", background: "#f3f4f6", color: "#6b7280", fontSize: "0.72rem", fontWeight: "600", padding: "2px 8px", borderRadius: "10px", marginBottom: "6px" },
  reasonChip:    { display: "inline-block", background: "#eff6ff", color: "#2563eb", fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "10px", marginBottom: "6px" },
  profileCard:   { background: "#fff", borderRadius: "14px", padding: "28px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", maxWidth: "700px" },
  profileHeader: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" },
  profileAvatar: { width: "70px", height: "70px", borderRadius: "50%", background: "#1a1a2e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: "bold", flexShrink: 0 },
  profileName:   { margin: "0 0 4px", fontSize: "1.3rem", fontWeight: "bold", color: "#111" },
  profileEmail:  { margin: "0 0 8px", color: "#6b7280", fontSize: "0.9rem" },
  formGrid:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
  formGroup:     { display: "flex", flexDirection: "column", gap: "6px" },
  label:         { fontSize: "0.82rem", fontWeight: "600", color: "#374151" },
  input:         { padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.9rem", outline: "none", width: "100%", boxSizing: "border-box" },
  cancelBtn:     { flex: 1, padding: "10px", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "#fff", cursor: "pointer", fontWeight: "600" },
  saveBtn:       { flex: 2, padding: "10px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "0.9rem" },
  saveProfileBtn:{ background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 28px", fontWeight: "600", fontSize: "0.95rem", cursor: "pointer", marginTop: "8px", transition: "background 0.3s" },
}

export default UserPanel