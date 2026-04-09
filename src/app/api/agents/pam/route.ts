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
      max_tokens: 2000,
      system: AGENTS.pam.systemPrompt,
      messages: [{
        role: 'user',
        content: `Generate a personalised outreach package for this vetted lead.

Company: ${lead.name}
Type: ${lead.lead_type}
Commodity: ${lead.commodity}
Region: ${lead.region}
Country: ${lead.country}
Website: ${lead.website}
Contact name: ${lead.contact_name || 'not known'}
Contact email: ${lead.contact_email || 'not found yet'}
Key signal: ${lead.key_signal}
Broker angle: ${lead.broker_angle}
Certifications: ${lead.certifications}
Years in business: ${lead.years_in_business}

Return JSON only:
{
  "subject_line": "Email subject under 60 chars — specific, not generic",
  "first_contact_email": "Full email body 150-200 words. Specific. Professional. Single clear call to action at the end.",
  "follow_up_1": "Day 7 follow-up. 80-100 words. Add one new piece of value or a specific detail.",
  "follow_up_2": "Day 14 final follow-up. 60-80 words. Gentle nudge. Leave door open.",
  "linkedin_message": "LinkedIn connection request under 300 chars. Personal and specific.",
  "pain_point": "Their most likely pain point in one sentence",
  "your_value_prop": "Your specific value proposition for this company in one sentence",
  "why_they_should_reply": "One concrete reason they would respond",
  "red_flags": "Any concerns about outreach approach or None"
}`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    let outreach = {}
    try {
      outreach = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim())
    } catch { outreach = {} }

    const o = outreach as Record<string, unknown>

    const { data: outreachRecord } = await supabase.from('outreach').insert({
      lead_id: lead.id,
      company_name: lead.name,
      lead_type: lead.lead_type,
      commodity: lead.commodity,
      region: lead.region,
      website: lead.website,
      contact_email: lead.contact_email,
      lead_score: lead.lead_score,
      subject_line: o.subject_line || '',
      first_contact_email: o.first_contact_email || '',
      follow_up_1: o.follow_up_1 || '',
      follow_up_2: o.follow_up_2 || '',
      linkedin_message: o.linkedin_message || '',
      pain_point: o.pain_point || '',
      your_value_prop: o.your_value_prop || '',
      why_they_should_reply: o.why_they_should_reply || '',
      red_flags: o.red_flags || 'None',
      status: 'Ready to send',
      created_date: new Date().toISOString().slice(0, 10),
      reply_received: 'No'
    }).select().single()

    await supabase.from('agent_logs').insert({
      agent: 'Pam',
      action: 'Prepared outreach',
      detail: `${lead.name} — subject: ${o.subject_line}`,
      lead_id: lead.id,
      status: 'completed'
    })

    return NextResponse.json({ success: true, outreach: outreachRecord })
  } catch (error) {
    console.error('Pam agent error:', error)
    return NextResponse.json({ error: 'Agent error' }, { status: 500 })
  }
}
