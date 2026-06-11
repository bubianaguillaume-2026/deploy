export const PHASES = {
  menstruation: {
    id: 'menstruation',
    label: 'Menstruation',
    short: 'Phase de repos',
    color: '#DC2626',
    colorRgb: '220, 38, 38',
    energy: 1,
    moon: '🌑',
    summary: 'Le corps se renouvelle. Énergie basse — c\'est normal et nécessaire. Honore ce ralentissement.',
    suggestions: {
      salariee: [
        'Tâches de fond et documentation',
        'Lecture et veille stratégique',
        'Reporter les présentations importantes si possible'
      ],
      afk: [
        'Analyser les chiffres du mois passé',
        'Trier et organiser les documents',
        'Planification passive et réflexion'
      ],
      crea: [
        'Brainstorming d\'idées par écrit',
        'Recherche d\'inspiration et moodboard',
        'Pause créative intentionnelle'
      ]
    },
    focus: 'Repos & introspection',
    doList: ['Méditer', 'Analyser', 'Planifier doucement', 'Se reposer'],
    avoidList: ['Grandes décisions', 'Networking intense', 'Lancements']
  },
  follicular: {
    id: 'follicular',
    label: 'Phase folliculaire',
    short: 'Énergie montante',
    color: '#16A34A',
    colorRgb: '22, 163, 74',
    energy: 4,
    moon: '🌒',
    summary: 'Créativité et énergie en hausse. Ton cerveau est en mode solution. Profite de cette clarté.',
    suggestions: {
      salariee: [
        'Nouvelles initiatives et projets',
        'Formation et apprentissage',
        'Proposer des idées lors des réunions'
      ],
      afk: [
        'Lancer de nouvelles collections ou produits',
        'Contacter fournisseurs et partenaires',
        'Développer la stratégie du mois'
      ],
      crea: [
        'Créer et filmer du nouveau contenu',
        'Développer de nouvelles séries',
        'Expérimenter de nouveaux formats'
      ]
    },
    focus: 'Création & nouveaux départs',
    doList: ['Créer', 'Lancer', 'Apprendre', 'Explorer'],
    avoidList: ['Procrastiner', 'Rester en retrait']
  },
  ovulation: {
    id: 'ovulation',
    label: 'Ovulation',
    short: 'Pic d\'énergie',
    color: '#D97706',
    colorRgb: '217, 119, 6',
    energy: 5,
    moon: '🌕',
    summary: 'Tu es au maximum. Charisme, clarté, présence. C\'est maintenant qu\'il faut se montrer.',
    suggestions: {
      salariee: [
        'Présentations et pitchs importants',
        'Négociations et entretiens clés',
        'Networking et réunions stratégiques'
      ],
      afk: [
        'Gros deals et partenariats',
        'Lives et événements clients',
        'Collaborations et échanges'
      ],
      crea: [
        'Tournage — tu es au top de ta forme',
        'Lives Instagram / YouTube',
        'Collabs et interviews'
      ]
    },
    focus: 'Communication & visibilité',
    doList: ['Se montrer', 'Négocier', 'Tourner', 'Networker'],
    avoidList: ['S\'isoler', 'Repousser les prises de contact']
  },
  luteal: {
    id: 'luteal',
    label: 'Phase lutéale',
    short: 'Énergie descendante',
    color: '#7C3AED',
    colorRgb: '124, 58, 237',
    energy: 3,
    moon: '🌗',
    summary: 'Énergie qui décline mais attention aux détails accrue. Le moment de finir et d\'optimiser.',
    suggestions: {
      salariee: [
        'Tâches administratives et emails',
        'Révisions, corrections, qualité',
        'Suivi de dossiers en cours'
      ],
      afk: [
        'Comptabilité et suivi des stocks',
        'Optimisation des processus',
        'Service client et SAV'
      ],
      crea: [
        'Montage et post-production',
        'Planification du mois suivant',
        'Captions, descriptions, SEO'
      ]
    },
    focus: 'Finir & optimiser',
    doList: ['Finir', 'Optimiser', 'Réviser', 'Prendre soin de toi'],
    avoidList: ['Gros lancements', 'Décisions impulsives']
  }
}

export function getPhaseForDay(day, cycleLength = 28) {
  if (day <= 5) return PHASES.menstruation
  if (day <= 13) return PHASES.follicular
  if (day <= 17) return PHASES.ovulation
  return PHASES.luteal
}

export function getCurrentCycleInfo(lastPeriodDate, cycleLength = 28) {
  if (!lastPeriodDate) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(lastPeriodDate)
  start.setHours(0, 0, 0, 0)

  const daysSince = Math.floor((today - start) / 86400000)
  if (daysSince < 0) return null

  const dayInCycle = (daysSince % cycleLength) + 1
  const phase = getPhaseForDay(dayInCycle, cycleLength)

  const phaseEndDay = phase.id === 'menstruation' ? 5
    : phase.id === 'follicular' ? 13
    : phase.id === 'ovulation' ? 17
    : cycleLength

  const daysLeft = Math.max(0, phaseEndDay - dayInCycle)

  return { phase, dayInCycle, daysLeft, cycleLength }
}

export function getNextPeriodDate(lastPeriodDate, cycleLength = 28) {
  if (!lastPeriodDate) return null
  const start = new Date(lastPeriodDate)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysSince = Math.floor((today - start) / 86400000)
  const completed = Math.floor(daysSince / cycleLength)
  const next = new Date(start)
  next.setDate(next.getDate() + (completed + 1) * cycleLength)
  return next
}
