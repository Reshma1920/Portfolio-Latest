'use client'

import type { CSSProperties, ReactNode, RefObject } from 'react'
import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import {
  GUIDE_DOT_BACKGROUND_IMAGE,
  GUIDE_DOT_BACKGROUND_SIZE,
  HOME_GUIDE_LINE,
  HOME_GUIDE_MARKER_PX,
  HOME_GUIDE_SIDE_INSET_PX,
} from './caseStudyLayout'

type CaseStudySectionFrameProps = {
  children: ReactNode
  className?: string
  /** Dark backgrounds use light strokes so the frame stays visible. */
  tone?: 'light' | 'dark'
  /** Corner squares where horizontals meet the page verticals. Default true. */
  showMarkers?: boolean
}

/** Vertical space between major Latch sections. */
export const CASE_STUDY_SECTION_GAP_PX = 88
/** Height of the dotted horizontal band centered inside that gap. */
export const CASE_STUDY_SECTION_DOT_BAND_PX = 40

/** Mark a full-bleed band where page guide verticals must not draw. */
export const CASE_STUDY_BREAK_PAGE_VERTICALS_ATTR = 'data-break-page-verticals'

const DOT_FILL_STYLE: CSSProperties = {
  backgroundImage: GUIDE_DOT_BACKGROUND_IMAGE,
  backgroundSize: GUIDE_DOT_BACKGROUND_SIZE,
  backgroundPosition: 'center top',
}

type RailSegment = { top: number; height: number }

function railSegments(rootHeight: number, gaps: RailSegment[]): RailSegment[] {
  if (rootHeight <= 0) return []
  if (gaps.length === 0) return [{ top: 0, height: rootHeight }]

  const sorted = [...gaps]
    .map((g) => ({
      top: Math.max(0, g.top),
      height: Math.max(0, g.height),
    }))
    .sort((a, b) => a.top - b.top)

  const segs: RailSegment[] = []
  let cursor = 0
  for (const gap of sorted) {
    const gapTop = gap.top
    const gapBottom = Math.min(rootHeight, gap.top + gap.height)
    if (gapTop > cursor) {
      segs.push({ top: cursor, height: gapTop - cursor })
    }
    cursor = Math.max(cursor, gapBottom)
  }
  if (cursor < rootHeight) {
    segs.push({ top: cursor, height: rootHeight - cursor })
  }
  return segs.filter((s) => s.height > 0.5)
}

function useGuideBreakSegments(
  wrapRef: RefObject<HTMLDivElement | null>,
  setSegments: (segments: RailSegment[] | 'full') => void,
) {
  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const update = () => {
      const wr = wrap.getBoundingClientRect()
      const breaks = [
        ...document.querySelectorAll<HTMLElement>(`[${CASE_STUDY_BREAK_PAGE_VERTICALS_ATTR}]`),
      ]
      const gaps = breaks.map((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top - wr.top, height: r.height }
      })
      setSegments(railSegments(wr.height, gaps))
    }

    update()

    const ro = new ResizeObserver(update)
    ro.observe(wrap)
    const observeBreaks = () => {
      document
        .querySelectorAll<HTMLElement>(`[${CASE_STUDY_BREAK_PAGE_VERTICALS_ATTR}]`)
        .forEach((el) => ro.observe(el))
    }
    observeBreaks()

    window.addEventListener('resize', update)
    const mo = new MutationObserver(() => {
      observeBreaks()
      update()
    })
    mo.observe(document.body, { childList: true, subtree: true })
    const deferred = [100, 400, 1200].map((ms) => window.setTimeout(update, ms))

    return () => {
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener('resize', update)
      deferred.forEach((id) => window.clearTimeout(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- measure against live DOM break targets
  }, [])
}

