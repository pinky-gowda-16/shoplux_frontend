const About = () => {
  const values = [
    { icon: "🚀", title: "Innovation",   desc: "We build modern solutions using the latest technologies like React, Node.js and cloud platforms." },
    { icon: "🔒", title: "Security",     desc: "Role-based access control and secure authentication protect every user on our platform." },
    { icon: "💡", title: "Learning",     desc: "This project was built to learn and demonstrate full-stack development skills in a real-world context." },
    { icon: "🤝", title: "Teamwork",     desc: "Collaboration and communication were at the heart of building this ecommerce platform together." },
    { icon: "📱", title: "Responsive",   desc: "Designed to work beautifully on all screen sizes, from mobile to desktop." },
    { icon: "⚡", title: "Performance",  desc: "Optimized for speed with Vite, efficient state management and clean component architecture." },
  ]

  const stats = [
    { label: "Products Listed", value: "50+",   icon: "📦" },
    { label: "Registered Users", value: "200+", icon: "👥" },
    { label: "Orders Processed", value: "500+", icon: "🛒" },
    { label: "Tech Stack Items", value: "10+",  icon: "💻" },
  ]

  return (
    <div style={s.page}>

      {/* ── Hero ── */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <span style={s.badge}>Ecommerce 2026</span>
          <h1 style={s.heroTitle}>About ShopLux</h1>
          <p style={s.heroSub}>
            A full-stack ecommerce web application built as a final year college project,
            demonstrating modern web development with React, role-based access control,
            and a fully functional admin and user panel.
          </p>
        </div>
        <div style={s.heroDecor}>🛍️</div>
      </div>

      {/* ── Stats ── */}
      <div style={s.section}>
        <div style={s.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} style={s.statCard}>
              <span style={s.statIcon}>{stat.icon}</span>
              <p style={s.statValue}>{stat.value}</p>
              <p style={s.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Story ── */}
      <div style={s.section}>
        <div style={s.twoCol}>
          <div style={s.storyText}>
            <span style={s.sectionTag}>Our Story</span>
            <h2 style={s.sectionTitle}>Why We Built This</h2>
            <p style={s.para}>
              ShopLux was born from a simple idea — to build a real-world ecommerce platform
              that goes beyond a basic CRUD app. As part of our final year computer science
              project, we wanted to implement industry-standard features like Role-Based Access
              Control (RBAC), protected routes, and a polished user experience.
            </p>
            <p style={s.para}>
              We used <strong>React</strong> for the frontend, <strong>Tailwind CSS</strong> for
              styling, and <strong>React Router</strong> for navigation. The project features
              three distinct user roles — Admin, User, and Limited User — each with carefully
              scoped permissions and a dedicated dashboard.
            </p>
            <div style={s.techStack}>
              {["React", "Vite", "React Router", "Tailwind CSS", "Context API", "RBAC"].map(tech => (
                <span key={tech} style={s.techTag}>{tech}</span>
              ))}
            </div>
          </div>
          <div style={s.missionCard}>
            <div style={s.missionIcon}>🎯</div>
            <h3 style={s.missionTitle}>Our Mission</h3>
            <p style={s.missionText}>
              To demonstrate that student developers can build production-quality
              web applications with clean code, thoughtful architecture, and
              great user experience.
            </p>
            <div style={s.missionDivider} />
            <h3 style={s.missionTitle}>Our Vision</h3>
            <p style={s.missionText}>
              To inspire fellow students to build projects that solve real problems
              and push beyond the basics of what's taught in the classroom.
            </p>
          </div>
        </div>
      </div>

      {/* ── Values ── */}
      <div style={{ ...s.section, background: "#f8fafc", padding: "60px 0" }}>
        <div style={s.inner}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTag}>What We Stand For</span>
            <h2 style={s.sectionTitle}>Our Core Values</h2>
          </div>
          <div style={s.valuesGrid}>
            {values.map((v, i) => (
              <div key={i} style={s.valueCard}>
                <span style={s.valueIcon}>{v.icon}</span>
                <h4 style={s.valueTitle}>{v.title}</h4>
                <p style={s.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ── Contact ── */}
      <div style={s.contactSection}>
        <div style={s.contactInner}>
          <div>
            <span style={{ ...s.sectionTag, color: "rgba(255,255,255,0.7)" }}>Get In Touch</span>
            <h2 style={{ ...s.sectionTitle, color: "#fff", marginTop: "8px" }}>Contact Us</h2>
            <p style={s.contactSub}>Have questions about our project? We'd love to hear from you.</p>
          </div>
          <div style={s.contactCards}>
            {[
              { icon: "📧", label: "Email",      value: "shoplux@college.edu" },
              { icon: "📍", label: "Location",   value: "Kolar" },
              
            ].map((c, i) => (
              <div key={i} style={s.contactCard}>
                <span style={s.contactIcon}>{c.icon}</span>
                <div>
                  <p style={s.contactLabel}>{c.label}</p>
                  <p style={s.contactValue}>{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

const s = {
  page: { fontFamily: "sans-serif", color: "#111" },

  // Hero
  hero: { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)", padding: "80px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "40px" },
  heroInner: { maxWidth: "640px" },
  badge: { background: "rgba(255,255,255,0.15)", color: "#fff", padding: "6px 16px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600", display: "inline-block", marginBottom: "20px" },
  heroTitle: { fontSize: "3.5rem", fontWeight: "900", color: "#fff", margin: "0 0 16px", fontFamily: "Georgia, serif", lineHeight: 1.1 },
  heroSub: { color: "rgba(255,255,255,0.75)", fontSize: "1.05rem", lineHeight: 1.7, margin: 0 },
  heroDecor: { fontSize: "8rem", opacity: 0.3, flexShrink: 0 },

  // Stats
  section: { padding: "60px 48px" },
  inner: { maxWidth: "1100px", margin: "0 auto" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", maxWidth: "900px", margin: "0 auto" },
  statCard: { background: "#fff", borderRadius: "16px", padding: "28px 20px", textAlign: "center", boxShadow: "0 2px 20px rgba(0,0,0,0.07)", border: "1px solid #f3f4f6" },
  statIcon: { fontSize: "2rem", display: "block", marginBottom: "12px" },
  statValue: { fontSize: "2rem", fontWeight: "900", color: "#1a1a2e", margin: "0 0 6px" },
  statLabel: { color: "#6b7280", fontSize: "0.85rem", margin: 0, fontWeight: "500" },

  // Story
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start", maxWidth: "1100px", margin: "0 auto" },
  storyText: {},
  sectionTag: { background: "#eff6ff", color: "#2563eb", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700", display: "inline-block", marginBottom: "12px" },
  sectionTitle: { fontSize: "2rem", fontWeight: "800", color: "#111", margin: "0 0 16px", fontFamily: "Georgia, serif" },
  sectionSub: { color: "#6b7280", fontSize: "0.95rem", marginTop: "8px" },
  para: { color: "#374151", lineHeight: 1.8, marginBottom: "16px", fontSize: "0.95rem" },
  techStack: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px" },
  techTag: { background: "#1a1a2e", color: "#fff", padding: "5px 14px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600" },
  missionCard: { background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: "20px", padding: "36px", color: "#fff" },
  missionIcon: { fontSize: "2.5rem", marginBottom: "16px" },
  missionTitle: { fontSize: "1.1rem", fontWeight: "700", margin: "0 0 10px", color: "#fff" },
  missionText: { color: "rgba(255,255,255,0.75)", lineHeight: 1.7, fontSize: "0.9rem", margin: 0 },
  missionDivider: { height: "1px", background: "rgba(255,255,255,0.15)", margin: "24px 0" },

  // Values
  sectionHeader: { textAlign: "center", marginBottom: "40px" },
  valuesGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", maxWidth: "1100px", margin: "0 auto" },
  valueCard: { background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 12px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" },
  valueIcon: { fontSize: "2rem", display: "block", marginBottom: "12px" },
  valueTitle: { fontSize: "1rem", fontWeight: "700", color: "#111", margin: "0 0 8px" },
  valueDesc: { color: "#6b7280", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 },

  // Contact
  contactSection: { background: "linear-gradient(135deg, #1a1a2e, #0f3460)", padding: "60px 48px" },
  contactInner: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center", maxWidth: "1100px", margin: "0 auto" },
  contactSub: { color: "rgba(255,255,255,0.65)", fontSize: "0.95rem", marginTop: "8px" },
  contactCards: { display: "flex", flexDirection: "column", gap: "16px" },
  contactCard: { background: "rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", border: "1px solid rgba(255,255,255,0.1)" },
  contactIcon: { fontSize: "1.5rem", flexShrink: 0 },
  contactLabel: { color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: "600", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" },
  contactValue: { color: "#fff", fontSize: "0.9rem", fontWeight: "600", margin: 0 },
}

export default About
