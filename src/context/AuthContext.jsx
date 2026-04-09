// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react"
import { authAPI, usersAPI } from "../api/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Restore session on page reload ────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  // ── Register ───────────────────────────────────────────────────
  const register = async (name, email, password, role = "user") => {
    try {
      const data = await authAPI.register(name, email, password, role)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  // ── Login ──────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  // ── Logout ─────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  // ── Admin: get all users ───────────────────────────────────────
  const getUsers = async () => {
    try {
      const data = await usersAPI.getAll()
      return { success: true, users: data.users }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  // ── Admin: create user ─────────────────────────────────────────
  const createUser = async (userData) => {
    try {
      const data = await usersAPI.create(userData)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  // ── Admin: update user role ────────────────────────────────────
  const updateUserRole = async (userId, role) => {
    try {
      const data = await usersAPI.updateRole(userId, role)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  // ── Admin: delete user ─────────────────────────────────────────
  const deleteUser = async (userId) => {
    try {
      await usersAPI.delete(userId)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  if (loading) return null // or a spinner

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      createUser,
      updateUserRole,
      deleteUser,
      getUsers,
    }}>
      {children}
    </AuthContext.Provider>
  )
}