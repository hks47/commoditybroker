'use client'

import { Stats } from '@/app/page'

export default function Ticker({ stats }: { stats: Stats }) {
  const items = [
    `COMMODITYBROKER INC. LIVE`,
    `LEADS: ${stats.totalLeads}`,
    `HOT LEADS: ${stats.hotLeads}`,
    `VETTED: ${stats.vettedLeads}`,
    `PIPELINE: $${(stats.pipelineValue / 1000).toFixed(0)}K`,
    `COMMISSION PENDING: $${(stats.commissionPending / 1000).toFixed(0)}K`,
    `COFFEE CORRIDOR: VIETNAM → JAPAN · GERMANY · UAE · CANADA`,
    `"THAT'S WHAT SHE SAID"`,
    `DWIGHT SCHRUTE: ASSISTANT REGIONAL MANAGER`,
    `BEARS. BEETS. COMMODITYBROKER INC.`,
  ]

  const text = items.join('   ·   ')

  return (
    <div
      className="overflow-hidden whitespace-nowrap py-1.5"
      style={{ background: '#1A1A1A', fontFamily: 'Courier Prime, monospace' }}
    >
      <div className="inline-block animate-ticker text-xs" style={{ color: '#00FF41', letterSpacing: '1px' }}>
        {text}&nbsp;&nbsp;&nbsp;{text}
      </div>
    </div>
  )
}
