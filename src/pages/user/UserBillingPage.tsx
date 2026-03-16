import { useEffect, useMemo, useState } from 'react'
import { CreditCard, ReceiptText, Wallet } from 'lucide-react'
import { UserPanel } from '../../components/UserPanel'
import { useUserPortal } from '../../hooks/useUserPortal'

const invoiceTone = {
  Paid: 'border-teal/25 bg-teal/10 text-teal',
  'Due Soon': 'border-coral/25 bg-coral/10 text-coral',
  Pending: 'border-amber/35 bg-amber/20 text-amber-700',
} as const

function parseAmount(amount: string) {
  return Number(amount.replace(/[^0-9.]/g, '')) || 0
}

export function UserBillingPage() {
  const {
    downloadReceipt,
    markInvoicePaid,
    state,
    toggleAutopay,
    totalDueAmountLabel,
    updatePaymentMethod,
    visibleInvoices,
  } = useUserPortal()
  const [paymentMethodDraft, setPaymentMethodDraft] = useState(state.paymentMethod)

  useEffect(() => {
    setPaymentMethodDraft(state.paymentMethod)
  }, [state.paymentMethod])

  const receiptCount = visibleInvoices.filter((invoice) => invoice.receiptReady).length
  const paidCount = visibleInvoices.filter((invoice) => invoice.status === 'Paid').length
  const pendingCount = visibleInvoices.filter((invoice) => invoice.status !== 'Paid').length
  const perChildBreakdown = useMemo(
    () =>
      state.children.map((child) => ({
        child,
        dueAmount: visibleInvoices
          .filter((invoice) => invoice.childId === child.id && invoice.status !== 'Paid')
          .reduce((sum, invoice) => sum + parseAmount(invoice.amount), 0),
      })),
    [state.children, visibleInvoices],
  )

  function handlePaymentMethodSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!paymentMethodDraft.trim()) {
      return
    }

    updatePaymentMethod(paymentMethodDraft.trim())
  }

  return (
    <div className="space-y-4">
      <UserPanel
        eyebrow="Billing center"
        title="Billing and receipts"
        description="Household billing is wired to the same family account record. Manage due amounts, autopay, receipts, and payment method changes without leaving the parent app."
      >
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[22px] border border-coral/25 bg-coral/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-coral">Due this cycle</p>
            <p className="mt-2 font-display text-3xl text-ink">{totalDueAmountLabel}</p>
          </div>
          <div className="rounded-[22px] border border-teal/25 bg-teal/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-teal">Receipts ready</p>
            <p className="mt-2 font-display text-3xl text-ink">{receiptCount}</p>
          </div>
          <div className="rounded-[22px] border border-amber/35 bg-amber/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-amber-700">Open invoices</p>
            <p className="mt-2 font-display text-3xl text-ink">{pendingCount}</p>
          </div>
          <div className="rounded-[22px] border border-plum/25 bg-plum/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-plum">Paid this view</p>
            <p className="mt-2 font-display text-3xl text-ink">{paidCount}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.08fr),minmax(320px,0.92fr)]">
          <div className="rounded-[26px] border border-ink/10 bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">Billing history</p>
                <h3 className="mt-2 font-display text-3xl text-ink">Invoices and payments</h3>
              </div>
              <span className="rounded-full border border-ink/10 bg-cloud px-3 py-1 text-xs font-semibold text-ink/70">
                {state.autopayEnabled ? 'Autopay on' : 'Autopay off'}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {visibleInvoices.map((invoice) => (
                <div key={invoice.id} className="rounded-[24px] border border-ink/10 bg-cloud/35 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{invoice.title}</p>
                      <p className="mt-1 text-sm text-ink/75">
                        {invoice.category} · {invoice.dueDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-3xl text-ink">{invoice.amount}</p>
                      <span className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${invoiceTone[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {invoice.status !== 'Paid' ? (
                      <button
                        type="button"
                        onClick={() => {
                          markInvoicePaid(invoice.id)
                        }}
                        className="kid-bubble-button rounded-full px-4 py-2 text-sm font-semibold text-white"
                      >
                        Mark paid
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        downloadReceipt(invoice.id)
                      }}
                      className="kid-ghost-button rounded-full px-4 py-2 text-sm font-semibold text-ink/85"
                    >
                      {invoice.receiptReady ? 'Download receipt' : 'Prepare receipt'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[26px] border border-ink/10 bg-ink px-4 py-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/65">Autopay control</p>
              <p className="mt-2 font-display text-3xl text-white">
                {state.autopayEnabled ? 'Autopay enabled' : 'Autopay disabled'}
              </p>
              <p className="mt-2 text-sm text-white/75">
                Keep autopay on for household-level invoices that should settle without a manual step.
              </p>
              <button
                type="button"
                onClick={() => {
                  toggleAutopay()
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
              >
                <CreditCard className="h-4 w-4" />
                {state.autopayEnabled ? 'Turn autopay off' : 'Turn autopay on'}
              </button>
            </div>

            <div className="rounded-[26px] border border-ink/10 bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">Payment method</p>
              <form onSubmit={handlePaymentMethodSave} className="mt-3 space-y-3">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-ink">Saved method</span>
                  <input
                    value={paymentMethodDraft}
                    onChange={(event) => {
                      setPaymentMethodDraft(event.target.value)
                    }}
                    className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
                  />
                </label>
                <button
                  type="submit"
                  className="kid-bubble-button rounded-full px-4 py-2 text-sm font-semibold text-white"
                >
                  Save payment method
                </button>
              </form>
            </div>
          </div>
        </div>
      </UserPanel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr),minmax(340px,0.92fr)]">
        <UserPanel eyebrow="Child breakdown" title="How dues map across children">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {perChildBreakdown.map(({ child, dueAmount }) => (
              <div key={child.id} className="rounded-[24px] border border-ink/10 bg-white px-4 py-4">
                <p className="font-semibold text-ink">{child.name}</p>
                <p className="mt-1 text-sm text-ink/75">{child.program}</p>
                <p className="mt-3 font-display text-3xl text-ink">${dueAmount}</p>
                <p className="mt-2 text-sm text-ink/80">Current due amount linked to this child.</p>
              </div>
            ))}
          </div>
        </UserPanel>

        <UserPanel eyebrow="Receipts" title="Billing shortcuts">
          <div className="space-y-3">
            <div className="rounded-[22px] border border-ink/10 bg-white px-4 py-4">
              <p className="inline-flex items-center gap-2 font-semibold text-ink">
                <Wallet className="h-4 w-4 text-plum" />
                Household wallet sync
              </p>
              <p className="mt-2 text-sm text-ink/80">
                Billing actions persist into the same parent account record used by admissions and family management.
              </p>
            </div>
            <div className="rounded-[22px] border border-teal/25 bg-teal/10 px-4 py-4">
              <p className="inline-flex items-center gap-2 font-semibold text-ink">
                <ReceiptText className="h-4 w-4 text-teal" />
                Receipt workflow
              </p>
              <p className="mt-2 text-sm text-ink/80">
                Preparing a receipt updates the family activity feed so the household always has a visible audit trail.
              </p>
            </div>
          </div>
        </UserPanel>
      </div>
    </div>
  )
}
