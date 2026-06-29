function toCSV(rows, headers) {
  const escape = (val) => {
    const str = String(val ?? '')
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  const headerRow = headers.join(',')
  const dataRows = rows.map(row => headers.map(h => escape(row[h])).join(','))
  return [headerRow, ...dataRows].join('\n')
}

function downloadCSV(content, filename) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportRevenues(revenues) {
  const csv = toCSV(revenues, ['date', 'label', 'amount', 'category', 'paid'])
  downloadCSV(csv, `AFK-revenus-${new Date().toISOString().slice(0, 10)}.csv`)
}

export function exportProjects(projects) {
  const csv = toCSV(projects, ['name', 'planned', 'spent', 'status'])
  downloadCSV(csv, `AFK-projets-${new Date().toISOString().slice(0, 10)}.csv`)
}

export function exportCalendar(calendar) {
  const csv = toCSV(calendar, ['date', 'title', 'platform', 'type', 'status'])
  downloadCSV(csv, `CREA-planning-${new Date().toISOString().slice(0, 10)}.csv`)
}

export function exportMonthlyTargets(monthlyTargets) {
  const rows = Object.entries(monthlyTargets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mois, mt]) => ({
      mois,
      objectif: mt.target || 0,
      realise: mt.actual || 0,
      ecart: (mt.actual || 0) - (mt.target || 0)
    }))
  const csv = toCSV(rows, ['mois', 'objectif', 'realise', 'ecart'])
  downloadCSV(csv, `AFK-objectifs-${new Date().toISOString().slice(0, 10)}.csv`)
}

export function exportActionPlan(actions) {
  const rows = actions.map(a => ({
    deadline: a.deadline,
    delai: `J-${a.daysBeforeEvent}`,
    action: a.label,
    evenement: a.eventName,
    date_evenement: a.eventDate,
    statut: a.done ? 'Fait' : 'À faire'
  }))
  const csv = toCSV(rows, ['deadline', 'delai', 'action', 'evenement', 'date_evenement', 'statut'])
  downloadCSV(csv, `AFK-retroplanning-${new Date().toISOString().slice(0, 10)}.csv`)
}
