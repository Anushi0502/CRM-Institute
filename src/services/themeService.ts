export type CrmThemeKey =
  | 'playful-meadow'
  | 'sunrise-carnival'
  | 'lagoon-breeze'
  | 'midnight-ops'
  | 'terracotta-ledger'
  | 'evergreen-circuit'

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
    label: 'Citrus Atelier',
    subtitle: 'Peach, marigold, and raspberry with boutique warmth',
    chipClassName: 'border-orange-300/60 bg-orange-100/70 text-orange-800',
    palette: [
      { name: 'Espresso', hex: '#4a2d24' },
      { name: 'Apricot', hex: '#f29b77' },
      { name: 'Marigold', hex: '#f5be3b' },
      { name: 'Raspberry', hex: '#d8576b' },
      { name: 'Blush', hex: '#f7d7cf' },
      { name: 'Cream', hex: '#fff1db' },
    ],
  },
  {
    key: 'midnight-ops',
    label: 'Midnight Ops',
    subtitle: 'Deep navy and mint for backend clarity',
    chipClassName: 'border-sky/40 bg-sky/15 text-sky-700',
    palette: [
      { name: 'Night ink', hex: '#1a2344' },
      { name: 'Signal mint', hex: '#1fb794' },
      { name: 'Control cyan', hex: '#3cb9e8' },
      { name: 'Alert coral', hex: '#ff6f7a' },
      { name: 'Energy amber', hex: '#f6ba4f' },
      { name: 'Lavender', hex: '#9d87f5' },
    ],
  },
  {
    key: 'terracotta-ledger',
    label: 'Terracotta Ledger',
    subtitle: 'Warm clay tones with professional contrast',
    chipClassName: 'border-amber/45 bg-amber/15 text-amber-700',
    palette: [
      { name: 'Ledger ink', hex: '#3a2b2f' },
      { name: 'Terracotta', hex: '#d56f4e' },
      { name: 'Sand', hex: '#efce9a' },
      { name: 'Olive', hex: '#5f8755' },
      { name: 'Slate blue', hex: '#5a6ea9' },
      { name: 'Rose', hex: '#cf6d8c' },
    ],
  },
  {
    key: 'evergreen-circuit',
    label: 'Velvet Bloom',
    subtitle: 'Plum, lilac, and rose with luxe evening contrast',
    chipClassName: 'border-fuchsia-300/55 bg-fuchsia-100/65 text-fuchsia-800',
    palette: [
      { name: 'Mulberry ink', hex: '#2f223d' },
      { name: 'Plum', hex: '#7c4d9e' },
      { name: 'Lilac', hex: '#c7afe9' },
      { name: 'Rose', hex: '#e06c8d' },
      { name: 'Champagne', hex: '#f1dfc7' },
      { name: 'Soft mist', hex: '#f7f2fb' },
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
