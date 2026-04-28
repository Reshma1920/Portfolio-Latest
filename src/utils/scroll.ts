function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Smooth in-page navigation; respects prefers-reduced-motion. */
export function scrollToSectionId(id: 'home' | 'work'): void {
  const el = document.getElementById(id)
  const behavior = prefersReducedMotion() ? ('auto' as const) : ('smooth' as const)
  el?.scrollIntoView({ behavior, block: 'start' })
  window.history.replaceState(null, '', `#${id}`)
}
