'use client'

import { motion } from 'framer-motion'
import { Crown, Medal, Award, Zap } from 'lucide-react'
import { ManagerStats } from '@/lib/types'

interface LeaderboardProps {
  managerStats: ManagerStats[]
}

export default function Leaderboard({ managerStats }: LeaderboardProps) {
  const sorted = [...managerStats].sort((a, b) => b.totalInterviews - a.totalInterviews)
  const maxInterviews = Math.max(...sorted.map(m => m.totalInterviews), 1)

  const rankConfig = [
    { Icon: Crown, badgeClass: 'rank-gold', label: '1st' },
    { Icon: Medal, badgeClass: 'rank-silver', label: '2nd' },
    { Icon: Award, badgeClass: 'rank-bronze', label: '3rd' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-white text-base">Manager Leaderboard</h2>
        </div>
        <span className="text-[10px] text-slate-500 px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          Live Rankings
        </span>
      </div>

      <div className="space-y-5">
        {sorted.map((manager, i) => {
          const config = rankConfig[i] || rankConfig[2]
          const barWidth = (manager.totalInterviews / maxInterviews) * 100

          return (
            <motion.div
              key={manager.managerId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.12 }}
            >
              <div className="flex items-center gap-3 mb-2.5">
                {/* Rank Badge */}
                <div className={`rank-badge w-8 h-8 ${config.badgeClass}`}>
                  <config.Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: `linear-gradient(135deg, ${manager.color}, ${manager.color}88)` }}
                    >
                      {manager.managerName[0]}
                    </div>
                    <div>
                      <span className="font-semibold text-white text-sm">{manager.managerName}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-blue-400/80">Initial: {manager.initial}</span>
                        <span className="text-[10px] text-emerald-400/80">Final: {manager.final}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold tracking-tight" style={{ color: manager.color }}>
                      {manager.totalInterviews}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="ml-11 bar-track h-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.15, ease: 'easeOut' }}
                  className="h-full bar-fill-animated"
                  style={{
                    background: `linear-gradient(90deg, ${manager.color}66, ${manager.color})`,
                    boxShadow: `0 0 12px ${manager.color}33`,
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Total footer */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-slate-500">Total across all managers</span>
        <span className="font-bold text-white text-sm">
          {managerStats.reduce((sum, m) => sum + m.totalInterviews, 0)} interviews
        </span>
      </div>
    </motion.div>
  )
}
