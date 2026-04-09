import { useState, useRef } from "react"

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { text: "Hi! How can I help you today?", sender: "bot" }
  ])
  const [input, setInput] = useState("")

  const responses = {
    hi: "Hello! Welcome to ShopLux. How can I assist you?",
    hello: "Hi there! What can I help you with?",
    help: "I can help you with:\n• Product information\n• Order tracking\n• Shipping details\n• Returns & refunds\n• Account issues",
    products: "We have Electronics, Accessories, and Clothing. Browse our Products page to see all items!",
    shipping: "We offer free shipping on orders above ₹1000. Standard delivery takes 3-5 business days.",
    return: "You can return items within 30 days of delivery. Visit your account to initiate a return.",
    payment: "We accept Credit/Debit cards, UPI, Net Banking, and Cash on Delivery.",
    contact: "You can reach us at support@shoplux.edu or call +91 98765 43210",
    default: "I'm here to help! You can ask about products, shipping, returns, or contact information."
  }

  const handleSend = (e) => {
    if (e) e.preventDefault()
    if (!input.trim()) return

    const userMsg = { text: input, sender: "user" }
    setMessages(prev => [...prev, userMsg])

    const lowerInput = input.toLowerCase()
    let botResponse = responses.default

    for (const [key, value] of Object.entries(responses)) {
      if (lowerInput.includes(key)) {
        botResponse = value
        break
      }
    }

    setInput("")

    setTimeout(() => {
      setMessages(prev => [...prev, { text: botResponse, sender: "bot" }])
    }, 500)
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} style={s.chatBtn} title="Chat with us">
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={s.chatWindow}>
          <div style={s.chatHeader}>
            <div>
              <h3 style={s.chatTitle}>ShopLux Support</h3>
              <p style={s.chatStatus}>🟢 Online</p>
            </div>
            <button onClick={() => setIsOpen(false)} style={s.closeBtn}>✕</button>
          </div>

          <div style={s.chatBody}>
            {messages.map((msg, i) => (
              <div key={i} style={msg.sender === "bot" ? s.botMsg : s.userMsg}>
                {msg.sender === "bot" && <span style={s.botAvatar}>🤖</span>}
                <div style={msg.sender === "bot" ? s.botBubble : s.userBubble}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div style={s.chatFooter}>
            <form onSubmit={handleSend} style={{ display: "flex", gap: "8px", width: "100%" }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                style={s.chatInput}
              />
              <button type="submit" style={s.sendBtn}>
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

const s = {
  chatBtn: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    fontSize: "1.8rem",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    zIndex: 1000,
    transition: "transform 0.2s",
  },
  chatWindow: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "360px",
    height: "500px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
    fontFamily: "sans-serif",
  },
  chatHeader: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    padding: "16px 20px",
    borderRadius: "16px 16px 0 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatTitle: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "700",
  },
  chatStatus: {
    margin: "4px 0 0",
    fontSize: "0.8rem",
    opacity: 0.9,
  },
  closeBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "#fff",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chatBody: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    background: "#f8f9fa",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  botMsg: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
  },
  userMsg: {
    display: "flex",
    justifyContent: "flex-end",
  },
  botAvatar: {
    fontSize: "1.5rem",
    flexShrink: 0,
  },
  botBubble: {
    background: "#fff",
    padding: "10px 14px",
    borderRadius: "12px 12px 12px 4px",
    maxWidth: "75%",
    fontSize: "0.9rem",
    lineHeight: 1.5,
    color: "#333",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    whiteSpace: "pre-line",
  },
  userBubble: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "12px 12px 4px 12px",
    maxWidth: "75%",
    fontSize: "0.9rem",
    lineHeight: 1.5,
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
  chatFooter: {
    padding: "16px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: "8px",
  },
  chatInput: {
    flex: 1,
    padding: "10px 14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "24px",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "sans-serif",
  },
  sendBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}

export default Chatbot
