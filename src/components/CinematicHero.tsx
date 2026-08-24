'use client'

import { useEffect, useState } from 'react'
import {
  HOME_GUIDE_SIDE_INSET_VAR,
  HOME_GUIDE_SIDE_PADDING_CLASS,
} from '../case-studies/caseStudyLayout'
import { SiteNav, SiteNavSpacer } from './SiteNav'

const NAV_SPACER_PX = 68
/** Distance from viewport bottom to the top rule of the footer meta band. */
const HERO_BAND_TOP_FROM_BOTTOM_PX = 90
/** Distance from viewport bottom to the bottom rule of the footer meta band. */
const HERO_BAND_BOTTOM_FROM_BOTTOM_PX = 24
/** Width of the left/right meta cells between the outer guides. */
const HERO_SIDE_CELL_PX = 220
const GUIDE_LINE = '#D6D6D6'
/** Solid black square centered on each guide intersection. */
const GUIDE_MARKER_PX = 6
/** Max corner radius at full hero scroll (px). */
const HERO_CORNER_RADIUS_MAX_PX = 56
/** Padding above the hero panel bottom edge once labels are inside the box. */
const HERO_LABEL_INSET_PX = 14
/** Fixed row height for the DEI / HCDE meta labels. */
const HERO_LABEL_ROW_PX = 28

const labelClass =
  'font-dmSans text-[12px] font-medium tracking-[-0.01em] text-[#646464] sm:text-[13px]'

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/** 0 at top of hero → 1 when leaving hero for work. */
function useHeroScrollProgress(): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    let ticking = false

    const update = () => {
      ticking = false
      const home = document.getElementById('home')
      const work = document.getElementById('work')
      if (!home || !work) return

      const homeTop = home.getBoundingClientRect().top + window.scrollY
      const workTop = work.getBoundingClientRect().top + window.scrollY
      const probe = window.scrollY + window.innerHeight * 0.35
      const span = workTop - homeTop
      setProgress(span > 0 ? clamp01((probe - homeTop) / span) : 0)
    }

    const schedule = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(update)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return progress
}

/**
 * Technical guide frame for the hero:
 * - Inner hero panel border morphs sharp → rounded on scroll (SVG rect)
 * - Horizontals in gutters + footer band; verticals split around the morphing panel
 */
