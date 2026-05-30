import { useEffect, useState } from 'react'
import { fetchPublicContactEmail } from '../lib/siteSettings'
import { getContactEmail } from '../lib/siteMeta'

export function useContactEmail(): string {
  const [email, setEmail] = useState(getContactEmail)

  useEffect(() => {
    let cancelled = false
    void fetchPublicContactEmail().then((value) => {
      if (!cancelled) setEmail(value)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return email
}
