'use client'

import { useState } from 'react'
import { Stats } from '@/app/page'

type Props = {
  view: 'office' | 'dashboard'
  setView: (v: 'office' | 'dashboard') => void
  isRunning: boolean
  onRunPipeline: (commodity: string, region: string, type: string) => void
  stats: Stats
}

const COMMODITIES = ['Coffee', 'Copper', 'Rice/Grain', 'Rebar/Steel', 'Cocoa', 'Cotton']
const REGIONS = ['Vietnam', 'Colombia', 'Ethiopia', 'Chile', 'Thailand', 'Brazil', 'Japan', 'Germany', 'UAE', 'Canada']

export default function Header({ view, setView, isRunning, onRunPipeline, stats }: Props) {
  const [showPipelineModal, setShowPipelineModal] = useState(false)
  const [commodity, setCommodity] = useState('Coffee')
  const [region, setRegion] = useState('Vietnam')
  const [type, setType] = useState<'supplier' | 'buyer'>('supplier')

  const S = { fontFamily: 'Courier Prime, monospace' }

  return (
    <>
      <div
        className="flex items-center justify-between px-4 py-3 border-b-4"
        style={{ background: '#6B4F3A', borderColor: '#4A3020', ...S }}
      >
        {/* Left: Logo */}
        <div>
          <div className="font-bold text-lg tracking-widest" style={{ fontFamily: 'Special Elite, cursive', color: '#F5E6C8' }}>
            COMMODITYBROKER INC.
          </div>
          <div className="text-xs tracking-widest" style={{ color: '#C4A882', letterSpacing: '3px' }}>
            SCRANTON BRANCH · VANCOUVER BC
          </div>
        </div>

        {/* Center: View toggle */}
        <div className="flex gap-1 rounded-sm overflow-hidden border" style={{ borderColor: '#4A3020' }}>
          <button
            onClick={() => setView('office')}
            className="px-4 py-1.5 text-xs tracking-wider transition-colors"
            style={{
              fontFamily: 'Special Elite, cursive',
              background: view === 'office' ? '#F5E6C8' : 'transparent',
              color: view === 'office' ? '#4A3020' : '#C4A882',
              letterSpacing: '1px'
            }}
          >
            THE OFFICE
          </button>
          <button
            onClick={() => setView('dashboard')}
            className="px-4 py-1.5 text-xs tracking-wider transition-colors"
            style={{
              fontFamily: 'Special Elite, cursive',
              background: view === 'dashboard' ? '#F5E6C8' : 'transparent',
              color: view === 'dashboard' ? '#4A3020' : '#C4A882',
              letterSpacing: '1px'
            }}
          >
            DASHBOARD
          </button>
        </div>

        {/* Right: Pipeline button + stats */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs" style={{ color: '#C4A882' }}>
            <div>{stats.totalLeads} leads · {stats.hotLeads} hot</div>
            <div>${(stats.commissionPending / 1000).toFixed(0)}k pipeline</div>
          </div>
          <button
            onClick={() => setShowPipelineModal(true)}
            disabled={isRunning}
            className="px-4 py-2 rounded-sm text-xs font-bold tracking-wider transition-all disabled:opacity-50"
            style={{
              background: isRunning ? '#4A3020' : '#F5E6C8',
              color: isRunning ? '#C4A882' : '#4A3020',
              fontFamily: 'Special Elite, cursive',
              letterSpacing: '1px'
            }}
          >
            {isRunning ? '⚡ RUNNING...' : '▶ RUN PIPELINE'}
          </button>
        </div>
      </div>

      {/* Pipeline modal */}
      {showPipelineModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowPipelineModal(false)}>
          <div
            className="rounded-sm border-2 p-6 max-w-sm w-full mx-4 shadow-2xl"
            style={{ background: '#F5F0E8', borderColor: '#6B4F3A', fontFamily: 'Courier Prime, monospace' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'Special Elite, cursive', color: '#2C2416' }}>
              Run Agent Pipeline
            </h2>
            <p className="text-xs mb-4" style={{ color: '#7A6E5F' }}>
              All 5 agents will work in sequence: Dwight finds leads → Jim vets → Oscar drafts docs → Pam writes outreach → Angela reviews pipeline.
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#7A6E5F' }}>Commodity</label>
                <select
                  value={commodity}
                  onChange={e => setCommodity(e.target.value)}
                  className="w-full p-2 text-sm rounded-sm border"
                  style={{ background: '#EDE8DC', borderColor: '#C8B89A', color: '#2C2416', fontFamily: 'Courier Prime, monospace' }}
                >
                  {COMMODITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#7A6E5F' }}>Region</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full p-2 text-sm rounded-sm border"
                  style={{ background: '#EDE8DC', borderColor: '#C8B89A', color: '#2C2416', fontFamily: 'Courier Prime, monospace' }}
                >
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#7A6E5F' }}>Lead Type</label>
                <div className="flex gap-2">
                  {(['supplier', 'buyer'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className="flex-1 py-2 text-xs rounded-sm border capitalize"
                      style={{
                        background: type === t ? '#6B4F3A' : '#EDE8DC',
                        color: type === t ? '#F5E6C8' : '#7A6E5F',
                        borderColor: type === t ? '#6B4F3A' : '#C8B89A',
                        fontFamily: 'Courier Prime, monospace'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPipelineModal(false)
                  onRunPipeline(commodity, region, type)
                }}
                className="flex-1 py-2 text-sm font-bold rounded-sm"
                style={{ background: '#27500A', color: '#F5E6C8', fontFamily: 'Special Elite, cursive', letterSpacing: '1px' }}
              >
                RUN NOW
              </button>
              <button
                onClick={() => setShowPipelineModal(false)}
                className="flex-1 py-2 text-sm rounded-sm border"
                style={{ borderColor: '#C8B89A', color: '#7A6E5F' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
