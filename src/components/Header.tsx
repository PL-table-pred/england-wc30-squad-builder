export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-england-red shadow-sm">
          <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
            <rect width="32" height="32" fill="#fff" />
            <rect x="14" width="4" height="32" fill="#CE1124" />
            <rect y="14" width="32" height="4" fill="#CE1124" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-england-navy sm:text-xl">England WC &apos;30</h1>
          <p className="text-xs text-slate-500 sm:text-sm">Squad Builder</p>
        </div>
      </div>
    </header>
  )
}
