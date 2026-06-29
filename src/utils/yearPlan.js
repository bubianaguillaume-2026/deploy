export const EVENT_SUGGESTIONS = [
  { name: 'Nouvel An',       color: '#6366f1' },
  { name: "Soldes d'hiver",  color: '#3b82f6' },
  { name: 'Saint-Valentin',  color: '#ec4899' },
  { name: 'Ramadan',         color: '#10b981' },
  { name: 'Pâques',          color: '#f59e0b' },
  { name: 'Fête des mères',  color: '#f43f5e' },
  { name: 'Fête des pères',  color: '#8b5cf6' },
  { name: "Soldes d'été",    color: '#06b6d4' },
  { name: 'Rentrée',         color: '#f97316' },
  { name: 'Halloween',       color: '#ea580c' },
  { name: 'Black Friday',    color: '#a3a3a3' },
  { name: 'Cyber Monday',    color: '#737373' },
  { name: 'Noël',            color: '#dc2626' },
]

export function computeDeadline(eventDate, daysBeforeEvent) {
  const d = new Date(eventDate)
  d.setDate(d.getDate() - (parseInt(daysBeforeEvent) || 0))
  return d.toISOString().slice(0, 10)
}
