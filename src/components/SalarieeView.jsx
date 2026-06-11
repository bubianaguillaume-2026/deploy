import { useState, useEffect } from 'react'
import CycleWidget from './CycleWidget'

function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function SalarieeView({ data, updateData, cycleData }) {
  const now = useNow()
  const [newTodo, setNewTodo] = useState('')

  const mins = now.getHours() * 60 + now.getMinutes()
  const start = 9 * 60
  const end = 18 * 60
  const progress = Math.min(100, Math.max(0, ((mins - start) / (end - start)) * 100))
  const minsLeft = Math.max(0, end - mins)
  const hLeft = Math.floor(minsLeft / 60)
  const mLeft = minsLeft % 60
  const isOver = mins >= end
  const isNotStarted = mins < start

  const today = now.toISOString().slice(0, 10)
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const todos = (data.todos || []).filter(t => t.date === today || !t.done)

  const addTodo = e => {
    e.preventDefault()
    if (!newTodo.trim()) return
    updateData(prev => ({
      ...prev,
      todos: [
        ...(prev.todos || []),
        { id: Date.now(), text: newTodo.trim(), done: false, date: today }
      ]
    }))
    setNewTodo('')
  }

  const toggleTodo = id => {
    updateData(prev => ({
      ...prev,
      todos: prev.todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
    }))
  }

  const deleteTodo = id => {
    updateData(prev => ({
      ...prev,
      todos: prev.todos.filter(t => t.id !== id)
    }))
  }

  const doneTodos = todos.filter(t => t.done).length
  const totalTodos = todos.length

  return (
    <div>
      <div className="mode-hero">
        <div className="mode-hero-title">SALARIÉE</div>
        <div className="mode-hero-subtitle" style={{ textTransform: 'capitalize' }}>{dateStr}</div>
      </div>

      <CycleWidget cycleData={cycleData} mode="salariee" />

      <div className="grid-2 mb-24">
        {/* Clock + work progress */}
        <div className="work-block">
          <div className="time-display">{timeStr}</div>
          <div style={{ marginTop: 20, marginBottom: 14 }}>
            <div className="flex-between mb-8">
              <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontFamily: 'Space Mono, monospace' }}>9H00</span>
              <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontFamily: 'Space Mono, monospace' }}>18H00</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {isNotStarted && (
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              La journée commence à <strong style={{ color: 'white' }}>9h00</strong>
            </div>
          )}
          {!isNotStarted && !isOver && (
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Encore <strong style={{ color: 'white' }}>{hLeft}h{mLeft.toString().padStart(2, '0')}</strong> avant la fin de journée
            </div>
          )}
          {isOver && (
            <div style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>
              Journée terminée — switche de mode !
            </div>
          )}
        </div>

        {/* Intention du jour */}
        <div className="card card-accent flex-col">
          <div className="section-title mb-12">Intention du jour</div>
          <textarea
            value={data.todayIntention || ''}
            onChange={e => updateData({ todayIntention: e.target.value })}
            placeholder="Quelle énergie tu veux apporter aujourd'hui ?"
            rows={5}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* To-do salariat */}
      <div className="card mb-16">
        <div className="flex-between mb-14">
          <div className="section-title">To-do du jour</div>
          {totalTodos > 0 && (
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--accent)' }}>
              {doneTodos}/{totalTodos}
            </span>
          )}
        </div>
        {totalTodos > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${totalTodos ? (doneTodos / totalTodos) * 100 : 0}%` }} />
            </div>
          </div>
        )}
        <form onSubmit={addTodo} className="flex gap-8 mb-14">
          <input
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            placeholder="Ajouter une tâche..."
          />
          <button type="submit" className="btn btn-primary">+ Ajouter</button>
        </form>
        {todos.length === 0 && (
          <div style={{ color: 'var(--text-subtle)', fontSize: 14, padding: '8px 0' }}>
            Aucune tâche pour aujourd'hui.
          </div>
        )}
        {todos.map(todo => (
          <div key={todo.id} className={`check-item ${todo.done ? 'done' : ''}`}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className="check-label">{todo.text}</span>
            <button className="btn btn-danger" onClick={() => deleteTodo(todo.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* Notes rapides */}
      <div className="card">
        <div className="section-title mb-12">Notes rapides</div>
        <textarea
          value={data.quickNotes || ''}
          onChange={e => updateData({ quickNotes: e.target.value })}
          placeholder="Réunions, décisions, idées à garder..."
          rows={6}
        />
      </div>
    </div>
  )
}