function HeroGuideFrame({ cornerRadius }: { cornerRadius: number }) {
  const inset = HOME_GUIDE_SIDE_INSET_VAR
  const half = GUIDE_MARKER_PX / 2
  const topRule = NAV_SPACER_PX
  const bandTop = HERO_BAND_TOP_FROM_BOTTOM_PX

  const markers: Array<{ left: string; top: number | string }> = [
    { left: inset, top: topRule },
    { left: `calc(100% - ${inset})`, top: topRule },
    { left: inset, top: `calc(100% - ${bandTop}px)` },
    { left: `calc(100% - ${inset})`, top: `calc(100% - ${bandTop}px)` },
  ]

  const lineStyle = { backgroundColor: GUIDE_LINE }

  return (
    <div className="pointer-events-none absolute inset-0 z-[70] hidden lg:block" aria-hidden>
      {/* Gutter horizontals — inner panel edges are drawn by the morphing SVG rect */}
      <span
        className="absolute left-0 h-px"
        style={{ top: topRule, width: inset, ...lineStyle }}
      />
      <span
        className="absolute right-0 h-px"
        style={{ top: topRule, width: inset, ...lineStyle }}
      />
      <span
        className="absolute left-0 h-px"
        style={{ bottom: bandTop, width: inset, ...lineStyle }}
      />
      <span
        className="absolute right-0 h-px"
        style={{ bottom: bandTop, width: inset, ...lineStyle }}
      />

      {/* Outer verticals — nav column + meta band, continuing to hero bottom */}
      <span
        className="absolute w-px"
        style={{ left: inset, top: 0, height: topRule, ...lineStyle }}
      />
      <span
        className="absolute w-px"
        style={{
          left: inset,
          bottom: 0,
          height: bandTop,
          ...lineStyle,
        }}
      />
      <span
        className="absolute w-px"
        style={{ right: inset, top: 0, height: topRule, ...lineStyle }}
      />
      <span
        className="absolute w-px"
        style={{
          right: inset,
          bottom: 0,
          height: bandTop,
          ...lineStyle,
        }}
      />

      {/* Hero panel — border morphs sharp → rounded on scroll */}
      <div
        className="absolute box-border"
        style={{
          left: inset,
          top: topRule,
          right: inset,
          bottom: bandTop,
          border: `1px solid ${GUIDE_LINE}`,
          borderRadius: cornerRadius,
        }}
      />

      {markers.map((marker, i) => (
        <span
          key={i}
          className="absolute bg-black"
          style={{
            width: GUIDE_MARKER_PX,
            height: GUIDE_MARKER_PX,
            left: marker.left,
            top: marker.top,
            marginLeft: -half,
            marginTop: -half,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Meta labels start below the hero panel bottom rule, then rise into the
 * panel (still along its bottom edge) as the hero scrolls.
 */
function HeroFooterBand({ progress }: { progress: number }) {
  const bandHeight = HERO_BAND_TOP_FROM_BOTTOM_PX - HERO_BAND_BOTTOM_FROM_BOTTOM_PX
  // Vertically center the label row inside the meta band at rest.
  const startBottom =
    HERO_BAND_BOTTOM_FROM_BOTTOM_PX + (bandHeight - HERO_LABEL_ROW_PX) / 2
  // Inside the hero box: sit just above the bottom border.
  const endBottom = HERO_BAND_TOP_FROM_BOTTOM_PX + HERO_LABEL_INSET_PX
  const bottom = startBottom + progress * (endBottom - startBottom)

  return (
    <div
      className="absolute inset-x-0 z-[75] hidden items-center lg:flex"
      style={{
        bottom,
        height: HERO_LABEL_ROW_PX,
        paddingLeft: HOME_GUIDE_SIDE_INSET_VAR,
        paddingRight: HOME_GUIDE_SIDE_INSET_VAR,
        willChange: 'bottom',
      }}
    >
      <p
        className={`${labelClass} flex h-full items-center justify-center text-center`}
        style={{ width: HERO_SIDE_CELL_PX, paddingInline: 16 }}
      >
        2026 DEI award
      </p>
      <div className="min-w-0 flex-1" aria-hidden />
      <p
        className={`${labelClass} flex h-full items-center justify-center text-center`}
        style={{ width: HERO_SIDE_CELL_PX, paddingInline: 16 }}
      >
        MS HCDE @UW
      </p>
    </div>
  )
}

export function CinematicHero({ reveal = true }: { reveal?: boolean }) {
  const heroScrollProgress = useHeroScrollProgress()
  const cornerRadius = heroScrollProgress * HERO_CORNER_RADIUS_MAX_PX
  const heroContentMinHeight = `calc(100vh - ${NAV_SPACER_PX}px - ${HERO_BAND_TOP_FROM_BOTTOM_PX}px - 1px)`
  const enterClass = reveal ? 'animate-fade-rise' : 'opacity-0'

  return (
    <div
      id="home"
      className="relative min-h-screen w-full text-foreground"
    >
      <SiteNav variant="home" />
      <SiteNavSpacer />
      <HeroGuideFrame cornerRadius={cornerRadius} />
      <HeroFooterBand progress={heroScrollProgress} />

      <div
        className="pointer-events-none absolute z-10 hidden justify-center pb-[40px] lg:flex"
        style={{
          top: `${NAV_SPACER_PX}px`,
          bottom: `${HERO_BAND_TOP_FROM_BOTTOM_PX + 1}px`,
          left: 0,
          width: HOME_GUIDE_SIDE_INSET_VAR,
        }}
        aria-hidden
      >
        <p
          className="font-dmSans text-[11px] leading-relaxed text-[#646464] sm:text-[12px] md:text-[12px] md:leading-relaxed lg:text-[13px]"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}
        >
          Made with Cursor and Claude
        </p>
      </div>

      <section
        className="relative z-10"
        style={{ minHeight: `calc(100vh - ${NAV_SPACER_PX}px)` }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ minHeight: heroContentMinHeight }}
        >
          <header
            className={`relative z-10 w-full text-center ${HOME_GUIDE_SIDE_PADDING_CLASS}`}
          >
            <div className="flex flex-col items-center">
              <span className={`${enterClass} inline-flex rounded-none bg-[rgba(107,53,184,0.12)] px-[11px] py-1.5 font-dmSans text-[15px] font-medium leading-none text-[#6B35B8]`}>
                Building fast, failing early.
              </span>
              <h1
                className={`group ${enterClass} mt-[26px] cursor-default font-display text-[45px] font-normal text-[#000000] sm:text-[54px] md:text-[64px] lg:text-[70px] xl:text-[77px]`}
                style={{
                  lineHeight: 1.06,
                  letterSpacing: '-1.65px',
                  fontFamily: '"Instrument Serif", Georgia, serif',
                }}
              >
                <span className="block">
                  <span
                    className="inline-flex w-0 items-center justify-center overflow-hidden align-middle text-[0.6em] leading-none text-[#6B35B8] opacity-0 transition-[width,opacity,margin] duration-300 ease-out group-hover:mr-[0.22em] group-hover:w-[0.75em] group-hover:opacity-100"
                    aria-hidden
                  >
                    ✦
                  </span>
                  Designing trust between
                </span>
                <span className="block">
                  <em className="italic">people</em> and{' '}
                  <em className="italic">intelligent</em>
                  <span
                    className="inline-flex w-0 items-center justify-center overflow-hidden align-middle text-[0.6em] leading-none text-[#6B35B8] opacity-0 transition-[width,opacity,margin] duration-300 ease-out group-hover:mx-[0.12em] group-hover:w-[0.75em] group-hover:opacity-100"
                    aria-hidden
                  >
                    ✺
                  </span>
                  <em className="italic"> systems</em>.
                </span>
              </h1>
            </div>
          </header>
        </div>
      </section>
    </div>
  )
}
