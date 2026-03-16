import { Paintbrush } from 'lucide-react'
import {
  crmThemes,
  type CrmThemeKey,
} from '../services/themeService'

interface ThemeSwitcherProps {
  selectedTheme: CrmThemeKey
  onThemeSelect: (theme: CrmThemeKey) => void
  compact?: boolean
}

export function ThemeSwitcher({
  selectedTheme,
  onThemeSelect,
  compact = false,
}: ThemeSwitcherProps) {
  return (
    <section className="kid-panel rounded-[26px] border border-ink/10 bg-white/92 p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-2 font-display text-xl text-ink">
          <Paintbrush className="h-4 w-4 text-coral" />
          Theme vibe
        </h3>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
          Instant
        </span>
      </div>

      <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1'}`}>
        {crmThemes.map((theme) => {
          const isActive = theme.key === selectedTheme

          return (
            <button
              key={theme.key}
              type="button"
              onClick={() => onThemeSelect(theme.key)}
              className={`rounded-[16px] border px-3 py-2 text-left transition ${
                isActive
                  ? 'border-ink bg-ink text-white shadow-soft'
                  : 'border-ink/10 bg-white text-ink/80 hover:border-teal/30 hover:bg-cloud/80'
              }`}
            >
              <p className="text-sm font-semibold">{theme.label}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className={`rounded-full border px-2 py-0.5 text-xs ${isActive ? 'border-white/30 bg-white/15 text-white' : theme.chipClassName}`}>
                  {theme.subtitle}
                </p>
                <div className="flex items-center gap-1">
                  {theme.palette.slice(0, 4).map((swatch) => (
                    <span
                      key={swatch.name}
                      className="h-2.5 w-2.5 rounded-full border border-white/30"
                      style={{ backgroundColor: swatch.hex }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
