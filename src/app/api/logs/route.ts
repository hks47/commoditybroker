import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const agent = searchParams.get('agent')

  let query = supabase.from('agent_logs').select('*').order('created_at', { ascending: false }).limit(limit)
  if (agent) query = query.eq('agent', agent)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
