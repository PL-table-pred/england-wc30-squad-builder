import { Link } from 'react-router-dom'
import { LegalPageLayout } from '../components/LegalPageLayout'
import { getSiteOrigin } from '../lib/siteMeta'

export function AboutPage() {
  const origin = getSiteOrigin()

  return (
    <LegalPageLayout
      title="About this site"
      subtitle="An unofficial fan project for England squad predictions ahead of the 2030 FIFA World Cup."
    >
      <section>
        <h2>What this is</h2>
        <p>
          England WC &apos;30 Squad Builder is a free, community-facing web app where fans and journalists
          can pick a 26-player England squad, set a formation and starting XI, choose a captain, and
          share a link or image of their prediction. Submissions can appear on the public leaderboard
          and in aggregated &ldquo;most picked&rdquo; stats when you choose to post.
        </p>
      </section>

      <section>
        <h2>Who runs it</h2>
        <p>
          The site is operated as an independent fan project by TimeCapsule Football (an enthusiast
          group building prediction and squad-builder tools). It is not operated by, endorsed by, or
          connected to The Football Association (The FA), FIFA, the Premier League, any national
          governing body, or any professional club.
        </p>
        <p>
          For questions, corrections, or takedown requests, please use our{' '}
          <Link to="/contact" className="font-semibold text-england-red hover:underline">
            contact page
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>Not affiliated with FIFA or The FA</h2>
        <p>
          &ldquo;England&rdquo;, World Cup, and related marks may be trademarks of their respective
          owners. This project is unofficial fan commentary and entertainment. We do not claim any
          official partnership, licence, or approval from FIFA, UEFA, The FA, or any rights holder.
        </p>
        <p>
          The player pool is a curated shortlist for discussion and may not reflect real call-ups,
          contracts, or availability. Scores on the leaderboard compare predictions to an
          administrator-published reference squad for game purposes only — not to official team
          selection.
        </p>
      </section>

      <section>
        <h2>Advertising</h2>
        <p>
          We may show advertising (for example through Google AdSense) to help cover hosting costs.
          Ad partners may use cookies as described in our{' '}
          <Link to="/privacy" className="font-semibold text-england-red hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>Explore</h2>
        <p>
          <Link to="/" className="font-semibold text-england-red hover:underline">
            Build your squad
          </Link>
          {' · '}
          <Link to="/stats" className="font-semibold text-england-red hover:underline">
            Most picked stats
          </Link>
          {' · '}
          <a href={`${origin}/#leaderboard`} className="font-semibold text-england-red hover:underline">
            Leaderboard
          </a>
        </p>
      </section>
    </LegalPageLayout>
  )
}
