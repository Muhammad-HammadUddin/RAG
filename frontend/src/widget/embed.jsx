import { createRoot } from 'react-dom/client'
import ChatWidget from './ChatWidget.jsx'

function init() {
  const currentScript =
    document.currentScript || document.querySelector('script[data-chat-widget]')

  if (!currentScript) {
    console.error('[ChatWidget] Could not find the widget <script> tag.')
    return
  }

  const ds = currentScript.dataset

  const config = {
    apiBase: ds.apiUrl,          // required, e.g. https://telecard-api.com/api/ask
    apiKey: ds.apiKey,           // required, this client's secret key
    primaryColor: ds.color || '#2563eb',
    botName: ds.botName || 'Support Bot',
    welcomeMessage: ds.welcome || 'How can I help you today?',
    position: ds.position || 'bottom-right',
  }

  if (!config.apiBase || !config.apiKey) {
    console.error('[ChatWidget] data-api-url and data-api-key are required on the script tag.')
    return
  }

  // Host element + shadow root so the client site's CSS can never bleed in or out
  const host = document.createElement('div')
  host.id = 'chat-widget-host'
  document.body.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })
  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)

  createRoot(mountPoint).render(<ChatWidget config={config} />)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
