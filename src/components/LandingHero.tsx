interface LandingHeroProps {
  onStart: () => void
}

export function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(206,17,36,0.06)_0%,transparent_50%)]" />
      <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-england-red">
          FIFA World Cup 2030
        </p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-england-navy sm:text-5xl">
          Build England&apos;s Squad
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Pick the 26 players you think will represent England at the 2030 World Cup. Choose your
          formation, set the captain, and share your prediction.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-8 rounded-xl bg-england-red px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-xl"
        >
          Build your squad
        </button>
        <div className="mt-12 grid grid-cols-3 gap-4 text-center sm:gap-8">
          <Feature number="26" label="Man squad" />
          <Feature number="4" label="Formations" />
          <Feature number="70+" label="Players to choose from" />
        </div>
      </div>
    </section>
  )
}

function Feature({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-extrabold text-england-red">{number}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}