function useGuideBreakGaps(wrapRef: RefObject<HTMLDivElement | null>) {
  const [gaps, setGaps] = useState<RailSegment[]>([])

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const update = () => {
      const wr = wrap.getBoundingClientRect()
      const breaks = [
        ...document.querySelectorAll<HTMLElement>(`[${CASE_STUDY_BREAK_PAGE_VERTICALS_ATTR}]`),
      ]
      setGaps(
        breaks.map((el) => {
          const r = el.getBoundingClientRect()
          return { top: r.top - wr.top, height: r.height }
        }),
      )
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(wrap)
    document
      .querySelectorAll<HTMLElement>(`[${CASE_STUDY_BREAK_PAGE_VERTICALS_ATTR}]`)
      .forEach((el) => ro.observe(el))
    window.addEventListener('resize', update)
    const deferred = [100, 400, 1200].map((ms) => window.setTimeout(update, ms))
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
      deferred.forEach((id) => window.clearTimeout(id))
    }
  }, [wrapRef])

  return gaps
}

/**
 * Page-level blackout over the 90px gutters (+ rail pixel) through dark bands.
 * Sits above page verticals (z-70) so nothing from the guide system peeks through.
 */
export function CaseStudyGuideBreakOverlay({
  color = '#050505',
}: {
  color?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const gaps = useGuideBreakGaps(wrapRef)

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 z-[71]"
      aria-hidden
    >
      {gaps.map((gap, i) => (
        <Fragment key={i}>
          <div
            className="absolute"
            style={{
              left: 0,
              // Cover the gutter AND the 1px page vertical at the inset
              width: HOME_GUIDE_SIDE_INSET_PX + 1,
              top: gap.top,
              height: gap.height,
              backgroundColor: color,
            }}
          />
          <div
            className="absolute"
            style={{
              right: 0,
              width: HOME_GUIDE_SIDE_INSET_PX + 1,
              top: gap.top,
              height: gap.height,
              backgroundColor: color,
            }}
          />
        </Fragment>
      ))}
    </div>
  )
}

/**
 * Full-page dotted fillers in the left/right 90px gutters.
 * Hard-breaks through any `[data-break-page-verticals]` band.
 */
export function CaseStudyPageDotGutters({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [segments, setSegments] = useState<RailSegment[] | 'full'>('full')

  useGuideBreakSegments(wrapRef, setSegments)

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-none absolute inset-0 z-[1] ${className}`}
      aria-hidden
    >
      {segments === 'full' ? (
        <>
          <div
            className="absolute inset-y-0"
            style={{ left: 0, width: HOME_GUIDE_SIDE_INSET_PX, ...DOT_FILL_STYLE }}
          />
          <div
            className="absolute inset-y-0"
            style={{ right: 0, width: HOME_GUIDE_SIDE_INSET_PX, ...DOT_FILL_STYLE }}
          />
        </>
      ) : (
        segments.map((seg, i) => (
          <Fragment key={i}>
            <div
              className="absolute"
              style={{
                left: 0,
                width: HOME_GUIDE_SIDE_INSET_PX,
                top: seg.top,
                height: seg.height,
                ...DOT_FILL_STYLE,
              }}
            />
            <div
              className="absolute"
              style={{
                right: 0,
                width: HOME_GUIDE_SIDE_INSET_PX,
                top: seg.top,
                height: seg.height,
                ...DOT_FILL_STYLE,
              }}
            />
          </Fragment>
        ))
      )}
    </div>
  )
}

/**
 * Spacer between framed sections: full gap height, with a shorter
 * dotted band centered vertically between the side gutters only
 * (does not overlap the 90px vertical dotted columns).
 */
export function CaseStudySectionGap() {
  const bandTop = (CASE_STUDY_SECTION_GAP_PX - CASE_STUDY_SECTION_DOT_BAND_PX) / 2

  return (
    <div
      className="relative w-full shrink-0"
      style={{ height: CASE_STUDY_SECTION_GAP_PX }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{
          top: bandTop,
          height: CASE_STUDY_SECTION_DOT_BAND_PX,
          width: `calc(100vw - ${HOME_GUIDE_SIDE_INSET_PX * 2}px)`,
          ...DOT_FILL_STYLE,
        }}
      />
    </div>
  )
}

/**
 * Continuous left/right guide verticals for a case study page.
 * Hard-breaks through any `[data-break-page-verticals]` band (e.g. dark Final Designs).
 */
export function CaseStudyPageVerticals({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [segments, setSegments] = useState<RailSegment[] | 'full'>('full')

  useGuideBreakSegments(wrapRef, setSegments)

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-none absolute inset-0 z-[70] ${className}`}
      aria-hidden
    >
      {segments === 'full' ? (
        <>
          <span
            className="absolute top-0 w-px"
            style={{
              left: HOME_GUIDE_SIDE_INSET_PX,
              bottom: 0,
              backgroundColor: HOME_GUIDE_LINE,
            }}
          />
          <span
            className="absolute top-0 w-px"
            style={{
              right: HOME_GUIDE_SIDE_INSET_PX,
              bottom: 0,
              backgroundColor: HOME_GUIDE_LINE,
            }}
          />
        </>
      ) : (
        segments.map((seg, i) => (
          <Fragment key={i}>
            <span
              className="absolute w-px"
              style={{
                left: HOME_GUIDE_SIDE_INSET_PX,
                top: seg.top,
                height: seg.height,
                backgroundColor: HOME_GUIDE_LINE,
              }}
            />
            <span
              className="absolute w-px"
              style={{
                right: HOME_GUIDE_SIDE_INSET_PX,
                top: seg.top,
                height: seg.height,
                backgroundColor: HOME_GUIDE_LINE,
              }}
            />
          </Fragment>
        ))
      )}
    </div>
  )
}

