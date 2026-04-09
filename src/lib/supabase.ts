import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Lead = {
  id: string
  name: string
  lead_type: 'supplier' | 'buyer'
  commodity: string
  region: string
  country: string
  website: string
  contact_email: string
  contact_name: string
  phone: string
  description: string
  lead_score: number
  status: string
  needs_vetting: string
  enriched_name: string
  likely_role: string
  confidence: string
  key_signal: string
  recommended_action: string
  priority: string
  broker_angle: string
  source: string
  certifications: string
  years_in_business: string
  min_volume_mt: string
  created_at: string
}

export type Vetting = {
  id: string
  lead_id: string
  company_name: string
  vet_score: number
  export_license: string
  certifications_verified: string
  years_in_business: string
  contact_quality: string
  website_credibility: string
  trade_history: string
  sanctions_check: string
  volume_fit: string
  financial_indicators: string
  geographic_fit: string
  overall_verdict: string
  red_flags: string
  vetted_by: string
  vetted_date: string
  created_at: string
}

export type Match = {
  id: string
  rank: number
  match_score: number
  supplier_name: string
  buyer_name: string
  commodity: string
  trade_route: string
  estimated_deal_value_usd: number
  broker_commission_usd: number
  fit_reasons: string
  risks: string
  recommended_first_action: string
  next_step: string
  priority: string
  matched_date: string
  status: string
  created_at: string
}

export type Outreach = {
  id: string
  lead_id: string
  company_name: string
  lead_type: string
  commodity: string
  region: string
  subject_line: string
  first_contact_email: string
  follow_up_1: string
  follow_up_2: string
  linkedin_message: string
  pain_point: string
  your_value_prop: string
  why_they_should_reply: string
  red_flags: string
  status: string
  created_date: string
  sent_date: string
  reply_received: string
  notes: string
  created_at: string
}

export type Deal = {
  id: string
  supplier_name: string
  buyer_name: string
  commodity: string
  trade_route: string
  deal_value_usd: number
  commission_rate: number
  commission_usd: number
  stage: string
  next_action: string
  notes: string
  deal_date: string
  close_date: string
  created_at: string
}

export type AgentLog = {
  id: string
  agent: string
  action: string
  detail: string
  lead_id: string
  status: string
  created_at: string
}
