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
    subtitle: 'Current soft-teal family look',
    chipClassName: 'border-teal/30 bg-teal/10 text-teal',
    palette: [
      { name: 'Ink', hex: '#18353d' },
      { name: 'Teal', hex: '#1f766e' },
      { name: 'Mint', hex: '#b7ddd7' },
      { name: 'Coral', hex: '#f27b64' },
      { name: 'Amber', hex: '#f0b45b' },
      { name: 'Plum', hex: '#72507d' },
    ],
  },
  {
    key: 'sunrise-carnival',
    label: 'Sunrise Carnival',
    subtitle: 'Warm peach, berry, and sun pops',
    chipClassName: 'border-coral/35 bg-coral/10 text-coral',
    palette: [
      { name: 'Midnight', hex: '#2f2e4d' },
      { name: 'Sunrise', hex: '#ff7a59' },
      { name: 'Honey', hex: '#ffbe3d' },
      { name: 'Berry', hex: '#ff5f87' },
      { name: 'Sky', hex: '#92d9ff' },
      { name: 'Lime', hex: '#8ed48a' },
    ],
  },
  {
    key: 'lagoon-breeze',
    label: 'Lagoon Breeze',
    subtitle: 'Fresh aqua, blue, and citrus energy',
    chipClassName: 'border-sky/45 bg-sky/12 text-sky-700',
    palette: [
      { name: 'Deep blue', hex: '#12314c' },
      { name: 'Aqua', hex: '#00a8a8' },
      { name: 'Cyan', hex: '#4dd2ff' },
      { name: 'Leaf', hex: '#69c98d' },
      { name: 'Lemon', hex: '#f7d94a' },
      { name: 'Coral', hex: '#ff7f6a' },
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
