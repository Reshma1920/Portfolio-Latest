'use client'

import type { RefObject } from 'react'
import { useLayoutEffect, useState } from 'react'

export type GuideFrameMetrics = {
  /** Viewport width excluding scrollbar. */
  width: number
  /** Fixed overlay top (viewport coords). */
  top: number
  /** Fixed overlay height. */
  height: number
  /** Parsed `--guide-side-inset` in px. */
  inset: number
}

const EMPTY: GuideFrameMetrics = { width: 0, top: 0, height: 0, inset: 0 }

function readGuideInsetPx(): number {
  if (typeof window === 'undefined') return 0
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--guide-side-inset').trim()
  return parseFloat(raw) || 0
}

/**
 * Pin section frame horizontals + corner markers to the viewport so they never
 * drift on horizontal overscroll or sub-pixel layout shifts.
 */
export function useGuideFrameMetrics(frameRef: RefObject<HTMLElement | null>) {
  const [metrics, setMetrics] = useState<GuideFrameMetrics>(EMPTY)

  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const update = () => {
      const rect = frame.getBoundingClientRect()
      setMetrics({
        width: document.documentElement.clientWidth,
        top: rect.top,
        height: rect.height,
        inset: readGuideInsetPx(),
      })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update)
    }
  }, [frameRef])

  return metrics
}
