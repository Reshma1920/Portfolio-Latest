'use client'

import { SiteNav, SiteNavSpacer } from './SiteNav'
import { HeroAmbientPixels } from './HeroAmbientPixels'

const HERO_SIDE_INSET_PX = 90
const NAV_SPACER_PX = 57
/** Distance from viewport bottom to the hero horizontal rule. */
const HERO_LINE_BOTTOM_OFFSET_PX = 90

function HeroGuideCornerMarkers() {
  const cornerClass = 'pointer-events-none absolute z-[20] h-2 w-2 border-solid border-black'
  const inset = `${HERO_SIDE_INSET_PX}px`
  const navTop = `${NAV_SPACER_PX}px`
  const ruleBottom = `${HERO_LINE_BOTTOM_OFFSET_PX}px`

  return (
    <div className="pointer-events-none absolute inset-0 z-[20]" aria-hidden>
      <span
        className={`${cornerClass} border-l-[1px] border-t-[1px]`}
        style={{ left: inset, top: navTop }}
      />
      <span
        className={`${cornerClass} border-r-[1px] border-t-[1px]`}
        style={{ right: inset, top: navTop }}
      />
      <span
        className={`${cornerClass} border-b-[1px] border-l-[1px]`}
        style={{ left: inset, bottom: ruleBottom }}
      />
      <span
        className={`${cornerClass} border-b-[1px] border-r-[1px]`}
        style={{ right: inset, bottom: ruleBottom }}
      />
    </div>
  )
}

export function CinematicHero() {
  const heroContentMinHeight = `calc(100vh - ${NAV_SPACER_PX}px - ${HERO_LINE_BOTTOM_OFFSET_PX}px - 1px)`

  return (
    <div
      id="home"
      className="relative min-h-screen w-full overflow-x-hidden text-foreground"
    >
      <SiteNav variant="home" />
      <SiteNavSpacer />
      <HeroAmbientPixels
        topOffsetPx={NAV_SPACER_PX}
        bottomOffsetPx={HERO_LINE_BOTTOM_OFFSET_PX + 1}
        sideInsetPx={HERO_SIDE_INSET_PX}
      />
      <HeroGuideCornerMarkers />

      <div
        className="pointer-events-none absolute z-10 flex justify-center pb-[40px]"
        style={{
          top: `${NAV_SPACER_PX}px`,
          bottom: `${HERO_LINE_BOTTOM_OFFSET_PX + 1}px`,
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
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <span
              className="absolute inset-y-0 w-px bg-[#e0e0e0]"
              style={{ left: `${HERO_SIDE_INSET_PX}px` }}
            />
            <span
              className="absolute inset-y-0 w-px bg-[#e0e0e0]"
              style={{ right: `${HERO_SIDE_INSET_PX}px` }}
            />
          </div>

          <header
            className="relative w-full text-center"
            style={{
              paddingLeft: `${HERO_SIDE_INSET_PX}px`,
              paddingRight: `${HERO_SIDE_INSET_PX}px`,
            }}
          >
            <div className="flex flex-col items-center">
              <span className="animate-fade-rise inline-flex rounded-none bg-[rgba(107,53,184,0.12)] px-[11px] py-1.5 font-dmSans text-[15px] font-medium leading-none text-[#6B35B8]">
                {'//Product Designer'}
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
                4+ years building for Enterprise B2B. Simplifying human experiences for complex systems
                by connecting data, workflows and decisions.
              </p>
            </div>
          </header>
        </div>
      </section>

      <div
        className="pointer-events-none absolute inset-x-0 z-10"
        style={{ bottom: `${HERO_LINE_BOTTOM_OFFSET_PX}px` }}
        aria-hidden
      >
        <div className="h-px w-full bg-[#e0e0e0]" />
      </div>
    </div>
  )
}
