'use client'

import { useState, useEffect } from 'react'
import { AgentStatus, Stats } from '@/app/page'

type Props = {
  agentStatus: AgentStatus
  stats: Stats
  selectedAgent: string | null
  setSelectedAgent: (agent: string | null) => void
  isRunning: boolean
}

const AGENTS_CONFIG = [
  {
    key: 'dwight',
    name: 'Dwight Schrute',
    title: 'Sales & Intelligence',
    emoji: '🥇',
    desk: 'Sales Dept.',
    color: '#854F0B',
    bg: '#FAEEDA',
    position: { x: 0, y: 0 },
    quote: 'Identity theft is not a joke. Neither are bad leads.',
    task: (s: Stats) => `Scored ${s.totalLeads} leads today`,
  },
  {
    key: 'jim',
    name: 'Jim Halpert',
    title: 'Vetting & KYC',
    emoji: '🔍',
    desk: 'Operations',
    color: '#0C447C',
    bg: '#EFF6FF',
    position: { x: 1, y: 0 },
    quote: 'If a lead scores under 7, it gets the face.',
    task: (s: Stats) => `Vetted ${s.vettedLeads} leads approved`,
  },
  {
    key: 'oscar',
    name: 'Oscar Martinez',
    title: 'Legal & Documents',
    emoji: '⚖️',
    desk: 'Legal Dept.',
    color: '#27500A',
    bg: '#EAF3DE',
    position: { x: 2, y: 0 },
    quote: "Actually, under Canadian commercial law...",
    task: () => `NDAs, agreements, term sheets`,
  },
  {
    key: 'angela',
    name: 'Angela Martin',
    title: 'Accounts & Finance',
    emoji: '💰',
    desk: 'Accounts',
    color: '#791F1F',
    bg: '#FCEBEB',
    position: { x: 0, y: 1 },
    quote: 'I find wasteful spending morally offensive.',
    task: (s: Stats) => `$${(s.commissionPending / 1000).toFixed(0)}k commission tracked`,
  },
  {
    key: 'pam',
    name: 'Pam Beesly',
    title: 'Outreach & Comms',
    emoji: '✉️',
    desk: 'Reception',
    color: '#534AB7',
    bg: '#EEEDFE',
    position: { x: 1, y: 1 },
    quote: 'Every email is a relationship. Make it count.',
    task: (s: Stats) => `${s.outreachReady} outreach packages ready`,
  },
]

function Character({ agent, status, onClick, isSelected }: {
  agent: typeof AGENTS_CONFIG[0]
  status: string
  onClick: () => void
  isSelected: boolean
}) {
  const animClass = status === 'working' ? 'animate-working' :
    status === 'done' ? '' : 'animate-idle'

  return (
    <div
      className={`cursor-pointer transition-all duration-200 ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
      onClick={onClick}
    >
      <div className={`relative flex flex-col items-center gap-1 ${animClass}`}>
        {/* Character body - pixel art style */}
        <div className="relative">
          {/* Status indicator */}
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white z-10 ${
            status === 'working' ? 'bg-amber-500 animate-pulse' :
            status === 'done' ? 'bg-green-600' : 'bg-gray-400'
          }`} />

          {/* Character avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 shadow-md"
            style={{ background: agent.bg, borderColor: agent.color }}
          >
            {agent.emoji}
          </div>
        </div>

        {/* Name tag */}
        <div className="text-center">
          <div
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{ fontFamily: 'Courier Prime, monospace', color: agent.color, background: agent.bg }}
          >
            {agent.name.split(' ')[0]}
          </div>
        </div>

        {/* Working speech bubble */}
        {status === 'working' && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded whitespace-nowrap z-20 shadow">
            Working...
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-yellow-200" />
          </div>
        )}

        {/* Done checkmark */}
        {status === 'done' && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-green-600 font-bold text-sm z-20">
            ✓
          </div>
        )}
      </div>
    </div>
  )
}

