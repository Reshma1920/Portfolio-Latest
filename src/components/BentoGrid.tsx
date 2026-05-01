import { useEffect, useRef, useState } from 'react'
import { scrollToSectionId } from '../utils/scroll'

const BUBBLE_USER = 'border border-white/25 bg-[rgba(92,92,92,0.1)]'
const BUBBLE_ASSISTANT = 'border border-white/25 bg-[rgba(92,92,92,0.08)]'

/** Glassmorphic chat card — backdrop + 0.15 surface, border/shadow aligned with prior bento cards */
const chatCardClass =
  'flex min-h-0 min-w-0 flex-col rounded-[24px] border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.15)] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.12)] backdrop-blur-[9px]'

/** Glassmorphic accent: design-system purple #6B35B8 → teal #0F3D3E */
const glassAccentIconBadge =
  'bg-gradient-to-br from-[#6B35B8]/40 via-[#3d3566]/28 to-[#0F3D3E]/44 backdrop-blur-md border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_2px_12px_rgba(15,61,62,0.2)] text-[#14141c]'

type AssistantPayload =
  | { type: 'text'; text: string }
  | { type: 'bullets'; lines: string[] }

type QaId = 'default' | 'career' | 'about' | 'ai-tools'

type QaItem = {
  id: QaId
  question: string
  answer: AssistantPayload
}

const QA_ITEMS: QaItem[] = [
  {
    id: 'default',
    question: "What can you do that AI can't?",
    answer: {
      type: 'text',
      text:
        'I read the room. I know when to push, when to listen, and what to cut. Most of my best design decisions came from conversations, disagreements, and figuring things out in the middle of the mess.',
    },
  },
  {
    id: 'career',
    question: 'Career highlights',
    answer: {
      type: 'bullets',
      lines: [
        '° 12-step workflow consolidated into 1 unified system for 500K+ users',
        '° Reduced loan processing time from 25 days to 8 days — a 68% improvement',
        '° 0 → 1 AI product shipped in 10 weeks',
      ],
    },
  },
  {
    id: 'about',
    question: 'Tell me about yourself',
    answer: {
      type: 'text',
      text:
        'Generalist Product Designer looking for unique product challenges. I bring structure to ambiguous problems and help shape products as they take form.',
    },
  },
  {
    id: 'ai-tools',
    question: 'Do you use AI tools?',
    answer: {
      type: 'text',
      text:
        "Yes, I'm always learning and experimenting with AI. I actually built this portfolio with Cursor in 3 days.",
    },
  },
]

function UserAvatar() {
  return (
    <div
      className={`flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full ${glassAccentIconBadge}`}
      aria-hidden
    >
      <svg
        className="h-4 w-4 text-[#14141c]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="8" r="3.5" />
        <path
          d="M4 20.5c0-3.3 2.5-5.5 8-5.5s8 2.2 8 5.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function IconSendPlane({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M2.01 21L23 12 2.01 3v7l15 2-15 2v7Z" />
    </svg>
  )
}

function scrollToWorkSection() {
  scrollToSectionId('work')
}

function AssistantBlock({ payload }: { payload: AssistantPayload }) {
  return (
    <div className="mr-auto w-full max-w-full sm:max-w-md">
      <p className="pl-[2.125rem] font-sans text-xs text-black/55">
        Reshma Lokanathan
      </p>
      <div className="mt-1 flex gap-1.5">
        <img
          src="/avatar-reshma.png"
          alt="Reshma"
          className="h-7 w-7 shrink-0 rounded-full border border-white/30 object-cover object-top [box-shadow:inset_0_1px_0_rgba(255,255,255,0.15)]"
          width={28}
          height={28}
          loading="lazy"
          decoding="async"
        />
        {payload.type === 'text' ? (
          <div
            className={`min-w-0 max-w-md flex-1 rounded-2xl rounded-bl-md px-2.5 py-1.5 text-[15px] leading-snug [text-wrap:pretty] text-black ${BUBBLE_ASSISTANT} [box-shadow:inset_0_1px_0_rgba(255,255,255,0.1)]`}
          >
            {payload.text}
          </div>
        ) : (
          <ul
            className={`min-w-0 max-w-md flex-1 list-none rounded-2xl rounded-bl-md px-2.5 py-1.5 text-[15px] leading-snug [text-wrap:pretty] text-black ${BUBBLE_ASSISTANT} [box-shadow:inset_0_1px_0_rgba(255,255,255,0.1)]`}
          >
            {payload.lines.map((line) => (
              <li key={line} className="mt-1 first:mt-0">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const FADE_MS = 300

export function BentoGrid() {
  const [activeId, setActiveId] = useState<QaId>('default')
  const [panelOpacity, setPanelOpacity] = useState(1)
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
    }
  }, [])

  const active = QA_ITEMS.find((q) => q.id === activeId) ?? QA_ITEMS[0]
  const inactivePills = QA_ITEMS.filter((q) => q.id !== activeId)

  function handlePillClick(targetId: QaId) {
    if (targetId === activeId) return

    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)

    setPanelOpacity(0)

    fadeTimeoutRef.current = setTimeout(() => {
      setActiveId(targetId)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPanelOpacity(1))
      })
      fadeTimeoutRef.current = null
    }, FADE_MS)
  }

  return (
    <section
      className="relative z-10 mx-auto w-full min-h-0 max-w-7xl px-3 pb-4 sm:px-5"
      aria-label="Chat introduction"
    >
      <div className="-mt-24 min-h-0 lg:-mt-[52px]">
        <div className="mx-auto w-[min(40vw,calc(100%-1.5rem))]">
          <div className={`${chatCardClass}`}>
            <div className="shrink-0" aria-live="polite">
              <div
                className="flex shrink-0 flex-col gap-6 pb-5 transition-opacity duration-300 ease-out"
                style={{ opacity: panelOpacity }}
              >
                <div className="min-h-0 shrink-0">
                  <div className="ml-auto flex w-full items-end justify-end gap-2">
                    <p
                      className={`w-fit max-w-[min(100%,20rem)] rounded-2xl rounded-br-md px-2.5 py-1.5 text-left text-[15px] leading-snug [text-wrap:pretty] text-black [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)] ${BUBBLE_USER}`}
                    >
                      {active.question}
                    </p>
                    <UserAvatar />
                  </div>
                </div>
                <div className="min-h-0 shrink-0 overflow-hidden">
                  <AssistantBlock payload={active.answer} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex shrink-0 flex-col gap-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {inactivePills.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePillClick(item.id)}
                    className="rounded-lg border border-[rgba(255,255,255,0.2)] bg-transparent px-[14px] py-[6px] font-sans text-[13px] text-black transition-colors hover:bg-[rgba(0,0,0,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                  >
                    {item.question}
                  </button>
                ))}
              </div>

              <div
                className={`flex min-h-0 shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.08)] ${BUBBLE_ASSISTANT} border border-white/20`}
              >
                <input
                  type="text"
                  readOnly
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#333333] placeholder:text-[#333333] focus:outline-none focus:ring-0"
                  placeholder="Ask me anything..."
                  aria-label="Ask me anything (preview)"
                />
                <button
                  type="button"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#6B35B8] to-[#0F3D3E] text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  aria-label="Send"
                  onClick={scrollToWorkSection}
                >
                  <IconSendPlane />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
