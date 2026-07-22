import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/ask'
const CHAT_USER_ID_KEY = 'chat-user-id'

function getOrCreateUserId() {
  if (typeof window === 'undefined') {
    return `user-${Date.now()}`
  }

  const existingId = window.sessionStorage.getItem(CHAT_USER_ID_KEY)
  if (existingId) {
    return existingId
  }

  const generatedId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  window.sessionStorage.setItem(CHAT_USER_ID_KEY, generatedId)
  return generatedId
}

function App() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I can help with pricing, setup, and integration. Ask me anything.' },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const userId = getOrCreateUserId()
    const sessionId = `session-${userId}`

    fetch(`${API_BASE}/history?sessionId=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load history')
        return res.json()
      })
      .then((data) => {
        if (data.messages?.length) {
          setMessages(data.messages)
        }
      })
      .catch(() => {

      })
  }, [])

 const sendMessage = async () => {
  const text = input.trim()
  if (!text || isLoading) return

  const userId = getOrCreateUserId()
  const sessionId = `session-${userId}`
  const botId = `${userId}-${Date.now()}`

  setMessages((prev) => [...prev, { id: `${userId}-${Date.now()}-user`, sender: 'user', text }])
  setMessages((prev) => [...prev, { id: botId, sender: 'bot', text: 'Thinking…' }])
  setInput('')
  setIsLoading(true)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000) // hang na ho

  try {
    const response = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId, userId }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errText = response.status === 429
        ? 'Too many messages, please wait a bit.'
        : 'The assistant is not available right now.'
      throw new Error(errText)
    }

    const payload = await response.json()
    const answer = payload?.answer || 'The assistant did not return a reply.'

    setMessages((prev) => prev.map((msg) =>
      msg.id === botId ? { ...msg, text: answer } : msg
    ))
  } catch (error) {
    const text = error.name === 'AbortError'
      ? 'The assistant is taking too long. Please try again.'
      : (error.message || 'The assistant is not available right now.')

    setMessages((prev) => prev.map((msg) =>
      msg.id === botId ? { ...msg, text } : msg
    ))
  } finally {
    clearTimeout(timeoutId)
    setIsLoading(false)
  }
}
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Chat<span>Flow</span></div>
        <nav className="nav-links">
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main className="hero-section">
        <div>
          <h1>Launch a smart chatbot for your website in days.</h1>
          <p>We build lightweight AI assistants that help visitors find answers fast, qualify leads, and improve conversions at a minimal cost.</p>
          <div className="cta-row">
            <button className="btn primary">Get Started</button>
            <button className="btn secondary">See Pricing</button>
          </div>
          <div className="stats">
            <div className="stat-card"><strong>24/7</strong><span>Support</span></div>
            <div className="stat-card"><strong>80%</strong><span>Faster Replies</span></div>
            <div className="stat-card"><strong>$99</strong><span>Starter Plan</span></div>
          </div>
        </div>

        <aside className="info-card">
          <h3>Why teams choose us</h3>
          <ul>
            <li>Fast chatbot setup for existing sites</li>
            <li>Affordable monthly plans</li>
            <li>Custom answers from your own content</li>
            <li>Easy integration with WordPress, Shopify, and custom apps</li>
          </ul>
        </aside>
      </main>

      <section id="services" className="services-section">
        <h2>Our Services</h2>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Website Chatbot</h3>
            <p>Deploy a conversational assistant that answers visitor questions instantly.</p>
          </article>
          <article className="feature-card">
            <h3>Lead Capture</h3>
            <p>Collect emails and route hot leads directly to your sales team.</p>
          </article>
          <article className="feature-card">
            <h3>Knowledge Base AI</h3>
            <p>Train the bot from FAQs, docs, and internal resources to stay accurate.</p>
          </article>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="info-card wide">
          <h3>Minimal cost, maximum clarity</h3>
          <p>We handle the setup, tuning, and deployment so you can launch without a heavy engineering budget.</p>
        </div>
      </section>

      <button className="chat-toggle" onClick={() => setOpen((prev) => !prev)}>💬 Chat with us</button>

      <div className={`chat-window ${open ? 'open' : ''}`}>
        <div className="chat-header">
          <strong>Support Bot</strong>
          <button onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
        </div>
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`msg ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage} disabled={isLoading}>{isLoading ? '...' : 'Send'}</button>
        </div>
      </div>
    </div>
  )
}

export default App
