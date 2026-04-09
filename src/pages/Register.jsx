import { useState, useContext } from "react"
import { useNavigate, Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

const ROLES = [
  { value: "admin",        label: "Admin",        icon: "👑", desc: "Full access to all features & settings", color: "#f59e0b", bg: "#fffbeb", text: "#92400e" },
  { value: "user",         label: "User",         icon: "👤", desc: "Standard access to products & account",  color: "#6c63ff", bg: "#f5f3ff", text: "#4c1d95" },
  { value: "limited_user", label: "Limited User", icon: "🔒", desc: "Browse products & contact only",         color: "#10b981", bg: "#f0fdf4", text: "#065f46" },
]

const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState("user")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)

    const result = await register(name, email, password, selectedRole)

    if (!result.success) {
      setError(result.message)
      setLoading(false)
      return
    }

    navigate("/")
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>🛍️ ShopLux</div>
        <h1 style={styles.tagline}>Join us<br />today.</h1>
        <p style={styles.sub}>Create your account and start shopping in minutes.</p>
        <ul style={styles.perks}>
          <li style={styles.perk}>✓ &nbsp;Free shipping on first order</li>
          <li style={styles.perk}>✓ &nbsp;Exclusive member deals</li>
          <li style={styles.perk}>✓ &nbsp;Easy returns & refunds</li>
        </ul>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Create account</h2>
          <p style={styles.hint}>Fill in your details below</p>

          <form onSubmit={handleSubmit} style={styles.form}>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                style={styles.input}
                onFocus={e => e.target.style.borderColor = "#111"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                required
              />
            </div>

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
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={styles.input}
                onFocus={e => e.target.style.borderColor = "#111"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                required
              />
            </div>

            {/* ROLE SELECTOR */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Select your role</label>
              <div style={styles.roleGrid}>
                {ROLES.map(role => {
                  const isSelected = selectedRole === role.value
                  return (
                    <div
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      style={{
                        ...styles.roleCard,
                        border: isSelected ? `2px solid ${role.color}` : "2px solid #e5e7eb",
                        background: isSelected ? role.bg : "#fff",
                        boxShadow: isSelected ? `0 0 0 3px ${role.color}22` : "none",
                      }}
                    >
                      <div style={styles.roleTop}>
                        <span style={styles.roleIcon}>{role.icon}</span>
                        <span style={{ ...styles.roleLabel, color: isSelected ? role.color : "#111" }}>{role.label}</span>
                        <span style={{ ...styles.roleCheck, opacity: isSelected ? 1 : 0, background: role.color }}>✓</span>
                      </div>
                      <p style={{ ...styles.roleDesc, color: isSelected ? role.text : "#9ca3af" }}>{role.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button
              type="submit"
              style={loading ? { ...styles.btn, opacity: 0.7 } : styles.btn}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>Sign in</Link>
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
  sub: { fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", marginBottom: "40px" },
  perks: { listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px" },
  perk: { color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", fontFamily: "sans-serif" },
  right: { flex: 1, background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", overflowY: "auto" },
  card: { background: "#fff", padding: "48px", borderRadius: "16px", boxShadow: "0 4px 40px rgba(0,0,0,0.08)", width: "100%", maxWidth: "420px" },
  title: { fontSize: "2rem", fontWeight: "bold", color: "#111", marginBottom: "8px" },
  hint: { color: "#9ca3af", marginBottom: "32px", fontFamily: "sans-serif", fontSize: "0.95rem" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "0.85rem", fontWeight: "600", color: "#374151", fontFamily: "sans-serif", letterSpacing: "0.02em" },
  input: { border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "12px 16px", fontSize: "0.95rem", fontFamily: "sans-serif", outline: "none", transition: "border-color 0.2s", background: "#fff" },
  roleGrid: { display: "flex", flexDirection: "column", gap: "10px" },
  roleCard: { borderRadius: "10px", padding: "12px 14px", cursor: "pointer", transition: "all 0.15s ease" },
  roleTop: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" },
  roleIcon: { fontSize: "1.1rem" },
  roleLabel: { fontFamily: "sans-serif", fontWeight: "700", fontSize: "0.9rem", flex: 1 },
  roleCheck: { width: "18px", height: "18px", borderRadius: "50%", color: "#fff", fontSize: "0.65rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", transition: "opacity 0.15s" },
  roleDesc: { fontFamily: "sans-serif", fontSize: "0.78rem", margin: 0, lineHeight: 1.4, paddingLeft: "28px" },
  error: { color: "#dc2626", fontSize: "0.85rem", fontFamily: "sans-serif", margin: 0 },
  btn: { background: "#111", color: "#fff", border: "none", borderRadius: "8px", padding: "14px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", marginTop: "4px", letterSpacing: "0.02em", fontFamily: "sans-serif", transition: "opacity 0.2s" },
  footer: { textAlign: "center", marginTop: "24px", color: "#9ca3af", fontFamily: "sans-serif", fontSize: "0.9rem" },
  link: { color: "#111", fontWeight: "bold", textDecoration: "none" },
}

export default Register