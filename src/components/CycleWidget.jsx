import { useState } from 'react'
import { getCurrentCycleInfo } from '../utils/cycle'

export default function CycleWidget({ cycleData, mode }) {
  const [hidden, setHidden] = useState(false)

  const info = getCurrentCycleInfo(cycleData?.lastPeriodDate, cycleData?.cycleLength)
  if (!info || !cycleData?.lastPeriodDate) return null

  const { phase, dayInCycle, daysLeft } = info

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          borderRadius: 100,
          background: `${phase.color}12`,
          border: `1px solid ${phase.color}30`,
          cursor: 'pointer',
          marginBottom: 28,
          fontSize: 12,
          fontWeight: 700,
          color: phase.color,
          fontFamily: 'inherit',
          letterSpacing: '0.04em'
        }}
      >
        <span>{phase.moon}</span>
        <span>{phase.short}</span>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, marginLeft: 2 }}>▾</span>
      </button>
    )
  }

  return (
    <div
      style={{
        border: `1px solid ${phase.color}25`,
        background: `${phase.color}08`,
        borderRadius: 14,
        padding: '18px 22px',
        marginBottom: 28
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>{phase.moon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: phase.color, letterSpacing: '0.04em' }}>
              {phase.short}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              Jour {dayInCycle} du cycle
              {daysLeft > 0 ? ` · encore ${daysLeft}j dans cette phase` : ''}
            </div>
          </div>
        </div>
        <button
          onClick={() => setHidden(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.25)',
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            padding: 4
          }}
        >
          ✕
        </button>
      </div>

      {/* Energy bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i <= phase.energy ? phase.color : 'rgba(255,255,255,0.07)'
            }}
          />
        ))}
      </div>

      {/* Suggestions for this mode */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {(phase.suggestions[mode] || []).map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <span style={{ color: phase.color, fontSize: 10, marginTop: 3, flexShrink: 0 }}>▸</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
