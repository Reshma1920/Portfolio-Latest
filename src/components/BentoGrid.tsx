import type { ReactNode } from 'react'

const BUBBLE_USER = 'border border-white/25 bg-[rgba(92,92,92,0.1)]'
const BUBBLE_ASSISTANT = 'border border-white/25 bg-[rgba(92,92,92,0.08)]'

const bentoCardClass =
  'min-h-0 flex flex-col rounded-[24px] border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.12)] backdrop-blur-[8px]'

/** Glassmorphic accent: design-system purple #6B35B8 → teal #0F3D3E (matches CTA / send button) */
const glassAccentIconBadge =
  'bg-gradient-to-br from-[#6B35B8]/40 via-[#3d3566]/28 to-[#0F3D3E]/44 backdrop-blur-md border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_2px_12px_rgba(15,61,62,0.2)] text-[#14141c]'

function IconTrophy() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-[#14141c]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M6 4h12v2a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V4Z" />
      <path d="M9 14h6v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2Z" />
      <path d="M5 4H4a1 1 0 0 0-1 1v1a3 3 0 0 0 2 2.83M19 4h1a1 1 0 0 1 1 1v1a3 3 0 0 1-2 2.83" />
    </svg>
  )
}

function IconTools() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-[#14141c]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

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

const highlights: string[] = [
  '12-step workflow → 1 unified system for 500K+ users',
  '30% fewer errors across 2,000+ banking accounts',
  '0 → 1 AI product shipped in 10 weeks',
]

function BentoOuter({ children }: { children: ReactNode }) {
  return <div className="-mt-16 min-h-0">{children}</div>
}

export function BentoGrid() {
  return (
    <section
      className="relative z-10 mx-auto w-full min-h-0 max-w-7xl px-3 pb-4 sm:px-5"
      aria-label="Featured work and skills"
    >
      <BentoOuter>
        <div className="grid min-h-0 w-full auto-rows-min grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch lg:gap-4">
          {/* Bento 1: left, height = content; row height sets right column */}
          <div
            className={`${bentoCardClass} w-full self-start max-lg:min-h-[20rem] lg:min-h-0`}
          >
            <div className="flex flex-col max-lg:min-h-0">
              <div className="shrink-0">
                <div className="ml-auto flex w-full items-end justify-end gap-2">
                  <p
                    className={`w-fit max-w-[min(100%,20rem)] rounded-2xl rounded-br-md px-2.5 py-1.5 text-left text-base leading-snug [text-wrap:pretty] text-black [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)] ${BUBBLE_USER}`}
                  >
                    Reshma, tell me about yourself!
                  </p>
                  <UserAvatar />
                </div>
              </div>
              <div className="mt-8 shrink-0">
                <div className="mr-auto flex w-full max-w-full flex-col gap-1 sm:max-w-md">
                  <p className="pl-[2.125rem] font-sans text-xs text-black/55">
                    Reshma Lokanathan
                  </p>
                  <div className="flex gap-1.5">
                    <img
                      src="/avatar-reshma.png"
                      alt="Reshma"
                      className="h-7 w-7 shrink-0 rounded-full border border-white/30 object-cover object-top [box-shadow:inset_0_1px_0_rgba(255,255,255,0.15)]"
                      width={28}
                      height={28}
                      loading="lazy"
                      decoding="async"
                    />
                    <div
                      className={`min-w-0 max-w-md flex-1 rounded-2xl rounded-bl-md px-2.5 py-1.5 text-base leading-snug [text-wrap:pretty] text-black ${BUBBLE_ASSISTANT} [box-shadow:inset_0_1px_0_rgba(255,255,255,0.1)]`}
                    >
                      Generalist designer looking for unique product challenges. I bring
                      structure to ambiguous problems and help shape products as they take
                      form.
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`mt-[60px] flex min-h-0 shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.08)] ${BUBBLE_ASSISTANT} border border-white/20`}
              >
                <input
                  type="text"
                  readOnly
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#333333] placeholder:text-[#333333] focus:outline-none focus:ring-0"
                  placeholder="Ask me anything..."
                  aria-label="Chat input (preview)"
                />
                <button
                  type="button"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#6B35B8] to-[#0F3D3E] text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  aria-label="Send"
                >
                  <IconSendPlane />
                </button>
              </div>
            </div>
          </div>

          {/* Bento 2 + 3: right column; total height matches B1 (grid stretch) */}
          <div className="flex min-h-0 w-full flex-col gap-4 lg:h-full">
            <div
              className={`${bentoCardClass} min-h-0 flex flex-1 flex-col overflow-hidden lg:min-h-0 lg:overflow-auto`}
            >
              <div className="mb-1.5 flex min-h-0 items-center gap-1.5">
                <span
                  className={`inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 ${glassAccentIconBadge}`}
                  aria-hidden
                >
                  <IconTrophy />
                </span>
                <h2 className="font-sans text-sm font-semibold text-[#000000] sm:text-base">
                  Career Highlights
                </h2>
              </div>
              <ul className="flex min-h-0 flex-1 flex-col justify-center gap-3.5 text-sm sm:gap-4 sm:text-base">
                {highlights.map((line) => (
                  <li
                    key={line}
                    className="leading-relaxed [text-wrap:pretty] text-black"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`${bentoCardClass} shrink-0`}>
              <div className="mb-1.5 flex items-center gap-1.5">
                <span
                  className={`inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 ${glassAccentIconBadge}`}
                  aria-hidden
                >
                  <IconTools />
                </span>
                <h2 className="font-sans text-sm font-semibold text-[#000000] sm:text-base">
                  Skills
                </h2>
              </div>
              <p className="m-0 text-sm leading-relaxed text-black sm:text-base [text-wrap:pretty]">
                Everything a designer needs! Anything else, I&apos;ll pick it up.
              </p>
            </div>
          </div>
        </div>
      </BentoOuter>
    </section>
  )
}
