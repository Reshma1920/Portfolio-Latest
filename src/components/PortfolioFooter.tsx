'use client'

import { HeroPixelTorch } from './HeroPixelTorch'

const HERO_IMAGE_SRC = '/Hero%20image.png'

export function PortfolioFooter() {
  return (
    <footer
      className="relative z-10 w-screen max-w-none pb-12 md:pb-16"
      style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
      aria-label="Site footer"
    >
      <HeroPixelTorch
        src={HERO_IMAGE_SRC}
        alt=""
        className="h-[clamp(220px,38vw,520px)] w-full"
      />
    </footer>
  )
}
