import { useState } from 'react'
import { EVENT_SUGGESTIONS, computeDeadline } from '../utils/yearPlan'
import { exportMonthlyTargets, exportActionPlan } from '../utils/exportCSV'

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const fmt = n =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0)

const DELAY_OPTIONS = [1, 3, 7, 14, 21, 30, 45, 60, 90]

export default function YearPlan({ data, updateData }) {
  const [subTab, setSubTab] = useState('monthly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [addingEventFor, setAddingEventFor] = useState(null)
  const [addingActionFor, setAddingActionFor] = useState(null)
  const [eventForm, setEventForm] = useState({ name: '', date: '', color: '#F59E0B' })
  const [actionForm, setActionForm] = useState({ label: '', daysBeforeEvent: 30 })

  const monthlyTargets = data.monthlyTargets || {}
  const commercialEvents = data.commercialEvents || []

  const months = Array.from({ length: 12 }, (_, i) => ({
    key: `${year}-${String(i + 1).padStart(2, '0')}`,
    index: i,
    name: MONTH_NAMES[i]
  }))

  const today = new Date().toISOString().slice(0, 10)
  const currentMonthKey = today.slice(0, 7)

  const totalTarget = months.reduce((s, m) => s + (monthlyTargets[m.key]?.target || 0), 0)
  const totalActual = months.reduce((s, m) => s + (monthlyTargets[m.key]?.actual || 0), 0)
  const totalEcart = totalActual - totalTarget

  const updateMonthField = (monthKey, field, value) => {
    updateData(prev => ({
      ...prev,
      monthlyTargets: {
        ...(prev.monthlyTargets || {}),
        [monthKey]: {
          ...(prev.monthlyTargets?.[monthKey] || {}),
          [field]: parseFloat(value) || 0
        }
      }
    }))
  }

  const handleAddEvent = (monthKey) => {
    if (!eventForm.name.trim() || !eventForm.date) return
    updateData(prev => ({
      ...prev,
      commercialEvents: [
        ...(prev.commercialEvents || []),
        {
          id: Date.now(),
          name: eventForm.name.trim(),
          date: eventForm.date,
          month: eventForm.date.slice(0, 7),
          color: eventForm.color,
          actions: []
        }
      ]
    }))
    setEventForm({ name: '', date: '', color: '#F59E0B' })
    setAddingEventFor(null)
  }

  const deleteEvent = id => {
    updateData(prev => ({
      ...prev,
      commercialEvents: (prev.commercialEvents || []).filter(e => e.id !== id)
    }))
    if (addingActionFor === id) setAddingActionFor(null)
  }

  const handleAddAction = (eventId) => {
    if (!actionForm.label.trim()) return
    const event = commercialEvents.find(e => e.id === eventId)
    if (!event) return
    const deadline = computeDeadline(event.date, actionForm.daysBeforeEvent)
    updateData(prev => ({
      ...prev,
      commercialEvents: (prev.commercialEvents || []).map(e =>
        e.id === eventId
          ? {
              ...e,
              actions: [
                ...e.actions,
                {
                  id: Date.now(),
                  label: actionForm.label.trim(),
                  daysBeforeEvent: parseInt(actionForm.daysBeforeEvent) || 0,
                  deadline,
                  done: false
                }
              ]
            }
          : e
      )
    }))
    setActionForm({ label: '', daysBeforeEvent: 30 })
    setAddingActionFor(null)
  }

  const toggleAction = (eventId, actionId) => {
    updateData(prev => ({
      ...prev,
      commercialEvents: (prev.commercialEvents || []).map(e =>
        e.id === eventId
          ? { ...e, actions: e.actions.map(a => a.id === actionId ? { ...a, done: !a.done } : a) }
          : e
      )
    }))
  }

  const deleteAction = (eventId, actionId) => {
    updateData(prev => ({
      ...prev,
      commercialEvents: (prev.commercialEvents || []).map(e =>
        e.id === eventId
          ? { ...e, actions: e.actions.filter(a => a.id !== actionId) }
          : e
      )
    }))
  }

  const allActions = commercialEvents
    .flatMap(e =>
      e.actions.map(a => ({
        ...a,
        eventId: e.id,
        eventName: e.name,
        eventDate: e.date,
        eventColor: e.color,
        month: e.month
      }))
    )
    .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))

  const pendingActions = allActions.filter(a => !a.done)
  const doneActions = allActions.filter(a => a.done)

  return (
    <div>
      {/* Header row */}
      <div className="flex-between mb-16">
        <div className="flex-center gap-8">
          <button className="btn btn-ghost btn-sm" onClick={() => setYear(y => y - 1)}>‹</button>
          <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 18, minWidth: 52, textAlign: 'center' }}>
            {year}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setYear(y => y + 1)}>›</button>
        </div>
        <div className="flex-center gap-8">
          {subTab === 'monthly' && (
            <button className="btn btn-ghost btn-sm" onClick={() => exportMonthlyTargets(monthlyTargets)}>
              Export objectifs
            </button>
          )}
          {subTab === 'retro' && (
            <button className="btn btn-ghost btn-sm" onClick={() => exportActionPlan(allActions)}>
              Export rétro-planning
            </button>
          )}
        </div>
      </div>

      {/* Year summary bar */}
      <div className="card mb-24" style={{ padding: '16px 20px' }}>
        <div className="grid-3">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>Objectif annuel</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 20, fontWeight: 700 }}>{fmt(totalTarget)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>CA réalisé</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 20, fontWeight: 700 }}>{fmt(totalActual)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>Écart</div>
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 20,
              fontWeight: 700,
              color: totalEcart >= 0 ? '#22c55e' : '#ef4444'
            }}>
              {totalEcart >= 0 ? '+' : ''}{fmt(totalEcart)}
            </div>
          </div>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="tab-bar mb-24">
        {[
          { key: 'monthly', label: 'Vue mensuelle' },
          { key: 'retro', label: 'Rétro-planning' }
        ].map(t => (
          <button
            key={t.key}
            className={`tab-btn ${subTab === t.key ? 'tab-active' : ''}`}
            onClick={() => setSubTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── VUE MENSUELLE ── */}
      {subTab === 'monthly' && months.map(m => {
        const mt = monthlyTargets[m.key] || {}
        const target = mt.target || 0
        const actual = mt.actual || 0
        const ecart = actual - target
        const eventsForMonth = commercialEvents.filter(e => e.month === m.key)
        const isCurrentMonth = m.key === currentMonthKey
        const totalActions = eventsForMonth.reduce((s, e) => s + e.actions.length, 0)
        const doneCount = eventsForMonth.reduce((s, e) => s + e.actions.filter(a => a.done).length, 0)

        return (
          <div
            key={m.key}
            className="card mb-16"
            style={isCurrentMonth ? { border: '1px solid var(--accent)' } : {}}
          >
            {/* Month header */}
            <div className="flex-between mb-16">
              <div className="flex-center gap-10">
                <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  {m.name} {year}
                </span>
                {isCurrentMonth && (
                  <span className="tag" style={{ background: 'var(--accent)', color: 'black', fontSize: 9, fontWeight: 800 }}>
                    EN COURS
                  </span>
                )}
                {totalActions > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {doneCount}/{totalActions} actions
                  </span>
                )}
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 11 }}
                onClick={() => setAddingEventFor(addingEventFor === m.key ? null : m.key)}
              >
                + Événement
              </button>
            </div>

            {/* KPI inputs */}
            <div className="grid-3 mb-16">
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 6 }}>
                  Objectif (€)
                </div>
                <input
                  type="number"
                  placeholder="0"
                  defaultValue={target || ''}
                  onBlur={e => updateMonthField(m.key, 'target', e.target.value)}
                  style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 15 }}
                />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 6 }}>
                  CA réalisé (€)
                </div>
                <input
                  type="number"
                  placeholder="0"
                  defaultValue={actual || ''}
                  onBlur={e => updateMonthField(m.key, 'actual', e.target.value)}
                  style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 15 }}
                />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 6 }}>
                  Écart
                </div>
                <div style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 20,
                  fontWeight: 700,
                  paddingTop: 10,
                  color: ecart === 0 ? 'var(--text-muted)' : ecart > 0 ? '#22c55e' : '#ef4444'
                }}>
                  {ecart === 0 ? '—' : `${ecart > 0 ? '+' : ''}${fmt(ecart)}`}
                </div>
              </div>
            </div>

            {/* Add event form */}
            {addingEventFor === m.key && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Nouvel événement commercial
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {EVENT_SUGGESTIONS.map(s => (
                    <button
                      key={s.name}
                      onClick={() => setEventForm(f => ({ ...f, name: s.name, color: s.color }))}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        border: `1px solid ${eventForm.name === s.name ? s.color : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: 6,
                        background: eventForm.name === s.name ? `${s.color}20` : 'transparent',
                        color: eventForm.name === s.name ? s.color : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        letterSpacing: '0.03em',
                        transition: 'all 0.15s'
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                <div className="grid-2 mb-12">
                  <div>
                    <label>Nom de l'événement</label>
                    <input
                      placeholder="Ex: Fête des mères"
                      value={eventForm.name}
                      onChange={e => setEventForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label>Date de l'événement</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-8">
                  <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => handleAddEvent(m.key)}>
                    Ajouter
                  </button>
                  <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setAddingEventFor(null)}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Events */}
            {eventsForMonth.length > 0 && (
              <div>
                {eventsForMonth.map(event => (
                  <div
                    key={event.id}
                    style={{
                      borderLeft: `3px solid ${event.color}`,
                      paddingLeft: 14,
                      marginBottom: 16,
                      paddingBottom: 4
                    }}
                  >
                    <div className="flex-between mb-8">
                      <div className="flex-center gap-10">
                        <span style={{ fontWeight: 700, fontSize: 14, color: event.color }}>
                          {event.name}
                        </span>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                          {event.date}
                        </span>
                      </div>
                      <div className="flex gap-6">
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 10, padding: '3px 10px' }}
                          onClick={() => setAddingActionFor(addingActionFor === event.id ? null : event.id)}
                        >
                          + Action J-X
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '3px 8px', fontSize: 10 }}
                          onClick={() => deleteEvent(event.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Add action form */}
                    {addingActionFor === event.id && (
                      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 14, marginBottom: 10 }}>
                        <div className="grid-2 mb-10">
                          <div>
                            <label>Action marketing</label>
                            <input
                              placeholder="Ex: Lancer la pub Instagram"
                              value={actionForm.label}
                              onChange={e => setActionForm(f => ({ ...f, label: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && handleAddAction(event.id)}
                            />
                          </div>
                          <div>
                            <label>Délai avant l'événement</label>
                            <select
                              value={actionForm.daysBeforeEvent}
                              onChange={e => setActionForm(f => ({ ...f, daysBeforeEvent: e.target.value }))}
                            >
                              {DELAY_OPTIONS.map(d => (
                                <option key={d} value={d}>
                                  J-{d} ({d} jour{d > 1 ? 's' : ''} avant)
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                          Deadline : <strong style={{ fontFamily: 'Space Mono, monospace', color: event.color }}>
                            {computeDeadline(event.date, actionForm.daysBeforeEvent)}
                          </strong>
                        </div>
                        <div className="flex gap-8">
                          <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => handleAddAction(event.id)}>
                            Ajouter l'action
                          </button>
                          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setAddingActionFor(null)}>
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions list */}
                    {event.actions.length > 0 && event.actions.map(action => {
                      const isOverdue = !action.done && action.deadline < today
                      return (
                        <div
                          key={action.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.04)'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={action.done}
                            onChange={() => toggleAction(event.id, action.id)}
                            style={{ flexShrink: 0, accentColor: event.color }}
                          />
                          <span style={{
                            fontFamily: 'Space Mono, monospace',
                            fontSize: 10,
                            fontWeight: 700,
                            color: isOverdue ? '#ef4444' : event.color,
                            minWidth: 36,
                            flexShrink: 0
                          }}>
                            J-{action.daysBeforeEvent}
                          </span>
                          <span style={{
                            fontSize: 13,
                            flex: 1,
                            textDecoration: action.done ? 'line-through' : 'none',
                            opacity: action.done ? 0.38 : 1,
                            color: isOverdue ? '#ef4444' : 'inherit'
                          }}>
                            {action.label}
                          </span>
                          <span style={{
                            fontFamily: 'Space Mono, monospace',
                            fontSize: 10,
                            color: isOverdue ? '#ef4444' : 'var(--text-muted)',
                            flexShrink: 0
                          }}>
                            {action.deadline}
                          </span>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '2px 6px', fontSize: 9, flexShrink: 0 }}
                            onClick={() => deleteAction(event.id, action.id)}
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* ── RÉTRO-PLANNING ── */}
      {subTab === 'retro' && (
        <div className="card">
          <div className="flex-between mb-24">
            <div>
              <div className="section-title">Plan d'action global</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {pendingActions.length} action{pendingActions.length !== 1 ? 's' : ''} à venir · {doneActions.length} faite{doneActions.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {allActions.length === 0 ? (
            <div style={{ color: 'var(--text-subtle)', fontSize: 14, padding: '8px 0' }}>
              Aucune action planifiée. Ajoute des événements avec des actions dans la vue mensuelle.
            </div>
          ) : (
            <div>
              {allActions.map(action => {
                const isOverdue = !action.done && action.deadline < today
                const daysUntil = Math.ceil((new Date(action.deadline) - new Date(today)) / (1000 * 60 * 60 * 24))
                const isUrgent = !action.done && !isOverdue && daysUntil <= 7

                return (
                  <div
                    key={`${action.eventId}-${action.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      opacity: action.done ? 0.38 : 1
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={action.done}
                      onChange={() => toggleAction(action.eventId, action.id)}
                      style={{ flexShrink: 0, accentColor: action.eventColor }}
                    />

                    <div style={{
                      fontFamily: 'Space Mono, monospace',
                      fontSize: 12,
                      fontWeight: 700,
                      color: isOverdue ? '#ef4444' : isUrgent ? '#f59e0b' : 'var(--accent)',
                      minWidth: 82,
                      flexShrink: 0
                    }}>
                      {action.deadline}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: action.done ? 'line-through' : 'none',
                        marginBottom: 5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {action.label}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: action.eventColor,
                          background: `${action.eventColor}20`,
                          borderRadius: 4,
                          padding: '2px 8px'
                        }}>
                          {action.eventName}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>
                          J-{action.daysBeforeEvent}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          événement le {action.eventDate}
                        </span>
                      </div>
                    </div>

                    {isOverdue && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#ef4444',
                        background: 'rgba(239,68,68,0.12)',
                        borderRadius: 4,
                        padding: '3px 8px',
                        flexShrink: 0
                      }}>
                        EN RETARD
                      </span>
                    )}
                    {isUrgent && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#f59e0b',
                        background: 'rgba(245,158,11,0.12)',
                        borderRadius: 4,
                        padding: '3px 8px',
                        flexShrink: 0
                      }}>
                        {daysUntil === 0 ? "AUJOURD'HUI" : `J-${daysUntil}`}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
