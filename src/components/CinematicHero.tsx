'use client'

import {
  HOME_GUIDE_SIDE_INSET_PX,
} from '../case-studies/caseStudyLayout'
import { SiteNav, SiteNavSpacer } from './SiteNav'

const HERO_SIDE_INSET_PX = HOME_GUIDE_SIDE_INSET_PX
const NAV_SPACER_PX = 57
/** Distance from viewport bottom to the top rule of the footer meta band. */
const HERO_BAND_TOP_FROM_BOTTOM_PX = 90
/** Distance from viewport bottom to the bottom rule of the footer meta band. */
const HERO_BAND_BOTTOM_FROM_BOTTOM_PX = 24
/** Width of the left/right meta cells between the outer guides. */
const HERO_SIDE_CELL_PX = 220
const GUIDE_LINE = '#D6D6D6'
/** Solid black square centered on each guide intersection. */
const GUIDE_MARKER_PX = 6

const labelClass =
  'font-dmSans text-[12px] font-medium tracking-[-0.01em] text-[#646464] sm:text-[13px]'

/**
 * Technical guide frame for the hero:
 * - Horizontals run edge-to-edge
 * - Verticals run from the top of the screen (through the nav) through the footer band
 * - Footer band is split into small | long | small cells with black squares at every intersection
 */
function HeroGuideFrame() {
  const inset = HERO_SIDE_INSET_PX
  const half = GUIDE_MARKER_PX / 2
  const topRule = NAV_SPACER_PX
  const bandTop = HERO_BAND_TOP_FROM_BOTTOM_PX
  const bandBottom = HERO_BAND_BOTTOM_FROM_BOTTOM_PX
  const sideCell = HERO_SIDE_CELL_PX

  const markers: Array<{ left: number | string; top: number | string }> = [
    // Top frame corners (below nav)
    { left: inset, top: topRule },
    { left: `calc(100% - ${inset}px)`, top: topRule },
    // Footer band markers (left→right): bottom, top, top, bottom
    { left: inset + sideCell, top: `calc(100% - ${bandTop}px)` },
    { left: `calc(100% - ${inset + sideCell}px)`, top: `calc(100% - ${bandTop}px)` },
    { left: inset, top: `calc(100% - ${bandBottom}px)` },
    { left: `calc(100% - ${inset}px)`, top: `calc(100% - ${bandBottom}px)` },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 z-[70]" aria-hidden>
      {/* Top horizontal — full bleed */}
      <span
        className="absolute inset-x-0 h-px"
        style={{ top: topRule, backgroundColor: GUIDE_LINE }}
      />
      {/* Footer band — top horizontal */}
      <span
        className="absolute inset-x-0 h-px"
        style={{ bottom: bandTop, backgroundColor: GUIDE_LINE }}
      />
      {/* Footer band — bottom horizontal */}
      <span
        className="absolute inset-x-0 h-px"
        style={{ bottom: bandBottom, backgroundColor: GUIDE_LINE }}
      />

      {/* Outer left vertical — top of screen through band */}
      <span
        className="absolute top-0 w-px"
        style={{
          left: inset,
          bottom: bandBottom,
          backgroundColor: GUIDE_LINE,
        }}
      />
      {/* Outer right vertical — top of screen through band */}
      <span
        className="absolute top-0 w-px"
        style={{
          right: inset,
          bottom: bandBottom,
          backgroundColor: GUIDE_LINE,
        }}
      />

      {/* Inner left cell divider (band only) */}
      <span
        className="absolute w-px"
        style={{
          left: inset + sideCell,
          bottom: bandBottom,
          height: bandTop - bandBottom,
          backgroundColor: GUIDE_LINE,
        }}
      />
      {/* Inner right cell divider (band only) */}
      <span
        className="absolute w-px"
        style={{
          right: inset + sideCell,
          bottom: bandBottom,
          height: bandTop - bandBottom,
          backgroundColor: GUIDE_LINE,
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

function HeroFooterBand() {
  const bandHeight = HERO_BAND_TOP_FROM_BOTTOM_PX - HERO_BAND_BOTTOM_FROM_BOTTOM_PX

  return (
    <div
      className="absolute inset-x-0 z-[15] flex items-center"
      style={{
        bottom: HERO_BAND_BOTTOM_FROM_BOTTOM_PX,
        height: bandHeight,
        paddingLeft: HERO_SIDE_INSET_PX,
        paddingRight: HERO_SIDE_INSET_PX,
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

export function CinematicHero() {
  const heroContentMinHeight = `calc(100vh - ${NAV_SPACER_PX}px - ${HERO_BAND_TOP_FROM_BOTTOM_PX}px - 1px)`

  return (
    <div
      id="home"
      className="relative min-h-screen w-full text-foreground"
    >
      <SiteNav variant="home" />
      <SiteNavSpacer />
      <HeroGuideFrame />
      <HeroFooterBand />

      <div
        className="pointer-events-none absolute z-10 flex justify-center pb-[40px]"
        style={{
          top: `${NAV_SPACER_PX}px`,
          bottom: `${HERO_BAND_TOP_FROM_BOTTOM_PX + 1}px`,
          left: 0,
          width: `${HERO_SIDE_INSET_PX}px`,
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
            className="relative z-10 w-full text-center"
            style={{
              paddingLeft: `${HERO_SIDE_INSET_PX}px`,
              paddingRight: `${HERO_SIDE_INSET_PX}px`,
            }}
          >
            <div className="flex flex-col items-center">
              <span className="animate-fade-rise inline-flex rounded-none bg-[rgba(107,53,184,0.12)] px-[11px] py-1.5 font-dmSans text-[15px] font-medium leading-none text-[#6B35B8]">
                Building fast, failing early.
              </span>
              <h1
                className="animate-fade-rise mt-[26px] font-display text-[56px] font-normal text-[#000000] sm:text-[68px] md:text-[80px] lg:text-[88px] xl:text-[96px]"
                style={{
                  lineHeight: 1.06,
                  letterSpacing: '-1.65px',
                  fontFamily: '"Instrument Serif", Georgia, serif',
                }}
              >
                <span className="block">
                  Designing for <em className="italic">people,</em>
                </span>
                <span className="block">
                  in an <em className="italic">AI-first </em>world.
                </span>
              </h1>
              <p className="animate-fade-rise-delay mt-10 max-w-xl text-[15px] leading-relaxed text-[#646464] sm:text-[16px] md:text-[16px] md:leading-relaxed lg:text-[17px]">
                Simplifying human experiences for complex systems by connecting data, workflows and
                decisions.
              </p>
            </div>
          </header>
        </div>
      </section>
    </div>
  )
}
