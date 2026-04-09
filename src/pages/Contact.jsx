import { useState, useRef, useCallback, memo } from "react"
import { messagesAPI } from "../api/api"

const MAX_CHARS = 500

const subjectOptions = [
  "Select a topic...",
  "🛒 Order Issue",
  "💳 Payment Problem",
  "📦 Product Inquiry",
  "↩️ Return & Refund",
  "🔧 Technical Support",
  "💬 Feedback",
  "🤝 Partnership",
  "❓ Other",
]

// ── Simple math CAPTCHA (no external lib needed) ──────────────
const generateCaptcha = () => {
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  return { question: `${a} + ${b} = ?`, answer: String(a + b) }
}

const Contact = () => {
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", subject: "", message: "",
    captcha: "", attachment: null,
  })
  const [errors, setErrors]       = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [captcha, setCaptcha]     = useState(generateCaptcha)
  const fileRef = useRef()

  const validate = () => {
    const e = {}
    if (!form.fullName.trim())                       e.fullName = "Full name is required"
    if (!form.email.trim())                          e.email    = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(form.email))      e.email    = "Enter a valid email address"
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/[\s\-]/g, "")))
                                                     e.phone    = "Enter a valid 10-digit number"
    if (!form.subject || form.subject === "Select a topic...")
                                                     e.subject  = "Please select a subject"
    if (!form.message.trim())                        e.message  = "Message cannot be empty"
    else if (form.message.trim().length < 10)        e.message  = "At least 10 characters required"
    if (!form.captcha.trim())                        e.captcha  = "Please solve the CAPTCHA"
    else if (form.captcha.trim() !== captcha.answer) e.captcha  = "Incorrect answer, try again"
    return e
  }

  const handleChange = useCallback((key) => (e) => {
    const value = e.target.value
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => {
      if (!prev[key]) return prev
      const newErrors = { ...prev }
      delete newErrors[key]
      return newErrors
    })
  }, [])

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, attachment: "File must be under 5MB" }))
      return
    }
    setForm(prev => ({ ...prev, attachment: file || null }))
    if (errors.attachment) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.attachment
        return newErrors
      })
    }
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    
    setLoading(true)
    try {
      // Send message to backend
      await messagesAPI.send({
        name: form.fullName,
        email: form.email,
        phone: form.phone || "",
        subject: form.subject,
        message: form.message,
      })
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: "Failed to send message. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm({ fullName: "", email: "", phone: "", subject: "", message: "", captcha: "", attachment: null })
    setErrors({})
    setSubmitted(false)
    setCaptcha(generateCaptcha())
    if (fileRef.current) fileRef.current.value = ""
  }

  const infoCards = [
    { icon: "📧", label: "Email Us",   value: "support@shoplux.edu",         sub: "We reply within 24 hours" },
    { icon: "📞", label: "Call Us",    value: "+91 98765 43210",              sub: "Mon–Sat, 9 AM – 6 PM" },
    { icon: "📍", label: "Visit Us",   value: "CS Dept, ABC College",         sub: "Bengaluru, Karnataka 560001" },
    { icon: "🕐", label: "Hours",      value: "Mon – Sat",                    sub: "9:00 AM to 6:00 PM IST" },
  ]

  const Field = useCallback(({ label, required, error, children }) => (
    <div style={s.fieldWrap}>
      <label style={s.label}>
        {label} {required && <span style={s.required}>*</span>}
      </label>
      {children}
      {error && <span style={s.errorMsg}>⚠ {error}</span>}
    </div>
  ), [])

  return (
    <div style={s.page}>

      {/* ── Hero ── */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Get In Touch</h1>
        <p style={s.heroSub}>Have a question, issue or suggestion? We're here to help. Fill in the form and we'll get back to you within 24 hours.</p>
      </div>

      {/* ── Info Cards ── */}
      <div style={s.infoGrid}>
        {infoCards.map((c, i) => (
          <div key={i} style={s.infoCard}>
            <span style={s.infoIcon}>{c.icon}</span>
            <div>
              <p style={s.infoLabel}>{c.label}</p>
              <p style={s.infoValue}>{c.value}</p>
              <p style={s.infoSub}>{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Layout ── */}
      <div style={s.mainLayout}>

        {/* ── Contact Form ── */}
        <div style={s.formCard}>
          {submitted ? (
            // ── SUCCESS STATE ──
            <div style={s.successBox}>
              <div style={s.successIcon}>✅</div>
              <h3 style={s.successTitle}>Message Sent Successfully!</h3>
              <p style={s.successText}>
                Thank you, <strong>{form.fullName}</strong>! We've received your message and
                sent a confirmation to <strong>{form.email}</strong>.
              </p>
              <div style={s.successDetails}>
                <p style={s.successItem}>📌 Subject: <strong>{form.subject}</strong></p>
                <p style={s.successItem}>⏱ Expected reply: <strong>Within 24 hours</strong></p>
                <p style={s.successItem}>📧 Auto-reply sent to your email</p>
                <p style={s.successItem}>💾 Message saved to our database</p>
              </div>
              <button onClick={handleReset} style={s.resetBtn}>Send Another Message</button>
            </div>
          ) : (
            <>
              <h2 style={s.formTitle}>Send Us a Message</h2>
              <p style={s.formSub}>Fields marked with <span style={s.required}>*</span> are required.</p>

              <div style={s.formGrid}>
                {/* Full Name */}
                <Field label="Full Name" required error={errors.fullName}>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={form.fullName}
                    onChange={handleChange("fullName")}
                    style={errors.fullName ? { ...s.input, ...s.inputError } : s.input}
                  />
                </Field>

                {/* Email */}
                <Field label="Email Address" required error={errors.email}>
                  <input
                    type="email"
                    placeholder="e.g. priya@gmail.com"
                    value={form.email}
                    onChange={handleChange("email")}
                    style={errors.email ? { ...s.input, ...s.inputError } : s.input}
                  />
                </Field>

                {/* Phone */}
                <Field label="Phone Number" error={errors.phone}>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210 (optional)"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    style={errors.phone ? { ...s.input, ...s.inputError } : s.input}
                  />
                </Field>

                {/* Subject */}
                <Field label="Subject / Query Type" required error={errors.subject}>
                  <select
                    value={form.subject}
                    onChange={handleChange("subject")}
                    style={errors.subject ? { ...s.input, ...s.inputError } : s.input}
                  >
                    {subjectOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </Field>
              </div>

              {/* Message */}
              <Field label="Your Message" required error={errors.message}>
                <div style={{ position: "relative" }}>
                  <textarea
                    placeholder="Describe your issue or question in detail... (min. 10 characters)"
                    value={form.message}
                    maxLength={MAX_CHARS}
                    onChange={handleChange("message")}
                    style={errors.message
                      ? { ...s.input, ...s.textarea, ...s.inputError }
                      : { ...s.input, ...s.textarea }}
                  />
                  <span style={{
                    ...s.charCount,
                    color: form.message.length > MAX_CHARS * 0.9 ? "#dc2626" : "#9ca3af"
                  }}>
                    {form.message.length}/{MAX_CHARS}
                  </span>
                </div>
              </Field>

              {/* File Attachment */}
              <Field label="Attachment" error={errors.attachment}>
                <div style={s.fileWrap} onClick={() => fileRef.current.click()}>
                  <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={handleFile} style={{ display: "none" }} />
                  <span style={s.fileIcon}>📎</span>
                  <span style={s.fileText}>
                    {form.attachment ? form.attachment.name : "Click to attach a file (JPG, PNG, PDF, DOC — max 5MB)"}
                  </span>
                  {form.attachment && (
                    <span onClick={e => { e.stopPropagation(); handleChange("attachment", null); fileRef.current.value = "" }}
                      style={s.fileRemove}>✕</span>
                  )}
                </div>
              </Field>

              {/* CAPTCHA */}
              <Field label="Security Check" required error={errors.captcha}>
                <div style={s.captchaWrap}>
                  <div style={s.captchaBox}>
                    <span style={s.captchaQ}>{captcha.question}</span>
                    <button onClick={() => { setCaptcha(generateCaptcha()); setForm(prev => ({ ...prev, captcha: "" })) }}
                      style={s.captchaRefresh} title="Refresh CAPTCHA">🔄</button>
                  </div>
                  <input
                    type="text"
                    placeholder="Your answer"
                    value={form.captcha}
                    onChange={handleChange("captcha")}
                    style={errors.captcha ? { ...s.input, ...s.captchaInput, ...s.inputError } : { ...s.input, ...s.captchaInput }}
                  />
                </div>
                <p style={s.captchaHint}>🤖 This helps us prevent spam submissions</p>
              </Field>

              {/* Submit */}
              {errors.submit && (
                <div style={{ background: "#fef2f2", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "12px", fontWeight: "600" }}>
                  ⚠ {errors.submit}
                </div>
              )}
              <button onClick={handleSubmit} style={s.submitBtn} disabled={loading}>
                {loading ? (
                  <span style={s.loadingRow}>
                    <span style={s.spinner} />
                    Sending...
                  </span>
                ) : "Send Message →"}
              </button>

              {/* Simulated backend notes */}
              <div style={s.noteBox}>
                <p style={s.noteItem}>✅ Your message will be saved to our database</p>
                <p style={s.noteItem}>📧 An auto-reply will be sent to your email</p>
                <p style={s.noteItem}>🔔 Admin will receive an email notification</p>
              </div>
            </>
          )}
        </div>

        {/* ── Right Panel: Map + FAQ ── */}
        <div style={s.rightPanel}>

          {/* Google Maps Embed */}
          <div style={s.mapCard}>
            <h3 style={s.sideTitle}>📍 Our Location</h3>
            <div style={s.mapWrap}>
              <iframe
                title="Our Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.3734!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="220"
                style={{ border: 0, borderRadius: "10px" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <p style={s.mapAddress}>CS Dept, ABC College, Bengaluru, Karnataka 560001</p>
          </div>

          {/* FAQ */}
          <div style={s.faqCard}>
            <h3 style={s.sideTitle}>❓ Quick FAQ</h3>
            {[
              { q: "How long does a reply take?",         a: "We typically reply within 24 hours on working days." },
              { q: "Can I track my order?",               a: "Yes! Log in to your User Panel and check My Orders section." },
              { q: "How do I return a product?",          a: "Select 'Return & Refund' as subject and describe your issue." },
              { q: "Is my data secure?",                  a: "Yes. We use RBAC and secure auth to protect all user data." },
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Collapsible FAQ Item ──────────────────────────────────────
const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false)
  const toggleOpen = useCallback(() => setOpen(prev => !prev), [])
  return (
    <div style={sf.wrap}>
      <button onClick={toggleOpen} style={sf.btn}>
        <span>{question}</span>
        <span style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </button>
      {open && <p style={sf.answer}>{answer}</p>}
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────
const s = {
  page: { fontFamily: "sans-serif", color: "#111", position: "relative" },
  hero: { background: "linear-gradient(135deg, #1a1a2e, #16213e)", padding: "64px 48px", textAlign: "center" },
  heroTitle: { fontSize: "3rem", fontWeight: "900", color: "#fff", margin: "0 0 12px", fontFamily: "Georgia, serif" },
  heroSub: { color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", maxWidth: "580px", margin: "0 auto", lineHeight: 1.7 },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0", borderBottom: "1px solid #f3f4f6" },
  infoCard: { display: "flex", alignItems: "center", gap: "14px", padding: "24px 28px", borderRight: "1px solid #f3f4f6", background: "#fff" },
  infoIcon: { fontSize: "1.8rem", flexShrink: 0 },
  infoLabel: { fontSize: "0.72rem", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" },
  infoValue: { fontSize: "0.9rem", fontWeight: "700", color: "#111", margin: "0 0 2px" },
  infoSub: { fontSize: "0.78rem", color: "#9ca3af", margin: 0 },
  mainLayout: { display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px", padding: "40px 48px", background: "#f8fafc", alignItems: "start" },
  formCard: { background: "#fff", borderRadius: "20px", padding: "36px", boxShadow: "0 2px 20px rgba(0,0,0,0.07)" },
  formTitle: { fontSize: "1.6rem", fontWeight: "800", color: "#111", margin: "0 0 6px", fontFamily: "Georgia, serif" },
  formSub: { color: "#9ca3af", fontSize: "0.85rem", margin: "0 0 28px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
  fieldWrap: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" },
  label: { fontSize: "0.85rem", fontWeight: "700", color: "#374151" },
  required: { color: "#dc2626" },
  input: { padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.9rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "sans-serif", background: "#fff", transition: "border-color 0.2s" },
  inputError: { borderColor: "#dc2626", background: "#fff8f8" },
  textarea: { height: "130px", resize: "vertical", paddingBottom: "28px" },
  charCount: { position: "absolute", bottom: "10px", right: "12px", fontSize: "0.75rem", pointerEvents: "none" },
  errorMsg: { fontSize: "0.78rem", color: "#dc2626", fontWeight: "600" },
  fileWrap: { border: "1.5px dashed #d1d5db", borderRadius: "8px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: "#fafafa" },
  fileIcon: { fontSize: "1.2rem", flexShrink: 0 },
  fileText: { fontSize: "0.85rem", color: "#6b7280", flex: 1 },
  fileRemove: { color: "#dc2626", fontWeight: "bold", cursor: "pointer", padding: "2px 6px" },
  captchaWrap: { display: "flex", gap: "12px", alignItems: "center" },
  captchaBox: { display: "flex", alignItems: "center", gap: "8px", background: "#f3f4f6", borderRadius: "8px", padding: "10px 16px", flexShrink: 0 },
  captchaQ: { fontWeight: "800", fontSize: "1.1rem", color: "#1a1a2e", fontFamily: "monospace", letterSpacing: "0.05em" },
  captchaRefresh: { background: "none", border: "none", cursor: "pointer", fontSize: "1rem" },
  captchaInput: { width: "120px", flexShrink: 0 },
  captchaHint: { fontSize: "0.75rem", color: "#9ca3af", margin: "6px 0 0" },
  submitBtn: { width: "100%", padding: "14px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "10px", fontSize: "1rem", fontWeight: "700", cursor: "pointer", marginTop: "8px" },
  loadingRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  spinner: { width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" },
  noteBox: { marginTop: "20px", background: "#f0fdf4", borderRadius: "10px", padding: "14px 16px" },
  noteItem: { fontSize: "0.8rem", color: "#16a34a", margin: "4px 0", fontWeight: "600" },
  successBox: { textAlign: "center", padding: "20px 0" },
  successIcon: { fontSize: "4rem", marginBottom: "16px" },
  successTitle: { fontSize: "1.6rem", fontWeight: "800", color: "#16a34a", margin: "0 0 12px", fontFamily: "Georgia, serif" },
  successText: { color: "#374151", fontSize: "0.95rem", lineHeight: 1.7, margin: "0 0 20px" },
  successDetails: { background: "#f0fdf4", borderRadius: "12px", padding: "16px 20px", textAlign: "left", marginBottom: "24px" },
  successItem: { fontSize: "0.85rem", color: "#16a34a", margin: "6px 0", fontWeight: "600" },
  resetBtn: { background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 28px", fontWeight: "700", cursor: "pointer", fontSize: "0.95rem" },
  rightPanel: { display: "flex", flexDirection: "column", gap: "20px" },
  mapCard: { background: "#fff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" },
  mapWrap: { borderRadius: "10px", overflow: "hidden", marginBottom: "10px" },
  mapAddress: { fontSize: "0.8rem", color: "#6b7280", margin: 0, textAlign: "center" },
  faqCard: { background: "#fff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" },
  sideTitle: { fontSize: "1rem", fontWeight: "800", color: "#111", margin: "0 0 16px" },
}

const sf = {
  wrap: { borderBottom: "1px solid #f3f4f6" },
  btn: { width: "100%", background: "none", border: "none", padding: "12px 0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700", color: "#111", textAlign: "left", gap: "8px" },
  answer: { fontSize: "0.82rem", color: "#6b7280", lineHeight: 1.6, padding: "0 0 12px", margin: 0 },
}

export default Contact
