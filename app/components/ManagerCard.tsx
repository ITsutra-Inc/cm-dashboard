'use client'

import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { Manager, ManagerStats, Interview } from '@/lib/types'

interface ManagerCardProps {
  manager: Manager
  stats: ManagerStats | undefined
  interviews: Interview[]
  index: number
}

export default function ManagerCard({ manager, stats, interviews, index }: ManagerCardProps) {
  const managerInterviews = interviews.filter(i => i.managerId === manager.id)
  const initial = stats?.initial || 0
  const final = stats?.final || 0
  const total = stats?.totalInterviews || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.12, type: 'spring', stiffness: 200, damping: 22 }}
      className={`glass ${manager.glassClass} rounded-2xl p-5 cursor-pointer`}
    >
      {/* Manager Header */}
      <div className="flex items-center justify-between mb-5 pt-1">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${manager.color}, ${manager.color}99)`,
              boxShadow: `0 4px 15px ${manager.color}33`,
            }}
          >
            {manager.name[0]}
          </div>
          <div>
            <h3 className="font-bold text-white text-base">{manager.name}</h3>
            <span className="text-[11px] text-slate-500">{manager.candidates.length} candidates</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold tracking-tight" style={{ color: manager.color }}>{total}</div>
          <div className="text-[9px] text-slate-600 uppercase tracking-widest font-semibold">interviews</div>
        </div>
      </div>

      {/* Stage Mini Bars */}
      <div className="space-y-2.5 mb-5">
        {[
          { label: 'Initial', count: initial, color: '#3b82f6', max: Math.max(initial, final, 1) },
          { label: 'Final', count: final, color: '#10b981', max: Math.max(initial, final, 1) },
        ].map(stage => (
          <div key={stage.label} className="flex items-center gap-2.5">
            <span className="text-[10px] text-slate-500 w-12 shrink-0 font-medium">{stage.label}</span>
            <div className="flex-1 bar-track h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stage.count / stage.max) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${stage.color}88, ${stage.color})` }}
              />
            </div>
            <span className="text-[10px] font-bold w-5 text-right" style={{ color: stage.color }}>
              {stage.count}
            </span>
          </div>
        ))}
      </div>

      {/* Candidate List */}
      <div className="border-t border-white/5 pt-4">
        <div className="text-[9px] uppercase tracking-widest text-slate-600 mb-3 flex items-center gap-1.5 font-semibold">
          <User className="w-3 h-3" /> Candidates
        </div>
        <div className="space-y-1">
          {manager.candidates.map((candidate) => {
            const candidateInterviews = managerInterviews.filter(
              i => i.candidateName.toLowerCase().includes(candidate.name.toLowerCase().split(' ').pop()!)
            )
            const latestStage = candidateInterviews.length > 0
              ? candidateInterviews[0].stage
              : null

            return (
              <div key={candidate.name} className="flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-white/[0.04] transition-all duration-200 group cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${manager.color}22`, color: manager.color }}
                  >
                    {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium">{candidate.name}</span>
                </div>
                {latestStage ? (
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                    latestStage === 'Final'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  }`}>
                    {latestStage}
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full text-slate-600 bg-white/[0.03]">
                    Pending
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
