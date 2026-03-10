'use client'

import { useMemo } from 'react'
import { Trophy, Medal } from 'lucide-react'
import { Interview } from '@/lib/types'
import { MANAGERS } from '@/lib/managers'

interface CandidateRankingProps {
  interviews: Interview[]
}

interface RankedCandidate {
  name: string
  managerId: string
  managerName: string
  managerColor: string
  initialCount: number
  finalCount: number
  points: number
}

export default function CandidateRanking({ interviews }: CandidateRankingProps) {
  const { ranked, maxPoints, podium, rest, podiumOrder } = useMemo(() => {
    const candidateMap = new Map<string, RankedCandidate>()

    for (const manager of MANAGERS) {
      for (const candidate of manager.candidates) {
        candidateMap.set(candidate.name, {
          name: candidate.name,
          managerId: manager.id,
          managerName: manager.name,
          managerColor: manager.color,
          initialCount: 0,
          finalCount: 0,
          points: 0,
        })
      }
    }

    for (const interview of interviews) {
      if (interview.stage !== 'Initial' && interview.stage !== 'Final') continue
      const entry = candidateMap.get(interview.candidateName)
      if (!entry) continue
      if (interview.stage === 'Initial') { entry.initialCount++; entry.points += 1 }
      else if (interview.stage === 'Final') { entry.finalCount++; entry.points += 2 }
      if (interview.isEndClient !== undefined) {
        entry.points += interview.isEndClient ? 2 : 1
      }
    }

    const ranked = Array.from(candidateMap.values()).sort((a, b) => b.points - a.points)
    const maxPoints = Math.max(...ranked.map(r => r.points), 1)
    const podium = ranked.slice(0, 3)
    const rest = ranked.slice(3)
    const podiumOrder = podium.length >= 3 ? [podium[1], podium[0], podium[2]] : podium

    return { ranked, maxPoints, podium, rest, podiumOrder }
  }, [interviews])
  const podiumHeights = ['h-28', 'h-36', 'h-24']
  const podiumClasses = ['podium-2nd', 'podium-1st', 'podium-3rd']
  const podiumLabels = ['2nd', '1st', '3rd']
  const podiumIcons = [Medal, Trophy, Medal]
  const podiumIconColors = ['text-slate-300', 'text-amber-400', 'text-orange-500']

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-white text-base">Candidate Rankings</h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/15 font-semibold">Initial = 1pt</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-semibold">Final = 2pt</span>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/15 font-semibold">End Client +2</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/15 font-semibold">Other +1</span>
        </div>
      </div>

      {/* Podium - Top 3 */}
      {podium.length >= 3 && podium[0].points > 0 && (
        <div className="flex items-end justify-center gap-4 mb-8 px-4">
          {podiumOrder.map((candidate, i) => {
            const Icon = podiumIcons[i]
            return (
              <div
                key={candidate.name}
                className="flex flex-col items-center flex-1 max-w-[200px]"
              >
                {/* Avatar + Info */}
                <div className="mb-3 text-center">
                  <div
                    className={`${i === 1 ? 'w-16 h-16' : 'w-12 h-12'} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${i === 1 ? 'text-lg' : 'text-sm'} ring-2 ring-offset-2 ring-offset-[#030712]`}
                    style={{
                      background: `linear-gradient(135deg, ${candidate.managerColor}, ${candidate.managerColor}88)`,
                      boxShadow: `0 0 25px ${candidate.managerColor}33`,
                      ['--tw-ring-color' as any]: candidate.managerColor,
                    }}
                  >
                    {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <p className={`font-semibold text-white truncate max-w-[160px] ${i === 1 ? 'text-sm' : 'text-xs'}`}>
                    {candidate.name}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: candidate.managerColor }} />
                    <span className="text-[10px] text-slate-500">{candidate.managerName}</span>
                  </div>
                </div>

                {/* Podium Bar */}
                <div className={`w-full ${podiumHeights[i]} rounded-t-2xl ${podiumClasses[i]} flex flex-col items-center justify-start pt-3 relative overflow-hidden`}>
                  {i === 1 && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 opacity-[0.07]" style={{
                        background: 'linear-gradient(45deg, transparent 30%, rgba(251,191,36,0.4) 50%, transparent 70%)',
                        animation: 'shimmer 3s ease-in-out infinite',
                      }} />
                    </div>
                  )}
                  <Icon className={`w-5 h-5 ${podiumIconColors[i]} mb-0.5`} />
                  <span className={`text-xl font-extrabold ${i === 1 ? 'text-amber-400' : 'text-white'}`}>
                    {candidate.points}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">pts</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">I:{candidate.initialCount}</span>
                    <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">F:{candidate.finalCount}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 font-bold">{podiumLabels[i]}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rest of rankings */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 text-[9px] uppercase tracking-widest text-slate-600 font-semibold">
          <span className="w-6 text-center">#</span>
          <span className="flex-1">Candidate</span>
          <span className="w-20 text-center hidden sm:block">Manager</span>
          <span className="w-12 text-center">Initial</span>
          <span className="w-12 text-center">Final</span>
          <span className="w-16 text-right">Points</span>
        </div>

        {rest.map((candidate, i) => {
          const rank = i + 4
          const barWidth = maxPoints > 0 ? (candidate.points / maxPoints) * 100 : 0

          return (
            <div
              key={candidate.name}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors duration-200 group cursor-pointer relative overflow-hidden"
            >
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, ${candidate.managerColor}06, transparent)`,
                  width: `${barWidth}%`,
                }}
              />

              <span className="w-6 text-center text-xs font-bold text-slate-600 relative z-10">{rank}</span>

              <div className="flex-1 flex items-center gap-2.5 relative z-10 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ background: `${candidate.managerColor}15`, color: candidate.managerColor }}
                >
                  {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 truncate font-medium">{candidate.name}</p>
                  <div className="flex items-center gap-1 sm:hidden">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: candidate.managerColor }} />
                    <span className="text-[10px] text-slate-500">{candidate.managerName}</span>
                  </div>
                </div>
              </div>

              <div className="w-20 hidden sm:flex items-center justify-center gap-1.5 relative z-10">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: candidate.managerColor }} />
                <span className="text-xs text-slate-400 font-medium">{candidate.managerName}</span>
              </div>

              <span className="w-12 text-center relative z-10">
                {candidate.initialCount > 0 ? (
                  <span className="text-xs font-bold text-blue-400">{candidate.initialCount}</span>
                ) : (
                  <span className="text-xs text-slate-700">-</span>
                )}
              </span>

              <span className="w-12 text-center relative z-10">
                {candidate.finalCount > 0 ? (
                  <span className="text-xs font-bold text-emerald-400">{candidate.finalCount}</span>
                ) : (
                  <span className="text-xs text-slate-700">-</span>
                )}
              </span>

              <div className="w-16 text-right relative z-10">
                <span className={`text-sm font-extrabold ${candidate.points > 0 ? 'text-white' : 'text-slate-700'}`}>
                  {candidate.points}
                </span>
                {candidate.points > 0 && <span className="text-[10px] text-slate-500 ml-0.5">pt</span>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-slate-500">Scoring: Initial (1pt) + Final (2pt) + End Client (+2) / Other (+1)</span>
        <span className="font-bold text-white">
          {ranked.reduce((s, r) => s + r.points, 0)} total pts / {ranked.filter(r => r.points > 0).length} active
        </span>
      </div>
    </div>
  )
}
