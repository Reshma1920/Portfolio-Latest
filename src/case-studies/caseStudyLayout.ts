/** Matches home SiteNav + WorkSection horizontal rhythm. */
export const PAGE_HORIZONTAL_OUTER_CLASS = 'px-3 sm:px-5'

/** Home technical guide: inset from viewport edges to the outer vertical rules. */
export const HOME_GUIDE_SIDE_INSET_PX = 90
/** Large desktop (≥1500px only) — see `--guide-side-inset` in index.css. */
export const HOME_GUIDE_SIDE_INSET_LG_PX = 210
export const HOME_GUIDE_SIDE_INSET_BREAKPOINT_PX = 1500

/** Responsive inset via CSS custom property (90px default; 210px at 1500px+ only). */
export const HOME_GUIDE_SIDE_INSET_VAR = 'var(--guide-side-inset)'

/** Tailwind horizontal padding aligned to guide verticals (md+ uses CSS var). */
export const HOME_GUIDE_SIDE_PADDING_CLASS =
  'px-5 sm:px-8 md:pl-[calc(var(--guide-side-inset)+40px)] md:pr-[calc(var(--guide-side-inset)+40px)]'

/** Flush to guide verticals — work cards, meta strips (no inner 40px offset). */
export const HOME_GUIDE_SIDE_FLUSH_CLASS =
  'px-5 sm:px-8 md:px-[var(--guide-side-inset)]'

export const guideSideInsetPlus = (px: number) =>
  px === 0 ? HOME_GUIDE_SIDE_INSET_VAR : `calc(${HOME_GUIDE_SIDE_INSET_VAR} + ${px}px)`

export const guideContentWidthBetweenRails = `calc(100% - 2 * ${HOME_GUIDE_SIDE_INSET_VAR})`

/** Horizontal breathing room inside the guide rails. */
export const CASE_STUDY_CONTENT_GUTTER_CLASS = 'px-5 sm:px-8 lg:px-10'

/**
 * Section padding — matches Latch “Research Overview” (px/pt/pb reference).
 */
export const CASE_STUDY_SECTION_INNER_CLASS = 'px-6 pb-6 pt-14 sm:px-8'
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

/** Inner content column for dark full-bleed bands — stays between guide rails. */
export const caseStudyContainerClass = `mx-[var(--guide-side-inset)] w-[calc(100%-2*var(--guide-side-inset))] max-w-[calc(100%-2*var(--guide-side-inset))] px-5 sm:px-8 md:px-10`

/** Full-width gutter around case study main column — no extra px; guides define rhythm. */
export const caseStudyPageOuterClass = 'px-0'

/** Case study body: pinned between guide verticals from md+ (90px inset; 210px at 1500px+). */
export const caseStudyMainClass = `w-full pb-28 px-5 sm:px-8 md:mx-[var(--guide-side-inset)] md:w-[calc(100%-2*var(--guide-side-inset))] md:max-w-[calc(100%-2*var(--guide-side-inset))] md:px-10`
