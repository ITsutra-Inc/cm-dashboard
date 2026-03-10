'use client'

import { Building2, Search, Globe, MapPin, Phone, ExternalLink } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { Company } from '@/lib/types'

interface CompanyListProps {
  companies: Company[]
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function CompanyList({ companies }: CompanyListProps) {
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(10)
  const debouncedSearch = useDebounce(search, 200)

  const filtered = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase()
    return companies.filter(c =>
      c.name.toLowerCase().includes(searchLower) ||
      c.city.toLowerCase().includes(searchLower) ||
      c.industry.toLowerCase().includes(searchLower)
    )
  }, [companies, debouncedSearch])

  const displayed = filtered.slice(0, visibleCount)

  return (
    <div className="glass rounded-2xl p-6">

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-white text-base">Companies</h2>
          <span className="text-[10px] text-slate-500 px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {companies.length} from D365
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setVisibleCount(10) }}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 focus:bg-white/[0.05] transition-all duration-200"
        />
      </div>

      {/* Table */}
      {companies.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-2.5 px-3 text-[9px] uppercase tracking-widest text-slate-600 font-semibold">Company</th>
                <th className="text-left py-2.5 px-3 text-[9px] uppercase tracking-widest text-slate-600 font-semibold hidden sm:table-cell">Industry</th>
                <th className="text-left py-2.5 px-3 text-[9px] uppercase tracking-widest text-slate-600 font-semibold hidden md:table-cell">City</th>
                <th className="text-left py-2.5 px-3 text-[9px] uppercase tracking-widest text-slate-600 font-semibold hidden lg:table-cell">Phone</th>
                <th className="text-left py-2.5 px-3 text-[9px] uppercase tracking-widest text-slate-600 font-semibold hidden lg:table-cell">Website</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((company, i) => (
                <tr
                  key={company.id || i}
                  className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors duration-150 cursor-pointer group"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/15 to-pink-500/15 flex items-center justify-center shrink-0 group-hover:from-purple-500/25 group-hover:to-pink-500/25 transition-all duration-200">
                        <Building2 className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <span className="font-medium text-slate-200 truncate max-w-[200px] group-hover:text-white transition-colors">{company.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden sm:table-cell">
                    <span className="text-[10px] text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.04] font-medium">
                      {company.industry}
                    </span>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{company.city || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{company.phone || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell">
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs cursor-pointer transition-colors font-medium"
                      >
                        <Globe className="w-3 h-3" />
                        Visit
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-700">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-slate-600">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6 text-purple-400/60" />
          </div>
          <p className="text-sm font-medium">Connecting to D365...</p>
          <p className="text-xs text-slate-700 mt-1">Fetching company data</p>
        </div>
      )}

      {/* Load More */}
      {filtered.length > visibleCount && (
        <button
          onClick={() => setVisibleCount(v => v + 10)}
          className="w-full mt-4 py-2.5 text-xs text-slate-500 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] rounded-xl cursor-pointer transition-all duration-200 font-medium border border-white/[0.04] hover:border-white/[0.08]"
        >
          Show more ({filtered.length - visibleCount} remaining)
        </button>
      )}

      {filtered.length === 0 && companies.length > 0 && (
        <div className="text-center py-6 text-slate-600 text-sm">
          No companies matching &quot;{search}&quot;
        </div>
      )}

      {/* Footer */}
      {companies.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-slate-600">Showing {displayed.length} of {filtered.length}</span>
          <span className="font-bold text-white">{companies.length} total companies</span>
        </div>
      )}
    </div>
  )
}
