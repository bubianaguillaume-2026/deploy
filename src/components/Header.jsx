import { useState, useEffect } from 'react'

export default function Header({ mode, setMode, modes }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="header">
      <div className="logo">Side Hustler</div>

      <div className="mode-switcher">
        {Object.entries(modes).map(([key, m]) => (
          <button
            key={key}
            className={`mode-btn ${mode === key ? 'active' : ''}`}
            onClick={() => setMode(key)}
            style={mode === key ? { background: m.color } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="header-time">
        {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </header>
  )
}
