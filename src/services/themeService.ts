export type CrmThemeKey = 'playful-meadow' | 'sunrise-carnival' | 'lagoon-breeze'

interface ThemePaletteSwatch {
  name: string
  hex: string
}

interface CrmTheme {
  key: CrmThemeKey
  label: string
  subtitle: string
  chipClassName: string
  palette: ThemePaletteSwatch[]
}

const THEME_STORAGE_KEY = 'crm-theme'
const DEFAULT_THEME: CrmThemeKey = 'sunrise-carnival'

export const crmThemes: CrmTheme[] = [
  {
    key: 'playful-meadow',
    label: 'Playful Meadow',
    subtitle: 'Bold teal, coral, and playful depth',
    chipClassName: 'border-teal/30 bg-teal/10 text-teal',
    palette: [
      { name: 'Ink', hex: '#143942' },
      { name: 'Teal', hex: '#148c7d' },
      { name: 'Mint', hex: '#baf0e4' },
      { name: 'Coral', hex: '#f8677b' },
      { name: 'Amber', hex: '#f5ae3e' },
      { name: 'Plum', hex: '#7e5b9e' },
    ],
  },
  {
    key: 'sunrise-carnival',
    label: 'Sunrise Carnival',
    subtitle: 'Bold warm pops with high contrast',
    chipClassName: 'border-coral/35 bg-coral/10 text-coral',
    palette: [
      { name: 'Midnight', hex: '#292348' },
      { name: 'Sunrise', hex: '#ff6a4c' },
      { name: 'Honey', hex: '#ffb935' },
      { name: 'Berry', hex: '#ff5983' },
      { name: 'Sky', hex: '#88d6ff' },
      { name: 'Lime', hex: '#88d37f' },
    ],
  },
  {
    key: 'lagoon-breeze',
    label: 'Lagoon Breeze',
    subtitle: 'Bold aqua-citrus with crisp contrast',
    chipClassName: 'border-sky/45 bg-sky/12 text-sky-700',
    palette: [
      { name: 'Deep blue', hex: '#0f3451' },
      { name: 'Aqua', hex: '#00a3a9' },
      { name: 'Cyan', hex: '#3ac7ff' },
      { name: 'Leaf', hex: '#68d397' },
      { name: 'Lemon', hex: '#fcce41' },
      { name: 'Coral', hex: '#ff6d5a' },
    ],
  },
]

function isCrmThemeKey(value: string): value is CrmThemeKey {
  return crmThemes.some((theme) => theme.key === value)
}

export function getStoredCrmTheme(): CrmThemeKey {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME
  }

  const value = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (!value || !isCrmThemeKey(value)) {
    return DEFAULT_THEME
  }

  return value
}

export function applyCrmTheme(theme: CrmThemeKey) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.crmTheme = theme
}

export function saveCrmTheme(theme: CrmThemeKey) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function initializeCrmTheme() {
  const storedTheme = getStoredCrmTheme()
  applyCrmTheme(storedTheme)
  return storedTheme
}
