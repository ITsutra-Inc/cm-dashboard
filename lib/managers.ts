import { Manager } from './types'

export const MANAGERS: Manager[] = [
  {
    id: 'paul',
    name: 'Paul',
    color: '#3b82f6',
    colorClass: 'text-paul',
    glassClass: 'glass-paul',
    candidates: [
      { name: 'Muhammad Zehsan Yousuf', managerId: 'paul' },
      { name: 'Tony Joseph', managerId: 'paul' },
      { name: 'Darshan Kafle', managerId: 'paul' },
    ],
  },
  {
    id: 'sid',
    name: 'Sid',
    color: '#10b981',
    colorClass: 'text-sid',
    glassClass: 'glass-sid',
    candidates: [
      { name: 'Babin Karki', managerId: 'sid' },
      { name: 'Kushal Karki', managerId: 'sid' },
      { name: 'Bivek Shrestha', managerId: 'sid' },
      { name: 'Nagendra Dhamala', managerId: 'sid' },
      { name: 'Rishav Shah', managerId: 'sid' },
      { name: 'Parag Mardan Thapa', managerId: 'sid' },
    ],
  },
  {
    id: 'suvash',
    name: 'Suvash',
    color: '#a855f7',
    colorClass: 'text-suvash',
    glassClass: 'glass-suvash',
    candidates: [
      { name: 'Kala Raut', managerId: 'suvash' },
      { name: 'Milu Shrestha', managerId: 'suvash' },
      { name: 'Bishnu Thapa', managerId: 'suvash' },
      { name: 'Pratistha Shrestha', managerId: 'suvash' },
    ],
  },
]

// Candidate name aliases for fuzzy matching against D365 data
const CANDIDATE_ALIASES: Record<string, string[]> = {
  'Muhammad Zehsan Yousuf': ['Muhammad Zeshan Yousuf', 'Zeshan Yousuf', 'Zehsan Yousuf', 'Muhammad Yousuf'],
  'Tony Joseph': ['Tony Joseph'],
  'Darshan Kafle': ['Darshan Kafle'],
  'Babin Karki': ['Babin Karki'],
  'Kushal Karki': ['Kushal Karki'],
  'Bivek Shrestha': ['Bivek Shrestha', 'Bibek Shrestha'],
  'Nagendra Dhamala': ['Nagendra Dhamala'],
  'Rishav Shah': ['Rishav Shah'],
  'Parag Mardan Thapa': ['Parag Mardan Thapa', 'Parag Thapa'],
  'Kala Raut': ['Kala Raut'],
  'Milu Shrestha': ['Milu Shrestha'],
  'Bishnu Thapa': ['Bishnu Thapa'],
  'Pratistha Shrestha': ['Pratistha Shrestha'],
}

export function getManagerForCandidate(candidateName: string): { manager: Manager; matchedCandidate: string } | undefined {
  if (!candidateName) return undefined
  const normalized = candidateName.toLowerCase().trim()

  for (const manager of MANAGERS) {
    for (const candidate of manager.candidates) {
      // Direct name match
      if (candidate.name.toLowerCase() === normalized) {
        return { manager, matchedCandidate: candidate.name }
      }

      // Alias match
      const aliases = CANDIDATE_ALIASES[candidate.name] || []
      for (const alias of aliases) {
        if (alias.toLowerCase() === normalized) {
          return { manager, matchedCandidate: candidate.name }
        }
      }

      // Partial match - candidate name starts with or contains target
      const candidateLower = candidate.name.toLowerCase()
      const allAliases = [candidateLower, ...aliases.map(a => a.toLowerCase())]

      for (const alias of allAliases) {
        // Check if the D365 name starts with our candidate name
        if (normalized.startsWith(alias) || alias.startsWith(normalized)) {
          return { manager, matchedCandidate: candidate.name }
        }
      }

      // First + Last name match
      const candidateParts = candidateLower.split(' ')
      const inputParts = normalized.split(' ')
      if (candidateParts.length >= 2 && inputParts.length >= 2) {
        const firstMatch = candidateParts[0] === inputParts[0]
        const lastMatch = candidateParts[candidateParts.length - 1] === inputParts[inputParts.length - 1]
        if (firstMatch && lastMatch) {
          return { manager, matchedCandidate: candidate.name }
        }
      }
    }
  }

  return undefined
}

export function getAllCandidateNames(): string[] {
  return MANAGERS.flatMap(m => m.candidates.map(c => c.name))
}
