import { useParams, Link } from "react-router-dom"
import { useState } from "react"
import products from "../data/products"

const ProductDetail = () => {
  const { id } = useParams()
  const product = products.find(p => p.id === parseInt(id))
  const [added, setAdded] = useState(false)

  if (!product) return (
    <div style={{ textAlign: "center", padding: "80px", fontFamily: "sans-serif" }}>
      <p style={{ fontSize: "3rem" }}>😕</p>
      <h2 style={{ marginTop: "16px" }}>Product not found</h2>
      <Link to="/products" style={{ color: "#111", marginTop: "16px", display: "inline-block" }}>← Back to Products</Link>
    </div>
  )

  const handleAddToCart = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div style={styles.page}>
      <Link to="/products" style={styles.back}>← Back to Products</Link>

      <div style={styles.container}>
        <div style={styles.imageWrap}>
          <img src={product.image} alt={product.name} style={styles.image} />
        </div>

        <div style={styles.details}>
          <span style={styles.category}>{product.category}</span>
          <h1 style={styles.name}>{product.name}</h1>
          <p style={styles.description}>{product.description}</p>

          <div style={styles.divider} />

          <div style={styles.priceRow}>
            <span style={styles.price}>₹{product.price.toLocaleString()}</span>
            <span style={styles.tax}>Inclusive of all taxes</span>
          </div>

          <button
            onClick={handleAddToCart}
            style={added ? { ...styles.btn, background: "#16a34a" } : styles.btn}
          >
            {added ? "✓ Added to Cart!" : "Add to Cart"}
          </button>

          <Link to="/products" style={styles.continueBtn}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { maxWidth: "1000px", margin: "0 auto", padding: "40px 24px", fontFamily: "sans-serif" },
  back: { color: "#111", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem", display: "inline-block", marginBottom: "32px" },
  container: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" },
  imageWrap: { borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 30px rgba(0,0,0,0.1)" },
  image: { width: "100%", height: "380px", objectFit: "cover" },
  details: { display: "flex", flexDirection: "column", gap: "16px" },
  category: { background: "#f3f4f6", color: "#374151", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", width: "fit-content" },
  name: { fontSize: "2rem", fontWeight: "bold", color: "#111", fontFamily: "Georgia, serif", margin: 0 },
  description: { color: "#6b7280", lineHeight: "1.7", fontSize: "0.95rem", margin: 0 },
  divider: { height: "1px", background: "#e5e7eb" },
  priceRow: { display: "flex", alignItems: "baseline", gap: "12px" },
  price: { fontSize: "2rem", fontWeight: "bold", color: "#111" },
  tax: { fontSize: "0.8rem", color: "#9ca3af" },
  btn: { background: "#111", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", transition: "background 0.3s" },
  continueBtn: { textAlign: "center", color: "#111", fontWeight: "600", textDecoration: "none", fontSize: "0.9rem", padding: "12px", border: "1.5px solid #111", borderRadius: "10px" },
}

export default ProductDetail