/** Matches home SiteNav + WorkSection horizontal rhythm. */
export const PAGE_HORIZONTAL_OUTER_CLASS = 'px-3 sm:px-5'

/** Home technical guide: inset from viewport edges to the outer vertical rules. */
export const HOME_GUIDE_SIDE_INSET_PX = 90
/** Solid black square centered on guide intersections / active nav marks. */
export const HOME_GUIDE_MARKER_PX = 6
export const HOME_GUIDE_LINE = '#D6D6D6'

/**
 * Shared dotted fill used on Latch gutters/gaps (and referenced for hero type language).
 * Keep these values identical wherever the guide-dot field appears.
 */
export const GUIDE_DOT_BACKGROUND_IMAGE =
  'radial-gradient(circle, rgba(158,158,150,0.55) 0.65px, transparent 0.7px)'
export const GUIDE_DOT_BACKGROUND_SIZE = '7px 7px'

export const PAGE_SHELL_MAX_WIDTH_CLASS = 'max-w-7xl'

export const PAGE_SHELL_INNER_PADDING_CLASS = 'px-[40px]'

export const pageShellInnerClass = `mx-auto w-full ${PAGE_SHELL_MAX_WIDTH_CLASS} ${PAGE_SHELL_INNER_PADDING_CLASS}`

/** Inner content column (nav, main, dark-section insets). */
export const caseStudyContainerClass = pageShellInnerClass

/** Full-width gutter around case study main column. */
export const caseStudyPageOuterClass = PAGE_HORIZONTAL_OUTER_CLASS

export const caseStudyMainClass = `${pageShellInnerClass} pb-28`
