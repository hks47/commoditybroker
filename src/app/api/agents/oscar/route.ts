import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { AGENTS } from '@/lib/agents'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { lead } = await req.json()

    const today = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      system: AGENTS.oscar.systemPrompt,
      messages: [{
        role: 'user',
        content: `Generate a full broker document package for this deal.

Company: ${lead.name}
Type: ${lead.lead_type}
Commodity: ${lead.commodity}
Country: ${lead.country || lead.region}
Date: ${today}
Broker: Harkirat Singh, CommodityBroker Inc., Vancouver BC Canada
Commission rate: 1.5%

Generate all 4 documents in full. Make them professional and legally sound.

Return JSON only:
{
  "nda": "Full mutual NDA text — parties, obligations, duration, governing law (BC Canada), signatures block",
  "broker_agreement": "Full broker commission agreement — parties, services, 1.5% commission, payment terms, termination, governing law (BC Canada)",
  "term_sheet": "Deal term sheet — commodity specs, quantity, quality, price range, delivery terms (Incoterms), payment terms (LC), timeline",
  "invoice_template": "Commission invoice — invoice number placeholder, date, deal reference, calculation, broker banking details placeholder"
}`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    let docs = {}
    try {
      docs = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim())
    } catch { docs = {} }

    const d = docs as Record<string, unknown>

    const { data: docRecord } = await supabase.from('documents').insert({
      lead_id: lead.id,
      company_name: lead.name,
      commodity: lead.commodity,
      deal_value_usd: 0,
      nda: d.nda || '',
      broker_agreement: d.broker_agreement || '',
      term_sheet: d.term_sheet || '',
      invoice_template: d.invoice_template || '',
      created_date: new Date().toISOString().slice(0, 10),
      status: 'Generated'
    }).select().single()

    await supabase.from('agent_logs').insert({
      agent: 'Oscar',
      action: 'Generated documents',
      detail: `NDA, broker agreement, term sheet, invoice for ${lead.name}`,
      lead_id: lead.id,
      status: 'completed'
    })

    return NextResponse.json({ success: true, documents: docRecord })
  } catch (error) {
    console.error('Oscar agent error:', error)
    return NextResponse.json({ error: 'Agent error' }, { status: 500 })
  }
}
