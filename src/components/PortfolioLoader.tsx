'use client'

import { useEffect } from 'react'

/** Exact symbols, left → right. */
const SYMBOLS = ['✦', '✺', '✦'] as const

const TOTAL_MS = 1500

const HERO_TYPE = {
  fontFamily: '"Instrument Serif", Georgia, serif',
  lineHeight: 1,
  letterSpacing: '-1.65px',
} as const

type PortfolioLoaderProps = {
  onComplete: () => void
}

export function PortfolioLoader({ onComplete }: PortfolioLoaderProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const doneAt = reduced ? 0 : TOTAL_MS

    const timer = window.setTimeout(() => {
      document.body.style.overflow = previousOverflow
      onComplete()
    }, doneAt)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = previousOverflow
    }
  }, [onComplete])

  return (
    <div
      className="loader-overlay fixed inset-0 z-[200] flex items-center justify-center bg-[#F7F6F2]"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex items-center justify-center gap-6 px-6 sm:gap-8 md:gap-10">
        {SYMBOLS.map((symbol, i) => (
          <span
            key={`${symbol}-${i}`}
            className="loader-symbol font-display text-[28px] font-normal leading-none text-black sm:text-[39px] md:text-[50px] lg:text-[62px]"
            style={{
              ...HERO_TYPE,
              animationDelay: `${(TOTAL_MS / SYMBOLS.length) * i}ms`,
            }}
            aria-hidden
          >
            {symbol}
          </span>
        ))}
      </div>
    </div>
  )
}
