'use client'

import { HeroPixelTorch } from './HeroPixelTorch'
import { HOME_GUIDE_SIDE_PADDING_CLASS } from '../case-studies/caseStudyLayout'

const HERO_IMAGE_SRC = '/Hero%20image.png'

export function PortfolioFooter() {
  return (
    <footer
      className="relative z-10 w-screen max-w-none"
      style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
      aria-label="Site footer"
    >
      <div className="relative">
        <HeroPixelTorch
          src={HERO_IMAGE_SRC}
          alt=""
          className="h-[clamp(220px,38vw,520px)] w-full"
        />
        <p
          className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center font-display text-5xl font-normal text-white sm:text-6xl md:text-7xl"
          style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
          aria-hidden
        >
          Fin.
        </p>
        <div
          className={`absolute inset-x-0 bottom-0 z-[3] flex items-baseline justify-between gap-6 pb-6 font-dmSans text-[14px] font-normal text-white ${HOME_GUIDE_SIDE_PADDING_CLASS}`}
        >
          <p>Reshma Lokanathan • 2026</p>
          <p className="shrink-0 text-right">Atlanta, GA</p>
        </div>
      </div>
    </footer>
  )
}
