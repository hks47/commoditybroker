'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { AgentStatus, Stats } from '@/app/page'

type Props = {
  agentStatus: AgentStatus
  stats: Stats
  selectedAgent: string | null
  setSelectedAgent: (agent: string | null) => void
  isRunning: boolean
}

const QUOTES: Record<string, string[]> = {
  dwight: [
    "Bears. Beets. Battlestar Galactica.",
    "I am faster than 80% of all snakes.",
    "Identity theft is not a joke, Jim!",
    "I never smile if I can help it.",
    "Quality leads only. I accept nothing less.",
    "The lead pipeline is my mung bean.",
    "Through concentration, I can raise my lead score at will.",
    "FACT: Vietnamese coffee is superior.",
  ],
  jim: [
    "I'm not superstitious, but I am a little stitious.",
    "Sometimes I start a sentence and don't know where it's going.",
    "KYC score under 7? That gets the face.",
    "False. This lead is a solid 8.",
    "We need better leads. That's what she said.",
    "I am running away from my responsibilities. And finding leads.",
  ],
  oscar: [
    "Actually, under Canadian commercial law...",
    "I'm not going to be made to feel stupid about this.",
    "The NDA has been prepared. As requested.",
    "Section 4(b) is very clear on this matter.",
    "This commission clause is airtight.",
    "I have a master's degree. I can draft a term sheet.",
  ],
  angela: [
    "I don't have a lot of patience for bad pipeline math.",
    "The numbers don't lie. The commission is concerning.",
    "I find wasteful spending morally questionable.",
    "A 1.5% commission is standard. Accept it.",
    "I have been keeping records. Always.",
    "Cats. Then leads. In that order.",
  ],
  pam: [
    "A personal touch goes a long way in cold outreach.",
    "The subject line should be specific. Not generic.",
    "Japanese buyers need precision. I've done my research.",
    "Every email is a relationship.",
    "I went to art school. I can write a cold email.",
    "Michael, that's not how you spell 'commodity'.",
  ],
  harkirat: [
    "I am the World's Best Commodity Broker.",
    "Would I rather be feared or loved? Both. I want both.",
    "That's what she said... about the commission rate.",
    "I'm not a millionaire yet. But I'm gonna be.",
    "Today I will close a deal. Or at least a warm lead.",
    "Wikipedia says commodity brokering is very lucrative.",
  ],
}

const AGENT_COLORS = {
  dwight:   { primary: '#854F0B', light: '#FAEEDA', dark: '#5C3508', skin: '#F4C27F', hair: '#5C3D11' },
  jim:      { primary: '#0C447C', light: '#EFF6FF', dark: '#083060', skin: '#E8B887', hair: '#8B6914' },
  oscar:    { primary: '#27500A', light: '#EAF3DE', dark: '#1A3507', skin: '#C68642', hair: '#1A1A1A' },
  angela:   { primary: '#791F1F', light: '#FCEBEB', dark: '#521414', skin: '#F4C27F', hair: '#C8A96E' },
  pam:      { primary: '#534AB7', light: '#EEEDFE', dark: '#3A3380', skin: '#F4C27F', hair: '#B8832A' },
  harkirat: { primary: '#2C2416', light: '#F5F0E8', dark: '#1A1510', skin: '#C68642', hair: '#1A1A1A' },
}

const DESK_POSITIONS = {
  dwight:   { col: 2.2, row: 1.4, label: 'SALES INTEL' },
  jim:      { col: 3.6, row: 1.0, label: 'VETTING' },
  oscar:    { col: 5.0, row: 1.4, label: 'LEGAL' },
  angela:   { col: 4.2, row: 2.6, label: 'ACCOUNTS' },
  pam:      { col: 2.2, row: 2.8, label: 'RECEPTION' },
  harkirat: { col: 0.8, row: 0.8, label: "CEO OFFICE" },
}

