import { BentoGrid } from './BentoGrid'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4'

const navLinkClass = 'text-sm text-muted transition-colors hover:text-foreground'
const navLinkActive =
  'inline-flex items-center rounded-[12px] border-[1.5px] border-[#111] bg-transparent px-3.5 py-1.5 text-sm text-foreground transition-colors'

export function CinematicHero() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-black text-foreground">
      {/* Fullscreen video background */}
      <div className="absolute inset-0 z-0">
        <video
          className="absolute inset-0 h-full w-full min-h-full min-w-full object-cover"
          style={{ objectPosition: '50% 50%' }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      </div>

      {/* Floating nav */}
      <div className="relative z-20 px-3 pt-4 sm:px-5 sm:pt-5">
        <nav className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 rounded-[16px] bg-[#F7F6F2] px-7 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]">
          <a
            href="#"
            className="font-display text-3xl tracking-tight text-[#000000]"
            style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
          >
            Reshma
          </a>

          <div className="flex max-w-full flex-1 flex-wrap items-center justify-end gap-x-8 gap-y-3 md:flex-initial md:justify-end">
            <a href="#" className={navLinkActive}>
              Home
            </a>
            <a href="#work" className={navLinkClass}>
              Work
            </a>
            <a href="#resume" className={navLinkClass}>
              Resume
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              className={navLinkClass}
            >
              LinkedIn
            </a>
            <a href="#ai-playground" className={navLinkClass}>
              AI Playground
            </a>
          </div>
        </nav>
      </div>

      {/* Hero */}
      <header
        className="relative z-10 flex flex-col items-center justify-center px-5 pb-[156px] text-center"
        style={{ paddingTop: 'calc(8rem - 79px)' }}
      >
        <h1
          className="animate-fade-rise max-w-7xl font-display text-5xl font-normal text-[#000000] sm:text-7xl md:text-8xl"
          style={{
            lineHeight: 0.95,
            letterSpacing: '-2.46px',
            fontFamily: '"Instrument Serif", Georgia, serif',
          }}
        >
          Designing for{' '}
          <em className="italic">people,</em> in an{' '}
          <em className="italic">AI-first </em>
          world.
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-[18px] leading-relaxed text-[#646464] sm:text-[20px]">
          Simplifying human experiences for complex systems by connecting data,
          workflows, and decisions.
        </p>
      </header>

      <BentoGrid />
    </div>
  )
}
