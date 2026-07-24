import { useState, useEffect, useRef } from 'react'

const USER_ID_KEY = 'chat-user-id'

function getOrCreateUserId() {
  if (typeof window === 'undefined') return `user-${Date.now()}`
  const existing = window.sessionStorage.getItem(USER_ID_KEY)
  if (existing) return existing
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  window.sessionStorage.setItem(USER_ID_KEY, id)
  return id
}

// config is optional on purpose — if nothing is passed (e.g. previewing this
// component on its own) it falls back to safe demo values instead of crashing.
export default function ChatWidget({ config = {} }) {
  const {
    apiBase = '',                 // '' = demo mode, no real backend call
    apiKey = '',
    primaryColor = '#2563eb',
    botName = 'Support Bot',
    welcomeMessage = 'How can I help you today?',
    position = 'bottom-right',    // 'bottom-right' | 'bottom-left'
  } = config

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ id: 1, sender: 'bot', text: welcomeMessage }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const userIdRef = useRef(getOrCreateUserId())

  const headers = {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  }

  useEffect(() => {
    if (!apiBase) return // demo mode, nothing to fetch
    const sessionId = `session-${userIdRef.current}`
    fetch(`${apiBase}/history?sessionId=${sessionId}`, { headers })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.messages?.length) setMessages(data.messages)
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userId = userIdRef.current
    const sessionId = `session-${userId}`
    const botId = `${userId}-${Date.now()}`

    setMessages((prev) => [...prev, { id: `${userId}-${Date.now()}-user`, sender: 'user', text }])
    setInput('')

    if (!apiBase) {
      // demo mode — no backend configured, show a placeholder reply
      setMessages((prev) => [
        ...prev,
        { id: botId, sender: 'bot', text: 'Demo mode: connect apiBase to get real answers.' },
      ])
      return
    }

    setMessages((prev) => [...prev, { id: botId, sender: 'bot', text: 'Thinking…' }])
    setIsLoading(true)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000)

    try {
      const response = await fetch(apiBase, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, sessionId, userId }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(
          response.status === 429
            ? 'Too many messages, please wait a bit.'
            : 'The assistant is not available right now.'
        )
      }

      const payload = await response.json()
      const answer = payload?.answer || 'The assistant did not return a reply.'
      setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text: answer } : m)))
    } catch (error) {
      const text =
        error.name === 'AbortError'
          ? 'The assistant is taking too long. Please try again.'
          : error.message || 'The assistant is not available right now.'
      setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text } : m)))
    } finally {
      clearTimeout(timeoutId)
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`cw-root cw-${position}`}
      style={{ '--cw-primary': primaryColor, position: 'fixed', zIndex: 999999 }}
    >
      <style>{`
        .cw-root { font-family: system-ui, -apple-system, sans-serif; }
        .cw-bottom-right { bottom: 20px; right: 20px; }
        .cw-bottom-left { bottom: 20px; left: 20px; }
        .cw-toggle {
          width: 56px; height: 56px; border-radius: 50%; border: none;
          background: var(--cw-primary); color: #fff; font-size: 22px; cursor: pointer;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        }
        .cw-window {
          position: absolute; bottom: 70px; right: 0; width: 320px; height: 420px;
          background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          display: none; flex-direction: column; overflow: hidden;
        }
        .cw-bottom-left .cw-window { right: auto; left: 0; }
        .cw-window.cw-open { display: flex; }
        .cw-header {
          background: var(--cw-primary); color: #fff; padding: 12px 14px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .cw-header button { background: none; border: none; color: #fff; cursor: pointer; font-size: 14px; }
        .cw-messages { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
        .cw-msg { max-width: 80%; padding: 8px 12px; border-radius: 10px; font-size: 14px; line-height: 1.4; }
        .cw-msg.cw-bot { background: #f1f1f4; align-self: flex-start; color: #1a1a1a; }
        .cw-msg.cw-user { background: var(--cw-primary); color: #fff; align-self: flex-end; }
        .cw-input { display: flex; border-top: 1px solid #eee; }
        .cw-input input { flex: 1; border: none; padding: 10px; font-size: 14px; outline: none; }
        .cw-input button { background: var(--cw-primary); color: #fff; border: none; padding: 0 14px; cursor: pointer; }
        .cw-input button:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <button className="cw-toggle" onClick={() => setOpen((p) => !p)} aria-label="Toggle chat">
        {open ? '✕' : '💬'}
      </button>

      <div className={`cw-window ${open ? 'cw-open' : ''}`}>
        <div className="cw-header">
          <strong>{botName}</strong>
          <button onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
        </div>
        <div className="cw-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`cw-msg cw-${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="cw-input">
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
          <button onClick={sendMessage} disabled={isLoading}>
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
