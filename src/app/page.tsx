'use client'

import { useCallback, useState } from 'react'
import { CinematicHero } from '../components/CinematicHero'
import { PageCursorPixels } from '../components/PageCursorPixels'
import { PortfolioInteractionSounds } from '../components/PortfolioInteractionSounds'
import { PortfolioLoader } from '../components/PortfolioLoader'
import { ScrollToTop } from '../components/ScrollToTop'
import { AboutSection } from '../components/AboutSection'
import { WorkSection } from '../components/WorkSection'

export default function HomePage() {
  const [introDone, setIntroDone] = useState(false)
  const completeIntro = useCallback(() => setIntroDone(true), [])

  return (
    <>
      {!introDone ? <PortfolioLoader onComplete={completeIntro} /> : null}
      <PortfolioInteractionSounds />
      <ScrollToTop />

      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[#F7F6F2]"
        aria-hidden
      />
      {introDone ? <PageCursorPixels /> : null}
      <div
        className={`relative z-[2] overflow-x-hidden ${introDone ? '' : 'invisible'}`}
        aria-hidden={!introDone}
      >
        <CinematicHero reveal={introDone} />
        {introDone ? (
          <div className="min-w-0 max-md:px-4 md:contents">
            <WorkSection />
            <AboutSection />
          </div>
        ) : null}
      </div>
    </>
  )
}

