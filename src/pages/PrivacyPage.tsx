import { Link } from 'react-router-dom'
import { LegalPageLayout } from '../components/LegalPageLayout'
import { getSiteOrigin } from '../lib/siteMeta'
import { useContactEmail } from '../hooks/useContactEmail'

export function PrivacyPage() {
  const contactEmail = useContactEmail()
  const origin = getSiteOrigin()
  const lastUpdated = '30 May 2026'

  return (
    <LegalPageLayout
      title="Privacy policy"
      subtitle={`How we handle information on ${origin}. Last updated: ${lastUpdated}.`}
    >
      <section>
        <h2>Overview</h2>
        <p>
          This policy explains what data the England WC &apos;30 Squad Builder collects, how we use it,
          and your choices. We aim to collect only what is needed to run the app, leaderboard, and
          optional accounts.
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
            representation of your squad (`squad_param`), a timestamp, and optional bot metadata.
            Submissions are readable by anyone with access to the public API (anon key) for leaderboard
            and stats features.
          </li>
          <li>
            <strong>View counts:</strong> Opening a shared squad link may increment an anonymous view
            counter once per browser session.
          </li>
          <li>
            <strong>Admin activity:</strong> Administrators with appropriate access may manage reference
            squads, settings, bots, and user records. Admin unlock via URL parameter stores a shared
            secret in session storage only for that browser session.
          </li>
        </ul>
      </section>

      <section>
        <h2>Browser storage (cookies and similar)</h2>
        <ul>
          <li>
            <strong>localStorage:</strong> Your in-progress squad is saved under the key{' '}
            <code className="rounded bg-slate-100 px-1 text-sm">england-wc30-squad</code> so you can
            return without losing picks. You can clear this via &ldquo;Reset squad&rdquo; or your browser
            settings.
          </li>
          <li>
            <strong>sessionStorage:</strong> Used for (1) deduplicating squad view counts per session, and
            (2) optional admin secret unlock for this tab/session only.
          </li>
          <li>
            <strong>Supabase session cookies:</strong> When logged in, Supabase may set authentication
            cookies or local storage entries to keep you signed in, depending on configuration.
          </li>
          <li>
            <strong>Advertising cookies:</strong> If we display Google AdSense or similar ads, Google and
            its partners may set cookies or use similar technologies to serve ads, measure performance,
            and (where enabled) personalize content. You can manage preferences at{' '}
            <a
              href="https://adssettings.google.com"
              className="font-semibold text-england-red hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>{' '}
            and via your browser.
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
