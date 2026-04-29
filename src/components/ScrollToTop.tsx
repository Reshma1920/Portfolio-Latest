import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Runs before browser paint on each navigation so the window starts at the top. */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
