import { useCallback, useEffect, useRef, useState } from 'react'

/** Corgi 1–6.svg (spaces encoded for URL) */
const CORGI_SRC = [
  '/Corgi%201.svg',
  '/Corgi%202.svg',
  '/Corgi%203.svg',
  '/Corgi%204.svg',
  '/Corgi%205.svg',
  '/Corgi%206.svg',
] as const

const CLICK_MESSAGES = [
  'She designed me, pretty good huh',
  'Still waiting for my design credit',
  "It's play time",
  'Zzz... still watching',
  'I approved this design',
] as const

const GREETING_FIRST = 'Hi!'
const GREETING_SECOND = 'I take my guarding duties very seriously'

type AnimKind = 'bounce' | 'wiggle' | 'sleepy' | 'nod'

const CLICK_ANIM_SEQUENCE: Array<AnimKind | null> = [
  'bounce',
  null,
  'wiggle',
  'sleepy',
  'nod',
]

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
  "I've seen every version of this portfolio",
  "Don't tell her I said this, but she's good",
  'I was her first user test subject',
  'Every great designer needs a dog',
  'I approved this design',
  'My feedback made it better. Trust me',
  'Still waiting for my design credit',
  "I live here. You're just visiting",
  'Hired for cuteness. Stayed for the design',
  "I've reviewed every pixel. Approved",
  "Don't scroll too fast. You'll miss the good parts",
  'She prototypes. I prototype naps',
  'This portfolio passed my sniff test',
  'Woof means wow in dog',
  'Every scroll brings you closer to hiring her',
  'I guard the work. She does the work. Team effort',
  "If you're a recruiter, stay a while",
  "I've been here since version 1",
  "You seem nice. She'd probably like to hear from you",
] as const

function SpeechBubble({ children }: { children: string }) {
  return (
    <div
      className="relative cursor-default rounded-[8px] bg-[#1a1a1a] px-[14px] py-1.5 text-center text-[12px] leading-tight text-white [box-shadow:0_4px_12px_rgba(0,0,0,0.25)]"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <span className="block max-w-[min(92vw,420px)] whitespace-nowrap">{children}</span>
      <span
        className="absolute left-[24px] top-full border-x-[6px] border-t-[7px] border-x-transparent border-t-[#1a1a1a]"
        aria-hidden
      />
    </div>
  )
}

