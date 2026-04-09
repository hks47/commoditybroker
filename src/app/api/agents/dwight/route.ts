import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { AGENTS } from '@/lib/agents'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json()

    if (action === 'score_lead') {
      const { lead } = data

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        system: AGENTS.dwight.systemPrompt,
        messages: [{
          role: 'user',
          content: `Score this lead out of 10 using the 10-point criteria. Be harsh — only quality leads pass.

Company: ${lead.name}
Type: ${lead.lead_type}
Commodity: ${lead.commodity}
Region: ${lead.region}
Website: ${lead.website}
Contact email: ${lead.contact_email}
Description: ${lead.description}
Source: ${lead.source}

Return JSON only:
{"lead_score": 0-100, "priority": "High/Medium/Low", "key_signal": "one sentence on why", "broker_angle": "how to approach", "recommended_action": "Cold email/LinkedIn/Skip", "pass": true/false, "reason": "why pass or fail"}`
        }]
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      let result = {}
      try {
        result = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim())
      } catch { result = { lead_score: 50, priority: 'Medium', pass: true } }

      await supabase.from('agent_logs').insert({
        agent: 'Dwight',
        action: 'Scored lead',
        detail: `${lead.name} — score: ${(result as { lead_score?: number }).lead_score}/100`,
        lead_id: lead.id,
        status: 'completed'
      })

      return NextResponse.json({ success: true, result })
    }

    if (action === 'find_leads') {
      const { query, commodity, region, type } = data

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        system: AGENTS.dwight.systemPrompt,
        messages: [{
          role: 'user',
          content: `Generate 5 realistic medium-sized ${type} leads for ${commodity} in ${region}.
Focus on: ${query}

These should be real types of companies that exist in this market — mid-size, approachable, not giant trading houses.

Return JSON array only:
[{"name": "Company Name", "lead_type": "${type}", "commodity": "${commodity}", "region": "${region}", "country": "specific country", "website": "realistic website url", "contact_email": "realistic contact email", "contact_name": "realistic person name", "description": "2 sentences about what they do", "lead_score": 60-85, "certifications": "e.g. Fair Trade, Organic", "years_in_business": "e.g. 8 years", "min_volume_mt": "e.g. 20MT", "source": "Kompass/Europages/Trade directory", "priority": "High/Medium", "key_signal": "why this is a good lead", "broker_angle": "how to approach"}]`
        }]
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
      let leads = []
      try {
        leads = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim())
      } catch { leads = [] }

      if (leads.length > 0) {
        await supabase.from('leads').insert(leads)
        await supabase.from('agent_logs').insert({
          agent: 'Dwight',
          action: 'Found leads',
          detail: `Generated ${leads.length} ${type} leads for ${commodity} in ${region}`,
          status: 'completed'
        })
      }

      return NextResponse.json({ success: true, leads })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Dwight agent error:', error)
    return NextResponse.json({ error: 'Agent error' }, { status: 500 })
  }
}
