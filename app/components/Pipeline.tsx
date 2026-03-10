'use client'

import { motion } from 'framer-motion'
import { GitBranch, ChevronRight, ArrowDownRight } from 'lucide-react'
import { Interview, ManagerStats } from '@/lib/types'
import { MANAGERS } from '@/lib/managers'

interface PipelineProps {
  interviews: Interview[]
  managerStats: ManagerStats[]
}

const stages = [
  { key: 'Initial' as const, label: 'Initial', color: '#3b82f6', gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/8', text: 'text-blue-400', border: 'border-blue-500/15', glowColor: 'rgba(59,130,246,0.15)' },
  { key: 'Final' as const, label: 'Final', color: '#10b981', gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/8', text: 'text-emerald-400', border: 'border-emerald-500/15', glowColor: 'rgba(16,185,129,0.15)' },
]

export default function Pipeline({ interviews, managerStats }: PipelineProps) {
  const totalByStage = {
    Initial: interviews.filter(i => i.stage === 'Initial').length,
    Final: interviews.filter(i => i.stage === 'Final').length,
  }
  const maxStage = Math.max(...Object.values(totalByStage), 1)
  const conversionRate = totalByStage.Initial > 0 ? ((totalByStage.Final / totalByStage.Initial) * 100).toFixed(0) : '0'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-white text-base">Interview Pipeline</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-500">Conversion</span>
          <span className="font-bold text-emerald-400">{conversionRate}%</span>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="flex items-stretch gap-3 mb-7">
        {stages.map((stage, i) => {
          const count = totalByStage[stage.key]
          const widthPercent = (count / maxStage) * 100

          return (
            <div key={stage.key} className="flex-1 flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.15, type: 'spring', stiffness: 200, damping: 20 }}
                className={`flex-1 ${stage.bg} border ${stage.border} rounded-2xl p-5 text-center relative overflow-hidden cursor-pointer group`}
                style={{ boxShadow: `0 0 30px ${stage.glowColor}` }}
              >
                {/* Subtle gradient background */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at center, ${stage.color}08, transparent 70%)` }} />

                <div className={`text-4xl font-extrabold ${stage.text} tracking-tight relative z-10`}>{count}</div>
                <div className="text-[11px] text-slate-500 mt-1.5 font-medium relative z-10">{stage.label}</div>
                <div className="mt-3 bar-track h-2 relative z-10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.7 + i * 0.15 }}
                    className="h-full rounded-full bar-fill-animated"
                    style={{ background: `linear-gradient(90deg, ${stage.color}88, ${stage.color})`, boxShadow: `0 0 10px ${stage.color}33` }}
                  />
                </div>
              </motion.div>
              {i < stages.length - 1 && (
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Per-Manager Pipeline Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 py-2 text-[9px] uppercase tracking-widest text-slate-600 font-semibold">
          <span className="w-20">Manager</span>
          <span className="flex-1 text-center">Initial</span>
          <span className="flex-1 text-center">Final</span>
          <span className="w-8 text-right">Total</span>
        </div>
        {MANAGERS.map((manager, mi) => {
          const mStats = managerStats.find(s => s.managerId === manager.id)
          if (!mStats) return null

          return (
            <motion.div
              key={manager.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + mi * 0.1 }}
              className="flex items-center gap-3 px-1 py-2 rounded-xl hover:bg-white/[0.03] transition-all duration-200 cursor-pointer"
            >
              <div className="w-20 flex items-center gap-2 shrink-0">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, ${manager.color}, ${manager.color}88)` }}
                >
                  {manager.name[0]}
                </div>
                <span className="text-xs font-medium text-slate-300 truncate">{manager.name}</span>
              </div>

              <div className="flex-1 flex items-center gap-2">
                {stages.map(stage => {
                  const count = stage.key === 'Initial' ? mStats.initial : mStats.final
                  const width = maxStage > 0 ? (count / maxStage) * 100 : 0

                  return (
                    <div key={stage.key} className="flex-1">
                      <div className="h-7 bar-track rounded-lg overflow-hidden relative group">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 0.6, delay: 0.8 + mi * 0.1 }}
                          className="h-full rounded-lg flex items-center justify-center"
                          style={{ background: `${stage.color}33`, minWidth: count > 0 ? '28px' : '0' }}
                        >
                          {count > 0 && (
                            <span className="text-[10px] font-bold" style={{ color: stage.color }}>
                              {count}
                            </span>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <span className="w-8 text-right text-xs font-extrabold" style={{ color: manager.color }}>
                {mStats.totalInterviews}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-slate-500">Pipeline stages: Initial → Final</span>
        <span className="font-bold text-white">
          {interviews.length} total interviews
        </span>
      </div>
    </motion.div>
  )
}
