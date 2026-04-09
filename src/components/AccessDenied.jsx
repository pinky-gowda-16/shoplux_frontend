import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { ROLE_META } from "../rbac/permissions"

const AccessDenied = ({ requiredPermission }) => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const roleMeta = ROLE_META[user?.role] || {}

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.iconWrap}>
          <span style={s.icon}>🔒</span>
        </div>
        <h1 style={s.title}>Access Denied</h1>
        <p style={s.message}>
          You do not have permission to view this page.
        </p>
        <div style={s.roleInfo}>
          <span style={s.roleLabel}>Your role:</span>
          <span style={{ ...s.roleBadge, color: roleMeta.color, background: roleMeta.bg }}>
            {roleMeta.label || user?.role}
          </span>
        </div>
        <p style={s.hint}>
          This page requires additional permissions not assigned to your role.
          Contact your administrator if you believe this is a mistake.
        </p>
        <div style={s.actions}>
          <button onClick={() => navigate(-1)} style={s.backBtn}>← Go Back</button>
          <button onClick={() => navigate("/")} style={s.homeBtn}>Go to Home</button>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    fontFamily: "sans-serif",
    padding: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "48px",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
    border: "1px solid #fee2e2",
  },
  iconWrap: {
    width: "80px",
    height: "80px",
    background: "#fef2f2",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
  },
  icon: { fontSize: "2.5rem" },
  title: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#111",
    margin: "0 0 12px",
    fontFamily: "Georgia, serif",
  },
  message: {
    fontSize: "1.05rem",
    color: "#dc2626",
    fontWeight: "600",
    margin: "0 0 20px",
  },
  roleInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  roleLabel: { color: "#6b7280", fontSize: "0.9rem" },
  roleBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "700",
  },
  hint: {
    color: "#9ca3af",
    fontSize: "0.85rem",
    lineHeight: "1.6",
    margin: "0 0 32px",
  },
  actions: { display: "flex", gap: "12px", justifyContent: "center" },
  backBtn: {
    padding: "10px 24px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "8px",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    color: "#374151",
  },
  homeBtn: {
    padding: "10px 24px",
    border: "none",
    borderRadius: "8px",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
}

export default AccessDenied