function Desk({ agent, status, onClick, isSelected, stats }: {
  agent: typeof AGENTS_CONFIG[0]
  status: string
  onClick: () => void
  isSelected: boolean
  stats: Stats
}) {
  return (
    <div
      className={`relative rounded-sm border-2 p-3 cursor-pointer transition-all duration-300 ${
        isSelected ? 'agent-active scale-102' :
        status === 'working' ? 'agent-processing' : ''
      }`}
      style={{
        background: '#F5F0E8',
        borderColor: isSelected ? agent.color : '#C8B89A',
        boxShadow: isSelected ? `0 0 0 2px ${agent.color}40, 2px 3px 0 rgba(0,0,0,0.3)` : '2px 3px 0 rgba(0,0,0,0.2)',
        fontFamily: 'Courier Prime, monospace'
      }}
      onClick={onClick}
    >
      {/* Wood grain desk top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-sm" style={{ background: '#6B4F3A' }} />

      {/* Department nameplate */}
      <div
        className="text-xs font-bold mb-2 px-2 py-0.5 rounded text-center mt-1"
        style={{ background: agent.color, color: '#F5E6C8', fontFamily: 'Special Elite, cursive', letterSpacing: '1px' }}
      >
        {agent.desk}
      </div>

      {/* Character */}
      <div className="flex justify-center mb-2">
        <Character agent={agent} status={status} onClick={onClick} isSelected={isSelected} />
      </div>

      {/* Current task */}
      <div className="text-xs text-center mt-1" style={{ color: '#7A6E5F' }}>
        {agent.task(stats)}
      </div>

      {/* Desk items decoration */}
      <div className="flex justify-between mt-2 px-1 text-xs opacity-50">
        <span>📁</span>
        <span>☕</span>
        <span>🖊️</span>
      </div>
    </div>
  )
}

