import type { ReactNode } from 'react'
import { Header } from './Header'
import { SiteFooter } from './SiteFooter'

interface LegalPageLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function LegalPageLayout({ title, subtitle, children }: LegalPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-england-red">Information</p>
          <h1 className="mt-1 text-3xl font-extrabold text-england-navy sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-3 text-slate-600">{subtitle}</p>}
        </header>
        <article className="space-y-6 text-slate-700 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-england-navy [&_h2]:pt-2 [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed [&_ul]:space-y-2">
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
