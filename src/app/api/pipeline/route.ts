import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    if (action === 'full_pipeline') {
      const { commodity, region, type } = data
      const results: Record<string, unknown> = {}

      // Step 1: Dwight finds leads
      const dwightRes = await fetch(`${baseUrl}/api/agents/dwight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'find_leads', data: { commodity, region, type, query: `${type} ${commodity} ${region}` } })
      })
      const dwightData = await dwightRes.json()
      results.leads = dwightData.leads || []

      // Step 2: Jim vets each lead
      const vettedLeads = []
      for (const lead of (results.leads as { id: string; lead_score: number; [key: string]: unknown }[])) {
        const jimRes = await fetch(`${baseUrl}/api/agents/jim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead })
        })
        const jimData = await jimRes.json()
        if (jimData.vetting?.overall_verdict !== 'Rejected') {
          vettedLeads.push({ ...lead, vetting: jimData.vetting })
        }
      }
      results.vetted = vettedLeads

      // Step 3: Oscar generates docs for high-score leads
      const docsGenerated = []
      for (const lead of vettedLeads.filter((l) => l.lead_score >= 70)) {
        const oscarRes = await fetch(`${baseUrl}/api/agents/oscar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead })
        })
        const oscarData = await oscarRes.json()
        docsGenerated.push(oscarData.documents)
      }
      results.documents = docsGenerated

      // Step 4: Pam writes outreach for vetted leads
      const outreachPrepared = []
      for (const lead of vettedLeads) {
        const pamRes = await fetch(`${baseUrl}/api/agents/pam`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead })
        })
        const pamData = await pamRes.json()
        outreachPrepared.push(pamData.outreach)
      }
      results.outreach = outreachPrepared

      // Step 5: Angela reviews pipeline
      const angelaRes = await fetch(`${baseUrl}/api/agents/angela`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pipeline_summary', data: {} })
      })
      const angelaData = await angelaRes.json()
      results.pipeline = angelaData

      await supabase.from('agent_logs').insert({
        agent: 'System',
        action: 'Full pipeline run',
        detail: `Found ${(results.leads as unknown[]).length} leads, vetted ${vettedLeads.length}, prepared ${outreachPrepared.length} outreach`,
        status: 'completed'
      })

      return NextResponse.json({ success: true, results })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Pipeline orchestrator error:', error)
    return NextResponse.json({ error: 'Pipeline error' }, { status: 500 })
  }
}
