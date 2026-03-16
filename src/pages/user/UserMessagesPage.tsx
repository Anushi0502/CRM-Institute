import { useMemo, useState } from 'react'
import { MessageCircleMore, Search, SendHorizontal, ShieldAlert } from 'lucide-react'
import { UserPanel } from '../../components/UserPanel'
import { useUserPortal } from '../../hooks/useUserPortal'
import type { MessageChannel } from '../../types/userPortal'

const channelOptions: Array<MessageChannel | 'All'> = ['All', 'Teacher', 'Admissions', 'Billing', 'Office']

export function UserMessagesPage() {
  const {
    escalateToOffice,
    selectedThread,
    selectedThreadMessages,
    selectThread,
    sendMessage,
    visibleThreads,
  } = useUserPortal()
  const [draftReply, setDraftReply] = useState('')
  const [escalationNote, setEscalationNote] = useState('Please review this with the office team.')
  const [channelFilter, setChannelFilter] = useState<MessageChannel | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredThreads = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return visibleThreads.filter((thread) => {
      const matchesChannel = channelFilter === 'All' ? true : thread.channel === channelFilter
      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : [thread.name, thread.role, thread.lastMessage, thread.channel]
              .join(' ')
              .toLowerCase()
              .includes(normalizedQuery)

      return matchesChannel && matchesSearch
    })
  }, [channelFilter, searchQuery, visibleThreads])

  const unreadCount = filteredThreads.reduce((sum, thread) => sum + thread.unreadCount, 0)
  const waitingOnYou = filteredThreads.filter((thread) => thread.status === 'Waiting on you').length

  function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedThread || !draftReply.trim()) {
      return
    }

    sendMessage(selectedThread.id, draftReply.trim())
    setDraftReply('')
  }

  return (
    <div className="space-y-4">
      <UserPanel
        eyebrow="Two-way engagement"
        title="School conversations"
        description="Parent messaging is fully wired here. Filter by channel, reply in context, and escalate to office without losing the child-aware thread structure."
      >
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[22px] border border-teal/25 bg-teal/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-teal">Visible threads</p>
            <p className="mt-2 font-display text-3xl text-ink">{filteredThreads.length}</p>
          </div>
          <div className="rounded-[22px] border border-coral/25 bg-coral/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-coral">Unread</p>
            <p className="mt-2 font-display text-3xl text-ink">{unreadCount}</p>
          </div>
          <div className="rounded-[22px] border border-amber/35 bg-amber/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-amber-700">Waiting on you</p>
            <p className="mt-2 font-display text-3xl text-ink">{waitingOnYou}</p>
          </div>
          <div className="rounded-[22px] border border-plum/25 bg-plum/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-plum">Office escalations</p>
            <p className="mt-2 font-display text-3xl text-ink">
              {filteredThreads.filter((thread) => thread.channel === 'Office').length}
            </p>
          </div>
        </div>
      </UserPanel>

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.8fr),minmax(0,1.2fr)]">
        <UserPanel
          eyebrow="Inbox"
          title="Conversation list"
          description="Threads stay child-aware, but the parent account can still reach shared teams like billing and office."
        >
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                }}
                placeholder="Search threads, last messages, or channels"
                className="w-full rounded-2xl border border-ink/10 bg-cloud/60 py-2 pl-10 pr-3 text-sm text-ink outline-none"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {channelOptions.map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => {
                    setChannelFilter(channel)
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    channelFilter === channel
                      ? 'border border-ink bg-ink text-white'
                      : 'border border-ink/10 bg-white text-ink/80'
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => {
                    selectThread(thread.id)
                  }}
                  className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                    selectedThread?.id === thread.id
                      ? 'border-ink bg-ink text-white'
                      : 'border-ink/10 bg-white text-ink hover:border-teal/30 hover:bg-cloud/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{thread.name}</p>
                        <span className="rounded-full border border-current/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-75">
                          {thread.channel}
                        </span>
                      </div>
                      <p className="mt-1 text-sm opacity-80">{thread.role}</p>
                    </div>
                    <div className="text-right">
                      {thread.unreadCount > 0 ? (
                        <span className="rounded-full border border-coral/25 bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral">
                          {thread.unreadCount}
                        </span>
                      ) : null}
                      <p className="mt-2 text-xs uppercase tracking-[0.12em] opacity-70">{thread.timestamp}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm opacity-85">{thread.lastMessage}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] opacity-70">{thread.status}</p>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-ink/15 bg-white px-4 py-8 text-sm text-ink/70">
                No threads match this filter yet.
              </div>
            )}
          </div>
        </UserPanel>

        <div className="space-y-4">
          <UserPanel
            eyebrow="Active thread"
            title={selectedThread?.name ?? 'No active thread'}
            description="Two-way engagement lives here, including direct replies and office escalation."
            action={(
              <button
                type="button"
                onClick={() => {
                  if (escalationNote.trim()) {
                    escalateToOffice(escalationNote.trim())
                  }
                }}
                className="kid-ghost-button inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ink/80"
              >
                <MessageCircleMore className="h-4 w-4" />
                Escalate to office
              </button>
            )}
          >
            <div className="space-y-3">
              {selectedThreadMessages.length > 0 ? (
                selectedThreadMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-[22px] border px-4 py-4 ${
                      message.sender === 'school'
                        ? 'border-teal/25 bg-teal/10'
                        : 'border-plum/25 bg-plum/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-ink">{message.author}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-ink/60">{message.timestamp}</p>
                    </div>
                    <p className="mt-2 text-sm text-ink/85">{message.body}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-ink/15 bg-white px-4 py-8 text-sm text-ink/70">
                  Choose a thread to view messages.
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 rounded-[24px] border border-ink/10 bg-white px-4 py-4">
              <p className="text-sm text-ink/80">Draft reply</p>
              <textarea
                value={draftReply}
                onChange={(event) => {
                  setDraftReply(event.target.value)
                }}
                placeholder="Write a message to the selected school thread."
                className="mt-3 h-28 w-full rounded-2xl border border-ink/10 bg-cloud/80 px-4 py-4 text-sm text-ink outline-none"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <input
                  value={escalationNote}
                  onChange={(event) => {
                    setEscalationNote(event.target.value)
                  }}
                  className="min-w-0 flex-1 rounded-full border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
                />
                <button
                  type="submit"
                  className="kid-bubble-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
                >
                  Send message
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </div>
            </form>
          </UserPanel>

          <UserPanel eyebrow="Escalation rules" title="When to use office escalation">
            <div className="space-y-3">
              <div className="rounded-[22px] border border-amber/35 bg-amber/20 px-4 py-4">
                <p className="inline-flex items-center gap-2 font-semibold text-ink">
                  <ShieldAlert className="h-4 w-4 text-amber-700" />
                  Operational escalation
                </p>
                <p className="mt-2 text-sm text-ink/80">
                  Use office escalation for pickup issues, billing disputes, absence conflicts, or anything that needs a coordinator instead of a classroom reply.
                </p>
              </div>
              <div className="rounded-[22px] border border-ink/10 bg-white px-4 py-4">
                <p className="font-semibold text-ink">Parent messaging standard</p>
                <p className="mt-2 text-sm text-ink/80">
                  Keep child-specific questions in the current thread and reserve billing or cross-household issues for shared channels. That keeps the staff side cleaner and reduces follow-up delays.
                </p>
              </div>
            </div>
          </UserPanel>
        </div>
      </div>
    </div>
  )
}
