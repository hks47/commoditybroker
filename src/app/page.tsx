'use client'

import { useState, useEffect, useCallback } from 'react'
import ScrantonOffice from '@/components/office/ScrantonOffice'
import Dashboard from '@/components/dashboard/Dashboard'
import Ticker from '@/components/ui/Ticker'
import Header from '@/components/ui/Header'

export type AgentStatus = {
  dwight: 'idle' | 'working' | 'done'
  jim: 'idle' | 'working' | 'done'
  oscar: 'idle' | 'working' | 'done'
  angela: 'idle' | 'working' | 'done'
  pam: 'idle' | 'working' | 'done'
}

export type Stats = {
  totalLeads: number
  hotLeads: number
  vettedLeads: number
  outreachReady: number
  pipelineValue: number
  commissionPending: number
  activeDeals: number
  recentLogs: Array<{ agent: string; action: string; detail: string; created_at: string }>
}

export default function Home() {
  const [view, setView] = useState<'office' | 'dashboard'>('office')
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    dwight: 'idle', jim: 'idle', oscar: 'idle', angela: 'idle', pam: 'idle'
  })
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0, hotLeads: 0, vettedLeads: 0, outreachReady: 0,
    pipelineValue: 0, commissionPending: 0, activeDeals: 0, recentLogs: []
  })
  const [isRunning, setIsRunning] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const [leadsRes, logsRes] = await Promise.all([
        fetch('/api/leads?limit=200'),
        fetch('/api/logs?limit=20')
      ])
      const leads = await leadsRes.json()
      const logs = await logsRes.json()

      if (Array.isArray(leads)) {
        setStats(prev => ({
          ...prev,
          totalLeads: leads.length,
          hotLeads: leads.filter((l: { lead_score: number }) => l.lead_score >= 70).length,
          vettedLeads: leads.filter((l: { status: string }) => l.status === 'Vetted').length,
          recentLogs: Array.isArray(logs) ? logs : []
        }))
      }
    } catch (e) {
      console.error('Stats fetch error:', e)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 15000)
    return () => clearInterval(interval)
  }, [fetchStats])

  const runPipeline = async (commodity: string, region: string, type: string) => {
    setIsRunning(true)
    const agents: (keyof AgentStatus)[] = ['dwight', 'jim', 'oscar', 'pam', 'angela']

    for (const agent of agents) {
      setAgentStatus(prev => ({ ...prev, [agent]: 'working' }))
      await new Promise(r => setTimeout(r, 2000))
    }

    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'full_pipeline', data: { commodity, region, type } })
      })
      await res.json()
    } catch (e) {
      console.error('Pipeline error:', e)
    }

    for (const agent of agents) {
      setAgentStatus(prev => ({ ...prev, [agent]: 'done' }))
    }

    await fetchStats()
    setIsRunning(false)

    setTimeout(() => {
      setAgentStatus({ dwight: 'idle', jim: 'idle', oscar: 'idle', angela: 'idle', pam: 'idle' })
    }, 3000)
  }

  return (
    <div className="min-h-screen carpet-bg">
      <Ticker stats={stats} />
      <Header
        view={view}
        setView={setView}
        isRunning={isRunning}
        onRunPipeline={runPipeline}
        stats={stats}
      />
      <main>
        {view === 'office' ? (
          <ScrantonOffice
            agentStatus={agentStatus}
            stats={stats}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            isRunning={isRunning}
          />
        ) : (
          <Dashboard stats={stats} onRefresh={fetchStats} />
        )}
      </main>
    </div>
  )
}
