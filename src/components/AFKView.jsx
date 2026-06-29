import { useState } from 'react'
import { exportRevenues, exportProjects } from '../utils/exportCSV'
import CycleWidget from './CycleWidget'
import YearPlan from './YearPlan'

const CATEGORIES = ['Ventes', 'Prestation', 'Remboursement', 'Autre']

const fmt = n =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0)

export default function AFKView({ data, updateData, cycleData }) {
  const [tab, setTab] = useState('overview')

  const [revenueForm, setRevenueForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    label: '',
    amount: '',
    category: 'Ventes',
    paid: true
  })

  const [invoiceForm, setInvoiceForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    client: '',
    amount: '',
    dueDate: ''
  })

  const [projectForm, setProjectForm] = useState({
    name: '',
    planned: '',
    spent: '0',
    status: 'en cours'
  })

  const [editingKpis, setEditingKpis] = useState(false)
  const [kpiDraft, setKpiDraft] = useState({
    monthlyTarget: data.kpis?.monthlyTarget || 0
  })

  const revenues = data.revenues || []
  const invoices = data.invoices || []
  const projects = data.projects || []

  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthRevenues = revenues.filter(r => r.date?.startsWith(currentMonth))
  const totalRevenue = monthRevenues.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)
  const target = data.kpis?.monthlyTarget || 0
  const progressPct = target ? Math.min(100, (totalRevenue / target) * 100) : 0
  const pendingInvoices = invoices.filter(i => i.status !== 'paid')
  const pendingTotal = pendingInvoices.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const totalBudgetPlanned = projects.reduce((s, p) => s + (parseFloat(p.planned) || 0), 0)
  const totalBudgetSpent = projects.reduce((s, p) => s + (parseFloat(p.spent) || 0), 0)

  const addRevenue = e => {
    e.preventDefault()
    if (!revenueForm.label || !revenueForm.amount) return
    updateData(prev => ({
      ...prev,
      revenues: [
        ...(prev.revenues || []),
        { ...revenueForm, id: Date.now(), amount: parseFloat(revenueForm.amount) }
      ]
    }))
    setRevenueForm(f => ({ ...f, label: '', amount: '' }))
  }

  const deleteRevenue = id => {
    updateData(prev => ({ ...prev, revenues: prev.revenues.filter(r => r.id !== id) }))
  }

  const addInvoice = e => {
    e.preventDefault()
    if (!invoiceForm.client || !invoiceForm.amount) return
    updateData(prev => ({
      ...prev,
      invoices: [
        ...(prev.invoices || []),
        { ...invoiceForm, id: Date.now(), amount: parseFloat(invoiceForm.amount), status: 'pending' }
      ]
    }))
    setInvoiceForm(f => ({ ...f, client: '', amount: '', dueDate: '' }))
  }

  const updateInvoiceStatus = (id, status) => {
    updateData(prev => ({
      ...prev,
      invoices: prev.invoices.map(i => i.id === id ? { ...i, status } : i)
    }))
  }

  const deleteInvoice = id => {
    updateData(prev => ({ ...prev, invoices: prev.invoices.filter(i => i.id !== id) }))
  }

  const addProject = e => {
    e.preventDefault()
    if (!projectForm.name || !projectForm.planned) return
    updateData(prev => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        {
          ...projectForm,
          id: Date.now(),
          planned: parseFloat(projectForm.planned),
          spent: parseFloat(projectForm.spent) || 0
        }
      ]
    }))
    setProjectForm({ name: '', planned: '', spent: '0', status: 'en cours' })
  }

  const updateSpent = (id, val) => {
    updateData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, spent: parseFloat(val) || 0 } : p)
    }))
  }

  const deleteProject = id => {
    updateData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }))
  }

  const saveKpis = () => {
    updateData(prev => ({
      ...prev,
      kpis: { ...prev.kpis, monthlyTarget: parseFloat(kpiDraft.monthlyTarget) || 0 }
    }))
    setEditingKpis(false)
  }

  const TABS = [
    { key: 'overview', label: 'Vue globale' },
    { key: 'revenues', label: 'Revenus' },
    { key: 'invoices', label: 'Factures' },
    { key: 'budget', label: 'Budget projets' },
    { key: 'annual', label: 'Plan annuel' }
  ]

  return (
    <div>
      <div className="mode-hero">
        <div className="mode-hero-title">AFK</div>
        <div className="mode-hero-subtitle">E-commerce & Business</div>
      </div>

      <CycleWidget cycleData={cycleData} mode="afk" />

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

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <>
          <div className="grid-4 mb-16">
            <div className="card card-accent">
              <div className="kpi-value">{fmt(totalRevenue)}</div>
              <div className="kpi-label">CA du mois</div>
            </div>
            <div className="card card-accent">
              <div className="kpi-value">{fmt(target)}</div>
              <div className="kpi-label">Objectif mensuel</div>
            </div>
            <div className="card card-accent">
              <div className="kpi-value">{fmt(pendingTotal)}</div>
              <div className="kpi-label">En attente ({pendingInvoices.length})</div>
            </div>
            <div className="card card-accent">
              <div className="kpi-value">{fmt(totalBudgetPlanned - totalBudgetSpent)}</div>
              <div className="kpi-label">Budget restant</div>
            </div>
          </div>

          <div className="card mb-16">
            <div className="flex-between mb-12">
              <div className="section-title">Progression mensuelle</div>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, color: 'var(--accent)', fontWeight: 700 }}>
                {progressPct.toFixed(0)}%
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex-between mt-8">
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmt(totalRevenue)} générés</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Objectif : {fmt(target)}</span>
            </div>
          </div>

          {editingKpis ? (
            <div className="card">
              <div className="section-title mb-16">Définir l'objectif mensuel</div>
              <label>Objectif CA mensuel (€)</label>
              <input
                type="number"
                value={kpiDraft.monthlyTarget}
                onChange={e => setKpiDraft({ monthlyTarget: e.target.value })}
                placeholder="Ex : 3000"
                style={{ marginBottom: 16 }}
              />
              <div className="flex gap-8">
                <button className="btn btn-primary" onClick={saveKpis}>Enregistrer</button>
                <button className="btn btn-ghost" onClick={() => setEditingKpis(false)}>Annuler</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-ghost" onClick={() => { setKpiDraft({ monthlyTarget: target }); setEditingKpis(true) }}>
              Modifier l'objectif
            </button>
          )}
        </>
      )}

      {/* ── REVENUES ── */}
      {tab === 'revenues' && (
        <>
          <form onSubmit={addRevenue} className="card mb-16">
            <div className="section-title mb-16">Nouvelle entrée</div>
            <div className="grid-2 mb-12">
              <div>
                <label>Date</label>
                <input type="date" value={revenueForm.date} onChange={e => setRevenueForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label>Catégorie</label>
                <select value={revenueForm.category} onChange={e => setRevenueForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>Libellé</label>
                <input
                  placeholder="Ex: Commandes Shopify"
                  value={revenueForm.label}
                  onChange={e => setRevenueForm(f => ({ ...f, label: e.target.value }))}
                />
              </div>
              <div>
                <label>Montant (€)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={revenueForm.amount}
                  onChange={e => setRevenueForm(f => ({ ...f, amount: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex-between">
              <label className="flex-center gap-8" style={{ marginBottom: 0, cursor: 'pointer', textTransform: 'none', letterSpacing: 0, fontSize: 13, fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={revenueForm.paid}
                  onChange={e => setRevenueForm(f => ({ ...f, paid: e.target.checked }))}
                />
                Déjà perçu
              </label>
              <button type="submit" className="btn btn-primary">+ Ajouter</button>
            </div>
          </form>

          <div className="card">
            <div className="flex-between mb-16">
              <div className="section-title">
                Historique — {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => exportRevenues(revenues)}>
                Export CSV
              </button>
            </div>
            {revenues.length === 0 ? (
              <div style={{ color: 'var(--text-subtle)', fontSize: 14 }}>Aucun revenu enregistré.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Libellé</th>
                    <th>Catégorie</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[...revenues].sort((a, b) => b.date?.localeCompare(a.date)).map(r => (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>{r.date}</td>
                      <td style={{ fontWeight: 500 }}>{r.label}</td>
                      <td>
                        <span className="tag" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                          {r.category}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'Space Mono, monospace', color: 'var(--accent)', fontWeight: 700 }}>
                        {fmt(r.amount)}
                      </td>
                      <td>
                        <span className={`tag ${r.paid ? 'status-paid' : 'status-pending'}`}>
                          {r.paid ? 'Perçu' : 'En attente'}
                        </span>
                      </td>
                      <td><button className="btn btn-danger" onClick={() => deleteRevenue(r.id)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── INVOICES ── */}
      {tab === 'invoices' && (
        <>
          <form onSubmit={addInvoice} className="card mb-16">
            <div className="section-title mb-16">Nouvelle facture</div>
            <div className="grid-2 mb-12">
              <div>
                <label>Client</label>
                <input
                  placeholder="Nom du client"
                  value={invoiceForm.client}
                  onChange={e => setInvoiceForm(f => ({ ...f, client: e.target.value }))}
                />
              </div>
              <div>
                <label>Montant (€)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={invoiceForm.amount}
                  onChange={e => setInvoiceForm(f => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div>
                <label>Date de facture</label>
                <input type="date" value={invoiceForm.date} onChange={e => setInvoiceForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label>Date d'échéance</label>
                <input type="date" value={invoiceForm.dueDate} onChange={e => setInvoiceForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">+ Ajouter</button>
            </div>
          </form>

          <div className="card">
            <div className="section-title mb-16">Toutes les factures</div>
            {invoices.length === 0 ? (
              <div style={{ color: 'var(--text-subtle)', fontSize: 14 }}>Aucune facture enregistrée.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Facturé</th>
                    <th>Échéance</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600 }}>{inv.client}</td>
                      <td style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>{inv.date}</td>
                      <td style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: inv.status === 'overdue' ? '#ef4444' : 'var(--text-muted)' }}>
                        {inv.dueDate}
                      </td>
                      <td style={{ fontFamily: 'Space Mono, monospace', color: 'var(--accent)', fontWeight: 700 }}>
                        {fmt(inv.amount)}
                      </td>
                      <td>
                        <div className="flex gap-4">
                          {['pending', 'paid', 'overdue'].map(s => (
                            <button
                              key={s}
                              onClick={() => updateInvoiceStatus(inv.id, s)}
                              className={`tag ${inv.status === s ? `status-${s}` : ''}`}
                              style={{
                                border: 'none',
                                cursor: 'pointer',
                                opacity: inv.status === s ? 1 : 0.35,
                                background: inv.status !== s ? 'rgba(255,255,255,0.05)' : undefined,
                                color: inv.status !== s ? 'var(--text-muted)' : undefined
                              }}
                            >
                              {s === 'pending' ? 'Attente' : s === 'paid' ? 'Payée' : 'Retard'}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td><button className="btn btn-danger" onClick={() => deleteInvoice(inv.id)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── BUDGET PROJETS ── */}
      {tab === 'budget' && (
        <>
          <form onSubmit={addProject} className="card mb-16">
            <div className="section-title mb-16">Nouveau projet</div>
            <div className="grid-2 mb-12">
              <div>
                <label>Nom du projet</label>
                <input
                  placeholder="Ex: Lancement collection été"
                  value={projectForm.name}
                  onChange={e => setProjectForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label>Statut</label>
                <select value={projectForm.status} onChange={e => setProjectForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="en cours">En cours</option>
                  <option value="planifié">Planifié</option>
                  <option value="terminé">Terminé</option>
                </select>
              </div>
              <div>
                <label>Budget prévu (€)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={projectForm.planned}
                  onChange={e => setProjectForm(f => ({ ...f, planned: e.target.value }))}
                />
              </div>
              <div>
                <label>Déjà dépensé (€)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={projectForm.spent}
                  onChange={e => setProjectForm(f => ({ ...f, spent: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">+ Créer le projet</button>
            </div>
          </form>

          {projects.length === 0 ? (
            <div className="card" style={{ color: 'var(--text-subtle)', fontSize: 14 }}>
              Aucun projet. Crée ton premier projet pour suivre ton budget.
            </div>
          ) : (
            <>
              {projects.map(p => {
                const pct = p.planned ? Math.min(100, (p.spent / p.planned) * 100) : 0
                const remaining = (parseFloat(p.planned) || 0) - (parseFloat(p.spent) || 0)
                const isOver = remaining < 0

                return (
                  <div key={p.id} className="card card-accent mb-16">
                    <div className="flex-between mb-16">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 17 }}>{p.name}</div>
                        <span
                          className="tag mt-8"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontSize: 10 }}
                        >
                          {p.status}
                        </span>
                      </div>
                      <button className="btn btn-danger" onClick={() => deleteProject(p.id)}>✕ Supprimer</button>
                    </div>

                    <div className="grid-3 mb-16">
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, fontWeight: 700 }}>Budget prévu</div>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, fontWeight: 700 }}>{fmt(p.planned)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, fontWeight: 700 }}>Dépensé</div>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, fontWeight: 700, color: pct > 85 ? '#f59e0b' : 'white' }}>
                          {fmt(p.spent)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, fontWeight: 700 }}>
                          {isOver ? 'Dépassé de' : 'Restant'}
                        </div>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, fontWeight: 700, color: isOver ? '#ef4444' : 'var(--accent)' }}>
                          {fmt(Math.abs(remaining))}
                        </div>
                      </div>
                    </div>

                    <div className="progress-bar mb-8">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, background: isOver ? '#ef4444' : pct > 85 ? '#f59e0b' : 'var(--accent)' }}
                      />
                    </div>

                    <div className="flex-between">
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct.toFixed(0)}% du budget utilisé</span>
                      <div className="flex-center gap-8">
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mettre à jour :</span>
                        <input
                          type="number"
                          defaultValue={p.spent}
                          onBlur={e => updateSpent(p.id, e.target.value)}
                          style={{ width: 110, padding: '5px 10px', fontSize: 13 }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
              <button className="btn btn-ghost" onClick={() => exportProjects(projects)}>Export CSV projets</button>
            </>
          )}
        </>
      )}
      {/* ── PLAN ANNUEL ── */}
      {tab === 'annual' && (
        <YearPlan data={data} updateData={updateData} />
      )}
    </div>
  )
}