function AgentModal({ agent, status, stats, onClose }: {
  agent: typeof AGENTS_CONFIG[0]
  status: string
  stats: Stats
  onClose: () => void
}) {
  const [logs, setLogs] = useState<Array<{ action: string; detail: string; created_at: string }>>([])

  useEffect(() => {
    fetch(`/api/logs?agent=${agent.name.split(' ')[0]}&limit=5`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLogs(data) })
      .catch(() => {})
  }, [agent])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="rounded-sm border-2 p-6 max-w-md w-full mx-4 shadow-xl"
        style={{ background: '#F5F0E8', borderColor: agent.color, fontFamily: 'Courier Prime, monospace' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-3xl border-2"
            style={{ background: agent.bg, borderColor: agent.color }}
          >
            {agent.emoji}
          </div>
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Special Elite, cursive', color: agent.color }}>
              {agent.name}
            </h2>
            <p className="text-xs" style={{ color: '#7A6E5F' }}>{agent.title}</p>
            <div className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
              status === 'working' ? 'bg-amber-100 text-amber-800' :
              status === 'done' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-600'
            }`}>
              {status === 'working' ? '⚡ Working' : status === 'done' ? '✓ Done' : '○ Idle'}
            </div>
          </div>
        </div>

        <div className="p-3 mb-4 rounded" style={{ background: '#FFFFF0', borderLeft: `3px solid ${agent.color}` }}>
          <p className="text-xs italic" style={{ color: '#2C2416' }}>&ldquo;{agent.quote}&rdquo;</p>
        </div>

        <h3 className="text-xs font-bold mb-2" style={{ color: agent.color, letterSpacing: '1px' }}>
          RECENT ACTIVITY
        </h3>
        <div className="space-y-1">
          {logs.length > 0 ? logs.map((log, i) => (
            <div key={i} className="text-xs p-2 rounded" style={{ background: '#EDE8DC' }}>
              <span className="font-bold" style={{ color: agent.color }}>{log.action}</span>
              <span className="ml-2" style={{ color: '#7A6E5F' }}>{log.detail}</span>
            </div>
          )) : (
            <p className="text-xs" style={{ color: '#7A6E5F' }}>No activity yet. Run the pipeline to get started.</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-xs py-2 rounded border"
          style={{ borderColor: agent.color, color: agent.color, background: 'transparent' }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default function ScrantonOffice({ agentStatus, stats, selectedAgent, setSelectedAgent, isRunning }: Props) {
  const selectedAgentConfig = AGENTS_CONFIG.find(a => a.key === selectedAgent)

  return (
    <div className="relative min-h-screen">
      {/* Office walls */}
      <div
        className="mx-4 mt-4 rounded-sm border-4 overflow-hidden"
        style={{
          borderColor: '#4A3020',
          background: '#D4C5A9',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.4)'
        }}
      >
        {/* Ceiling fluorescent lights */}
        <div className="flex justify-around py-2 px-8" style={{ background: '#C8B89A', borderBottom: '2px solid #B0A08A' }}>
          {[1,2,3].map(i => (
            <div key={i} className="h-2 w-32 rounded-sm" style={{ background: '#F0ECD8', boxShadow: '0 0 8px rgba(240,236,216,0.8)' }} />
          ))}
        </div>

        {/* Room label */}
        <div className="text-center py-2" style={{ fontFamily: 'Special Elite, cursive', color: '#7A6E5F', fontSize: '11px', letterSpacing: '3px' }}>
          SCRANTON BRANCH — COMMODITYBROKER INC.
        </div>

        {/* Office floor with desks */}
        <div
          className="p-6"
          style={{
            background: 'repeating-linear-gradient(45deg, #8B7355 0px, #8B7355 2px, #7A6445 2px, #7A6445 14px)',
            minHeight: '420px'
          }}
        >
          {/* Desks grid */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {AGENTS_CONFIG.filter(a => a.position.y === 0).map(agent => (
              <Desk
                key={agent.key}
                agent={agent}
                status={agentStatus[agent.key as keyof AgentStatus]}
                onClick={() => setSelectedAgent(selectedAgent === agent.key ? null : agent.key)}
                isSelected={selectedAgent === agent.key}
                stats={stats}
              />
            ))}
          </div>

          {/* Second row */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-6">
            {AGENTS_CONFIG.filter(a => a.position.y === 1).map(agent => (
              <Desk
                key={agent.key}
                agent={agent}
                status={agentStatus[agent.key as keyof AgentStatus]}
                onClick={() => setSelectedAgent(selectedAgent === agent.key ? null : agent.key)}
                isSelected={selectedAgent === agent.key}
                stats={stats}
              />
            ))}

            {/* CEO Office */}
            <div
              className="rounded-sm border-2 p-3"
              style={{
                background: '#F5F0E8',
                borderColor: '#6B4F3A',
                borderWidth: '2px',
                boxShadow: '2px 3px 0 rgba(0,0,0,0.3)',
                fontFamily: 'Courier Prime, monospace',
                position: 'relative'
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-sm" style={{ background: '#6B4F3A' }} />
              <div
                className="text-xs font-bold mb-2 px-2 py-0.5 rounded text-center mt-1"
                style={{ background: '#2C2416', color: '#F5E6C8', fontFamily: 'Special Elite, cursive', letterSpacing: '1px' }}
              >
                CEO OFFICE
              </div>
              <div className="flex justify-center mb-2">
                <div className="flex flex-col items-center gap-1 animate-idle">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 shadow-md"
                    style={{ background: '#FFF9E6', borderColor: '#6B4F3A' }}
                  >
                    👔
                  </div>
                  <div className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: '#2C2416', background: '#EDE8DC' }}>
                    Harkirat
                  </div>
                </div>
              </div>
              <div className="text-xs text-center" style={{ color: '#7A6E5F' }}>
                {stats.vettedLeads > 0 ? `${stats.vettedLeads} warm leads ready` : 'Waiting for warm leads'}
              </div>
              <div className="flex justify-between mt-2 px-1 text-xs opacity-50">
                <span>🏆</span>
                <span>☕</span>
                <span>📊</span>
              </div>
              <div className="absolute top-2 right-2 text-xs" style={{ color: '#854F0B', fontFamily: 'Special Elite, cursive', fontSize: '7px' }}>
                WORLD&apos;S BEST BOSS
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline running indicator */}
        {isRunning && (
          <div
            className="py-3 text-center"
            style={{ background: '#6B4F3A', fontFamily: 'Special Elite, cursive', color: '#F5E6C8', fontSize: '12px', letterSpacing: '2px' }}
          >
            ⚡ AGENTS WORKING — PIPELINE IN PROGRESS ⚡
          </div>
        )}

        {/* Stats strip */}
        <div
          className="grid grid-cols-4 divide-x"
          style={{ background: '#C8B89A', borderTop: '2px solid #B0A08A', divideColor: '#B0A08A' }}
        >
          {[
            { label: 'Total Leads', value: stats.totalLeads, color: '#0C447C' },
            { label: 'Hot Leads', value: stats.hotLeads, color: '#3B6D11' },
            { label: 'Vetted', value: stats.vettedLeads, color: '#854F0B' },
            { label: 'Pipeline', value: `$${(stats.pipelineValue / 1000).toFixed(0)}k`, color: '#791F1F' },
          ].map(stat => (
            <div key={stat.label} className="text-center py-3">
              <div className="text-xl font-bold" style={{ fontFamily: 'Special Elite, cursive', color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-wider" style={{ color: '#7A6E5F' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent modal */}
      {selectedAgent && selectedAgentConfig && (
        <AgentModal
          agent={selectedAgentConfig}
          status={agentStatus[selectedAgent as keyof AgentStatus]}
          stats={stats}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  )
}
