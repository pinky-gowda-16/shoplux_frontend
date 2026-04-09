import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { hasPermission } from "../rbac/permissions"
import AccessDenied from "./AccessDenied"

/**
 * RBACRoute - Route wrapper with permission enforcement
 *
 * Usage:
 *   <RBACRoute permission="view_dashboard">
 *     <Dashboard />
 *   </RBACRoute>
 *
 *   <RBACRoute adminOnly>
 *     <AdminPanel />
 *   </RBACRoute>
 */
const RBACRoute = ({ children, permission, adminOnly = false }) => {
  const { user } = useContext(AuthContext)

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />

  // Admin-only check
  if (adminOnly && user.role !== "admin") {
    return <AccessDenied />
  }

  // Permission-based check
  if (permission && !hasPermission(user.role, permission)) {
    return <AccessDenied requiredPermission={permission} />
  }

  return children
}

export default RBACRoute
