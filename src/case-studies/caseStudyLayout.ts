/** Matches home SiteNav + WorkSection horizontal rhythm. */
export const PAGE_HORIZONTAL_OUTER_CLASS = 'px-3 sm:px-5'

export const PAGE_SHELL_MAX_WIDTH_CLASS = 'max-w-7xl'

export const PAGE_SHELL_INNER_PADDING_CLASS = 'px-[40px]'

export const pageShellInnerClass = `mx-auto w-full ${PAGE_SHELL_MAX_WIDTH_CLASS} ${PAGE_SHELL_INNER_PADDING_CLASS}`

/** Inner content column (nav, main, dark-section insets). */
export const caseStudyContainerClass = pageShellInnerClass

/** Full-width gutter around case study main column. */
export const caseStudyPageOuterClass = PAGE_HORIZONTAL_OUTER_CLASS

export const caseStudyMainClass = `${pageShellInnerClass} pb-28`
