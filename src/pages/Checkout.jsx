import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { ordersAPI } from "../api/api"

// ── Step Indicator ─────────────────────────────────────────────
const steps = ["Cart Summary", "Delivery", "Payment", "Confirm"]

const StepBar = ({ current }) => (
  <div style={s.stepBar}>
    {steps.map((step, i) => (
      <div key={i} style={s.stepWrap}>
        <div style={{
          ...s.stepCircle,
          background: i < current ? "#16a34a" : i === current ? "#1a1a2e" : "#e5e7eb",
          color: i <= current ? "#fff" : "#9ca3af",
        }}>
          {i < current ? "✓" : i + 1}
        </div>
        <span style={{ ...s.stepLabel, color: i === current ? "#111" : "#9ca3af", fontWeight: i === current ? "700" : "500" }}>
          {step}
        </span>
        {i < steps.length - 1 && (
          <div style={{ ...s.stepLine, background: i < current ? "#16a34a" : "#e5e7eb" }} />
        )}
      </div>
    ))}
  </div>
)

const MOCK_CART = []

const SAVED_ADDRESSES = [
  { id: 1, label: "Home",   name: "Priya Sharma", line1: "42, MG Road", line2: "Koramangala", city: "Bengaluru", state: "Karnataka", pin: "560034", phone: "+91 98765 43210" },
  { id: 2, label: "Office", name: "Priya Sharma", line1: "Tech Park, Block A", line2: "Whitefield", city: "Bengaluru", state: "Karnataka", pin: "560066", phone: "+91 98765 43210" },
]

const EMPTY_ADDR = { name: "", line1: "", line2: "", city: "", state: "", pin: "", phone: "", label: "Home" }

