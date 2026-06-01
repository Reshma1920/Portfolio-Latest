'use client'

import { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'

/** Runs before browser paint on each navigation so the window starts at the top. */
export function ScrollToTop() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
