import { Link } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

const Navbar = () => {

  const {user,logout} = useContext(AuthContext)

  return (
    <nav className="bg-black text-white p-4 flex justify-between">

      <h1 className="text-xl font-bold">Shop</h1>

      <div className="space-x-4">

        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/products">Products</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/contact">Contact</Link>

        {!user && <Link to="/login">Login</Link>}

        {user?.role==="admin" && (
          <Link to="/admin">Admin</Link>
        )}

        {user?.role==="user" && (
          <Link to="/user">User</Link>
        )}

        {user?.role==="limited_user" && (
          <Link to="/products">Products</Link>
        )}

        {user && (
          <button onClick={logout}>Logout</button>
        )}

      </div>

    </nav>
  )
}

export default Navbar