import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { AGENTS } from '@/lib/agents'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json()

    if (action === 'calculate_commission') {
      const { deal_value_usd, commission_rate = 1.5 } = data
      const commission = deal_value_usd * (commission_rate / 100)
      await supabase.from('agent_logs').insert({
        agent: 'Angela',
        action: 'Calculated commission',
        detail: `Deal value: $${deal_value_usd.toLocaleString()} — Commission: $${commission.toLocaleString()} at ${commission_rate}%`,
        status: 'completed'
      })
      return NextResponse.json({ success: true, commission_usd: commission, commission_rate })
    }

    if (action === 'pipeline_summary') {
      const { data: deals } = await supabase.from('deals').select('*')
      const { data: leads } = await supabase.from('leads').select('id, status, lead_score')
      const { data: matches } = await supabase.from('matches').select('broker_commission_usd, status')

      const totalPipelineValue = deals?.reduce((s, d) => s + (d.deal_value_usd || 0), 0) || 0
      const totalCommission = deals?.reduce((s, d) => s + (d.commission_usd || 0), 0) || 0
      const pendingCommission = matches?.reduce((s, m) => s + (m.broker_commission_usd || 0), 0) || 0
      const hotLeads = leads?.filter(l => l.lead_score >= 70).length || 0
      const vettedLeads = leads?.filter(l => l.status === 'Vetted').length || 0

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 500,
        system: AGENTS.angela.systemPrompt,
        messages: [{
          role: 'user',
          content: `Provide a brief financial health summary for this pipeline.
Total pipeline value: $${totalPipelineValue}
Total commission earned: $${totalCommission}
Pending commission in matches: $${pendingCommission}
Active deals: ${deals?.length || 0}
Hot leads: ${hotLeads}
Vetted leads: ${vettedLeads}
Return JSON: {"summary": "2 sentences", "health": "Good/Fair/Poor", "recommendation": "one action item"}`
        }]
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      let analysis = {}
      try { analysis = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim()) } catch { analysis = {} }

      await supabase.from('agent_logs').insert({
        agent: 'Angela',
        action: 'Pipeline review',
        detail: `Pipeline value: $${totalPipelineValue.toLocaleString()} | Pending commission: $${pendingCommission.toLocaleString()}`,
        status: 'completed'
      })

      return NextResponse.json({
        success: true,
        totalPipelineValue,
        totalCommission,
        pendingCommission,
        activeDeals: deals?.length || 0,
        hotLeads,
        vettedLeads,
        analysis
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Angela agent error:', error)
    return NextResponse.json({ error: 'Agent error' }, { status: 500 })
  }
}
