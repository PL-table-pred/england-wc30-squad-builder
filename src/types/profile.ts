export type AudienceType = 'fan' | 'journalist'

export type UserRole = 'user' | 'admin'

export const AUDIENCE_OPTIONS: { value: AudienceType; label: string; description: string }[] = [
  {
    value: 'fan',
    label: 'Fan',
    description: 'Regular supporter — not working in media',
  },
  {
    value: 'journalist',
    label: 'Journalist / media',
    description: 'Press, broadcaster, or publication',
  },
]