export function WanderingPuppy() {
  const [clickStep, setClickStep] = useState<number | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [hoverPhrase, setHoverPhrase] = useState<string | null>(null)
  const [clickOverridesHover, setClickOverridesHover] = useState(false)
  const [activeAnim, setActiveAnim] = useState<AnimKind | null>(null)
  const [greetingText, setGreetingText] = useState<string | null>(null)

  const hoverRef = useRef(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastHoverPhraseRef = useRef<string | null>(null)
  const greetingTimerIdsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const greetingTextRef = useRef<string | null>(null)
  const clickStepRef = useRef<number | null>(null)
  const hoverRotationOrderRef = useRef<string[] | null>(null)
  const rotationIndexRef = useRef(0)
  const idleBubbleDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastIdleCorgiRef = useRef<number | null>(null)

  const [idleRotationText, setIdleRotationText] = useState<string | null>(null)
  const [idleRotationCorgiIndex, setIdleRotationCorgiIndex] = useState<number | null>(
    null,
  )

  const clearGreetingTimers = useCallback(() => {
    greetingTimerIdsRef.current.forEach(clearTimeout)
    greetingTimerIdsRef.current = []
  }, [])

  const suppressGreeting = useCallback(() => {
    clearGreetingTimers()
    setGreetingText(null)
  }, [clearGreetingTimers])

  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }

  const armIdleTimer = useCallback(() => {
    clearIdleTimer()
    idleTimerRef.current = setTimeout(() => {
      if (hoverRef.current) return
      setClickStep(null)
      setActiveAnim(null)
      idleTimerRef.current = null
    }, 2000)
  }, [])

  const pickHoverPhrase = useCallback(() => {
    const last = lastHoverPhraseRef.current
    const pool = HOVER_PHRASES.filter((p) => p !== last)
    const choice = pool[Math.floor(Math.random() * pool.length)]!
    lastHoverPhraseRef.current = choice
    return choice
  }, [])

  useEffect(() => {
    greetingTextRef.current = greetingText
  }, [greetingText])

  useEffect(() => {
    clickStepRef.current = clickStep
  }, [clickStep])

  useEffect(() => {
    const phrases = [...HOVER_PHRASES]
    for (let i = phrases.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const t = phrases[i]!
      phrases[i] = phrases[j]!
      phrases[j] = t
    }
    hoverRotationOrderRef.current = phrases

    const tick = () => {
      if (hoverRef.current) return
      if (greetingTextRef.current) return
      if (clickStepRef.current !== null) return

      const order = hoverRotationOrderRef.current
      if (!order?.length) return

      const idx = rotationIndexRef.current % order.length
      rotationIndexRef.current++
      const phrase = order[idx]!

      const prevCorgi = lastIdleCorgiRef.current
      let corgiIdx = Math.floor(Math.random() * CORGI_SRC.length)
      if (prevCorgi !== null) {
        while (corgiIdx === prevCorgi) {
          corgiIdx = Math.floor(Math.random() * CORGI_SRC.length)
        }
      }
      lastIdleCorgiRef.current = corgiIdx

      if (idleBubbleDismissRef.current) {
        clearTimeout(idleBubbleDismissRef.current)
        idleBubbleDismissRef.current = null
      }
      setIdleRotationCorgiIndex(corgiIdx)
      setIdleRotationText(phrase)
      idleBubbleDismissRef.current = window.setTimeout(() => {
        setIdleRotationText(null)
        setIdleRotationCorgiIndex(null)
        idleBubbleDismissRef.current = null
      }, 3000)
    }

    const intervalId = window.setInterval(tick, 10_000)
    return () => {
      clearInterval(intervalId)
      if (idleBubbleDismissRef.current) {
        clearTimeout(idleBubbleDismissRef.current)
        idleBubbleDismissRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const schedule = (delay: number, fn: () => void) => {
      const id = window.setTimeout(fn, delay)
      greetingTimerIdsRef.current.push(id)
      return id
    }

    schedule(1000, () => setGreetingText(GREETING_FIRST))
    schedule(4000, () => setGreetingText(GREETING_SECOND))
    schedule(7000, () => setGreetingText(null))

    return () => {
      greetingTimerIdsRef.current.forEach(clearTimeout)
      greetingTimerIdsRef.current = []
    }
  }, [])

  useEffect(() => {
    return () => clearIdleTimer()
  }, [])

  useEffect(() => {
    if (clickStep === null) return undefined
    const t = CLICK_ANIM_SEQUENCE[clickStep]
    if (!t) {
      setActiveAnim(null)
      return undefined
    }
    setActiveAnim(t)
    const id = window.setTimeout(() => setActiveAnim(null), 500)
    return () => clearTimeout(id)
  }, [clickStep])

  const handlePointerEnter = () => {
    suppressGreeting()
    hoverRef.current = true
    setIsHovering(true)
    setClickOverridesHover(false)
    setHoverPhrase(pickHoverPhrase())
    clearIdleTimer()
  }

  const handlePointerLeave = () => {
    hoverRef.current = false
    setIsHovering(false)
    setHoverPhrase(null)
    setClickOverridesHover(false)
    armIdleTimer()
  }

  const handleClick = () => {
    suppressGreeting()
    setClickOverridesHover(true)
    setClickStep((s) => (s === null ? 0 : (s + 1) % 5))
    if (!hoverRef.current) armIdleTimer()
    else clearIdleTimer()
  }

  const displayedSrc = isHovering
    ? CORGI_SRC[2]
    : clickStep !== null
      ? CORGI_SRC[clickStep + 1]
      : idleRotationCorgiIndex !== null
        ? CORGI_SRC[idleRotationCorgiIndex]
        : CORGI_SRC[2]

  const animClass =
    activeAnim === 'bounce'
      ? 'wandering-puppy-anim-bounce'
      : activeAnim === 'wiggle'
        ? 'wandering-puppy-anim-wiggle'
        : activeAnim === 'sleepy'
          ? 'wandering-puppy-anim-sleepy'
          : activeAnim === 'nod'
            ? 'wandering-puppy-anim-nod'
            : ''

  const visibleBubble = (() => {
    if (isHovering && hoverPhrase && !clickOverridesHover) return hoverPhrase
    if (clickStep !== null && (clickOverridesHover || !isHovering)) {
      return CLICK_MESSAGES[clickStep]
    }
    if (greetingText) return greetingText
    if (idleRotationText) return idleRotationText
    return null
  })()

  return (
    <>
      <style>{`
        @keyframes wandering-puppy-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes wandering-puppy-wiggle {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes wandering-puppy-sleepy {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.9); }
        }
        @keyframes wandering-puppy-nod {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-10deg); }
        }
        .wandering-puppy-anim-bounce {
          animation: wandering-puppy-bounce 0.5s ease forwards;
        }
        .wandering-puppy-anim-wiggle {
          animation: wandering-puppy-wiggle 0.5s ease forwards;
        }
        .wandering-puppy-anim-sleepy {
          animation: wandering-puppy-sleepy 0.5s ease-in-out forwards;
        }
        .wandering-puppy-anim-nod {
          animation: wandering-puppy-nod 0.5s ease forwards;
        }
        .wandering-puppy-img {
          transform-origin: center center;
        }
      `}</style>
      <div
        className="pointer-events-auto fixed z-[9999] cursor-pointer overflow-visible"
        style={{ bottom: 32, left: 32, width: 100, height: 100 }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {visibleBubble ? (
          <div className="pointer-events-none absolute bottom-[110px] left-0 z-[1] w-max max-w-[min(92vw,420px)]">
            <SpeechBubble>{visibleBubble}</SpeechBubble>
          </div>
        ) : null}
        <button
          type="button"
          onClick={handleClick}
          className="absolute bottom-0 left-0 flex h-[100px] w-[100px] cursor-pointer items-center justify-center border-0 bg-transparent p-0"
          aria-label="Corgi mascot"
        >
          <img
            src={displayedSrc}
            alt=""
            width={100}
            height={100}
            draggable={false}
            className={`wandering-puppy-img block h-[100px] w-[100px] max-h-[100px] max-w-[100px] object-contain select-none ${animClass}`}
          />
        </button>
      </div>
    </>
  )
}
