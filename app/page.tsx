import Dashboard from './components/Dashboard'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams
  const signageKey = typeof params.signage_key === 'string' ? params.signage_key : undefined
  const validKey = process.env.SIGNAGE_KEY
  const signageMode = !!signageKey && signageKey === validKey

  if (signageKey && !signageMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Invalid Signage Key</h2>
          <p className="text-sm text-slate-500">The provided signage key is not valid.</p>
        </div>
      </div>
    )
  }

  return <Dashboard signageMode={signageMode} />
}
