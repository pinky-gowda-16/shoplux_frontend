import { useState } from "react"

const blogPosts = [
  {
    id: 1,
    title: "How We Built a Full-Stack Ecommerce App with React",
    excerpt: "A deep dive into our college project — from setting up Vite and React Router to implementing RBAC and a fully functional admin panel.",
    content: "Building a full-stack ecommerce app was one of the most exciting and challenging experiences of our college journey. We started with Vite for blazing fast builds, set up React Router for navigation, and implemented Context API for global state management. The biggest challenge was designing the Role-Based Access Control system that supports Admin, User, and Limited User roles — each with scoped permissions and a dedicated dashboard.",
    category: "Tech",
    date: "March 5, 2026",
    author: "Priya Sharma",
    avatar: "P",
    avatarColor: "#e11d48",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=340&fit=crop",
    featured: true,
  },
  {
    id: 2,
    title: "Understanding Role-Based Access Control (RBAC) in React",
    excerpt: "Learn how we implemented a scalable RBAC system in our ecommerce app — with permission gates, protected routes and an Access Denied page.",
    content: "RBAC is a method of restricting system access based on the roles of individual users. In our React app, we created a permissions.js file that defines all roles and their permissions in one place. We then built a PermissionGate component to conditionally render UI elements and an RBACRoute component to protect entire pages. This makes the system scalable — adding a new role only requires editing one file.",
    category: "Tech",
    date: "February 28, 2026",
    author: "Rahul Verma",
    avatar: "R",
    avatarColor: "#2563eb",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=340&fit=crop",
    featured: false,
  },
  {
    id: 3,
    title: "Top 5 Ecommerce UI/UX Trends in 2026",
    excerpt: "From dark mode dashboards to micro-interactions — here are the top design trends shaping modern ecommerce experiences this year.",
    content: "The ecommerce landscape is evolving rapidly. In 2026, the biggest trends include dark mode interfaces, micro-interactions for better feedback, glassmorphism cards, AI-powered product recommendations, and mobile-first layouts. Our ShopLux project incorporates many of these trends — especially the sidebar navigation with collapsible design and toast notifications for instant feedback.",
    category: "Design",
    date: "February 20, 2026",
    author: "Sneha Patel",
    avatar: "S",
    avatarColor: "#16a34a",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?w=600&h=340&fit=crop",
    featured: false,
  },
  {
    id: 4,
    title: "Building a Cart System with React Context API",
    excerpt: "How we built an add-to-cart system with bulk quantity input, wishlist support, and real-time price calculation using just React Context.",
    content: "Instead of reaching for Redux, we used React's built-in Context API to manage cart state globally. The cart supports adding items, removing items, updating quantities (including bulk input), and calculating totals in real time. We also added wishlist functionality that persists across page navigations within the session. The key insight was separating cart logic into a dedicated context provider.",
    category: "Tutorial",
    date: "February 15, 2026",
    author: "Amit Kumar",
    avatar: "A",
    avatarColor: "#d97706",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=340&fit=crop",
    featured: false,
  },
  {
    id: 5,
    title: "Why We Chose Vite Over Create React App",
    excerpt: "Vite's lightning-fast HMR and build speed made it the obvious choice for our project. Here's a comparison and what we learned.",
    content: "Create React App was the go-to for years, but Vite has completely changed the game. With Vite, our dev server starts in under 300ms, Hot Module Replacement is instant, and build times are significantly faster. We also had full control over the config with vite.config.ts. The only challenge was setting up Tailwind CSS correctly — which required adding the content paths to tailwind.config.js.",
    category: "Tech",
    date: "February 8, 2026",
    author: "Priya Sharma",
    avatar: "P",
    avatarColor: "#e11d48",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1607798748738-b15c40d33d57?w=600&h=340&fit=crop",
    featured: false,
  },
  {
    id: 6,
    title: "Designing a Responsive Admin Panel from Scratch",
    excerpt: "Our admin panel has a collapsible sidebar, data tables, modal forms, charts and RBAC — all built without any component library.",
    content: "Building the admin panel was the most complex part of our project. We needed a collapsible sidebar, stats cards, data tables with CRUD operations, modal forms, a basic bar chart for analytics, and an RBAC configuration page — all without using any component library like Material UI or Ant Design. Everything was built with plain React and inline styles, which gave us full control and deep understanding of the underlying concepts.",
    category: "Design",
    date: "January 30, 2026",
    author: "Sneha Patel",
    avatar: "S",
    avatarColor: "#16a34a",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop",
    featured: false,
  },
]

