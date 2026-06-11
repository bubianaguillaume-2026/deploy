import { useState } from 'react'
import { exportCalendar } from '../utils/exportCSV'
import CycleWidget from './CycleWidget'

const PLATFORMS = [
  { id: 'youtube',  label: 'YouTube',   cls: 'platform-yt',  icon: '▶' },
  { id: 'podcast',  label: 'Podcast',   cls: 'platform-pod', icon: '◉' },
  { id: 'instagram',label: 'Instagram', cls: 'platform-ig',  icon: '◈' },
  { id: 'tiktok',   label: 'TikTok',    cls: 'platform-tt',  icon: '♪' }
]

const STAGES = [
  { id: 'idea',       label: 'IDÉE',     color: '#6b7280' },
  { id: 'inprogress', label: 'EN COURS', color: '#f59e0b' },
  { id: 'ready',      label: 'PRÊT',     color: '#8b5cf6' },
  { id: 'published',  label: 'PUBLIÉ',   color: '#22c55e' }
]

const CONTENT_TYPES = ['Vidéo longue', 'Short / Reel', 'Post', 'Story', 'Épisode podcast', 'Live', 'Carrousel']

const getPlatform = id => PLATFORMS.find(p => p.id === id) || PLATFORMS[0]

export default function CreaView({ data, updateData, cycleData }) {
  const [tab, setTab] = useState('pipeline')

  const [pipeForm, setPipeForm] = useState({
    title: '',
    platform: 'youtube',
    stage: 'idea',
    notes: ''
  })

  const [calForm, setCalForm] = useState({
    date: '',
    title: '',
    platform: 'youtube',
    type: 'Vidéo longue'
  })

  const pipeline = data.pipeline || []
  const calendar = data.calendar || []

  const addPipeItem = e => {
    e.preventDefault()
    if (!pipeForm.title.trim()) return
    updateData(prev => ({
      ...prev,
      pipeline: [...(prev.pipeline || []), { ...pipeForm, id: Date.now() }]
    }))
    setPipeForm(f => ({ ...f, title: '', notes: '' }))
  }

  const moveItem = (id, stage) => {
    updateData(prev => ({
      ...prev,
      pipeline: prev.pipeline.map(i => i.id === id ? { ...i, stage } : i)
    }))
  }

  const deletePipeItem = id => {
    updateData(prev => ({ ...prev, pipeline: prev.pipeline.filter(i => i.id !== id) }))
  }

  const addCalItem = e => {
    e.preventDefault()
    if (!calForm.title.trim() || !calForm.date) return
    updateData(prev => ({
      ...prev,
      calendar: [...(prev.calendar || []), { ...calForm, id: Date.now(), status: 'planifié' }]
    }))
    setCalForm(f => ({ ...f, title: '', date: '' }))
  }

  const updateCalStatus = (id, status) => {
    updateData(prev => ({
      ...prev,
      calendar: prev.calendar.map(i => i.id === id ? { ...i, status } : i)
    }))
  }

  const deleteCalItem = id => {
    updateData(prev => ({ ...prev, calendar: prev.calendar.filter(i => i.id !== id) }))
  }

  const today = new Date().toISOString().slice(0, 10)

  const TABS = [
    { key: 'pipeline', label: 'Pipeline' },
    { key: 'calendar', label: 'Planning éditorial' }
  ]

  return (
    <div>
      <div className="mode-hero">
        <div className="mode-hero-title">CRÉA</div>
        <div className="mode-hero-subtitle">
          {PLATFORMS.map(p => (
            <span key={p.id} className={`tag ${p.cls}`}>{p.icon} {p.label}</span>
          ))}
        </div>
      </div>

      <CycleWidget cycleData={cycleData} mode="crea" />

      <div className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PIPELINE ── */}
      {tab === 'pipeline' && (
        <>
          <form onSubmit={addPipeItem} className="card mb-24">
            <div className="section-title mb-16">Nouveau contenu</div>
            <div className="grid-2 mb-12">
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Titre / Idée</label>
                <input
                  placeholder="Ex: Vidéo sur ma routine morning side hustler"
                  value={pipeForm.title}
                  onChange={e => setPipeForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label>Plateforme</label>
                <select value={pipeForm.platform} onChange={e => setPipeForm(f => ({ ...f, platform: e.target.value }))}>
                  {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label>Étape</label>
                <select value={pipeForm.stage} onChange={e => setPipeForm(f => ({ ...f, stage: e.target.value }))}>
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Notes (optionnel)</label>
                <input
                  placeholder="Angle, format, références..."
                  value={pipeForm.notes}
                  onChange={e => setPipeForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">+ Ajouter au pipeline</button>
            </div>
          </form>

          <div className="pipeline">
            {STAGES.map(stage => {
              const items = pipeline.filter(i => i.stage === stage.id)
              return (
                <div key={stage.id} className="pipeline-col">
                  <div className="pipeline-col-header">
                    <span className="pipeline-col-title" style={{ color: stage.color }}>{stage.label}</span>
                    <span className="pipeline-count">{items.length}</span>
                  </div>

                  {items.length === 0 && <div className="pipeline-empty">Vide</div>}

                  {items.map(item => {
                    const pl = getPlatform(item.platform)
                    return (
                      <div key={item.id} className="pipeline-item">
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>
                          {item.title}
                        </div>
                        <span className={`tag ${pl.cls}`}>{pl.icon} {pl.label}</span>
                        {item.notes && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.4 }}>
                            {item.notes}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                          {STAGES.filter(s => s.id !== stage.id).map(s => (
                            <button
                              key={s.id}
                              onClick={() => moveItem(item.id, s.id)}
                              style={{
                                fontSize: 9,
                                padding: '2px 8px',
                                border: `1px solid ${s.color}50`,
                                color: s.color,
                                background: 'transparent',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontWeight: 700,
                                letterSpacing: '0.05em'
                              }}
                            >
                              → {s.label}
                            </button>
                          ))}
                          <button
                            className="btn btn-danger"
                            style={{ padding: '2px 8px', fontSize: 9 }}
                            onClick={() => deletePipeItem(item.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── CALENDAR ── */}
      {tab === 'calendar' && (
        <>
          <form onSubmit={addCalItem} className="card mb-16">
            <div className="section-title mb-16">Planifier une publication</div>
            <div className="grid-2 mb-12">
              <div>
                <label>Titre du contenu</label>
                <input
                  placeholder="Titre de la vidéo, du post..."
                  value={calForm.title}
                  onChange={e => setCalForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label>Date de publication</label>
                <input type="date" value={calForm.date} onChange={e => setCalForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label>Plateforme</label>
                <select value={calForm.platform} onChange={e => setCalForm(f => ({ ...f, platform: e.target.value }))}>
                  {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label>Type de contenu</label>
                <select value={calForm.type} onChange={e => setCalForm(f => ({ ...f, type: e.target.value }))}>
                  {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">+ Planifier</button>
            </div>
          </form>

          <div className="card">
            <div className="flex-between mb-16">
              <div className="section-title">Planning éditorial</div>
              <button className="btn btn-ghost btn-sm" onClick={() => exportCalendar(calendar)}>Export CSV</button>
            </div>

            {calendar.length === 0 ? (
              <div style={{ color: 'var(--text-subtle)', fontSize: 14 }}>Aucun contenu planifié.</div>
            ) : (
              <div>
                {[...calendar]
                  .sort((a, b) => a.date?.localeCompare(b.date))
                  .map(item => {
                    const pl = getPlatform(item.platform)
                    const isPast = item.date < today && item.status !== 'publié'
                    const isPublished = item.status === 'publié'

                    const STATUS_OPTS = ['planifié', 'en tournage', 'en montage', 'prêt', 'publié']

                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          padding: '14px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          opacity: isPublished ? 0.5 : 1
                        }}
                      >
                        <div style={{
                          fontFamily: 'Space Mono, monospace',
                          fontSize: 12,
                          color: isPast ? '#ef4444' : 'var(--accent)',
                          minWidth: 82,
                          fontWeight: 700
                        }}>
                          {item.date}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: isPublished ? 'line-through' : 'none',
                            marginBottom: 6,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.title}
                          </div>
                          <div className="flex-center gap-6">
                            <span className={`tag ${pl.cls}`}>{pl.icon} {pl.label}</span>
                            <span className="tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                              {item.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex-center gap-8">
                          <select
                            value={item.status}
                            onChange={e => updateCalStatus(item.id, e.target.value)}
                            style={{
                              width: 'auto',
                              padding: '5px 10px',
                              fontSize: 12,
                              color: item.status === 'publié' ? '#22c55e' : item.status === 'prêt' ? 'var(--accent)' : 'var(--text-muted)'
                            }}
                          >
                            {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                          </select>
                          <button className="btn btn-danger" onClick={() => deleteCalItem(item.id)}>✕</button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
