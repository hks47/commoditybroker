'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Stats } from '@/app/page'

type Props = {
  stats: Stats
  onRefresh: () => void
}

type Lead = {
  id: string
  name: string
  lead_type: string
  commodity: string
  region: string
  lead_score: number
  status: string
  priority: string
  contact_email: string
  key_signal: string
  created_at: string
}

type Match = {
  id: string
  supplier_name: string
  buyer_name: string
  commodity: string
  trade_route: string
  match_score: number
  broker_commission_usd: number
  estimated_deal_value_usd: number
  priority: string
  recommended_first_action: string
  status: string
}

type Outreach = {
  id: string
  company_name: string
  lead_type: string
  subject_line: string
  status: string
  reply_received: string
  created_date: string
  first_contact_email: string
}

export default function Dashboard({ stats, onRefresh }: Props) {
  const [tab, setTab] = useState<'leads' | 'matches' | 'outreach' | 'logs'>('leads')
  const [leads, setLeads] = useState<Lead[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [outreach, setOutreach] = useState<Outreach[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOutreach, setSelectedOutreach] = useState<Outreach | null>(null)

  useEffect(() => {
    fetchTabData()
  }, [tab])

  const fetchTabData = async () => {
    setLoading(true)
    try {
      if (tab === 'leads') {
        const { data } = await supabase.from('leads').select('*').order('lead_score', { ascending: false }).limit(50)
        setLeads(data || [])
      } else if (tab === 'matches') {
        const { data } = await supabase.from('matches').select('*').order('match_score', { ascending: false }).limit(50)
        setMatches(data || [])
      } else if (tab === 'outreach') {
        const { data } = await supabase.from('outreach').select('*').order('created_at', { ascending: false }).limit(50)
        setOutreach(data || [])
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const scoreColor = (score: number) => score >= 70 ? '#27500A' : score >= 50 ? '#854F0B' : '#791F1F'
  const scoreBg = (score: number) => score >= 70 ? '#EAF3DE' : score >= 50 ? '#FAEEDA' : '#FCEBEB'

  const S = { fontFamily: 'Courier Prime, monospace' }

  return (
    <div className="p-4" style={S}>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Leads', value: stats.totalLeads, color: '#0C447C', bg: '#EFF6FF' },
          { label: 'Hot Leads (70+)', value: stats.hotLeads, color: '#27500A', bg: '#EAF3DE' },
          { label: 'Vetted & Approved', value: stats.vettedLeads, color: '#854F0B', bg: '#FAEEDA' },
          { label: 'Commission Pipeline', value: `$${(stats.commissionPending / 1000).toFixed(0)}k`, color: '#791F1F', bg: '#FCEBEB' },
        ].map(card => (
          <div key={card.label} className="rounded-sm border p-3 shadow-sm"
            style={{ background: card.bg, borderColor: card.color + '40' }}>
            <div className="text-2xl font-bold" style={{ fontFamily: 'Special Elite, cursive', color: card.color }}>
              {card.value}
            </div>
            <div className="text-xs mt-1 uppercase tracking-wider" style={{ color: card.color + 'CC' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 border-b-2" style={{ borderColor: '#C8B89A' }}>
        {(['leads', 'matches', 'outreach', 'logs'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 text-xs uppercase tracking-wider transition-colors"
            style={{
              fontFamily: 'Special Elite, cursive',
              background: tab === t ? '#6B4F3A' : 'transparent',
              color: tab === t ? '#F5E6C8' : '#7A6E5F',
              borderRadius: '4px 4px 0 0',
              letterSpacing: '1px'
            }}
          >
            {t}
          </button>
        ))}
        <button
          onClick={() => { onRefresh(); fetchTabData() }}
          className="ml-auto px-3 py-1 text-xs rounded border"
          style={{ borderColor: '#C8B89A', color: '#7A6E5F' }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Tab content */}
      <div className="rounded-sm border overflow-hidden shadow-sm" style={{ background: '#F5F0E8', borderColor: '#C8B89A' }}>

        {loading && (
          <div className="text-center py-8 text-sm" style={{ color: '#7A6E5F' }}>Loading...</div>
        )}

        {/* LEADS TAB */}
        {!loading && tab === 'leads' && (
          <div>
            {leads.length === 0 ? (
              <div className="text-center py-12 text-sm" style={{ color: '#7A6E5F' }}>
                No leads yet. Run the pipeline from the office view to find leads.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: '#6B4F3A', color: '#F5E6C8' }}>
                    {['Company', 'Type', 'Commodity', 'Region', 'Score', 'Status', 'Signal'].map(h => (
                      <th key={h} className="text-left px-3 py-2 uppercase tracking-wider" style={{ fontSize: '10px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <tr key={lead.id} style={{ background: i % 2 === 0 ? '#F5F0E8' : '#EDE8DC', borderBottom: '1px solid #DDD5C0' }}>
                      <td className="px-3 py-2 font-bold" style={{ color: '#2C2416' }}>{lead.name || '—'}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded text-xs"
                          style={{
                            background: lead.lead_type === 'supplier' ? '#EFF6FF' : '#F5F3FF',
                            color: lead.lead_type === 'supplier' ? '#0C447C' : '#534AB7'
                          }}>
                          {lead.lead_type}
                        </span>
                      </td>
                      <td className="px-3 py-2" style={{ color: '#7A6E5F' }}>{lead.commodity}</td>
                      <td className="px-3 py-2" style={{ color: '#7A6E5F' }}>{lead.region}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded font-bold"
                          style={{ background: scoreBg(lead.lead_score), color: scoreColor(lead.lead_score) }}>
                          {lead.lead_score}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded text-xs"
                          style={{
                            background: lead.status === 'Vetted' ? '#EAF3DE' : lead.status === 'Rejected' ? '#FCEBEB' : '#FAEEDA',
                            color: lead.status === 'Vetted' ? '#27500A' : lead.status === 'Rejected' ? '#791F1F' : '#854F0B'
                          }}>
                          {lead.status || 'New'}
                        </span>
                      </td>
                      <td className="px-3 py-2" style={{ color: '#7A6E5F', maxWidth: '180px' }}>
                        <span className="truncate block" style={{ maxWidth: '180px' }}>{lead.key_signal || '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* MATCHES TAB */}
        {!loading && tab === 'matches' && (
          <div>
            {matches.length === 0 ? (
              <div className="text-center py-12 text-sm" style={{ color: '#7A6E5F' }}>
                No matches yet. Run the AI Matcher after the scraper populates leads.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: '#6B4F3A', color: '#F5E6C8' }}>
                    {['Supplier', 'Buyer', 'Route', 'Score', 'Deal Value', 'Commission', 'Action'].map(h => (
                      <th key={h} className="text-left px-3 py-2 uppercase tracking-wider" style={{ fontSize: '10px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match, i) => (
                    <tr key={match.id} style={{ background: i % 2 === 0 ? '#F5F0E8' : '#EDE8DC', borderBottom: '1px solid #DDD5C0' }}>
                      <td className="px-3 py-2 font-bold" style={{ color: '#2C2416' }}>{match.supplier_name}</td>
                      <td className="px-3 py-2 font-bold" style={{ color: '#2C2416' }}>{match.buyer_name}</td>
                      <td className="px-3 py-2" style={{ color: '#7A6E5F' }}>{match.trade_route}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded font-bold"
                          style={{ background: scoreBg(match.match_score), color: scoreColor(match.match_score) }}>
                          {match.match_score}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-bold" style={{ color: '#0C447C' }}>
                        ${(match.estimated_deal_value_usd || 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 font-bold" style={{ color: '#27500A' }}>
                        ${(match.broker_commission_usd || 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-2" style={{ color: '#7A6E5F', fontSize: '10px' }}>
                        {match.recommended_first_action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* OUTREACH TAB */}
        {!loading && tab === 'outreach' && (
          <div>
            {outreach.length === 0 ? (
              <div className="text-center py-12 text-sm" style={{ color: '#7A6E5F' }}>
                No outreach prepared yet. Run Pam&apos;s outreach prep after leads are vetted.
              </div>
            ) : (
              <div className="divide-y" style={{ divideColor: '#DDD5C0' }}>
                {outreach.map(o => (
                  <div key={o.id} className="p-3 flex items-center gap-3 hover:bg-amber-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedOutreach(selectedOutreach?.id === o.id ? null : o)}>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm border flex-shrink-0"
                      style={{ background: o.reply_received === 'Yes' ? '#EAF3DE' : '#EFF6FF', borderColor: o.reply_received === 'Yes' ? '#27500A' : '#0C447C' }}>
                      {o.reply_received === 'Yes' ? '✓' : '✉'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate" style={{ color: '#2C2416' }}>{o.company_name}</div>
                      <div className="text-xs truncate" style={{ color: '#7A6E5F' }}>{o.subject_line}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded text-xs"
                        style={{
                          background: o.status === 'Sent' ? '#EAF3DE' : '#FAEEDA',
                          color: o.status === 'Sent' ? '#27500A' : '#854F0B'
                        }}>
                        {o.status}
                      </span>
                      <span className="text-xs" style={{ color: '#7A6E5F' }}>{o.created_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LOGS TAB */}
        {!loading && tab === 'logs' && (
          <div className="divide-y" style={{ divideColor: '#DDD5C0' }}>
            {stats.recentLogs.length === 0 ? (
              <div className="text-center py-12 text-sm" style={{ color: '#7A6E5F' }}>No agent activity yet.</div>
            ) : stats.recentLogs.map((log, i) => {
              const agentColors: Record<string, string> = {
                Dwight: '#854F0B', Jim: '#0C447C', Oscar: '#27500A', Angela: '#791F1F', Pam: '#534AB7', System: '#2C2416'
              }
              const color = agentColors[log.agent] || '#2C2416'
              return (
                <div key={i} className="px-4 py-2 flex items-start gap-3">
                  <div className="text-xs font-bold flex-shrink-0 w-16 mt-0.5" style={{ color }}>{log.agent}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold" style={{ color: '#2C2416' }}>{log.action}</div>
                    <div className="text-xs" style={{ color: '#7A6E5F' }}>{log.detail}</div>
                  </div>
                  <div className="text-xs flex-shrink-0" style={{ color: '#B0A08A' }}>
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Outreach detail modal */}
      {selectedOutreach && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOutreach(null)}>
          <div className="rounded-sm border-2 max-w-2xl w-full max-h-screen overflow-y-auto shadow-xl"
            style={{ background: '#F5F0E8', borderColor: '#6B4F3A', fontFamily: 'Courier Prime, monospace' }}
            onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b" style={{ borderColor: '#C8B89A', background: '#6B4F3A' }}>
              <h2 className="font-bold" style={{ fontFamily: 'Special Elite, cursive', color: '#F5E6C8', fontSize: '16px' }}>
                {selectedOutreach.company_name}
              </h2>
              <p className="text-xs" style={{ color: '#C4A882' }}>Subject: {selectedOutreach.subject_line}</p>
            </div>
            <div className="p-4 space-y-4">
              {[
                { label: 'First Contact Email', content: selectedOutreach.first_contact_email },
              ].map(section => (
                <div key={section.label}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6B4F3A' }}>{section.label}</h3>
                  <div className="p-3 rounded text-xs whitespace-pre-wrap" style={{ background: '#EDE8DC', color: '#2C2416', lineHeight: 1.7 }}>
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2" style={{ borderColor: '#C8B89A' }}>
              <button
                className="flex-1 py-2 text-xs rounded border font-bold"
                style={{ background: '#27500A', color: '#F5E6C8', border: 'none' }}
                onClick={async () => {
                  await supabase.from('outreach').update({ status: 'Sent', sent_date: new Date().toISOString().slice(0, 10) }).eq('id', selectedOutreach.id)
                  setSelectedOutreach(null)
                  fetchTabData()
                }}>
                Mark as Sent
              </button>
              <button
                className="flex-1 py-2 text-xs rounded border"
                style={{ borderColor: '#C8B89A', color: '#7A6E5F' }}
                onClick={() => setSelectedOutreach(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