// ── Main Checkout ──────────────────────────────────────────────
const Checkout = ({ cart: propCart }) => {
  const { user } = useContext(AuthContext)
  const navigate  = useNavigate()

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token || !user) {
      navigate("/login", { state: { from: "/checkout", message: "Please login to proceed with checkout" } })
    }
  }, [user, navigate])

  let savedCart = []
  try {
    const cartData = localStorage.getItem('cart')
    savedCart = cartData ? JSON.parse(cartData) : []
  } catch (err) {
    console.error('Error reading cart:', err)
    savedCart = []
  }
  
  const cart     = propCart || savedCart
  const subtotal = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0)
  const shipping = subtotal > 50000 ? 0 : 99
  const tax      = Math.round(subtotal * 0.18)
  const total    = subtotal + shipping + tax

  const [step, setStep]   = useState(0)
  const [toast, setToast] = useState(null)

  // ── Delivery Address ────────────────────────────────────────
  const [selectedDelivery, setSelectedDelivery] = useState(1)
  const [useNewDelivery, setUseNewDelivery]     = useState(false)
  const [newDelivery, setNewDelivery]           = useState(EMPTY_ADDR)

  // ── Billing Address ─────────────────────────────────────────
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true)
  const [selectedBilling, setSelectedBilling]             = useState(1)
  const [useNewBilling, setUseNewBilling]                 = useState(false)
  const [newBilling, setNewBilling]                       = useState(EMPTY_ADDR)

  // ── Payment ─────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cardDetails, setCardDetails]     = useState({ number: "", name: "", expiry: "", cvv: "" })
  const [upiId, setUpiId]                 = useState("")
  const [savedCard, setSavedCard]         = useState(null)
  const [showCvv, setShowCvv]             = useState(false)

  // ── Order placed ────────────────────────────────────────────
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId]                     = useState("ORD-" + Math.floor(100000 + Math.random() * 900000))

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const getDeliveryAddress = () => {
    if (useNewDelivery) return newDelivery
    return SAVED_ADDRESSES.find(a => a.id === selectedDelivery) || SAVED_ADDRESSES[0]
  }

  const getBillingAddress = () => {
    if (billingSameAsDelivery) return getDeliveryAddress()
    if (useNewBilling) return newBilling
    return SAVED_ADDRESSES.find(a => a.id === selectedBilling) || SAVED_ADDRESSES[0]
  }

  // ── Validation ──────────────────────────────────────────────
  const validateDelivery = () => {
    if (useNewDelivery) {
      const d = newDelivery
      if (!d.name || !d.line1 || !d.city || !d.pin || !d.phone) {
        showToast("Please fill all required delivery fields", "error"); return false
      }
    }
    return true
  }

  const validatePayment = () => {
    if (paymentMethod === "card" && !savedCard) {
      const c = cardDetails
      if (!c.number || !c.name || !c.expiry || !c.cvv) {
        showToast("Please fill all card details", "error"); return false
      }
      if (c.number.replace(/\s/g, "").length < 16) {
        showToast("Invalid card number", "error"); return false
      }
    }
    if (paymentMethod === "upi" && !upiId.includes("@")) {
      showToast("Enter a valid UPI ID (e.g. name@upi)", "error"); return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateDelivery()) return
    if (step === 2 && !validatePayment()) return
    if (step === 3) { handlePlaceOrder(); return }
    setStep(s => s + 1)
  }

  const handlePlaceOrder = async () => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem("token")
      if (!token || !user) {
        showToast("Please login to place an order", "error")
        setTimeout(() => navigate("/login"), 2000)
        return
      }

      // Save order to backend
      const orderData = {
        customer: user?.name || user?.email || "Guest",
        product: cart.map(item => item.name).join(", "),
        amount: total,
        status: "Pending",
        items: cart.map(item => ({
          name: item.name,
          qty: item.qty || 1,
          price: item.price
        })),
        image: cart[0]?.image || "https://picsum.photos/seed/order/80/80"
      }
      
      console.log('Placing order:', orderData)
      const response = await ordersAPI.create(orderData)
      console.log('Order response:', response)
      
      localStorage.removeItem('cart')
      setOrderPlaced(true)
    } catch (err) {
      console.error('Order error:', err)
      const errorMessage = err.message || "Failed to place order. Please try again."
      
      // Handle authentication errors
      if (errorMessage.includes("authorized") || errorMessage.includes("token")) {
        showToast("Session expired. Please login again.", "error")
        setTimeout(() => navigate("/login"), 2000)
      } else {
        showToast(errorMessage, "error")
      }
    }
  }

  const formatCard = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16)
    return digits.replace(/(.{4})/g, "$1 ").trim()
  }

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4)
    if (digits.length >= 2) return digits.slice(0, 2) + "/" + digits.slice(2)
    return digits
  }

  // ── Order Placed Screen ──────────────────────────────────────
  if (orderPlaced) {
    const addr = getDeliveryAddress()
    return (
      <div style={s.root}>
        <div style={s.successWrap}>
          <div style={s.successCard}>
            <div style={s.successIcon}>🎉</div>
            <h2 style={s.successTitle}>Order Placed Successfully!</h2>
            <p style={s.successSub}>Your order <strong>{orderId}</strong> has been confirmed.</p>
            <div style={s.successDetails}>
              <div style={s.successRow}><span>Estimated Delivery</span><strong>3–5 Business Days</strong></div>
              <div style={s.successRow}><span>Delivering to</span><strong>{addr.name}, {addr.city}</strong></div>
              <div style={s.successRow}><span>Payment</span><strong style={{ textTransform: "capitalize" }}>{paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "upi" ? "UPI" : "Credit/Debit Card"}</strong></div>
              <div style={s.successRow}><span>Amount Paid</span><strong style={{ color: "#16a34a" }}>₹{total.toLocaleString()}</strong></div>
            </div>
            <div style={s.successBtns}>
              <button onClick={() => navigate("/user")} style={s.trackBtn}>Track Order →</button>
              <button onClick={() => navigate("/products")} style={s.continueBtn}>Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={s.root}>
      {toast && <div style={{ ...s.toast, background: toast.type === "error" ? "#dc2626" : "#16a34a" }}>{toast.msg}</div>}

      {/* ── Header ── */}
      <div style={s.header}>
        <button onClick={() => navigate(-1)} style={s.backBtn}>← Back</button>
        <h1 style={s.headerTitle}>🛍️ Checkout</h1>
        <span style={s.secureTag}>🔒 Secure Checkout</span>
      </div>

      {/* Empty Cart Message */}
      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🛒</div>
          <h2 style={{ fontSize: "1.5rem", color: "#111", marginBottom: "10px" }}>Your cart is empty</h2>
          <p style={{ color: "#6b7280", marginBottom: "30px" }}>Add some products to your cart to proceed with checkout</p>
          <button onClick={() => navigate("/products")} style={{ background: "#111", color: "#fff", border: "none", padding: "12px 32px", borderRadius: "8px", fontSize: "1rem", fontWeight: "600", cursor: "pointer" }}>
            Browse Products
          </button>
        </div>
      ) : (
        <>
          {/* ── Step Bar ── */}
          <div style={s.stepBarWrap}><StepBar current={step} /></div>

          <div style={s.layout}>
        {/* ── Left Panel ── */}
        <div style={s.leftPanel}>

          {/* ════════ STEP 0: ORDER SUMMARY ════════ */}
          {step === 0 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>🛒 Order Summary</h2>
              {cart.map(item => (
                <div key={item.id} style={s.cartItem}>
                  <img src={item.image} alt={item.name} style={s.cartImg} />
                  <div style={{ flex: 1 }}>
                    <p style={s.cartItemName}>{item.name}</p>
                    <p style={s.cartItemCat}>{item.category}</p>
                    <p style={s.cartItemQty}>Qty: {item.qty}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={s.cartItemPrice}>₹{(item.price * item.qty).toLocaleString()}</p>
                    <p style={s.cartItemUnit}>₹{item.price.toLocaleString()} each</p>
                  </div>
                </div>
              ))}
              <div style={s.divider} />
              <div style={s.couponRow}>
                <input placeholder="Enter coupon code" style={s.couponInput} />
                <button style={s.couponBtn}>Apply</button>
              </div>
            </div>
          )}

          {/* ════════ STEP 1: DELIVERY ADDRESS ════════ */}
          {step === 1 && (
            <div>
              <div style={s.card}>
                <h2 style={s.cardTitle}>📍 Delivery Address</h2>

                {/* Saved Addresses */}
                {!useNewDelivery && (
                  <div style={s.addrList}>
                    {SAVED_ADDRESSES.map(addr => (
                      <div key={addr.id} onClick={() => setSelectedDelivery(addr.id)}
                        style={selectedDelivery === addr.id ? { ...s.addrOption, ...s.addrOptionActive } : s.addrOption}>
                        <div style={s.addrRadio}>
                          <div style={selectedDelivery === addr.id ? { ...s.radioOuter, borderColor: "#1a1a2e" } : s.radioOuter}>
                            {selectedDelivery === addr.id && <div style={s.radioInner} />}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={s.addrLabel}>{addr.label === "Home" ? "🏠" : "🏢"} {addr.label}</span>
                            {addr.id === 1 && <span style={s.defaultTag}>Default</span>}
                          </div>
                          <p style={s.addrName}>{addr.name}</p>
                          <p style={s.addrLine}>{addr.line1}, {addr.line2}</p>
                          <p style={s.addrLine}>{addr.city}, {addr.state} - {addr.pin}</p>
                          <p style={s.addrPhone}>📞 {addr.phone}</p>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setUseNewDelivery(true)} style={s.newAddrBtn}>+ Add New Address</button>
                  </div>
                )}

                {/* New Delivery Address Form */}
                {useNewDelivery && (
                  <div>
                    <button onClick={() => setUseNewDelivery(false)} style={s.backToSaved}>← Use Saved Address</button>
                    <AddressForm data={newDelivery} onChange={setNewDelivery} />
                  </div>
                )}
              </div>

              {/* ── Billing Address ── */}
              <div style={{ ...s.card, marginTop: "16px" }}>
                <h2 style={s.cardTitle}>🧾 Billing Address</h2>

                {/* Same as Delivery Toggle */}
                <div onClick={() => setBillingSameAsDelivery(!billingSameAsDelivery)} style={s.sameAddrRow}>
                  <div style={billingSameAsDelivery ? { ...s.checkbox, background: "#1a1a2e", borderColor: "#1a1a2e" } : s.checkbox}>
                    {billingSameAsDelivery && <span style={s.checkmark}>✓</span>}
                  </div>
                  <div>
                    <p style={s.sameAddrLabel}>Same as delivery address</p>
                    <p style={s.sameAddrSub}>Your billing address will match your delivery address</p>
                  </div>
                </div>

                {/* Different Billing Address */}
                {!billingSameAsDelivery && (
                  <div style={{ marginTop: "16px" }}>
                    {!useNewBilling && (
                      <div style={s.addrList}>
                        {SAVED_ADDRESSES.map(addr => (
                          <div key={addr.id} onClick={() => setSelectedBilling(addr.id)}
                            style={selectedBilling === addr.id ? { ...s.addrOption, ...s.addrOptionActive } : s.addrOption}>
                            <div style={s.addrRadio}>
                              <div style={selectedBilling === addr.id ? { ...s.radioOuter, borderColor: "#1a1a2e" } : s.radioOuter}>
                                {selectedBilling === addr.id && <div style={s.radioInner} />}
                              </div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <span style={s.addrLabel}>{addr.label === "Home" ? "🏠" : "🏢"} {addr.label}</span>
                              </div>
                              <p style={s.addrName}>{addr.name}</p>
                              <p style={s.addrLine}>{addr.line1}, {addr.line2}</p>
                              <p style={s.addrLine}>{addr.city}, {addr.state} - {addr.pin}</p>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => setUseNewBilling(true)} style={s.newAddrBtn}>+ Add New Billing Address</button>
                      </div>
                    )}
                    {useNewBilling && (
                      <div>
                        <button onClick={() => setUseNewBilling(false)} style={s.backToSaved}>← Use Saved Address</button>
                        <AddressForm data={newBilling} onChange={setNewBilling} />
                      </div>
                    )}
                  </div>
                )}

                {/* Show billing address preview if same as delivery */}
                {billingSameAsDelivery && (
                  <div style={s.billingPreview}>
                    <p style={s.billingPreviewTitle}>Billing to:</p>
                    <p style={s.addrName}>{getDeliveryAddress().name}</p>
                    <p style={s.addrLine}>{getDeliveryAddress().line1}, {getDeliveryAddress().line2}</p>
                    <p style={s.addrLine}>{getDeliveryAddress().city}, {getDeliveryAddress().state} - {getDeliveryAddress().pin}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════ STEP 2: PAYMENT ════════ */}
          {step === 2 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>💳 Payment Method</h2>

              {/* Payment Options */}
              <div style={s.paymentOptions}>
                {[
                  { key: "card", label: "Credit / Debit Card", icon: "💳" },
                  { key: "upi",  label: "UPI",                 icon: "📱" },
                  { key: "netbanking", label: "Net Banking",   icon: "🏦" },
                  { key: "cod",  label: "Cash on Delivery",    icon: "💵" },
                ].map(opt => (
                  <div key={opt.key} onClick={() => setPaymentMethod(opt.key)}
                    style={paymentMethod === opt.key ? { ...s.payOption, ...s.payOptionActive } : s.payOption}>
                    <div style={paymentMethod === opt.key ? { ...s.radioOuter, borderColor: "#1a1a2e" } : s.radioOuter}>
                      {paymentMethod === opt.key && <div style={s.radioInner} />}
                    </div>
                    <span style={s.payIcon}>{opt.icon}</span>
                    <span style={s.payLabel}>{opt.label}</span>
                  </div>
                ))}
              </div>

              {/* Card Details */}
              {paymentMethod === "card" && (
                <div style={s.payForm}>
                  <div style={s.cardVisual}>
                    <div style={s.cardChip}>▬▬</div>
                    <p style={s.cardNumber}>{cardDetails.number || "•••• •••• •••• ••••"}</p>
                    <div style={s.cardBottom}>
                      <div>
                        <p style={s.cardFieldLabel}>CARD HOLDER</p>
                        <p style={s.cardFieldVal}>{cardDetails.name || "YOUR NAME"}</p>
                      </div>
                      <div>
                        <p style={s.cardFieldLabel}>EXPIRES</p>
                        <p style={s.cardFieldVal}>{cardDetails.expiry || "MM/YY"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Saved Card Option */}
                  <div onClick={() => setSavedCard(savedCard ? null : "saved")}
                    style={savedCard ? { ...s.savedCardRow, background: "#f0fdf4", border: "1.5px solid #16a34a" } : s.savedCardRow}>
                    <div style={savedCard ? { ...s.checkbox, background: "#16a34a", borderColor: "#16a34a" } : s.checkbox}>
                      {savedCard && <span style={s.checkmark}>✓</span>}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: "700", fontSize: "0.9rem" }}>Use saved card</p>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>Visa •••• •••• •••• 4242</p>
                    </div>
                    <span style={s.visaTag}>VISA</span>
                  </div>

                  {!savedCard && (
                    <div style={s.cardForm}>
                      <div style={s.formGroup}>
                        <label style={s.label}>Card Number *</label>
                        <input placeholder="1234 5678 9012 3456" maxLength={19}
                          value={cardDetails.number}
                          onChange={e => setCardDetails(p => ({ ...p, number: formatCard(e.target.value) }))}
                          style={s.input} />
                      </div>
                      <div style={s.formGroup}>
                        <label style={s.label}>Cardholder Name *</label>
                        <input placeholder="Name on card"
                          value={cardDetails.name}
                          onChange={e => setCardDetails(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                          style={s.input} />
                      </div>
                      <div style={s.twoCol}>
                        <div style={s.formGroup}>
                          <label style={s.label}>Expiry Date *</label>
                          <input placeholder="MM/YY" maxLength={5}
                            value={cardDetails.expiry}
                            onChange={e => setCardDetails(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                            style={s.input} />
                        </div>
                        <div style={s.formGroup}>
                          <label style={s.label}>CVV *</label>
                          <div style={{ position: "relative" }}>
                            <input placeholder="•••" maxLength={3} type={showCvv ? "text" : "password"}
                              value={cardDetails.cvv}
                              onChange={e => setCardDetails(p => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                              style={s.input} />
                            <button onClick={() => setShowCvv(!showCvv)}
                              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "#6b7280" }}>
                              {showCvv ? "Hide" : "Show"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* UPI */}
              {paymentMethod === "upi" && (
                <div style={s.payForm}>
                  <div style={s.upiApps}>
                    {[
                      { name: "GPay",   emoji: "🟢" },
                      { name: "PhonePe",emoji: "🟣" },
                      { name: "Paytm",  emoji: "🔵" },
                      { name: "BHIM",   emoji: "🟠" },
                    ].map(app => (
                      <div key={app.name} style={s.upiApp}>
                        <span style={{ fontSize: "1.8rem" }}>{app.emoji}</span>
                        <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#374151" }}>{app.name}</span>
                      </div>
                    ))}
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Or enter UPI ID</label>
                    <input placeholder="yourname@upi" value={upiId}
                      onChange={e => setUpiId(e.target.value)} style={s.input} />
                    <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#9ca3af" }}>e.g. priya@okicici, 9876543210@ybl</p>
                  </div>
                </div>
              )}

              {/* Net Banking */}
              {paymentMethod === "netbanking" && (
                <div style={s.payForm}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Select Bank</label>
                    <select style={s.input}>
                      <option value="">-- Choose your bank --</option>
                      {["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Bank", "Yes Bank", "PNB", "Bank of Baroda"].map(b => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: "8px 0 0" }}>You will be redirected to your bank's secure page to complete payment.</p>
                </div>
              )}

              {/* COD */}
              {paymentMethod === "cod" && (
                <div style={{ ...s.payForm, background: "#fffbeb", borderRadius: "10px", padding: "16px", border: "1px solid #fde68a" }}>
                  <p style={{ margin: 0, fontWeight: "700", color: "#92400e" }}>💵 Cash on Delivery</p>
                  <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "#78350f" }}>Pay ₹{total.toLocaleString()} when your order arrives. Extra ₹49 COD fee applies.</p>
                </div>
              )}
            </div>
          )}

          {/* ════════ STEP 3: CONFIRM ════════ */}
          {step === 3 && (
            <div>
              <div style={s.card}>
                <h2 style={s.cardTitle}>📦 Order Review</h2>
                {cart.map(item => (
                  <div key={item.id} style={s.cartItem}>
                    <img src={item.image} alt={item.name} style={s.cartImg} />
                    <div style={{ flex: 1 }}>
                      <p style={s.cartItemName}>{item.name}</p>
                      <p style={s.cartItemQty}>Qty: {item.qty}</p>
                    </div>
                    <p style={s.cartItemPrice}>₹{(item.price * item.qty).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div style={s.card}>
                  <h3 style={s.miniCardTitle}>📍 Delivering To</h3>
                  {(() => {
                    const addr = getDeliveryAddress()
                    return (
                      <>
                        <p style={s.addrName}>{addr.name}</p>
                        <p style={s.addrLine}>{addr.line1}{addr.line2 ? ", " + addr.line2 : ""}</p>
                        <p style={s.addrLine}>{addr.city}, {addr.state} - {addr.pin}</p>
                        <p style={s.addrPhone}>📞 {addr.phone}</p>
                      </>
                    )
                  })()}
                  <button onClick={() => setStep(1)} style={s.changeBtn}>Change</button>
                </div>

                <div style={s.card}>
                  <h3 style={s.miniCardTitle}>🧾 Billing Address</h3>
                  {(() => {
                    const addr = getBillingAddress()
                    return (
                      <>
                        {billingSameAsDelivery && <span style={s.sameTag}>Same as delivery</span>}
                        <p style={s.addrName}>{addr.name}</p>
                        <p style={s.addrLine}>{addr.line1}{addr.line2 ? ", " + addr.line2 : ""}</p>
                        <p style={s.addrLine}>{addr.city}, {addr.state} - {addr.pin}</p>
                      </>
                    )
                  })()}
                  <button onClick={() => setStep(1)} style={s.changeBtn}>Change</button>
                </div>
              </div>

              <div style={{ ...s.card, marginTop: "16px" }}>
                <h3 style={s.miniCardTitle}>💳 Payment</h3>
                <p style={{ margin: 0, fontWeight: "600", fontSize: "0.95rem" }}>
                  {paymentMethod === "card" ? (savedCard ? "Visa •••• 4242" : "Card ending " + (cardDetails.number.slice(-4) || "••••")) :
                   paymentMethod === "upi" ? `UPI: ${upiId}` :
                   paymentMethod === "netbanking" ? "Net Banking" : "Cash on Delivery"}
                </p>
                <button onClick={() => setStep(2)} style={s.changeBtn}>Change</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Panel: Price Summary ── */}
        <div style={s.rightPanel}>
          <div style={s.summaryCard}>
            <h3 style={s.summaryTitle}>Price Details</h3>
            <div style={s.summaryRow}><span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div style={s.summaryRow}><span>Shipping</span><span style={{ color: shipping === 0 ? "#16a34a" : "#111" }}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
            <div style={s.summaryRow}><span>GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
            {paymentMethod === "cod" && <div style={s.summaryRow}><span>COD Fee</span><span>₹49</span></div>}
            <div style={s.divider} />
            <div style={{ ...s.summaryRow, fontWeight: "800", fontSize: "1.1rem" }}>
              <span>Total</span>
              <span style={{ color: "#16a34a" }}>₹{(total + (paymentMethod === "cod" ? 49 : 0)).toLocaleString()}</span>
            </div>
            {shipping === 0 && <p style={s.freeShipMsg}>🎉 You saved ₹99 on shipping!</p>}

            {/* Action Button */}
            <button onClick={handleNext} style={s.nextBtn}>
              {step === 0 ? "Proceed to Address →" :
               step === 1 ? "Proceed to Payment →" :
               step === 2 ? "Review Order →" :
               "Place Order 🎉"}
            </button>

            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={s.backStepBtn}>← Go Back</button>
            )}

            <p style={s.secureNote}>🔒 100% Secure & Encrypted Payment</p>
          </div>

          {/* Items mini list */}
          <div style={{ ...s.summaryCard, marginTop: "16px" }}>
            <h3 style={s.summaryTitle}>Items in Cart</h3>
            {cart.map(item => (
              <div key={item.id} style={s.miniItem}>
                <img src={item.image} alt={item.name} style={s.miniImg} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={s.miniName}>{item.name}</p>
                  <p style={s.miniQty}>Qty: {item.qty}</p>
                </div>
                <span style={s.miniPrice}>₹{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}

// ── Reusable Address Form ──────────────────────────────────────
const AddressForm = ({ data, onChange }) => {
  const fields = [
    { key: "name",  label: "Full Name *",     placeholder: "Your full name",       col: 2 },
    { key: "line1", label: "Address Line 1 *", placeholder: "House no., Street",   col: 2 },
    { key: "line2", label: "Address Line 2",   placeholder: "Area, Landmark",      col: 2 },
    { key: "city",  label: "City *",           placeholder: "City",                col: 1 },
    { key: "state", label: "State",            placeholder: "State",               col: 1 },
    { key: "pin",   label: "PIN Code *",       placeholder: "560001",              col: 1 },
    { key: "phone", label: "Phone *",          placeholder: "+91 XXXXX XXXXX",     col: 1 },
  ]
  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {fields.map(f => (
          <div key={f.key} style={{ ...s.formGroup, gridColumn: f.col === 2 ? "1/-1" : "auto" }}>
            <label style={s.label}>{f.label}</label>
            <input placeholder={f.placeholder} value={data[f.key] || ""}
              onChange={e => onChange(p => ({ ...p, [f.key]: e.target.value }))}
              style={s.input} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────
const s = {
  root:         { minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif" },
  toast:        { position: "fixed", top: "20px", right: "20px", color: "#fff", padding: "12px 24px", borderRadius: "10px", zIndex: 9999, fontWeight: "600", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" },
  header:       { background: "#1a1a2e", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  backBtn:      { background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "0.9rem", fontWeight: "600" },
  headerTitle:  { margin: 0, fontSize: "1.3rem", fontWeight: "bold", color: "#fff" },
  secureTag:    { background: "#ffffff15", color: "#fff", padding: "6px 12px", borderRadius: "20px", fontSize: "0.8rem" },
  stepBarWrap:  { background: "#fff", padding: "20px 32px", borderBottom: "1px solid #e5e7eb" },
  stepBar:      { display: "flex", alignItems: "center", maxWidth: "600px", margin: "0 auto" },
  stepWrap:     { display: "flex", alignItems: "center", flex: 1 },
  stepCircle:   { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: "700", flexShrink: 0 },
  stepLabel:    { fontSize: "0.78rem", marginLeft: "8px", whiteSpace: "nowrap" },
  stepLine:     { flex: 1, height: "2px", margin: "0 8px" },
  layout:       { display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", padding: "24px 32px", maxWidth: "1200px", margin: "0 auto", alignItems: "start" },
  leftPanel:    {},
  rightPanel:   {},
  card:         { background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" },
  cardTitle:    { margin: "0 0 20px", fontSize: "1.1rem", fontWeight: "800", color: "#111" },
  miniCardTitle:{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: "700", color: "#111" },
  cartItem:     { display: "flex", gap: "14px", padding: "12px 0", borderBottom: "1px solid #f3f4f6" },
  cartImg:      { width: "64px", height: "64px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 },
  cartItemName: { margin: "0 0 4px", fontWeight: "700", fontSize: "0.9rem", color: "#111" },
  cartItemCat:  { margin: "0 0 4px", fontSize: "0.78rem", color: "#9ca3af" },
  cartItemQty:  { margin: 0, fontSize: "0.8rem", color: "#6b7280" },
  cartItemPrice:{ margin: 0, fontWeight: "800", fontSize: "1rem", color: "#111" },
  cartItemUnit: { margin: "2px 0 0", fontSize: "0.75rem", color: "#9ca3af" },
  divider:      { height: "1px", background: "#e5e7eb", margin: "16px 0" },
  couponRow:    { display: "flex", gap: "10px" },
  couponInput:  { flex: 1, padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.9rem", outline: "none" },
  couponBtn:    { background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontWeight: "600" },
  addrList:     { display: "flex", flexDirection: "column", gap: "12px" },
  addrOption:   { display: "flex", gap: "14px", padding: "14px", borderRadius: "10px", border: "1.5px solid #e5e7eb", cursor: "pointer", transition: "all 0.15s" },
  addrOptionActive:{ border: "1.5px solid #1a1a2e", background: "#f8fafc" },
  addrRadio:    { paddingTop: "2px" },
  radioOuter:   { width: "18px", height: "18px", borderRadius: "50%", border: "2px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  radioInner:   { width: "8px", height: "8px", borderRadius: "50%", background: "#1a1a2e" },
  addrLabel:    { fontWeight: "700", fontSize: "0.85rem", color: "#111" },
  defaultTag:   { background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "700" },
  addrName:     { margin: "0 0 2px", fontWeight: "600", fontSize: "0.88rem", color: "#111" },
  addrLine:     { margin: "0 0 2px", fontSize: "0.82rem", color: "#6b7280" },
  addrPhone:    { margin: "4px 0 0", fontSize: "0.8rem", color: "#374151" },
  newAddrBtn:   { background: "none", border: "2px dashed #e5e7eb", borderRadius: "10px", padding: "12px", width: "100%", cursor: "pointer", color: "#6b7280", fontWeight: "600", fontSize: "0.88rem" },
  backToSaved:  { background: "none", border: "none", color: "#2563eb", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem", padding: "0 0 12px", display: "block" },
  sameAddrRow:  { display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px", background: "#f8fafc", borderRadius: "10px", cursor: "pointer", border: "1.5px solid #e5e7eb" },
  checkbox:     { width: "20px", height: "20px", borderRadius: "5px", border: "2px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" },
  checkmark:    { color: "#fff", fontSize: "0.75rem", fontWeight: "bold" },
  sameAddrLabel:{ margin: 0, fontWeight: "700", fontSize: "0.9rem", color: "#111" },
  sameAddrSub:  { margin: "2px 0 0", fontSize: "0.78rem", color: "#9ca3af" },
  billingPreview:{ marginTop: "16px", background: "#f8fafc", borderRadius: "10px", padding: "14px", border: "1px solid #e5e7eb" },
  billingPreviewTitle:{ margin: "0 0 8px", fontSize: "0.8rem", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" },
  paymentOptions:{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" },
  payOption:    { display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "10px", border: "1.5px solid #e5e7eb", cursor: "pointer" },
  payOptionActive:{ border: "1.5px solid #1a1a2e", background: "#f8fafc" },
  payIcon:      { fontSize: "1.3rem" },
  payLabel:     { fontWeight: "600", fontSize: "0.9rem", color: "#111" },
  payForm:      { marginTop: "4px" },
  cardVisual:   { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", borderRadius: "14px", padding: "24px", color: "#fff", marginBottom: "20px" },
  cardChip:     { fontSize: "1.2rem", color: "#fbbf24", marginBottom: "20px", letterSpacing: "-4px" },
  cardNumber:   { fontSize: "1.1rem", fontWeight: "bold", letterSpacing: "3px", margin: "0 0 20px" },
  cardBottom:   { display: "flex", justifyContent: "space-between" },
  cardFieldLabel:{ margin: "0 0 2px", fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" },
  cardFieldVal: { margin: 0, fontWeight: "700", fontSize: "0.85rem" },
  savedCardRow: { display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: "#f8fafc", borderRadius: "10px", cursor: "pointer", border: "1.5px solid #e5e7eb", marginBottom: "16px" },
  visaTag:      { background: "#1a1a2e", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "800", marginLeft: "auto" },
  cardForm:     { display: "flex", flexDirection: "column", gap: "14px" },
  upiApps:      { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  upiApp:       { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e5e7eb", cursor: "pointer", minWidth: "80px" },
  sameTag:      { display: "inline-block", background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700", marginBottom: "8px" },
  changeBtn:    { marginTop: "12px", background: "none", border: "none", color: "#2563eb", fontWeight: "600", cursor: "pointer", fontSize: "0.82rem", padding: 0 },
  summaryCard:  { background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", position: "sticky", top: "20px" },
  summaryTitle: { margin: "0 0 16px", fontSize: "1rem", fontWeight: "800", color: "#111" },
  summaryRow:   { display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "0.9rem", color: "#374151" },
  freeShipMsg:  { background: "#f0fdf4", color: "#16a34a", padding: "8px 12px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "600", margin: "8px 0 0", textAlign: "center" },
  nextBtn:      { width: "100%", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", marginTop: "16px" },
  backStepBtn:  { width: "100%", background: "#fff", color: "#6b7280", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", marginTop: "8px" },
  secureNote:   { textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", marginTop: "12px" },
  miniItem:     { display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid #f3f4f6" },
  miniImg:      { width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 },
  miniName:     { margin: "0 0 2px", fontSize: "0.8rem", fontWeight: "600", color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" },
  miniQty:      { margin: 0, fontSize: "0.72rem", color: "#9ca3af" },
  miniPrice:    { fontSize: "0.85rem", fontWeight: "700", color: "#111", flexShrink: 0 },
  twoCol:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  formGroup:    { display: "flex", flexDirection: "column", gap: "6px" },
  label:        { fontSize: "0.82rem", fontWeight: "600", color: "#374151" },
  input:        { padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.9rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "sans-serif" },
  successWrap:  { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  successCard:  { background: "#fff", borderRadius: "20px", padding: "48px", textAlign: "center", maxWidth: "480px", width: "100%", boxShadow: "0 4px 40px rgba(0,0,0,0.1)" },
  successIcon:  { fontSize: "4rem", marginBottom: "16px" },
  successTitle: { margin: "0 0 8px", fontSize: "1.6rem", fontWeight: "bold", color: "#111" },
  successSub:   { margin: "0 0 24px", color: "#6b7280", fontSize: "0.95rem" },
  successDetails:{ background: "#f8fafc", borderRadius: "12px", padding: "16px", textAlign: "left", marginBottom: "24px" },
  successRow:   { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb", fontSize: "0.88rem", color: "#374151" },
  successBtns:  { display: "flex", flexDirection: "column", gap: "10px" },
  trackBtn:     { background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer" },
  continueBtn:  { background: "#fff", color: "#111", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "12px", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer" },
}

export default Checkout