import { type FormEvent, useState } from 'react'
import { LegalPageLayout } from '../components/LegalPageLayout'
import { useContactEmail } from '../hooks/useContactEmail'

export function ContactPage() {
  const contactEmail = useContactEmail()
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const lines = [
      message.trim(),
      '',
      name.trim() ? `From: ${name.trim()}` : '',
    ].filter(Boolean)
    const body = lines.join('\n')
    const mailto = `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(
      subject.trim() || 'England WC30 Squad Builder',
    )}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    setSent(true)
  }

  return (
    <LegalPageLayout
      title="Contact"
      subtitle="Questions about the site, privacy, advertising, or content corrections."
    >
      <section>
        <h2>Email</h2>
        <p>
          You can reach us directly at{' '}
          <a href={`mailto:${contactEmail}`} className="font-semibold text-england-red hover:underline">
            {contactEmail}
          </a>
          . We aim to reply within a few business days.
        </p>
      </section>

      <section>
        <h2>Send a message</h2>
        <p className="text-sm text-slate-500">
          The form below opens your email app with a pre-filled message (no message is stored on our
          servers).
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-semibold text-england-navy">
              Your name (optional)
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-england-navy focus:border-england-red focus:outline-none focus:ring-1 focus:ring-england-red"
            />
          </div>
          <div>
            <label htmlFor="contact-subject" className="block text-sm font-semibold text-england-navy">
              Subject
            </label>
            <input
              id="contact-subject"
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-england-navy focus:border-england-red focus:outline-none focus:ring-1 focus:ring-england-red"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-sm font-semibold text-england-navy">
              Message
            </label>
            <textarea
              id="contact-message"
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-england-navy focus:border-england-red focus:outline-none focus:ring-1 focus:ring-england-red"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-england-red px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 sm:w-auto"
          >
            Open in email app
          </button>
          {sent && (
            <p className="text-sm text-slate-500" role="status">
              If your mail app did not open, email us at{' '}
              <a href={`mailto:${contactEmail}`} className="font-semibold text-england-red hover:underline">
                {contactEmail}
              </a>
              .
            </p>
          )}
        </form>
      </section>

      <section>
        <h2>What to include</h2>
        <ul>
          <li>Privacy or data requests (account email, if applicable)</li>
          <li>Copyright or trademark concerns</li>
          <li>Bug reports or broken share links</li>
          <li>Press or partnership enquiries</li>
        </ul>
      </section>
    </LegalPageLayout>
  )
}
