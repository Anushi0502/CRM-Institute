import { GraduationCap, Sparkles, Star } from 'lucide-react'
import kidsRainbowBanner from '../assets/kids-rainbow-banner.svg'

const careStages = [
  { label: 'Infant care', icon: Sparkles, tone: 'border border-sky/35 bg-sky/20 text-white' },
  { label: 'Toddler play', icon: Star, tone: 'border border-berry/35 bg-berry/20 text-white' },
  { label: 'Early learning', icon: GraduationCap, tone: 'border border-sun/40 bg-sun/28 text-white' },
]

export function BrandMark() {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/35 bg-[var(--crm-gradient-brand)] p-6 text-white shadow-soft">
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/12" />
      <div className="absolute bottom-0 right-12 h-24 w-24 rounded-full bg-berry/28 blur-xl" />
      <div className="absolute left-8 top-20 h-16 w-16 rounded-full bg-sun/20 blur-lg" />

      <div className="kid-sticker relative z-10 bg-white/18 text-white">
        <Sparkles className="h-3.5 w-3.5" />
        Ages 6m to 7y
      </div>

      <div className="relative z-10 mt-4 overflow-hidden rounded-2xl border border-white/20">
        <img
          src={kidsRainbowBanner}
          alt="Playful rainbow strip"
          className="h-20 w-full object-cover"
        />
        <div className="absolute inset-0 bg-[var(--crm-gradient-brand-overlay)]" />
      </div>

      <div className="relative z-10 mt-5 flex items-center gap-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/18 text-xl font-bold shadow-soft">
          B
        </div>
        <span className="kid-ribbon border-white/35 bg-white/18 text-white">
          Story-led operations
        </span>
      </div>

      <div className="relative z-10 mt-5 space-y-3">
        <p className="font-display text-2xl leading-tight">
          BrightMinds Little Learners CRM
        </p>
        <p className="max-w-[16rem] text-sm text-white/86">
          Family communication, joyful care tracking, and admissions flow for
          infant through early-years classrooms.
        </p>
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap gap-2">
        {careStages.map((stage) => {
          const Icon = stage.icon

          return (
            <span
              key={stage.label}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${stage.tone}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {stage.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
