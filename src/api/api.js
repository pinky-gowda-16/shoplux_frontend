// src/api/api.js
// Central API service — replaces all localStorage mock calls

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// ── Helper: get auth headers ───────────────────────────────────
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
})

// ── Helper: handle response ────────────────────────────────────
const handleRes = async (res) => {
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Something went wrong")
  return data
}

// ══════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════
export const authAPI = {
  register: (name, email, password, role) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    }).then(handleRes),

  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(handleRes),

  me: () =>
    fetch(`${BASE_URL}/auth/me`, { headers: authHeaders() }).then(handleRes),
}

// ══════════════════════════════════════════════════════════════
// USERS (admin only)
// ══════════════════════════════════════════════════════════════
export const usersAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/users`, { headers: authHeaders() }).then(handleRes),

  create: (userData) =>
    fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(userData),
    }).then(handleRes),

  updateRole: (userId, role) =>
    fetch(`${BASE_URL}/users/${userId}/role`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ role }),
    }).then(handleRes),

  delete: (userId) =>
    fetch(`${BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleRes),
}

// ══════════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════════
export const productsAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/products`, { headers: authHeaders() }).then(handleRes),

  getOne: (id) =>
    fetch(`${BASE_URL}/products/${id}`, { headers: authHeaders() }).then(handleRes),

  create: (productData) =>
    fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(productData),
    }).then(handleRes),

  update: (id, productData) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(productData),
    }).then(handleRes),

  delete: (id) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleRes),
}

// ══════════════════════════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════════════════════════
export const ordersAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/orders`, { headers: authHeaders() }).then(handleRes),

  create: (orderData) =>
    fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(orderData),
    }).then(handleRes),

  updateStatus: (id, status) =>
    fetch(`${BASE_URL}/orders/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }).then(handleRes),

  delete: (id) =>
    fetch(`${BASE_URL}/orders/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleRes),
}

// ══════════════════════════════════════════════════════════════
// MESSAGES
// ══════════════════════════════════════════════════════════════
export const messagesAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/messages`, { headers: authHeaders() }).then(handleRes),

  send: (messageData) =>
    fetch(`${BASE_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData),
    }).then(handleRes),

  markRead: (id) =>
    fetch(`${BASE_URL}/messages/${id}/read`, {
      method: "PATCH",
      headers: authHeaders(),
    }).then(handleRes),

  reply: (id, replyText) =>
    fetch(`${BASE_URL}/messages/${id}/reply`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ replyText }),
    }).then(handleRes),

  delete: (id) =>
    fetch(`${BASE_URL}/messages/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleRes),
}