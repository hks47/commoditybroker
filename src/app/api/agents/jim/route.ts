import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { AGENTS } from '@/lib/agents'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { lead } = await req.json()

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1500,
      system: AGENTS.jim.systemPrompt,
      messages: [{
        role: 'user',
        content: `Run a full 10-point KYC vetting check on this company.

Company: ${lead.name}
Type: ${lead.lead_type}
Commodity: ${lead.commodity}
Region: ${lead.region}
Country: ${lead.country}
Website: ${lead.website}
Contact email: ${lead.contact_email}
Contact name: ${lead.contact_name}
Description: ${lead.description}
Certifications: ${lead.certifications}
Years in business: ${lead.years_in_business}
Min volume: ${lead.min_volume_mt}

Score each of the 10 criteria 0 or 1. Be realistic based on what you can infer.

Return JSON only:
{
  "vet_score": 0-10,
  "export_license": "Likely/Unlikely/Unknown",
  "certifications_verified": "Verified/Partial/None",
  "years_in_business": "3+/1-3/<1/Unknown",
  "contact_quality": "Direct/Generic/None",
  "website_credibility": "Professional/Basic/None",
  "trade_history": "Strong/Moderate/Weak/Unknown",
  "sanctions_check": "Clear/Flag/Unknown",
  "volume_fit": "Good fit/Possible/Poor fit",
  "financial_indicators": "Stable/Unknown/Concern",
  "geographic_fit": "Perfect/Good/Poor",
  "overall_verdict": "Approved/Conditional/Rejected",
  "red_flags": "None or description of issues",
  "notes": "Brief summary for CEO"
}`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    let vetting = {}
    try {
      vetting = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim())
    } catch { vetting = { vet_score: 5, overall_verdict: 'Conditional' } }

    const v = vetting as Record<string, unknown>

    const { data: vettingRecord } = await supabase.from('vetting').insert({
      lead_id: lead.id,
      company_name: lead.name,
      ...v,
      vetted_by: 'Jim',
      vetted_date: new Date().toISOString().slice(0, 10)
    }).select().single()

    await supabase.from('leads').update({
      status: v.overall_verdict === 'Approved' ? 'Vetted' : v.overall_verdict === 'Rejected' ? 'Rejected' : 'Conditional',
      needs_vetting: 'Done'
    }).eq('id', lead.id)

    await supabase.from('agent_logs').insert({
      agent: 'Jim',
      action: 'Vetted lead',
      detail: `${lead.name} — vet score: ${v.vet_score}/10 — ${v.overall_verdict}`,
      lead_id: lead.id,
      status: 'completed'
    })

    return NextResponse.json({ success: true, vetting: vettingRecord })
  } catch (error) {
    console.error('Jim agent error:', error)
    return NextResponse.json({ error: 'Agent error' }, { status: 500 })
  }
}
