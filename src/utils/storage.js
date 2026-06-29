const DATA_KEY = 'side-hustler-data'
const MODE_KEY = 'side-hustler-mode'

const defaults = {
  salariee: {
    todos: [],
    todayIntention: '',
    quickNotes: ''
  },
  afk: {
    revenues: [],
    invoices: [],
    projects: [],
    kpis: { monthlyTarget: 0, ordersTarget: 0 },
    monthlyTargets: {},
    commercialEvents: []
  },
  crea: {
    pipeline: [],
    calendar: []
  },
  cycle: {
    lastPeriodDate: '',
    cycleLength: 28
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (!raw) return defaults
    const saved = JSON.parse(raw)
    return {
      salariee: { ...defaults.salariee, ...saved.salariee },
      afk: {
        ...defaults.afk,
        ...saved.afk,
        kpis: { ...defaults.afk.kpis, ...saved.afk?.kpis },
        monthlyTargets: saved.afk?.monthlyTargets || {},
        commercialEvents: saved.afk?.commercialEvents || []
      },
      crea: { ...defaults.crea, ...saved.crea },
      cycle: { ...defaults.cycle, ...saved.cycle }
    }
  } catch {
    return defaults
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
  } catch {}
}

export function loadMode() {
  return localStorage.getItem(MODE_KEY) || 'salariee'
}

export function saveMode(mode) {
  localStorage.setItem(MODE_KEY, mode)
}
