export function BrandMark() {
  return (
    <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#1f766e_0%,#18353d_100%)] p-6 text-white shadow-soft">
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute bottom-0 right-10 h-20 w-20 rounded-full bg-coral/25 blur-xl" />
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold">
        B
      </div>
      <div className="mt-6 space-y-3">
        <p className="font-display text-2xl leading-tight">
          BrightMinds Institute CRM
        </p>
        <p className="max-w-[16rem] text-sm text-white/80">
          Admissions, family communication, and student care in one calm
          operations hub.
        </p>
      </div>
    </div>
  )
}
