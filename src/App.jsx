import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { PERMISSIONS, hasPermission } from "./rbac/permissions";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserPanel from "./pages/UserPanel";
import AccessDenied from "./components/AccessDenied";
import Checkout from "./pages/Checkout";
import Chatbot from "./components/Chatbot";

// ── RBAC Route Guard ──────────────────────────────────────────
const RBACRoute = ({ children, permission, adminOnly = false }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <AccessDenied />;
  if (permission && !hasPermission(user.role, permission)) return <AccessDenied />;
  return children;
};

// ── Simple private route (just requires login) ────────────────
const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// ── Smart redirect after login based on role ─────────────────
const HomeRedirect = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "limited_user") return <Navigate to="/products" replace />;
  return <Navigate to="/user" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Chatbot />
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Smart home redirect */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Main layout with RBAC-protected pages */}
        {/* FIX: removed duplicate path="/" — using pathless route so nested routes work correctly */}
        <Route
          element={
            <RBACRoute permission={null}>
              <MainLayout />
            </RBACRoute>
          }
        >
          {/* Full user routes */}
          <Route
            path="user"
            element={<RBACRoute permission={PERMISSIONS.VIEW_DASHBOARD}><UserPanel /></RBACRoute>}
          />

          {/* Products - limited_user CAN access */}
          <Route
            path="products"
            element={<RBACRoute permission={PERMISSIONS.VIEW_PRODUCTS}><Products /></RBACRoute>}
          />
          <Route
            path="product/:id"
            element={<RBACRoute permission={PERMISSIONS.VIEW_PRODUCTS}><ProductDetail /></RBACRoute>}
          />

          {/* Contact - limited_user CAN access */}
          <Route
            path="contact"
            element={<RBACRoute permission={PERMISSIONS.VIEW_CONTACT}><Contact /></RBACRoute>}
          />

          {/* Restricted from limited_user */}
          <Route
            path="about"
            element={<RBACRoute permission={PERMISSIONS.VIEW_DASHBOARD}><About /></RBACRoute>}
          />
          <Route
            path="blog"
            element={<RBACRoute permission={PERMISSIONS.VIEW_DASHBOARD}><Blog /></RBACRoute>}
          />
        </Route>

        {/* Checkout - requires login only */}
        {/* FIX: PrivateRoute is now defined above */}
        <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />

        {/* Admin - fully protected */}
        <Route
          path="/admin"
          element={<RBACRoute adminOnly><AdminDashboard /></RBACRoute>}
        />

        {/* Access denied page */}
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;