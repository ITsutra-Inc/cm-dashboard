'use client'

import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { BarChart3, PieChartIcon, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { ManagerStats } from '@/lib/types'

interface InterviewChartProps {
  managerStats: ManagerStats[]
}

const STAGE_COLORS = {
  Initial: '#3b82f6',
  Final: '#10b981',
}

export default function InterviewChart({ managerStats }: InterviewChartProps) {
  const [view, setView] = useState<'bar' | 'pie'>('bar')

  const barData = managerStats.map(m => ({
    name: m.managerName,
    Initial: m.initial,
    Final: m.final,
    fill: m.color,
  }))

  const pieData = [
    { name: 'Initial', value: managerStats.reduce((s, m) => s + m.initial, 0), color: STAGE_COLORS.Initial },
    { name: 'Final', value: managerStats.reduce((s, m) => s + m.final, 0), color: STAGE_COLORS.Final },
  ]

  const totalInterviews = pieData.reduce((s, d) => s + d.value, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-white text-base">Interviews by Stage</h2>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
          <button
            onClick={() => setView('bar')}
            className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all duration-200 ${
              view === 'bar' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setView('pie')}
            className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all duration-200 ${
              view === 'pie' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="h-[280px]">
        {view === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barGap={6} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                  padding: '10px 14px',
                }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: '#94a3b8', fontSize: 12 }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 500 }}>{value}</span>}
              />
              <Bar dataKey="Initial" fill={STAGE_COLORS.Initial} radius={[6, 6, 0, 0]} />
              <Bar dataKey="Final" fill={STAGE_COLORS.Final} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                animationDuration={800}
                strokeWidth={0}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 500 }}>{value}</span>}
              />
              {/* Center Label */}
              <text x="50%" y="47%" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={28} fontWeight={800}>
                {totalInterviews}
              </text>
              <text x="50%" y="58%" textAnchor="middle" dominantBaseline="central" fill="#64748b" fontSize={10} fontWeight={500}>
                TOTAL
              </text>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stage Legend with Counts */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/5">
        {pieData.map(stage => (
          <div key={stage.name} className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: stage.color, boxShadow: `0 0 8px ${stage.color}44` }} />
            <span className="text-xs text-slate-500 font-medium">{stage.name}</span>
            <span className="text-sm font-extrabold text-white">{stage.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
