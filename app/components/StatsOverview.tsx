'use client'

import { motion } from 'framer-motion'
import { Users, ArrowRight, Trophy, Building2 } from 'lucide-react'

interface StatsOverviewProps {
  totalInterviews: number
  initial: number
  final: number
  totalCompanies: number
  totalCandidates: number
}

export default function StatsOverview({
  totalInterviews, initial, final, totalCompanies, totalCandidates,
}: StatsOverviewProps) {
  const stats = [
    {
      label: 'Total Interviews',
      value: totalInterviews,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-400',
      textColor: 'text-blue-400',
      cardAccent: 'stat-card-blue',
    },
    {
      label: 'Initial',
      value: initial,
      icon: ArrowRight,
      gradient: 'from-blue-500 to-indigo-400',
      textColor: 'text-blue-400',
      cardAccent: 'stat-card-indigo',
    },
    {
      label: 'Final',
      value: final,
      icon: Trophy,
      gradient: 'from-emerald-500 to-green-400',
      textColor: 'text-emerald-400',
      cardAccent: 'stat-card-green',
    },
    {
      label: 'Companies',
      value: totalCompanies,
      icon: Building2,
      gradient: 'from-purple-500 to-pink-400',
      textColor: 'text-purple-400',
      cardAccent: 'stat-card-purple',
    },
    {
      label: 'Candidates',
      value: totalCandidates,
      icon: Users,
      gradient: 'from-rose-500 to-orange-400',
      textColor: 'text-rose-400',
      cardAccent: 'stat-card-rose',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
          className={`glass stat-card ${stat.cardAccent} rounded-2xl p-4 cursor-pointer group`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <div className={`text-[10px] font-medium ${stat.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
              View
            </div>
          </div>
          <div className={`text-3xl font-extrabold stat-number ${stat.textColor} tracking-tight`}>
            {stat.value}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5 font-medium">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  )
}
