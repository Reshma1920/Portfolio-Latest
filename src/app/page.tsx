'use client'

import { CinematicHero } from '../components/CinematicHero'
import { PageCursorPixels } from '../components/PageCursorPixels'
import { PortfolioInteractionSounds } from '../components/PortfolioInteractionSounds'
import { ScrollToTop } from '../components/ScrollToTop'
import { WorkSection } from '../components/WorkSection'

export default function HomePage() {
  return (
    <>
      <PortfolioInteractionSounds />
      <ScrollToTop />

      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[#F7F6F2]"
        aria-hidden
      />
      <PageCursorPixels />
      <div className="relative z-[2] overflow-x-hidden">
        <CinematicHero />
        {/* Mobile-only horizontal inset (16px); md:contents removes wrapper box on desktop. */}
        <div className="min-w-0 max-md:px-4 md:contents">
          <WorkSection />
        </div>
      </div>
    </>
  )
}

