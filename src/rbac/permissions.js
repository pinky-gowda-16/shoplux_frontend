// ─────────────────────────────────────────────────────────────
// RBAC - Role Based Access Control
// Add new roles here. No other file needs to change.
// ─────────────────────────────────────────────────────────────

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  LIMITED_USER: "limited_user",
}

// All possible permissions in the system
export const PERMISSIONS = {
  VIEW_DASHBOARD:   "view_dashboard",
  VIEW_PRODUCTS:    "view_products",
  VIEW_CONTACT:     "view_contact",
  VIEW_ORDERS:      "view_orders",
  VIEW_USERS:       "view_users",
  VIEW_ANALYTICS:   "view_analytics",
  VIEW_SETTINGS:    "view_settings",
  VIEW_REPORTS:     "view_reports",
  VIEW_WISHLIST:    "view_wishlist",
  VIEW_CART:        "view_cart",
  VIEW_PROFILE:     "view_profile",
  MANAGE_PRODUCTS:  "manage_products",
  MANAGE_USERS:     "manage_users",
  MANAGE_ORDERS:    "manage_orders",
}

// ── Role → Permissions Map ────────────────────────────────────
// To add a new role, simply add an entry here.
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // Admin gets everything

  [ROLES.USER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_CONTACT,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_WISHLIST,
    PERMISSIONS.VIEW_CART,
    PERMISSIONS.VIEW_PROFILE,
  ],

  [ROLES.LIMITED_USER]: [
    // ONLY products and contact — nothing else
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_CONTACT,
  ],
}

// ── Helper Functions ──────────────────────────────────────────

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role, permission) => {
  const perms = ROLE_PERMISSIONS[role] || []
  return perms.includes(permission)
}

/**
 * Check if a role has ALL of the given permissions
 */
export const hasAllPermissions = (role, permissions) => {
  return permissions.every(p => hasPermission(role, p))
}

/**
 * Check if a role has ANY of the given permissions
 */
export const hasAnyPermission = (role, permissions) => {
  return permissions.some(p => hasPermission(role, p))
}

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Route → required permission map
 * Used for both UI guards and API-level checks
 */
export const ROUTE_PERMISSIONS = {
  "/":           PERMISSIONS.VIEW_DASHBOARD,
  "/user":       PERMISSIONS.VIEW_DASHBOARD,
  "/products":   PERMISSIONS.VIEW_PRODUCTS,
  "/contact":    PERMISSIONS.VIEW_CONTACT,
  "/orders":     PERMISSIONS.VIEW_ORDERS,
  "/wishlist":   PERMISSIONS.VIEW_WISHLIST,
  "/cart":       PERMISSIONS.VIEW_CART,
  "/profile":    PERMISSIONS.VIEW_PROFILE,
  "/admin":      PERMISSIONS.MANAGE_USERS,
}

/**
 * Simulate backend API permission check
 * In a real app, this runs on the server — replicated here for demo
 */
export const apiPermissionCheck = (role, requiredPermission) => {
  const allowed = hasPermission(role, requiredPermission)
  if (!allowed) {
    return {
      success: false,
      status: 403,
      message: "Access Denied – You do not have permission to perform this action.",
    }
  }
  return { success: true, status: 200 }
}

// ── Role display metadata (for UI) ───────────────────────────
export const ROLE_META = {
  [ROLES.ADMIN]: {
    label: "Admin",
    color: "#9333ea",
    bg: "#fdf4ff",
    description: "Full access to all features",
  },
  [ROLES.USER]: {
    label: "User",
    color: "#16a34a",
    bg: "#f0fdf4",
    description: "Access to personal dashboard, products, orders",
  },
  [ROLES.LIMITED_USER]: {
    label: "Limited User",
    color: "#d97706",
    bg: "#fffbeb",
    description: "Access to Products and Contact pages only",
  },
}
