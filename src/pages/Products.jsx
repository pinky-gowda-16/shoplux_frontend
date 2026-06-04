import { useState } from "react"
import { Link } from "react-router-dom"
import products from "../data/products"

const categories = ["All", "Electronics", "Accessories", "Clothing"]

const Products = () => {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })
  const [wishlist, setWishlist] = useState([])
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState("all") // "all" or "wishlist"

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = activeCategory === "All" || p.category === activeCategory
    const matchTab = activeTab === "all" || wishlist.includes(p.id)
    return matchSearch && matchCategory && matchTab
  })

  const addToCart = (product) => {
    try {
      const existing = cart.find(i => i.id === product.id)
      const updatedCart = existing
        ? cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...cart, { ...product, qty: 1 }]
      setCart(updatedCart)
      localStorage.setItem('cart', JSON.stringify(updatedCart))
      showToast(`"${product.name}" added to cart!`)
    } catch (err) {
      console.error('Error adding to cart:', err)
      showToast('Failed to add to cart', 'error')
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      if (prev.includes(product.id)) {
        showToast(`"${product.name}" removed from wishlist`)
        return prev.filter(id => id !== product.id)
      } else {
        showToast(`"${product.name}" added to wishlist ❤️`)
        return [...prev, product.id]
      }
    })
  }

  const isWishlisted = (id) => wishlist.includes(id)

  return (
    <div style={styles.page}>

      {toast && <div style={styles.toast}>{toast}</div>}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Products</h1>
          <p style={styles.subtitle}>{filtered.length} items found</p>
        </div>
        <div style={styles.badges}>
          {wishlist.length > 0 && (
            <div style={styles.wishlistBadge}>❤️ {wishlist.length} Saved</div>
          )}
          {cart.length > 0 && (
            <div style={styles.cartBadge}>🛒 {cart.length} item{cart.length > 1 ? "s" : ""}</div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("all")}
          style={activeTab === "all" ? { ...styles.tab, ...styles.tabActive } : styles.tab}
        >
          All Products
        </button>
        <button
          onClick={() => setActiveTab("wishlist")}
          style={activeTab === "wishlist" ? { ...styles.tab, ...styles.tabActive } : styles.tab}
        >
          ❤️ Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
        </button>
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.search}
          onFocus={e => e.target.style.borderColor = "#111"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
      </div>

      {/* Category Filter */}
      <div style={styles.filters}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={activeCategory === cat ? { ...styles.filterBtn, ...styles.filterActive } : styles.filterBtn}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ fontSize: "3rem" }}>{activeTab === "wishlist" ? "❤️" : "🔍"}</p>
          <p style={{ color: "#9ca3af", marginTop: "12px" }}>
            {activeTab === "wishlist" ? "No items in your wishlist yet" : "No products found"}
          </p>
          {activeTab === "wishlist" && (
            <button onClick={() => setActiveTab("all")} style={styles.browseBtn}>
              Browse Products
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(product => (
            <div key={product.id} style={styles.card}>
              <div style={styles.imageWrap}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={styles.image}
                  onMouseOver={e => e.target.style.transform = "scale(1.05)"}
                  onMouseOut={e => e.target.style.transform = "scale(1)"}
                />
                {/* Wishlist Heart Button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  style={isWishlisted(product.id) ? { ...styles.heartBtn, ...styles.heartActive } : styles.heartBtn}
                  title={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted(product.id) ? "❤️" : "🤍"}
                </button>
                <span style={styles.categoryTag}>{product.category}</span>
              </div>
              <div style={styles.cardBody}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.description}>{product.description.slice(0, 60)}...</p>
                <div style={styles.priceRow}>
                  <span style={styles.price}>₹{product.price.toLocaleString()}</span>
                  <div style={styles.btnGroup}>
                    <Link to={`/product/${product.id}`} style={styles.viewBtn}>View</Link>
                    <button
                      onClick={() => addToCart(product)}
                      style={styles.addBtn}
                      onMouseOver={e => e.target.style.background = "#333"}
                      onMouseOut={e => e.target.style.background = "#111"}
                    >
                      + Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "40px 24px", fontFamily: "sans-serif", position: "relative" },
  toast: { position: "fixed", bottom: "30px", right: "30px", background: "#111", color: "#fff", padding: "14px 24px", borderRadius: "10px", fontSize: "0.9rem", zIndex: 1000, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  title: { fontSize: "2.2rem", fontWeight: "bold", color: "#111", fontFamily: "Georgia, serif" },
  subtitle: { color: "#9ca3af", marginTop: "4px", fontSize: "0.9rem" },
  badges: { display: "flex", gap: "10px" },
  wishlistBadge: { background: "#fff0f0", color: "#e11d48", padding: "10px 20px", borderRadius: "50px", fontWeight: "bold", fontSize: "0.9rem", border: "1.5px solid #fecdd3" },
  cartBadge: { background: "#111", color: "#fff", padding: "10px 20px", borderRadius: "50px", fontWeight: "bold", fontSize: "0.9rem" },
  tabs: { display: "flex", gap: "0", marginBottom: "24px", borderBottom: "2px solid #e5e7eb" },
  tab: { padding: "10px 24px", border: "none", background: "none", cursor: "pointer", fontSize: "0.95rem", fontWeight: "600", color: "#9ca3af", borderBottom: "2px solid transparent", marginBottom: "-2px" },
  tabActive: { color: "#111", borderBottom: "2px solid #111" },
  searchWrap: { position: "relative", marginBottom: "20px" },
  searchIcon: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "1rem" },
  search: { width: "100%", padding: "12px 16px 12px 42px", border: "1.5px solid #e5e7eb", borderRadius: "10px", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  filters: { display: "flex", gap: "10px", marginBottom: "32px", flexWrap: "wrap" },
  filterBtn: { padding: "8px 20px", borderRadius: "50px", border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "0.9rem", fontWeight: "500", color: "#374151" },
  filterActive: { background: "#111", color: "#fff", borderColor: "#111" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" },
  card: { background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" },
  imageWrap: { position: "relative", overflow: "hidden", height: "220px" },
  image: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" },
  heartBtn: { position: "absolute", top: "12px", right: "12px", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "36px", height: "36px", fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", transition: "transform 0.2s" },
  heartActive: { background: "#fff0f0", transform: "scale(1.1)" },
  categoryTag: { position: "absolute", top: "12px", left: "12px", background: "rgba(255,255,255,0.9)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600", color: "#374151" },
  cardBody: { padding: "16px" },
  productName: { fontSize: "1.05rem", fontWeight: "700", color: "#111", marginBottom: "6px" },
  description: { fontSize: "0.85rem", color: "#9ca3af", marginBottom: "14px", lineHeight: "1.4" },
  priceRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: "1.2rem", fontWeight: "bold", color: "#111" },
  btnGroup: { display: "flex", gap: "8px" },
  viewBtn: { background: "#fff", color: "#111", border: "1.5px solid #111", borderRadius: "8px", padding: "7px 12px", fontSize: "0.85rem", fontWeight: "600", textDecoration: "none" },
  addBtn: { background: "#111", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 12px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer", transition: "background 0.2s" },
  empty: { textAlign: "center", padding: "80px 0" },
  browseBtn: { marginTop: "16px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer" },
}

export default Products