const categories = ["All", "Tech", "Design", "Tutorial"]
const categoryColors = { Tech: { color: "#2563eb", bg: "#eff6ff" }, Design: { color: "#9333ea", bg: "#fdf4ff" }, Tutorial: { color: "#16a34a", bg: "#f0fdf4" } }

const Blog = () => {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [expandedPost, setExpandedPost] = useState(null)

  const filtered = blogPosts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === "All" || p.category === activeCategory
    return matchSearch && matchCat
  })

  const featured = blogPosts.find(p => p.featured)
  const regular = filtered.filter(p => !p.featured || activeCategory !== "All" || search)

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Our Blog</h1>
          <p style={s.subtitle}>Insights, tutorials and updates from the ShopLux team.</p>
        </div>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={s.searchInput}
          />
        </div>
      </div>

      {/* ── Categories ── */}
      <div style={s.filters}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={activeCategory === cat ? { ...s.filterBtn, ...s.filterActive } : s.filterBtn}>
            {cat}
          </button>
        ))}
        <span style={s.postCount}>{filtered.length} article{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ── Featured Post ── */}
      {!search && activeCategory === "All" && featured && (
        <div style={s.featured}>
          <img src={featured.image} alt={featured.title} style={s.featuredImg} />
          <div style={s.featuredBody}>
            <div style={s.featuredTop}>
              <span style={{ ...s.catPill, color: categoryColors[featured.category]?.color, background: categoryColors[featured.category]?.bg }}>
                {featured.category}
              </span>
              <span style={s.featuredBadge}>⭐ Featured</span>
            </div>
            <h2 style={s.featuredTitle}>{featured.title}</h2>
            <p style={s.featuredExcerpt}>{featured.excerpt}</p>
            {expandedPost === featured.id && (
              <p style={s.fullContent}>{featured.content}</p>
            )}
            <div style={s.featuredMeta}>
              <div style={s.authorRow}>
                <div style={{ ...s.avatarSmall, background: featured.avatarColor }}>{featured.avatar}</div>
                <span style={s.authorName}>{featured.author}</span>
                <span style={s.dot}>·</span>
                <span style={s.metaText}>{featured.date}</span>
                <span style={s.dot}>·</span>
                <span style={s.metaText}>{featured.readTime}</span>
              </div>
              <button
                onClick={() => setExpandedPost(expandedPost === featured.id ? null : featured.id)}
                style={s.readBtn}
              >
                {expandedPost === featured.id ? "Show Less ↑" : "Read More →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Regular Posts Grid ── */}
      {filtered.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: "3rem" }}>📭</p>
          <p style={{ color: "#9ca3af", marginTop: "12px" }}>No articles found</p>
        </div>
      ) : (
        <div style={s.grid}>
          {(search || activeCategory !== "All" ? filtered : regular).map(post => (
            <div key={post.id} style={s.card}>
              <div style={s.cardImgWrap}>
                <img src={post.image} alt={post.title} style={s.cardImg}
                  onMouseOver={e => e.target.style.transform = "scale(1.05)"}
                  onMouseOut={e => e.target.style.transform = "scale(1)"}
                />
                <span style={{ ...s.catPill, ...s.catPillAbsolute, color: categoryColors[post.category]?.color, background: categoryColors[post.category]?.bg }}>
                  {post.category}
                </span>
              </div>
              <div style={s.cardBody}>
                <h3 style={s.cardTitle}>{post.title}</h3>
                <p style={s.cardExcerpt}>{post.excerpt}</p>
                {expandedPost === post.id && (
                  <p style={s.fullContent}>{post.content}</p>
                )}
                <div style={s.cardMeta}>
                  <div style={s.authorRow}>
                    <div style={{ ...s.avatarSmall, background: post.avatarColor }}>{post.avatar}</div>
                    <div>
                      <p style={s.authorName}>{post.author}</p>
                      <p style={s.metaText}>{post.date} · {post.readTime}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    style={s.readBtnSmall}
                  >
                    {expandedPost === post.id ? "Less ↑" : "Read →"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Newsletter ── */}
      <div style={s.newsletter}>
        <div style={s.newsletterInner}>
          <div>
            <h3 style={s.newsletterTitle}>Stay Updated 📬</h3>
            <p style={s.newsletterSub}>Get the latest articles from our team delivered to your inbox.</p>
          </div>
          <div style={s.newsletterForm}>
            <input type="email" placeholder="Enter your email" style={s.newsletterInput} />
            <button style={s.newsletterBtn}>Subscribe</button>
          </div>
        </div>
      </div>

    </div>
  )
}

const s = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "40px 32px", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "2.4rem", fontWeight: "900", color: "#111", margin: "0 0 6px", fontFamily: "Georgia, serif" },
  subtitle: { color: "#6b7280", margin: 0, fontSize: "0.95rem" },
  searchWrap: { position: "relative" },
  searchIcon: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" },
  searchInput: { padding: "10px 16px 10px 40px", border: "1.5px solid #e5e7eb", borderRadius: "10px", fontSize: "0.9rem", outline: "none", width: "260px" },
  filters: { display: "flex", gap: "10px", marginBottom: "32px", alignItems: "center", flexWrap: "wrap" },
  filterBtn: { padding: "7px 18px", borderRadius: "50px", border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "0.88rem", fontWeight: "600", color: "#374151" },
  filterActive: { background: "#111", color: "#fff", borderColor: "#111" },
  postCount: { marginLeft: "auto", color: "#9ca3af", fontSize: "0.85rem" },
  catPill: { padding: "3px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" },
  catPillAbsolute: { position: "absolute", top: "12px", left: "12px" },

  // Featured
  featured: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 30px rgba(0,0,0,0.1)", marginBottom: "40px", border: "1px solid #f3f4f6" },
  featuredImg: { width: "100%", height: "100%", objectFit: "cover", minHeight: "360px" },
  featuredBody: { padding: "36px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px", background: "#fff" },
  featuredTop: { display: "flex", gap: "10px", alignItems: "center" },
  featuredBadge: { background: "#fffbeb", color: "#d97706", padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" },
  featuredTitle: { fontSize: "1.6rem", fontWeight: "800", color: "#111", margin: 0, fontFamily: "Georgia, serif", lineHeight: 1.3 },
  featuredExcerpt: { color: "#6b7280", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 },
  featuredMeta: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" },

  // Grid
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px", marginBottom: "48px" },
  card: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #f3f4f6", display: "flex", flexDirection: "column" },
  cardImgWrap: { position: "relative", height: "200px", overflow: "hidden" },
  cardImg: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" },
  cardBody: { padding: "20px", display: "flex", flexDirection: "column", flex: 1 },
  cardTitle: { fontSize: "1.05rem", fontWeight: "800", color: "#111", margin: "0 0 10px", lineHeight: 1.4, fontFamily: "Georgia, serif" },
  cardExcerpt: { color: "#6b7280", fontSize: "0.85rem", lineHeight: 1.6, margin: "0 0 16px", flex: 1 },
  fullContent: { color: "#374151", fontSize: "0.88rem", lineHeight: 1.8, margin: "0 0 16px", padding: "12px", background: "#f8fafc", borderRadius: "8px", borderLeft: "3px solid #1a1a2e" },
  cardMeta: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" },

  // Author
  authorRow: { display: "flex", alignItems: "center", gap: "8px" },
  avatarSmall: { width: "30px", height: "30px", borderRadius: "50%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.75rem", flexShrink: 0 },
  authorName: { fontWeight: "600", fontSize: "0.85rem", color: "#111", margin: 0 },
  metaText: { color: "#9ca3af", fontSize: "0.78rem", margin: 0 },
  dot: { color: "#d1d5db", fontSize: "0.8rem" },

  // Buttons
  readBtn: { background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" },
  readBtnSmall: { background: "#f3f4f6", color: "#111", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" },

  empty: { textAlign: "center", padding: "80px 0" },

  // Newsletter
  newsletter: { background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: "20px", padding: "40px 48px" },
  newsletterInner: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "32px", flexWrap: "wrap" },
  newsletterTitle: { fontSize: "1.4rem", fontWeight: "800", color: "#fff", margin: "0 0 6px", fontFamily: "Georgia, serif" },
  newsletterSub: { color: "rgba(255,255,255,0.65)", margin: 0, fontSize: "0.9rem" },
  newsletterForm: { display: "flex", gap: "10px" },
  newsletterInput: { padding: "12px 16px", borderRadius: "8px", border: "none", fontSize: "0.9rem", outline: "none", width: "240px" },
  newsletterBtn: { background: "#e11d48", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 24px", fontWeight: "700", cursor: "pointer", fontSize: "0.9rem", whiteSpace: "nowrap" },
}

export default Blog
