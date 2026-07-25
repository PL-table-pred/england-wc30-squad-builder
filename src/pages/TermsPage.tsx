import { Link } from 'react-router-dom'
import { LegalPageLayout } from '../components/LegalPageLayout'
import { getSiteOrigin } from '../lib/siteMeta'
import { useContactEmail } from '../hooks/useContactEmail'

export function TermsPage() {
  const contactEmail = useContactEmail()
  const origin = getSiteOrigin()
  const lastUpdated = '25 July 2026'

  return (
    <LegalPageLayout
      title="Terms of use"
      subtitle={`Rules for using ${origin}. Last updated: ${lastUpdated}.`}
    >
      <section>
        <h2>Agreement</h2>
        <p>
          By using England WC &apos;30 Squad Builder (&ldquo;the site&rdquo;, &ldquo;LionXI&rdquo;), you
          agree to these terms. If you do not agree, please do not use the site. The site is operated by
          TimeCapsule Football as an independent fan project.
        </p>
      </section>

      <section>
        <h2>What the service is</h2>
        <p>
          The site lets you build a predicted 26-player England squad for the 2030 FIFA World Cup, set a
          formation and starting XI, choose a captain, share predictions, and optionally submit them to a
          community leaderboard scored against an administrator-published reference squad. Features may
          change over time.
        </p>
      </section>

      <section>
        <h2>No official affiliation</h2>
        <p>
          The site is unofficial fan entertainment and commentary. It is not affiliated with, endorsed
          by, or connected to The Football Association (The FA), FIFA, UEFA, the Premier League, any
          club, or any rights holder. Names, badges, and competition marks belong to their owners and are
          used here only for editorial discussion.
        </p>
      </section>

      <section>
        <h2>Accounts</h2>
        <p>
          Registration is optional for browsing and building locally, but required for some features
          (for example posting to the leaderboard). You must provide accurate information, keep your
          login secure, and not share accounts. We may suspend or delete accounts that abuse the
          service, harass others, or attempt to disrupt the site.
        </p>
      </section>

      <section>
        <h2>User content and predictions</h2>
        <ul>
          <li>
            Squads you build and submit, display names, and related text are your responsibility. Do not
            post illegal, abusive, or infringing content.
          </li>
          <li>
            Custom player names you type are for personal prediction only. Do not use them to impersonate
            real people in a misleading or harmful way.
          </li>
          <li>
            By submitting to the leaderboard or other public features, you grant us a non-exclusive
            licence to display, store, and aggregate that content for operating the site (including stats
            and share previews).
          </li>
          <li>
            Administrators may remove submissions or accounts that break these terms or harm the
            community.
          </li>
        </ul>
      </section>

      <section>
        <h2>Leaderboard and scoring</h2>
        <p>
          Leaderboard points compare your prediction to a reference squad published by site admins for
          game purposes only. Scores, ranks, and &ldquo;most picked&rdquo; stats are entertainment — not
          official team selection, betting advice, or a prize competition unless we clearly state
          otherwise. We may lock submissions, adjust scoring rules, or reset contest settings when needed
          to run the feature fairly.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Scrape, overload, or reverse-engineer the service in a way that harms availability</li>
          <li>Bypass security, admin gates, or rate limits</li>
          <li>Use automation to spam or flood the leaderboard</li>
          <li>Misrepresent affiliation with FIFA, The FA, or this site&apos;s operators</li>
        </ul>
      </section>

      <section>
        <h2>Intellectual property</h2>
        <p>
          Site design, code, and original editorial content are owned by TimeCapsule Football or its
          licensors. Player names and likenesses appear for fan discussion only. You may share your own
          squad images and links for personal, non-commercial use.
        </p>
      </section>

      <section>
        <h2>Disclaimer and liability</h2>
        <p>
          The site is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee
          uninterrupted access, accurate player data, or that leaderboard results will remain available.
          To the fullest extent allowed by law, TimeCapsule Football is not liable for indirect or
          consequential loss arising from use of the site. Nothing in these terms limits liability that
          cannot be limited under applicable law.
        </p>
      </section>

      <section>
        <h2>Privacy and cookies</h2>
        <p>
          How we handle data is described in our{' '}
          <Link to="/privacy" className="font-semibold text-england-red hover:underline">
            privacy policy
          </Link>
          , including browser storage and any advertising cookies if ads are enabled.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update these terms from time to time. The &ldquo;Last updated&rdquo; date above will
          change when we do. Continued use after changes means you accept the revised terms.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms:{' '}
          <a href={`mailto:${contactEmail}`} className="font-semibold text-england-red hover:underline">
            {contactEmail}
          </a>{' '}
          or the{' '}
          <Link to="/contact" className="font-semibold text-england-red hover:underline">
            contact page
          </Link>
          .
        </p>
      </section>
    </LegalPageLayout>
  )
}
