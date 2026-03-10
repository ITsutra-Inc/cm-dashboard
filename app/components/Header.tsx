'use client'

import { motion } from 'framer-motion'
import { Activity, RefreshCw, Database, Wifi, WifiOff } from 'lucide-react'

interface HeaderProps {
  lastUpdated: string
  isLoading: boolean
  d365Connected: boolean
  onRefresh: () => void
}

export default function Header({ lastUpdated, isLoading, d365Connected, onRefresh }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl px-5 py-3.5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5">
            <div className="live-dot" />
          </div>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gradient-brand">
            CM Dashboard
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5 tracking-wide">Candidate Manager Performance Tracker</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {d365Connected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">D365 Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400">Connecting...</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-slate-500" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Database className="w-3.5 h-3.5" />
          <span>{lastUpdated || 'Loading...'}</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-white/10 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </motion.header>
  )
}
