import { useCallback, useEffect, useRef, useState } from 'react'

const CORGI_SRC = '/Corgi%20SVG%20.svg'

const CLICK_MESSAGES = [
  "That's the spot!",
  "It's play time",
  'Zzz... still watching',
  'She designed me, pretty good huh',
  'I approved this design',
] as const

const ANIM_NAMES = ['happy', 'playful', 'sleepy', 'excited', 'proud'] as const

const HOVER_PHRASES = [
  'Give me some love',
  "Let's take a walk",
  "It's play time",
  'Pet me, I dare you',
  'I reviewed her portfolio too',
  'She designed me, pretty good huh',
  'Woof. You found me',
  "I'm basically her co-designer",
  'Scroll more, I follow',
  "Best portfolio ever. I'm biased",
  'She spent more time on me than her resume',
  "I've seen every version of this portfolio",
  "Don't tell her I said this, but she's good",
  'I was her first user test subject',
  'She debugged me at 2am. True story',
  'Every great designer needs a dog',
  'I approved this design',
  'My feedback made it better. Trust me',
  'Still waiting for my design credit',
  "I live here. You're just visiting",
] as const

function SpeechBubble({ children }: { children: string }) {
  return (
    <div
      className="relative cursor-default rounded-[8px] bg-[#1a1a1a] px-[14px] py-1.5 text-center text-[12px] leading-tight text-white [box-shadow:0_4px_12px_rgba(0,0,0,0.25)]"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <span className="block max-w-[min(92vw,420px)] whitespace-nowrap">{children}</span>
      <span
        className="absolute left-1/2 top-full -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent border-t-[#1a1a1a]"
        aria-hidden
      />
    </div>
  )
}

export function CorgiMascot() {
  const [lastClickState, setLastClickState] = useState<number | null>(null)
  const [activeAnim, setActiveAnim] = useState<(typeof ANIM_NAMES)[number] | null>(null)
  const [hoverPhrase, setHoverPhrase] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  const lastHoverPhraseRef = useRef<string | null>(null)
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pickHoverPhrase = useCallback(() => {
    const last = lastHoverPhraseRef.current
    const pool = HOVER_PHRASES.filter((p) => p !== last)
    const choice = pool[Math.floor(Math.random() * pool.length)]!
    lastHoverPhraseRef.current = choice
    return choice
  }, [])

  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (lastClickState === null) return
    const name = ANIM_NAMES[lastClickState]
    if (animTimerRef.current) clearTimeout(animTimerRef.current)
    setActiveAnim(name)
    animTimerRef.current = setTimeout(() => {
      setActiveAnim(null)
      animTimerRef.current = null
    }, 500)
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current)
    }
  }, [lastClickState])

  const handleClick = () => {
    setLastClickState((s) => (s === null ? 0 : (s + 1) % 5))
  }

  const handlePointerEnter = () => {
    setIsHovering(true)
    setHoverPhrase(pickHoverPhrase())
  }

  const handlePointerLeave = () => {
    setIsHovering(false)
    setHoverPhrase(null)
  }

  const animClass =
    activeAnim === 'happy'
      ? 'corgi-mascot-anim-happy'
      : activeAnim === 'playful'
        ? 'corgi-mascot-anim-playful'
        : activeAnim === 'sleepy'
          ? 'corgi-mascot-anim-sleepy'
          : activeAnim === 'excited'
            ? 'corgi-mascot-anim-excited'
            : activeAnim === 'proud'
              ? 'corgi-mascot-anim-proud'
              : ''

  const clickMessage = lastClickState !== null ? CLICK_MESSAGES[lastClickState] : null

  return (
    <>
      <style>{`
        @keyframes corgi-mascot-happy {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes corgi-mascot-playful {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes corgi-mascot-sleepy {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.9); }
        }
        @keyframes corgi-mascot-excited {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes corgi-mascot-proud {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-10deg); }
        }
        .corgi-mascot-anim-happy {
          animation: corgi-mascot-happy 0.5s ease forwards;
        }
        .corgi-mascot-anim-playful {
          animation: corgi-mascot-playful 0.5s ease forwards;
        }
        .corgi-mascot-anim-sleepy {
          animation: corgi-mascot-sleepy 0.5s ease forwards;
        }
        .corgi-mascot-anim-excited {
          animation: corgi-mascot-excited 0.5s linear forwards;
        }
        .corgi-mascot-anim-proud {
          animation: corgi-mascot-proud 0.5s ease forwards;
        }
        .corgi-mascot-img {
          transform-origin: center center;
        }
      `}</style>
      <div
        className="pointer-events-auto fixed z-[9999] flex flex-col items-center gap-2"
        style={{ bottom: 24, left: 24 }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {isHovering && hoverPhrase ? <SpeechBubble>{hoverPhrase}</SpeechBubble> : null}
        {clickMessage ? <SpeechBubble>{clickMessage}</SpeechBubble> : null}
        <button
          type="button"
          onClick={handleClick}
          className="cursor-pointer border-0 bg-transparent p-0"
          aria-label="Corgi mascot"
        >
          <img
            src={CORGI_SRC}
            alt=""
            width={100}
            draggable={false}
            className={`corgi-mascot-img block h-auto w-[100px] max-w-[100px] select-none ${animClass}`}
          />
        </button>
      </div>
    </>
  )
}
