export type AdminNavSection = {
  id: string
  href: string
  title: string
  description: string
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    id: 'reference',
    href: '/admin/reference',
    title: 'Reference squad',
    description: 'Publish the answer key used for leaderboard scoring.',
  },
  {
    id: 'settings',
    href: '/admin/settings',
    title: 'Site & contest settings',
    description: 'Contact email for legal pages, lock or unlock submissions.',
  },
  {
    id: 'bots',
    href: '/admin/bots',
    title: 'QA bots',
    description: 'Seed realistic bot predictions for the leaderboard.',
  },
  {
    id: 'submissions',
    href: '/admin/submissions',
    title: 'Submissions',
    description: 'Browse and remove squad predictions from the leaderboard.',
  },
  {
    id: 'users',
    href: '/admin/users',
    title: 'Users & admins',
    description: 'View signups, fan vs journalist, and promote admins.',
  },
]
