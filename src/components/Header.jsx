import { useState, useEffect } from 'react'
import { getCurrentCycleInfo } from '../utils/cycle'

export default function Header({ mode, setMode, modes, cycleData }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const cycleInfo = getCurrentCycleInfo(cycleData?.lastPeriodDate, cycleData?.cycleLength)

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
            {key === 'cycle' && cycleInfo ? `${cycleInfo.phase.moon} ${m.label}` : m.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {cycleInfo && mode !== 'cycle' && (
          <button
            onClick={() => setMode('cycle')}
            title={`${cycleInfo.phase.label} — Jour ${cycleInfo.dayInCycle}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: `${cycleInfo.phase.color}15`,
              border: `1px solid ${cycleInfo.phase.color}30`,
              borderRadius: 100,
              padding: '4px 12px',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              color: cycleInfo.phase.color,
              fontFamily: 'inherit',
              letterSpacing: '0.04em',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: 13 }}>{cycleInfo.phase.moon}</span>
            <span>J{cycleInfo.dayInCycle}</span>
          </button>
        )}
        <div className="header-time">
          {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </header>
  )
}
