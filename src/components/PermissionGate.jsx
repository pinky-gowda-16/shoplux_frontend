import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { hasPermission, hasAnyPermission } from "../rbac/permissions"

/**
 * PermissionGate
 * Wraps any UI element and only renders it if the user has the required permission.
 *
 * Usage:
 *   <PermissionGate permission="view_products">
 *     <ProductsLink />
 *   </PermissionGate>
 *
 *   <PermissionGate anyOf={["view_orders", "manage_orders"]}>
 *     <OrdersSection />
 *   </PermissionGate>
 */
const PermissionGate = ({ permission, anyOf, children, fallback = null }) => {
  const { user } = useContext(AuthContext)
  if (!user) return fallback

  const allowed = anyOf
    ? hasAnyPermission(user.role, anyOf)
    : hasPermission(user.role, permission)

  return allowed ? children : fallback
}

export default PermissionGate
