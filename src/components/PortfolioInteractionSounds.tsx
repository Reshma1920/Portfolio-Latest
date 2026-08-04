'use client'

import { useEffect } from 'react'
import {
  playClickSound,
  preloadPortfolioSounds,
  unlockPortfolioAudio,
} from '../audio/portfolioAudio'

/** Matches nav links, buttons, anchors, and draggable hero overlay cards. */
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input:not([type="hidden"]), select, textarea, summary, article.pointer-events-auto'

export function PortfolioInteractionSounds() {
  useEffect(() => {
    preloadPortfolioSounds()

    const unlock = () => unlockPortfolioAudio()
    document.addEventListener('pointerdown', unlock, { once: true, passive: true })
    document.addEventListener('keydown', unlock, { once: true })

    const onClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest(INTERACTIVE_SELECTOR)
      if (!target || target.closest('[data-hero-canvas-cards]')) return
      playClickSound()
    }

    document.addEventListener('click', onClick, true)

    return () => {
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('keydown', unlock)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
