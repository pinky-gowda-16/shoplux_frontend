import { useState, useContext } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  // Get redirect path from location state
  const from = location.state?.from || null
  const message = location.state?.message || null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(email, password)

    if (!result.success) {
      setError(result.message || "Invalid email or password")
      setLoading(false)
      return
    }

    // Redirect to the page they came from, or based on role
    if (from) {
      navigate(from)
    } else if (result.user.role === "admin") {
      navigate("/admin")
    } else if (result.user.role === "limited_user") {
      navigate("/products")
    } else {
      navigate("/user")
    }

    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>🛍️ ShopLux</div>
        <h1 style={styles.tagline}>Your style,<br />delivered.</h1>
        <p style={styles.sub}>Thousands of products. Seamless experience.</p>
        <div style={styles.dots}>
          <span style={{ ...styles.dot, background: "#fff" }}></span>
          <span style={{ ...styles.dot, background: "rgba(255,255,255,0.4)" }}></span>
          <span style={{ ...styles.dot, background: "rgba(255,255,255,0.2)" }}></span>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.hint}>Sign in to your account</p>

          {message && <div style={styles.infoMessage}>{message}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={styles.input}
                onFocus={e => e.target.style.borderColor = "#111"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={styles.input}
                onFocus={e => e.target.style.borderColor = "#111"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                required
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button
              type="submit"
              style={loading ? { ...styles.btn, opacity: 0.7 } : styles.btn}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p style={styles.footer}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.link}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Georgia', serif" },
  left: {
    flex: 1,
    background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
    display: "flex", flexDirection: "column", justifyContent: "center",
    padding: "60px", color: "#fff",
  },
  brand: { fontSize: "1.4rem", fontWeight: "bold", marginBottom: "60px", letterSpacing: "0.05em" },
  tagline: { fontSize: "3.5rem", fontWeight: "bold", lineHeight: 1.15, marginBottom: "20px", letterSpacing: "-0.02em" },
  sub: { fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", marginBottom: "60px" },
  dots: { display: "flex", gap: "8px" },
  dot: { width: "10px", height: "10px", borderRadius: "50%" },
  right: { flex: 1, background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" },
  card: { background: "#fff", padding: "48px", borderRadius: "16px", boxShadow: "0 4px 40px rgba(0,0,0,0.08)", width: "100%", maxWidth: "400px" },
  title: { fontSize: "2rem", fontWeight: "bold", color: "#111", marginBottom: "8px" },
  hint: { color: "#9ca3af", marginBottom: "32px", fontFamily: "sans-serif", fontSize: "0.95rem" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.85rem", fontWeight: "600", color: "#374151", fontFamily: "sans-serif", letterSpacing: "0.02em" },
  input: { border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "12px 16px", fontSize: "0.95rem", fontFamily: "sans-serif", outline: "none", transition: "border-color 0.2s", background: "#fff" },
  error: { color: "#dc2626", fontSize: "0.85rem", fontFamily: "sans-serif", margin: 0 },
  infoMessage: { background: "#eff6ff", color: "#1e40af", padding: "12px 16px", borderRadius: "8px", fontSize: "0.9rem", fontFamily: "sans-serif", marginBottom: "16px", border: "1px solid #bfdbfe" },
  btn: { background: "#111", color: "#fff", border: "none", borderRadius: "8px", padding: "14px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", marginTop: "8px", letterSpacing: "0.02em", transition: "opacity 0.2s", fontFamily: "sans-serif" },
  footer: { textAlign: "center", marginTop: "24px", color: "#9ca3af", fontFamily: "sans-serif", fontSize: "0.9rem" },
  link: { color: "#111", fontWeight: "bold", textDecoration: "none" },
}

export default Login