import { useState } from 'react'
import { PHASES, getCurrentCycleInfo, getPhaseForDay, getNextPeriodDate } from '../utils/cycle'

export default function CycleView({ data, updateData }) {
  const [showSettings, setShowSettings] = useState(!data.lastPeriodDate)
  const [form, setForm] = useState({
    lastPeriodDate: data.lastPeriodDate || '',
    cycleLength: data.cycleLength || 28
  })

  const info = getCurrentCycleInfo(data.lastPeriodDate, data.cycleLength)
  const nextPeriod = getNextPeriodDate(data.lastPeriodDate, data.cycleLength)

  const saveSettings = () => {
    if (!form.lastPeriodDate) return
    updateData({ lastPeriodDate: form.lastPeriodDate, cycleLength: parseInt(form.cycleLength) || 28 })
    setShowSettings(false)
  }

  const CycleStrip = () => {
    const cl = data.cycleLength || 28
    const today = info?.dayInCycle

    return (
      <div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {Array.from({ length: cl }, (_, i) => i + 1).map(day => {
            const phase = getPhaseForDay(day, cl)
            const isToday = day === today
            return (
              <div
                key={day}
                title={`Jour ${day} — ${phase.label}`}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  background: isToday ? phase.color : `${phase.color}22`,
                  border: isToday ? `2px solid ${phase.color}` : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontFamily: 'Space Mono, monospace',
                  color: isToday ? 'white' : phase.color,
                  fontWeight: isToday ? 700 : 400,
                  transform: isToday ? 'scale(1.15)' : 'none',
                  position: 'relative',
                  zIndex: isToday ? 1 : 0,
                  cursor: 'default'
                }}
              >
                {isToday ? '●' : day}
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 20, marginTop: 18, flexWrap: 'wrap' }}>
          {Object.values(PHASES).map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── Setup screen ── */
  if (!data.lastPeriodDate || showSettings) {
    return (
      <div>
        <div className="mode-hero">
          <div className="mode-hero-title">CYCLE</div>
          <div className="mode-hero-subtitle">Synchronise tes tâches avec ton énergie naturelle</div>
        </div>

        <div className="card" style={{ maxWidth: 500 }}>
          <div className="section-title mb-6">Configuration</div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24, lineHeight: 1.6 }}>
            Ces données restent uniquement sur ton appareil. Elles permettent de calculer ta phase actuelle et d'adapter les suggestions dans chaque mode.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label>Date de début de tes dernières règles</label>
            <input
              type="date"
              value={form.lastPeriodDate}
              onChange={e => setForm(f => ({ ...f, lastPeriodDate: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label>Durée moyenne de ton cycle (jours)</label>
            <input
              type="number"
              min="21"
              max="45"
              value={form.cycleLength}
              onChange={e => setForm(f => ({ ...f, cycleLength: e.target.value }))}
            />
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
              La moyenne est 28 jours. La plupart des cycles vont de 21 à 35 jours.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={saveSettings} disabled={!form.lastPeriodDate}>
              Activer le suivi du cycle
            </button>
            {data.lastPeriodDate && (
              <button className="btn btn-ghost" onClick={() => setShowSettings(false)}>Annuler</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const { phase, dayInCycle, daysLeft } = info

  return (
    <div>
      <div className="mode-hero">
        <div className="mode-hero-title" style={{ color: phase.color }}>CYCLE</div>
        <div className="mode-hero-subtitle">
          <span style={{ color: phase.color, fontWeight: 700 }}>{phase.moon} {phase.label}</span>
          <span>—</span>
          <span>Jour {dayInCycle} sur {data.cycleLength || 28}</span>
        </div>
      </div>

      {/* Current phase + energy */}
      <div className="grid-2 mb-24">
        <div
          className="card"
          style={{ borderColor: `${phase.color}25`, background: `${phase.color}06` }}
        >
          <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 20 }}>{phase.moon}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: phase.color, marginBottom: 10 }}>
            {phase.short}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 20 }}>
            {phase.summary}
          </div>

          {/* Energy meter */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 10 }}>
              Niveau d'énergie
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    background: i <= phase.energy ? phase.color : 'rgba(255,255,255,0.07)'
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 12, color: phase.color, marginTop: 8, fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>
              {phase.energy}/5
            </div>
          </div>

          {daysLeft > 0 && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Encore <strong style={{ color: 'white' }}>{daysLeft} jour{daysLeft > 1 ? 's' : ''}</strong> dans cette phase
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Focus + actions */}
          <div className="card">
            <div className="section-title mb-14">Priorités — {phase.focus}</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
              {phase.doList.map(item => (
                <span
                  key={item}
                  className="tag"
                  style={{ background: `${phase.color}18`, color: phase.color }}
                >
                  ✓ {item}
                </span>
              ))}
            </div>
            <div className="section-title mb-10">À éviter</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {phase.avoidList.map(item => (
                <span
                  key={item}
                  className="tag"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                >
                  ✗ {item}
                </span>
              ))}
            </div>
          </div>

          {/* Next period */}
          {nextPeriod && (
            <div className="card">
              <div className="section-title mb-10">Prochaines règles estimées</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: PHASES.menstruation.color }}>
                {nextPeriod.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
                Dans {Math.round((nextPeriod - new Date()) / 86400000)} jours
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions per mode */}
      <div className="section-title mb-16">Suggestions par mode — phase actuelle</div>
      <div className="grid-3 mb-24">
        {[
          { key: 'salariee', label: 'SALARIÉE', modeColor: '#8B5CF6' },
          { key: 'afk',      label: 'AFK',      modeColor: '#F59E0B' },
          { key: 'crea',     label: 'CRÉA',     modeColor: '#EC4899' }
        ].map(m => (
          <div key={m.key} className="card">
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: m.modeColor,
              marginBottom: 16,
              textTransform: 'uppercase'
            }}>
              {m.label}
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {phase.suggestions[m.key].map((s, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: phase.color, fontSize: 11, marginTop: 2, flexShrink: 0 }}>▸</span>
                  <span style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.8)' }}>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Phases overview */}
      <div className="section-title mb-16">Les 4 phases — que faire quand</div>
      <div className="grid-2 mb-24">
        {Object.values(PHASES).map(p => {
          const isCurrent = p.id === phase.id
          return (
            <div
              key={p.id}
              className="card"
              style={{
                borderColor: isCurrent ? `${p.color}40` : 'var(--border)',
                background: isCurrent ? `${p.color}08` : 'var(--surface)',
                opacity: isCurrent ? 1 : 0.6
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{p.moon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                    Jours 1–{p.id === 'menstruation' ? 5 : p.id === 'follicular' ? 13 : p.id === 'ovulation' ? 17 : data.cycleLength || 28}
                    {isCurrent && <span style={{ color: p.color, marginLeft: 8 }}>← Maintenant</span>}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i <= p.energy ? p.color : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                {p.focus}
              </div>
            </div>
          )
        })}
      </div>

      {/* Cycle strip */}
      <div className="card mb-16">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div className="section-title">Calendrier du cycle — {data.cycleLength || 28} jours</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(true)}>
            Modifier
          </button>
        </div>
        <CycleStrip />
      </div>
    </div>
  )
}
