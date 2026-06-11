import { useState, useEffect } from 'react'
import Header from './components/Header'
import SalarieeView from './components/SalarieeView'
import AFKView from './components/AFKView'
import CreaView from './components/CreaView'
import CycleView from './components/CycleView'
import { loadData, saveData, loadMode, saveMode } from './utils/storage'

export const MODES = {
  salariee: {
    label: 'SALARIÉE',
    color: '#8B5CF6',
    colorRgb: '139, 92, 246',
    bg: '#07030f'
  },
  afk: {
    label: 'AFK',
    color: '#F59E0B',
    colorRgb: '245, 158, 11',
    bg: '#0d0800'
  },
  crea: {
    label: 'CRÉA',
    color: '#EC4899',
    colorRgb: '236, 72, 153',
    bg: '#0d0008'
  },
  cycle: {
    label: 'CYCLE',
    color: '#F43F5E',
    colorRgb: '244, 63, 94',
    bg: '#0d0205'
  }
}

export default function App() {
  const [mode, setMode] = useState(() => loadMode())
  const [data, setData] = useState(() => loadData())

  useEffect(() => { saveMode(mode) }, [mode])
  useEffect(() => { saveData(data) }, [data])

  const updateData = (section, updater) => {
    setData(prev => ({
      ...prev,
      [section]: typeof updater === 'function'
        ? updater(prev[section])
        : { ...prev[section], ...updater }
    }))
  }

  const m = MODES[mode]

  return (
    <div
      className="app"
      style={{
        '--accent': m.color,
        '--accent-rgb': m.colorRgb,
        backgroundColor: m.bg
      }}
    >
      <Header mode={mode} setMode={setMode} modes={MODES} cycleData={data.cycle} />
      <main className="main-content">
        {mode === 'salariee' && (
          <SalarieeView
            data={data.salariee}
            updateData={u => updateData('salariee', u)}
            cycleData={data.cycle}
          />
        )}
        {mode === 'afk' && (
          <AFKView
            data={data.afk}
            updateData={u => updateData('afk', u)}
            cycleData={data.cycle}
          />
        )}
        {mode === 'crea' && (
          <CreaView
            data={data.crea}
            updateData={u => updateData('crea', u)}
            cycleData={data.cycle}
          />
        )}
        {mode === 'cycle' && (
          <CycleView
            data={data.cycle}
            updateData={u => updateData('cycle', u)}
          />
        )}
      </main>
    </div>
  )
}
