'use client'

import { Calendar, ClipboardList, Search } from 'lucide-react'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Interview } from '@/lib/types'

interface InterviewTableProps {
  interviews: Interview[]
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function InterviewTable({ interviews }: InterviewTableProps) {
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [managerFilter, setManagerFilter] = useState<string>('all')
  const debouncedSearch = useDebounce(search, 200)

  const filtered = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase()
    return interviews.filter(i => {
      const matchSearch = debouncedSearch === '' ||
        i.candidateName.toLowerCase().includes(searchLower) ||
        i.companyName.toLowerCase().includes(searchLower)
      const matchStage = stageFilter === 'all' || i.stage === stageFilter
      const matchManager = managerFilter === 'all' || i.managerId === managerFilter
      return matchSearch && matchStage && matchManager
    })
  }, [interviews, debouncedSearch, stageFilter, managerFilter])

  const stageColors: Record<string, string> = {
    Initial: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    Final: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  }

  const managerColors: Record<string, string> = {
    paul: '#3b82f6',
    sid: '#10b981',
    suvash: '#a855f7',
  }

  return (
    <div className="glass rounded-2xl p-6">

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ClipboardList className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-white text-base">All Interviews</h2>
          <span className="text-[10px] text-slate-500 px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {interviews.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            placeholder="Search by candidate or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:bg-white/[0.05] transition-all duration-200"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl py-2.5 px-3.5 text-sm text-slate-400 focus:outline-none focus:border-cyan-500/40 cursor-pointer hover:bg-white/[0.05] transition-all duration-200"
        >
          <option value="all">All Stages</option>
          <option value="Initial">Initial</option>
          <option value="Final">Final</option>
        </select>
        <select
          value={managerFilter}
          onChange={(e) => setManagerFilter(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl py-2.5 px-3.5 text-sm text-slate-400 focus:outline-none focus:border-cyan-500/40 cursor-pointer hover:bg-white/[0.05] transition-all duration-200"
        >
          <option value="all">All Managers</option>
          <option value="paul">Paul</option>
          <option value="sid">Sid</option>
          <option value="suvash">Suvash</option>
        </select>
      </div>

      {/* Interview List */}
      {filtered.length > 0 ? (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
          {filtered.map((interview) => (
            <div
              key={interview.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer group relative overflow-hidden"
            >
              {/* Left accent bar */}
              <div
                className="w-1 h-10 rounded-full shrink-0"
                style={{ background: interview.stage === 'Final' ? '#10b981' : '#3b82f6' }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">{interview.candidateName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${stageColors[interview.stage]}`}>
                    {interview.stage}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  {interview.companyName && (
                    <span className="text-xs text-slate-500 truncate">{interview.companyName}</span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: managerColors[interview.managerId] || '#64748b' }} />
                    <span className="text-xs font-medium" style={{ color: managerColors[interview.managerId] || '#64748b' }}>
                      {interview.managerName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                {interview.date && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(interview.date).toLocaleDateString()}
                  </div>
                )}
                {interview.status && (
                  <span className="text-[10px] text-slate-600 font-medium">{interview.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-600">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-6 h-6 text-cyan-400/60" />
          </div>
          {interviews.length === 0 ? (
            <>
              <p className="text-sm font-medium">Fetching from D365...</p>
              <p className="text-xs text-slate-700 mt-1">Loading interview data</p>
            </>
          ) : (
            <p className="text-sm font-medium">No interviews matching your filters</p>
          )}
        </div>
      )}

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-slate-600">{filtered.length} of {interviews.length} interviews</span>
          <div className="flex items-center gap-3">
            <span className="text-blue-400 font-semibold">{filtered.filter(i => i.stage === 'Initial').length} Initial</span>
            <span className="text-emerald-400 font-semibold">{filtered.filter(i => i.stage === 'Final').length} Final</span>
          </div>
        </div>
      )}
    </div>
  )
}
