import { Link } from 'react-router-dom'
import { LegalPageLayout } from '../components/LegalPageLayout'
import { getSiteOrigin } from '../lib/siteMeta'
import { useContactEmail } from '../hooks/useContactEmail'

export function PrivacyPage() {
  const contactEmail = useContactEmail()
  const origin = getSiteOrigin()
  const lastUpdated = '25 July 2026'

  return (
    <LegalPageLayout
      title="Privacy policy"
      subtitle={`How we handle information on ${origin} (LionXI). Last updated: ${lastUpdated}.`}
    >
      <section>
        <h2>Overview</h2>
        <p>
          This policy explains what data the England WC &apos;30 Squad Builder collects, how we use it,
          and your choices. The site is operated by TimeCapsule Football at{' '}
          <a href={origin} className="font-semibold text-england-red hover:underline">
            {origin}
          </a>
          . We aim to collect only what is needed to run the app, leaderboard, and optional accounts.
          Use of the site is also governed by our{' '}
          <Link to="/terms" className="font-semibold text-england-red hover:underline">
            terms of use
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>Data we collect</h2>
        <ul>
          <li>
            <strong>Account data (optional):</strong> If you register, Supabase Auth stores your email
            address and password (hashed). Your profile may include a display name, whether you are a
            fan or journalist, and an optional publication name.
          </li>
          <li>
            <strong>Squad predictions:</strong> When you post to the leaderboard, we store an encoded
            representation of your squad (`squad_param`) and a timestamp. Submissions are readable by
            anyone with access to the public API (anon key) for leaderboard and stats features.
          </li>
          <li>
            <strong>View counts:</strong> Opening a shared squad link may increment an anonymous view
            counter once per browser session.
          </li>
          <li>
            <strong>Admin activity:</strong> Administrators with appropriate access may manage reference
            squads, settings, submissions, and user records. Admin unlock via URL parameter stores a
            shared secret in session storage only for that browser session.
          </li>
        </ul>
      </section>

      <section>
        <h2>Cookies and similar technologies</h2>
        <p>
          We use browser storage and, where enabled, third-party cookies. This section is our cookie
          notice for the site.
        </p>
        <ul>
          <li>
            <strong>Essential / functional:</strong> localStorage key{' '}
            <code className="rounded bg-slate-100 px-1 text-sm">england-wc30-squad</code> keeps your
            in-progress squad. sessionStorage deduplicates squad view counts and may hold an admin
            unlock for the current tab only. Supabase may store auth session data so you stay signed in.
          </li>
          <li>
            <strong>Advertising (when enabled):</strong> Google AdSense or similar partners may set
            cookies to serve and measure ads. Manage preferences at{' '}
            <a
              href="https://adssettings.google.com"
              className="font-semibold text-england-red hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>{' '}
            or via your browser. A consent banner may appear in regions that require it before
            non-essential cookies load.
          </li>
        </ul>
      </section>

      <section>
        <h2>Third-party services</h2>
        <ul>
          <li>
            <strong>Supabase</strong> — database, authentication, and API hosting. Data is processed
            according to{' '}
            <a
              href="https://supabase.com/privacy"
              className="font-semibold text-england-red hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Supabase&apos;s privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Vercel</strong> — site hosting, edge functions (e.g. share preview images), and
            logs. See{' '}
            <a
              href="https://vercel.com/legal/privacy-policy"
              className="font-semibold text-england-red hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vercel&apos;s privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Google (AdSense / Analytics, if enabled)</strong> — advertising and measurement.
            See{' '}
            <a
              href="https://policies.google.com/privacy"
              className="font-semibold text-england-red hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google&apos;s privacy policy
            </a>
            .
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use data</h2>
        <p>
          We use collected information to operate the squad builder, show leaderboards and community
          stats, authenticate users, prevent abuse, improve the service, and (where applicable) display
          advertising. We do not sell your personal information.
        </p>
      </section>

      <section>
        <h2>Retention and security</h2>
        <p>
          Leaderboard submissions and accounts persist until deleted by you (where supported) or an
          administrator. We rely on Supabase row-level security and industry-standard hosting practices,
          but no online service is 100% secure.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct, or delete personal data.
          To request help, email{' '}
          <a href={`mailto:${contactEmail}`} className="font-semibold text-england-red hover:underline">
            {contactEmail}
          </a>{' '}
          or use the{' '}
          <Link to="/contact" className="font-semibold text-england-red hover:underline">
            contact page
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          The service is intended for a general audience. If you are under 16, please use the site
          with a parent or guardian&apos;s permission.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top
          will change when we do.
        </p>
      </section>
    </LegalPageLayout>
  )
}