const HANDOFF_SEQUENCE = [
  { from: 'dwight', to: 'jim',      label: 'Lead found!' },
  { from: 'jim',    to: 'oscar',    label: 'Lead vetted' },
  { from: 'jim',    to: 'pam',      label: 'Prep outreach' },
  { from: 'oscar',  to: 'harkirat', label: 'Docs ready' },
  { from: 'pam',    to: 'angela',   label: 'Track commission' },
  { from: 'angela', to: 'harkirat', label: 'Warm lead!' },
]

function shadeColor(hex: string, amt: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amt))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amt))
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amt))
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export default function ScrantonOffice({ agentStatus, stats, selectedAgent, setSelectedAgent, isRunning }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)
  const prevStatusRef = useRef<AgentStatus>(agentStatus)
  const [speechBubble, setSpeechBubble] = useState<{ agent: string; quote: string } | null>(null)
  const [handoffAnim, setHandoffAnim] = useState<{ from: string; to: string; progress: number; label: string } | null>(null)
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerSpeech = useCallback((agent: string) => {
    const quotes = QUOTES[agent]
    if (!quotes?.length) return
    const quote = quotes[Math.floor(Math.random() * quotes.length)]
    setSpeechBubble({ agent, quote })
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
    speechTimerRef.current = setTimeout(() => setSpeechBubble(null), 4500)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const idle = Object.entries(agentStatus).filter(([, s]) => s === 'idle').map(([a]) => a)
      if (idle.length > 0) triggerSpeech(idle[Math.floor(Math.random() * idle.length)])
    }, 8000)
    return () => clearInterval(interval)
  }, [agentStatus, triggerSpeech])

  useEffect(() => {
    const prev = prevStatusRef.current
    Object.entries(agentStatus).forEach(([agent, status]) => {
      if (prev[agent as keyof AgentStatus] === 'working' && status === 'done') {
        const h = HANDOFF_SEQUENCE.find(hf => hf.from === agent)
        if (h) setHandoffAnim({ ...h, progress: 0 })
      }
    })
    prevStatusRef.current = { ...agentStatus }
  }, [agentStatus])

  useEffect(() => {
    if (!handoffAnim) return
    const id = setInterval(() => {
      setHandoffAnim(prev => {
        if (!prev || prev.progress >= 1) { clearInterval(id); return null }
        return { ...prev, progress: Math.min(1, prev.progress + 0.018) }
      })
    }, 16)
    return () => clearInterval(id)
  }, [handoffAnim?.from, handoffAnim?.to])

  function isoToScreen(col: number, row: number, w: number, h: number, tileW: number, tileH: number) {
    const originX = w * 0.5
    const originY = h * 0.18
    return {
      x: originX + (col - row) * tileW,
      y: originY + (col + row) * tileH,
    }
  }

  function drawFloorTile(ctx: CanvasRenderingContext2D, x: number, y: number, tw: number, th: number, fill: string) {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + tw, y + th)
    ctx.lineTo(x, y + th * 2)
    ctx.lineTo(x - tw, y + th)
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  function drawDesk(ctx: CanvasRenderingContext2D, x: number, y: number, tw: number, th: number, colors: typeof AGENT_COLORS.dwight, label: string, status: string, t: number) {
    const dw = tw * 0.75
    const dh = th * 0.75
    const deskH = 18
    const isWorking = status === 'working'
    const pulse = isWorking ? (Math.sin(t * 6) + 1) / 2 : 0

    // Desk top face
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + dw, y + dh)
    ctx.lineTo(x, y + dh * 2)
    ctx.lineTo(x - dw, y + dh)
    ctx.closePath()
    ctx.fillStyle = isWorking ? shadeColor(colors.light, -10) : colors.light
    ctx.fill()
    ctx.strokeStyle = colors.primary
    ctx.lineWidth = isWorking ? 1.5 : 0.8
    ctx.stroke()

    // Desk left face
    ctx.beginPath()
    ctx.moveTo(x - dw, y + dh)
    ctx.lineTo(x, y + dh * 2)
    ctx.lineTo(x, y + dh * 2 + deskH)
    ctx.lineTo(x - dw, y + dh + deskH)
    ctx.closePath()
    ctx.fillStyle = shadeColor(colors.light, -40)
    ctx.fill()
    ctx.stroke()

    // Desk right face
    ctx.beginPath()
    ctx.moveTo(x + dw, y + dh)
    ctx.lineTo(x, y + dh * 2)
    ctx.lineTo(x, y + dh * 2 + deskH)
    ctx.lineTo(x + dw, y + dh + deskH)
    ctx.closePath()
    ctx.fillStyle = shadeColor(colors.light, -60)
    ctx.fill()
    ctx.stroke()

    // Monitor
    ctx.fillStyle = '#1A1A2E'
    ctx.beginPath()
    ctx.roundRect(x - tw * 0.18, y - th * 0.3, tw * 0.36, th * 0.5, 2)
    ctx.fill()
    // Screen glow
    const screenColor = isWorking ? `rgba(100,200,255,${0.7 + pulse * 0.3})` : 'rgba(60,120,200,0.5)'
    ctx.fillStyle = screenColor
    ctx.beginPath()
    ctx.roundRect(x - tw * 0.14, y - th * 0.26, tw * 0.28, th * 0.4, 1)
    ctx.fill()
    if (isWorking) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + pulse * 0.4})`
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(x - tw * 0.1, y - th * 0.2 + i * th * 0.08, tw * 0.2, th * 0.04)
      }
    }

    // Nameplate
    ctx.fillStyle = colors.primary
    ctx.beginPath()
    ctx.roundRect(x - dw * 0.5, y + dh * 1.2, dw, th * 0.4, 2)
    ctx.fill()
    ctx.fillStyle = '#F5E6C8'
    ctx.font = `bold ${Math.max(7, tw * 0.1)}px "Courier Prime", monospace`
    ctx.textAlign = 'center'
    ctx.fillText(label, x, y + dh * 1.2 + th * 0.28)
  }

  function drawCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, agent: string, status: string, t: number, scale: number) {
    const c = AGENT_COLORS[agent as keyof typeof AGENT_COLORS] || AGENT_COLORS.harkirat
    const s = scale * 0.85
    const isWorking = status === 'working'
    const isDone = status === 'done'

    const bob = isWorking ? Math.sin(t * 18) * 0.8 : Math.sin(t * 1.8 + Object.keys(AGENT_COLORS).indexOf(agent) * 0.9) * 2
    const py = y + bob

    // Shadow
    ctx.save()
    ctx.globalAlpha = 0.2
    ctx.beginPath()
    ctx.ellipse(x, py + 16 * s, 9 * s, 3 * s, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#000'
    ctx.fill()
    ctx.restore()

    // Legs
    const legL = isWorking ? Math.sin(t * 16) * 2 : 0
    ctx.fillStyle = '#2A2A3A'
    ctx.beginPath(); ctx.roundRect(x - 4 * s, py + 7 * s, 3 * s, 9 * s + legL, 1); ctx.fill()
    ctx.beginPath(); ctx.roundRect(x + 1 * s, py + 7 * s, 3 * s, 9 * s - legL, 1); ctx.fill()
    // Shoes
    ctx.fillStyle = '#111'
    ctx.beginPath(); ctx.roundRect(x - 5 * s, py + 15 * s + legL, 5 * s, 3 * s, 1); ctx.fill()
    ctx.beginPath(); ctx.roundRect(x + 1 * s, py + 15 * s - legL, 5 * s, 3 * s, 1); ctx.fill()

    // Body
    ctx.fillStyle = c.primary
    ctx.beginPath()
    ctx.roundRect(x - 5 * s, py - 6 * s, 10 * s, 14 * s, 1)
    ctx.fill()

    // Arms
    const armS = isWorking ? Math.sin(t * 16) * 3 : Math.sin(t * 1.8) * 2
    ctx.fillStyle = c.skin
    ctx.beginPath(); ctx.roundRect(x - 8 * s, py - 4 * s + armS, 3 * s, 9 * s, 1); ctx.fill()
    ctx.beginPath(); ctx.roundRect(x + 5 * s, py - 4 * s - armS, 3 * s, 9 * s, 1); ctx.fill()

    // Hands
    ctx.fillStyle = c.skin
    ctx.beginPath(); ctx.ellipse(x - 6.5 * s, py + 5 * s + armS, 2 * s, 2.5 * s, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(x + 6.5 * s, py + 5 * s - armS, 2 * s, 2.5 * s, 0, 0, Math.PI * 2); ctx.fill()

    // Neck
    ctx.fillStyle = c.skin
    ctx.beginPath(); ctx.roundRect(x - 2 * s, py - 9 * s, 4 * s, 4 * s, 1); ctx.fill()

    // Head
    ctx.fillStyle = c.skin
    ctx.beginPath()
    ctx.roundRect(x - 5.5 * s, py - 20 * s, 11 * s, 12 * s, 2)
    ctx.fill()

    // Hair
    ctx.fillStyle = c.hair
    if (agent === 'pam' || agent === 'angela') {
      ctx.beginPath(); ctx.roundRect(x - 5.5 * s, py - 20 * s, 11 * s, 4 * s, [2, 2, 0, 0]); ctx.fill()
      ctx.beginPath(); ctx.roundRect(x - 7 * s, py - 18 * s, 3 * s, 8 * s, 1); ctx.fill()
      ctx.beginPath(); ctx.roundRect(x + 4 * s, py - 18 * s, 3 * s, 8 * s, 1); ctx.fill()
    } else {
      ctx.beginPath(); ctx.roundRect(x - 5.5 * s, py - 20 * s, 11 * s, 4 * s, [2, 2, 0, 0]); ctx.fill()
    }

    // Eyes
    ctx.fillStyle = '#1A1A1A'
    ctx.beginPath(); ctx.ellipse(x - 2.5 * s, py - 13 * s, 1.5 * s, 1.5 * s, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(x + 2.5 * s, py - 13 * s, 1.5 * s, 1.5 * s, 0, 0, Math.PI * 2); ctx.fill()
    // Eye shine
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.beginPath(); ctx.ellipse(x - 2 * s, py - 13.5 * s, 0.6 * s, 0.6 * s, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(x + 3 * s, py - 13.5 * s, 0.6 * s, 0.6 * s, 0, 0, Math.PI * 2); ctx.fill()

    // Mouth
    if (isDone) {
      ctx.strokeStyle = '#27500A'; ctx.lineWidth = 1.5 * s
      ctx.beginPath(); ctx.arc(x, py - 9.5 * s, 2 * s, 0, Math.PI); ctx.stroke()
    } else if (isWorking) {
      ctx.fillStyle = c.primary
      ctx.beginPath(); ctx.ellipse(x, py - 9.5 * s, 1.5 * s, 1 * s, 0, 0, Math.PI * 2); ctx.fill()
    } else {
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1 * s
      ctx.beginPath(); ctx.moveTo(x - 2 * s, py - 9.5 * s); ctx.lineTo(x + 2 * s, py - 9.5 * s); ctx.stroke()
    }

    // Status bubble
    if (isWorking) {
      const pulse = (Math.sin(t * 8) + 1) / 2
      ctx.beginPath(); ctx.arc(x, py - 26 * s, 5 * s, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,180,20,${0.7 + pulse * 0.3})`; ctx.fill()
      ctx.fillStyle = '#FFF'; ctx.font = `${9 * s}px monospace`; ctx.textAlign = 'center'
      ctx.fillText('⚡', x, py - 22 * s)
    } else if (isDone) {
      ctx.beginPath(); ctx.arc(x, py - 26 * s, 5 * s, 0, Math.PI * 2)
      ctx.fillStyle = '#27500A'; ctx.fill()
      ctx.fillStyle = '#FFF'; ctx.font = `${9 * s}px monospace`; ctx.textAlign = 'center'
      ctx.fillText('✓', x, py - 22 * s)
    }
  }

  function drawSpeechBubble(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, w: number) {
    const maxW = Math.min(200, w * 0.28)
    ctx.font = '10px "Courier Prime", monospace'
    const words = text.split(' ')
    const lines: string[] = []
    let line = ''
    words.forEach(word => {
      const test = line + (line ? ' ' : '') + word
      if (ctx.measureText(test).width > maxW - 20) { if (line) lines.push(line); line = word }
      else line = test
    })
    if (line) lines.push(line)
    const lh = 13; const bh = lines.length * lh + 16
    const bw = Math.min(maxW, Math.max(...lines.map(l => ctx.measureText(l).width)) + 20)
    const bx = Math.max(8, Math.min(cx - bw / 2, w - bw - 8))
    const by = cy - bh - 8
    ctx.fillStyle = '#FFFFF0'; ctx.strokeStyle = '#C8B89A'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx - 6, by + bh); ctx.lineTo(cx + 6, by + bh); ctx.lineTo(cx, by + bh + 9)
    ctx.closePath(); ctx.fillStyle = '#FFFFF0'; ctx.fill()
    ctx.strokeStyle = '#C8B89A'; ctx.lineWidth = 1.2; ctx.stroke()
    ctx.fillStyle = '#2C2416'; ctx.font = '10px "Courier Prime", monospace'; ctx.textAlign = 'left'
    lines.forEach((l, i) => ctx.fillText(l, bx + 10, by + 13 + i * lh))
  }

  function drawHandoff(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, progress: number, label: string) {
    const ease = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
    const px = fromX + (toX - fromX) * ease
    const py = fromY + (toY - fromY) * ease - Math.sin(progress * Math.PI) * 45
    // Trail
    ctx.beginPath(); ctx.moveTo(fromX, fromY)
    ctx.quadraticCurveTo(
      (fromX + toX) / 2, Math.min(fromY, toY) - 50,
      toX, toY
    )
    ctx.strokeStyle = 'rgba(59,109,17,0.25)'; ctx.lineWidth = 1.5
    ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([])
    // Paper
    ctx.save(); ctx.translate(px, py); ctx.rotate(progress * Math.PI * 4)
    ctx.fillStyle = '#F5F0E8'; ctx.strokeStyle = '#C8B89A'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.roundRect(-7, -9, 14, 18, 2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = 'rgba(100,80,50,0.4)'
    for (let i = 0; i < 3; i++) ctx.fillRect(-4, -4 + i * 4, 8, 1.5)
    ctx.restore()
    ctx.fillStyle = 'rgba(27,50,9,0.85)'; ctx.font = 'bold 9px "Courier Prime", monospace'; ctx.textAlign = 'center'
    ctx.fillText(label, px, py - 14)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const p = canvas.parentElement
      if (p) { canvas.width = p.clientWidth; canvas.height = Math.min(620, Math.max(480, p.clientWidth * 0.62)) }
    }
    resize()
    window.addEventListener('resize', resize)

    let last = 0
    const loop = (ts: number) => {
      const dt = Math.min((ts - last) / 1000, 0.05); last = ts
      timeRef.current += dt
      const t = timeRef.current
      const W = canvas.width; const H = canvas.height
      const tileW = Math.min(W / 7.5, 85); const tileH = tileW * 0.52

      ctx.clearRect(0, 0, W, H)

      // Wall gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#CFC0A4'); bg.addColorStop(1, '#BFB090')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Carpet grid
      for (let i = 0; i < W; i += 16) {
        for (let j = 0; j < H; j += 16) {
          ctx.fillStyle = ((i / 16 + j / 16) % 2 === 0) ? 'rgba(139,115,85,0.12)' : 'rgba(122,100,69,0.06)'
          ctx.fillRect(i, j, 16, 16)
        }
      }

      // Floor tiles
      for (let col = 0; col <= 6.5; col += 0.5) {
        for (let row = 0; row <= 4.5; row += 0.5) {
          const pos = isoToScreen(col, row, W, H, tileW, tileH)
          const isDeskArea = Object.values(DESK_POSITIONS).some(d => Math.abs(d.col - col) < 0.6 && Math.abs(d.row - row) < 0.6)
          if (!isDeskArea) {
            drawFloorTile(ctx, pos.x, pos.y, tileW * 0.5, tileH * 0.5,
              col % 1 === 0 && row % 1 === 0 ? 'rgba(210,195,165,0.5)' : 'rgba(195,180,150,0.35)'
            )
          }
        }
      }

      // Conference room label
      const confPos = isoToScreen(2, -0.2, W, H, tileW, tileH)
      ctx.fillStyle = 'rgba(100,80,50,0.45)'; ctx.font = `bold ${Math.max(8, tileW * 0.12)}px "Special Elite", cursive`
      ctx.textAlign = 'center'; ctx.fillText('CONFERENCE ROOM', confPos.x, confPos.y)

      // Kitchen label
      const kitPos = isoToScreen(5.5, 1.8, W, H, tileW, tileH)
      ctx.fillStyle = 'rgba(100,80,50,0.35)'; ctx.font = `${Math.max(7, tileW * 0.1)}px "Special Elite", cursive`
      ctx.textAlign = 'center'; ctx.fillText('KITCHEN', kitPos.x, kitPos.y)

      // Draw desks + characters
      const agents = Object.entries(DESK_POSITIONS) as [string, { col: number; row: number; label: string }][]
      agents.forEach(([agent, dp]) => {
        const pos = isoToScreen(dp.col, dp.row, W, H, tileW, tileH)
        const status = agentStatus[agent as keyof AgentStatus] || 'idle'
        const colors = AGENT_COLORS[agent as keyof typeof AGENT_COLORS] || AGENT_COLORS.harkirat
        const isSelected = selectedAgent === agent

        // CEO office outline
        if (agent === 'harkirat') {
          // CEO office solid walls
          ctx.fillStyle = 'rgba(180,155,115,0.35)'
          ctx.beginPath()
          ctx.moveTo(pos.x, pos.y - tileH * 2.2)
          ctx.lineTo(pos.x + tileW * 1.8, pos.y - tileH * 0.4)
          ctx.lineTo(pos.x, pos.y + tileH * 1.4)
          ctx.lineTo(pos.x - tileW * 1.8, pos.y - tileH * 0.4)
          ctx.closePath(); ctx.fill()
          // Wall lines
          ctx.strokeStyle = '#6B4F3A'; ctx.lineWidth = 2.5
          ctx.beginPath()
          ctx.moveTo(pos.x, pos.y - tileH * 2.2)
          ctx.lineTo(pos.x + tileW * 1.8, pos.y - tileH * 0.4)
          ctx.lineTo(pos.x, pos.y + tileH * 1.4)
          ctx.lineTo(pos.x - tileW * 1.8, pos.y - tileH * 0.4)
          ctx.closePath(); ctx.stroke()
          // Room label
          ctx.fillStyle = '#4A3020'
          ctx.font = `bold ${Math.max(8, tileW * 0.11)}px "Special Elite", cursive`
          ctx.textAlign = 'center'; ctx.fillText("MICHAEL'S OFFICE", pos.x, pos.y - tileH * 2.1)
          // World's Best Boss mug
          ctx.fillStyle = '#854F0B'
          ctx.beginPath(); ctx.roundRect(pos.x + tileW * 0.6, pos.y - tileH * 0.8, 12, 14, 2); ctx.fill()
          ctx.fillStyle = '#F5E6C8'; ctx.font = `${Math.max(5, tileW * 0.07)}px monospace`
          ctx.textAlign = 'center'; ctx.fillText('★', pos.x + tileW * 0.6 + 6, pos.y - tileH * 0.55)
        }

        // Glow ring for working
        if (status === 'working' || isSelected) {
          const pulse = (Math.sin(t * 5) + 1) / 2
          ctx.beginPath(); ctx.arc(pos.x, pos.y + tileH * 0.5, tileW * 0.9, 0, Math.PI * 2)
          ctx.fillStyle = status === 'working' ? `rgba(240,160,20,${0.06 + pulse * 0.08})` : `rgba(59,109,17,${0.06 + pulse * 0.06})`
          ctx.fill()
        }

        drawDesk(ctx, pos.x, pos.y, tileW, tileH, colors, dp.label, status, t)
        drawCharacter(ctx, pos.x, pos.y - tileH * 0.6, agent, status, t, Math.min(1.4, tileW / 44))

        // Speech bubble for this agent
        if (speechBubble?.agent === agent) {
          drawSpeechBubble(ctx, speechBubble.quote, pos.x, pos.y - tileH * 1.8, W)
        }
      })

      // Handoff animation
      if (handoffAnim) {
        const fd = DESK_POSITIONS[handoffAnim.from as keyof typeof DESK_POSITIONS]
        const td = DESK_POSITIONS[handoffAnim.to as keyof typeof DESK_POSITIONS]
        if (fd && td) {
          const fp = isoToScreen(fd.col, fd.row, W, H, tileW, tileH)
          const tp = isoToScreen(td.col, td.row, W, H, tileW, tileH)
          drawHandoff(ctx, fp.x, fp.y - tileH * 0.6, tp.x, tp.y - tileH * 0.6, handoffAnim.progress, handoffAnim.label)
        }
      }

      // Pipeline scan line
      if (isRunning) {
        const scanY = ((t * 80) % (H + 60)) - 30
        const sg = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15)
        sg.addColorStop(0, 'rgba(59,109,17,0)'); sg.addColorStop(0.5, 'rgba(59,109,17,0.18)'); sg.addColorStop(1, 'rgba(59,109,17,0)')
        ctx.fillStyle = sg; ctx.fillRect(0, scanY - 15, W, 30)
      }

      // Stats bar
      const sy = H - 46
      ctx.fillStyle = 'rgba(30,22,12,0.9)'; ctx.fillRect(0, sy, W, 46)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, sy, W, 1)
      const stats2 = [
        { l: 'LEADS', v: stats.totalLeads, c: '#6BA3E8' },
        { l: 'HOT LEADS', v: stats.hotLeads, c: '#80C878' },
        { l: 'VETTED', v: stats.vettedLeads, c: '#E8C040' },
        { l: 'PIPELINE', v: `$${(stats.pipelineValue / 1000).toFixed(0)}K`, c: '#E87868' },
        { l: 'COMMISSION', v: `$${(stats.commissionPending / 1000).toFixed(0)}K`, c: '#B8A0E8' },
      ]
      const sw = W / stats2.length
      stats2.forEach((s, i) => {
        const sx = i * sw + sw / 2
        ctx.fillStyle = s.c; ctx.font = `bold ${Math.max(13, tileW * 0.2)}px "Special Elite", cursive`
        ctx.textAlign = 'center'; ctx.fillText(String(s.v), sx, sy + 22)
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = `${Math.max(7, tileW * 0.1)}px "Courier Prime", monospace`
        ctx.fillText(s.l, sx, sy + 37)
      })

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
  }, [agentStatus, stats, isRunning, selectedAgent, speechBubble, handoffAnim])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width)
    const my = (e.clientY - rect.top) * (canvas.height / rect.height)
    const W = canvas.width; const H = canvas.height
    const tileW = Math.min(W / 7.5, 85); const tileH = tileW * 0.52
    let hit: string | null = null; let minD = 999
    Object.entries(DESK_POSITIONS).forEach(([agent, dp]) => {
      const pos = isoToScreen(dp.col, dp.row, W, H, tileW, tileH)
      const charY = pos.y - tileH * 0.6
      const d = Math.hypot(mx - pos.x, my - charY)
      if (d < 45 && d < minD) { minD = d; hit = agent }
    })
    if (hit) {
      setSelectedAgent(selectedAgent === hit ? null : hit)
      triggerSpeech(hit)
    } else setSelectedAgent(null)
  }, [selectedAgent, setSelectedAgent, triggerSpeech])

  return (
    <div className="relative w-full" style={{ fontFamily: 'Courier Prime, monospace' }}>
      <div className="relative w-full">
        <canvas ref={canvasRef} className="w-full cursor-pointer block" style={{ height: 620 }} onClick={handleClick} />
        {isRunning && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-sm text-xs font-bold tracking-widest animate-pulse"
            style={{ background: '#27500A', color: '#F5E6C8', fontFamily: 'Special Elite, cursive', letterSpacing: '2px', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            ⚡ AGENTS WORKING ⚡
          </div>
        )}
        <div className="absolute bottom-12 right-3 text-xs opacity-40" style={{ color: '#F5E6C8' }}>
          click characters
        </div>
      </div>
      {selectedAgent && (
        <AgentPanel agent={selectedAgent} status={agentStatus[selectedAgent as keyof AgentStatus]} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  )
}

function AgentPanel({ agent, status, onClose }: { agent: string; status: string; onClose: () => void }) {
  const [logs, setLogs] = useState<Array<{ action: string; detail: string; created_at: string }>>([])
  const c = AGENT_COLORS[agent as keyof typeof AGENT_COLORS] || AGENT_COLORS.harkirat
  const dp = DESK_POSITIONS[agent as keyof typeof DESK_POSITIONS]
  const quotes = QUOTES[agent] || []
  const quote = quotes[Math.floor(Math.random() * quotes.length)]

  useEffect(() => {
    const name = agent.charAt(0).toUpperCase() + agent.slice(1)
    fetch(`/api/logs?agent=${name}&limit=6`).then(r => r.json()).then(d => { if (Array.isArray(d)) setLogs(d) }).catch(() => {})
  }, [agent])

  return (
    <div className="mx-4 mb-4 rounded-sm border-2 overflow-hidden" style={{ background: '#F5F0E8', borderColor: c.primary, boxShadow: '2px 4px 0 rgba(0,0,0,0.25)' }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: c.primary }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold border-2" style={{ background: c.light, borderColor: c.dark, color: c.primary, fontFamily: 'Special Elite, cursive', fontSize: 13 }}>
            {agent.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold" style={{ fontFamily: 'Special Elite, cursive', color: '#F5E6C8', fontSize: 14, letterSpacing: '1px' }}>
              {agent.charAt(0).toUpperCase() + agent.slice(1)}
            </div>
            <div className="text-xs" style={{ color: '#C4A882' }}>{dp?.label}</div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${status === 'working' ? 'bg-amber-100 text-amber-900' : status === 'done' ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-600'}`}>
            {status === 'working' ? '⚡ Working' : status === 'done' ? '✓ Done' : '○ Idle'}
          </span>
          <button onClick={onClose} className="text-xs px-2 py-1 rounded" style={{ color: '#C4A882', background: 'rgba(0,0,0,0.2)' }}>✕</button>
        </div>
      </div>
      <div className="p-4">
        {quote && <div className="p-3 mb-3 rounded-sm text-xs italic" style={{ background: '#FFFFF0', borderLeft: `3px solid ${c.primary}`, color: '#2C2416', lineHeight: 1.7 }}>&ldquo;{quote}&rdquo;</div>}
        <div className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: c.primary }}>Recent Activity</div>
        {logs.length > 0 ? (
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="p-2 rounded-sm text-xs flex items-start gap-2" style={{ background: '#EDE8DC' }}>
                <span className="font-bold flex-shrink-0" style={{ color: c.primary }}>{log.action}</span>
                <span className="flex-1" style={{ color: '#7A6E5F' }}>{log.detail}</span>
                <span className="flex-shrink-0" style={{ color: '#B0A08A' }}>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: '#7A6E5F' }}>No activity yet. Run the pipeline to put {agent.charAt(0).toUpperCase() + agent.slice(1)} to work.</p>
        )}
      </div>
    </div>
  )
}
