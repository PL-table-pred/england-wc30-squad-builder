/** UK-focused QA bot display names (adapted from pl-table-predict). */

const ENGLISH_FIRST_MALE = [
  'James', 'Oliver', 'Harry', 'George', 'Jack', 'Charlie', 'William', 'Thomas', 'Henry',
  'Noah', 'Arthur', 'Joshua', 'Freddie', 'Edward', 'Oscar', 'Daniel', 'Samuel', 'Benjamin',
  'Max', 'Jacob', 'Alexander', 'Leo', 'Ethan', 'Archie', 'Lucas', 'Reuben', 'Harrison',
]

const ENGLISH_LAST = [
  'Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Wilson', 'Davies', 'Evans', 'Johnson',
  'Roberts', 'Walker', 'Robinson', 'Wood', 'Thompson', 'White', 'Hall', 'Green', 'Harris',
  'Lewis', 'Martin', 'Jackson', 'Clarke', 'Wright', 'Cooper', 'King', 'Lee', 'Allen', 'Young',
]

const SCOTTISH_FIRST = ['Callum', 'Fraser', 'Angus', 'Ewan', 'Hamish', 'Gregor', 'Murray', 'Lewis']
const SCOTTISH_LAST = ['MacDonald', 'Campbell', 'Fraser', 'Murray', 'McKay', 'Robertson', 'Stewart']

const WELSH_FIRST = ['Gareth', 'Rhys', 'Dewi', 'Owain', 'Harri', 'Morgan', 'Rhodri', 'Tomos']
const WELSH_LAST = ['Jones', 'Williams', 'Davies', 'Evans', 'Thomas', 'Roberts', 'Lewis', 'Morgan']

export type QaPersona = {
  displayName: string
  nationality: string
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickNationality(): string {
  const roll = Math.random()
  if (roll < 0.92) return 'England'
  if (roll < 0.96) return pick(['Scotland', 'Wales'] as const)
  return pick(['Northern Ireland', 'Ireland'] as const)
}

function namesForNationality(nationality: string): { first: string[]; last: string[] } {
  if (nationality === 'Scotland') return { first: SCOTTISH_FIRST, last: SCOTTISH_LAST }
  if (nationality === 'Wales') return { first: WELSH_FIRST, last: WELSH_LAST }
  return { first: ENGLISH_FIRST_MALE, last: ENGLISH_LAST }
}

/** Unique QA personas for bot leaderboard entries. */
export function pickUniqueQaPersonas(count: number): QaPersona[] {
  const used = new Set<string>()
  const out: QaPersona[] = []
  let guard = 0

  while (out.length < count && guard < count * 80) {
    guard++
    const nationality = pickNationality()
    const { first, last } = namesForNationality(nationality)
    const displayName = `${pick(first)} ${pick(last)}`
    if (used.has(displayName)) continue
    used.add(displayName)
    out.push({ displayName, nationality })
  }

  while (out.length < count) {
    const n = out.length + 1
    out.push({ displayName: `${pick(ENGLISH_FIRST_MALE)} ${pick(ENGLISH_LAST)}-${n}`, nationality: 'England' })
  }

  return shuffle(out)
}
