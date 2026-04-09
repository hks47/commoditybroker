# CommodityBroker Inc. — Scranton Branch

AI-powered commodity brokering platform. 5 Claude agents work as your staff. You close warm leads.

## Stack
- Next.js 14 (App Router)
- Supabase (PostgreSQL database)
- Vercel (hosting)
- Claude API (5 AI agents)
- Tailwind CSS + Special Elite font (The Office theme)

## Agents
| Agent | Role |
|-------|------|
| Dwight Schrute | Sales & Lead Intelligence |
| Jim Halpert | Vetting & KYC Operations |
| Oscar Martinez | Legal & Documentation |
| Angela Martin | Accounts & Finance |
| Pam Beesly | Outreach & Communications |

## Setup

### 1. Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/commoditybroker
cd commoditybroker
npm install
```

### 2. Environment variables
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://rtowocuvioexkehsmxss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_BASE_URL=https://your-vercel-url.vercel.app
```

### 3. Supabase setup
Run the SQL in `supabase/schema.sql` in your Supabase SQL editor.

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
1. Push to GitHub
2. Go to vercel.com → New Project → Import your repo
3. Add environment variables in Vercel dashboard
4. Deploy

## Usage

### The Office View
- See all 5 agents at their desks
- Click any agent to see their recent activity
- Click "Run Pipeline" to send all agents to work
- Choose commodity, region, and lead type
- Watch agents animate as they work

### Dashboard View
- Leads tab: all scraped and scored leads
- Matches tab: AI-generated supplier-buyer matches with commission estimates
- Outreach tab: personalised emails ready to send, click to mark as sent
- Logs tab: real-time agent activity log

### Pipeline Flow
1. Dwight finds 5 quality leads for your chosen corridor
2. Jim vets each lead (10-point KYC check)
3. Oscar generates docs for high-score leads
4. Pam writes personalised outreach for each vetted lead
5. Angela reviews the pipeline financial health
6. You get warm leads in your dashboard, ready to close

## The Office Characters
- Dwight: "Bears. Beets. Quality leads."
- Jim: Does the face when a lead scores under 7.
- Oscar: "Actually, under Canadian commercial law..."
- Angela: Disapproving of wasteful spending.
- Pam: Every email is a relationship.
- You: World's Best Boss mug, warm leads only.
