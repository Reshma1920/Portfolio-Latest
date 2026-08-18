'use client'

import { useEffect } from 'react'

/**
 * Portfolio is vertical-scroll only. Clip + lock window.scrollX so trackpad /
 * touch horizontal pans cannot shift the page. Nested `.overflow-x-auto`
 * regions (e.g. tables) are left alone.
 */
export function LockHorizontalScroll() {
  useEffect(() => {
    const isNestedHorizontalScroll = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false
      return Boolean(target.closest('.overflow-x-auto, .overflow-x-scroll'))
    }

    const snapX = () => {
      if (window.scrollX !== 0) {
        window.scrollTo(0, window.scrollY)
      }
    }

    const onWheel = (event: WheelEvent) => {
      if (event.deltaX === 0) return
      if (isNestedHorizontalScroll(event.target)) return
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
        event.preventDefault()
      }
    }

    let touchStartX = 0
    let touchStartY = 0

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      touchStartX = touch.clientX
      touchStartY = touch.clientY
    }

    const onTouchMove = (event: TouchEvent) => {
      if (isNestedHorizontalScroll(event.target)) return
      const touch = event.touches[0]
      if (!touch) return
      const dx = Math.abs(touch.clientX - touchStartX)
      const dy = Math.abs(touch.clientY - touchStartY)
      if (dx > dy && dx > 6) {
        event.preventDefault()
      }
    }

    snapX()
    window.addEventListener('scroll', snapX, { passive: true })
    window.addEventListener('resize', snapX)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      window.removeEventListener('scroll', snapX)
      window.removeEventListener('resize', snapX)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return null
}
