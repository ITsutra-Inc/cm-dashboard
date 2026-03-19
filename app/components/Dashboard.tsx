'use client'

import { useState, useEffect, useCallback, useRef, memo } from 'react'
import Header from './Header'
import CandidateRanking from './CandidateRanking'
import ManagerRanking from './ManagerRanking'
import { MANAGERS } from '@/lib/managers'
import { Interview, ManagerStats } from '@/lib/types'
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react'

const POLL_INTERVAL = 30000
const TAB_ROTATE_INTERVAL = 20000
const DESIGN_WIDTH = 1440

interface DashboardProps {
  signageMode?: boolean
}

type TabView = 'managers' | 'candidates'

const LiveClock = memo(function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])
  return <span className="stat-number">{time}</span>
})

function useViewportScale() {
  const [node, setNode] = useState<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [ready, setReady] = useState(false)

  const callbackRef = useCallback((el: HTMLDivElement | null) => {
    setNode(el)
  }, [])

  useEffect(() => {
    if (!node) return

    function recalc() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const contentH = node!.scrollHeight || 1

      const scaleX = vw / DESIGN_WIDTH
      const scaleY = vh / contentH
      setScale(Math.min(scaleX, scaleY))
      setReady(true)
    }

    recalc()
    window.addEventListener('resize', recalc)

    const observer = new ResizeObserver(recalc)
    observer.observe(node)

    return () => {
      window.removeEventListener('resize', recalc)
      observer.disconnect()
    }
  }, [node])

  return { callbackRef, scale, ready }
}

export default function Dashboard({ signageMode = false }: DashboardProps) {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [managerStats, setManagerStats] = useState<ManagerStats[]>([])
  const [lastUpdated, setLastUpdated] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [d365Connected, setD365Connected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)
  const [activeTab, setActiveTab] = useState<TabView>('managers')
  const hasManagerStats = useRef(false)
  const { callbackRef, scale, ready } = useViewportScale()

  // Auto-rotate tabs in signage mode
  useEffect(() => {
    if (!signageMode) return
    const interval = setInterval(() => {
      setActiveTab(prev => prev === 'managers' ? 'candidates' : 'managers')
    }, TAB_ROTATE_INTERVAL)
    return () => clearInterval(interval)
  }, [signageMode])

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    try {
      const interviewRes = await fetch('/api/d365/interviews')
      if (interviewRes.ok) {
        const data = await interviewRes.json()
        setInterviews(data.interviews || [])
        setManagerStats(data.managerStats || [])
        hasManagerStats.current = true
        setD365Connected(true)
        setError(null)
      } else {
        if (interviewRes.status !== 500) setD365Connected(true)
        if (!hasManagerStats.current) {
          setManagerStats(MANAGERS.map(m => ({
            managerId: m.id, managerName: m.name, color: m.color,
            totalInterviews: 0, screening: 0, initial: 0, final: 0, conversionRate: 0,
            candidates: m.candidates.map(c => c.name),
          })))
          hasManagerStats.current = true
        }
      }
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err: any) {
      setError(err.message || 'Failed to connect')
    } finally {
      setIsLoading(false)
      setInitialLoad(false)
    }
  }, []) // No dependencies - uses ref for conditional check

  useEffect(() => {
    fetchData(true)
    const interval = setInterval(() => fetchData(false), POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  if (initialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">CM Dashboard</h2>
          <p className="text-sm text-slate-400 flex items-center gap-2 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Connecting to D365...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center">
      <div
        ref={callbackRef}
        className="relative z-10 px-8"
        style={{
          width: DESIGN_WIDTH,
          flexShrink: 0,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {error && (
          <div className="mb-4 glass rounded-xl p-4 border-amber-500/20 border flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-200 font-medium">{error}</p>
              <p className="text-xs text-slate-500 mt-0.5">Auto-retrying every 30s</p>
            </div>
          </div>
        )}

        {/* Manager Rankings */}
        <ManagerRanking interviews={interviews} />
      </div>
    </div>
  )
}