/**
 * Full-bleed top/bottom horizontals for a section, with black (or white) squares
 * where they meet the page vertical guides. No per-section verticals.
 */
export function CaseStudySectionFrame({
  children,
  className = '',
  tone = 'light',
  showMarkers = true,
}: CaseStudySectionFrameProps) {
  const half = HOME_GUIDE_MARKER_PX / 2
  const line = tone === 'dark' ? 'rgba(255,255,255,0.28)' : HOME_GUIDE_LINE
  const mark = tone === 'dark' ? '#ffffff' : '#000000'

  return (
    <div className={`relative ${className}`}>
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 z-[70] w-screen -translate-x-1/2"
        aria-hidden
      >
        <span
          className="absolute inset-x-0 top-0 h-px"
          style={{ backgroundColor: line }}
        />
        <span
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ backgroundColor: line }}
        />
        {showMarkers ? (
          <>
            <span
              className="absolute top-0 bg-black"
              style={{
                left: HOME_GUIDE_SIDE_INSET_PX,
                width: HOME_GUIDE_MARKER_PX,
                height: HOME_GUIDE_MARKER_PX,
                marginLeft: -half,
                marginTop: -half,
                backgroundColor: mark,
              }}
            />
            <span
              className="absolute top-0"
              style={{
                right: HOME_GUIDE_SIDE_INSET_PX,
                width: HOME_GUIDE_MARKER_PX,
                height: HOME_GUIDE_MARKER_PX,
                marginRight: -half,
                marginTop: -half,
                backgroundColor: mark,
              }}
            />
            <span
              className="absolute bottom-0"
              style={{
                left: HOME_GUIDE_SIDE_INSET_PX,
                width: HOME_GUIDE_MARKER_PX,
                height: HOME_GUIDE_MARKER_PX,
                marginLeft: -half,
                marginBottom: -half,
                backgroundColor: mark,
              }}
            />
            <span
              className="absolute bottom-0"
              style={{
                right: HOME_GUIDE_SIDE_INSET_PX,
                width: HOME_GUIDE_MARKER_PX,
                height: HOME_GUIDE_MARKER_PX,
                marginRight: -half,
                marginBottom: -half,
                backgroundColor: mark,
              }}
            />
          </>
        ) : null}
      </div>
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
