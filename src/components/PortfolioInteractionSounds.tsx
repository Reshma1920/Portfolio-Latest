'use client'

import { useEffect } from 'react'
import {
  playClickSound,
  playHoverSound,
  preloadPortfolioSounds,
  unlockPortfolioAudio,
} from '../audio/portfolioAudio'

/** Matches nav links, buttons, anchors, and draggable hero overlay cards. */
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input:not([type="hidden"]), select, textarea, summary, article.pointer-events-auto'

function isEnteringInteractive(target: Element, related: EventTarget | null): boolean {
  if (!(related instanceof Node)) return true
  return !target.contains(related)
}

export function PortfolioInteractionSounds() {
  useEffect(() => {
    preloadPortfolioSounds()

    const unlock = () => unlockPortfolioAudio()
    document.addEventListener('pointerdown', unlock, { once: true, passive: true })
    document.addEventListener('keydown', unlock, { once: true })

    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as Element).closest(INTERACTIVE_SELECTOR)
      if (!target || target.closest('[data-hero-canvas-cards]')) return
      if (!isEnteringInteractive(target, e.relatedTarget)) return
      playHoverSound()
    }

    const onClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest(INTERACTIVE_SELECTOR)
      if (!target || target.closest('[data-hero-canvas-cards]')) return
      playClickSound()
    }

    document.addEventListener('mouseover', onMouseOver, true)
    document.addEventListener('click', onClick, true)

    return () => {
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('keydown', unlock)
      document.removeEventListener('mouseover', onMouseOver, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
