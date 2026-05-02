import type { MouseEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { BentoGrid } from './BentoGrid'
import { scrollToSectionId } from '../utils/scroll'

const RESUME_HREF = '/resume.pdf'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4'

const navLinkClass = 'text-sm text-muted transition-colors hover:text-foreground'

/** Same box for active + inactive so border + color can ease without layout jump */
const navPillBase =
  'inline-flex items-center rounded-[12px] border-[1.5px] px-3.5 py-1.5 text-sm transition-[color,border-color,background-color,box-shadow] duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0'
const navPillInactive = `${navPillBase} border-transparent bg-transparent text-muted hover:text-foreground`
const navPillActive = `${navPillBase} border-[#111] bg-transparent text-foreground`

function onNavAnchor(
  dest: 'home' | 'work',
  event: MouseEvent<HTMLAnchorElement>,
) {
  event.preventDefault()
  scrollToSectionId(dest)
}

function computeWorkSectionActive(work: HTMLElement): boolean {
  const r = work.getBoundingClientRect()
  const vh = window.innerHeight
  // Stable band: activates as work clears the hero; deactivates when scrolled well past.
  const enter = r.top < vh * 0.5 && r.bottom > vh * 0.18
  return enter
}

function HamburgerIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      className="text-[#000000]"
      aria-hidden
    >
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function CinematicHero() {
  const [activeNav, setActiveNav] = useState<'home' | 'work'>(() =>
    typeof window !== 'undefined' && window.location.hash === '#work'
      ? 'work'
      : 'home',
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navShellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.location.hash !== '#work') return
    setActiveNav('work')
    requestAnimationFrame(() => scrollToSectionId('work'))
  }, [])

  useEffect(() => {
    const work = document.getElementById('work')
    if (!work) return

    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setActiveNav(computeWorkSectionActive(work) ? 'work' : 'home')
      })
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const el = navShellRef.current
      if (el && !el.contains(e.target as Node)) setMobileMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [mobileMenuOpen])

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  function onMobileNavAnchor(
    dest: 'home' | 'work',
    event: MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault()
    closeMobileMenu()
    scrollToSectionId(dest)
  }

  return (
    <div
      id="home"
      className="relative min-h-screen w-full overflow-x-hidden bg-black text-foreground"
    >
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

      {/* viewport-fixed rail (explicitly not position:sticky — avoids quirks with overflow/stacking).
          Stays visibly on top while scrolling through Home + Work. */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] px-4 md:top-5 md:px-5">
        <div ref={navShellRef} className="pointer-events-auto relative mx-auto w-full max-w-7xl">
          <nav
            className={`flex w-full flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-5 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out motion-reduce:transition-none md:px-7 ${
              activeNav === 'work'
                ? 'border border-black/[0.08] bg-[rgba(247,246,242,0.48)] backdrop-blur-[18px] backdrop-saturate-150 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.75)]'
                : 'border border-transparent bg-[#F7F6F2] shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]'
            }`}
            aria-label="Primary"
          >
            <a
              href="#home"
              className="font-display text-3xl tracking-tight text-[#000000] transition-colors duration-300 ease-out motion-reduce:transition-none"
              style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
              onClick={(e) => onNavAnchor('home', e)}
            >
              Reshma Lokanathan
            </a>

            <div className="hidden max-w-full flex-1 flex-wrap items-center justify-end gap-x-8 gap-y-3 md:flex md:flex-initial md:justify-end">
              <a
                href="#home"
                className={activeNav === 'home' ? navPillActive : navPillInactive}
                onClick={(e) => onNavAnchor('home', e)}
              >
                Home
              </a>
              <a
                href="#work"
                className={activeNav === 'work' ? navPillActive : navPillInactive}
                onClick={(e) => onNavAnchor('work', e)}
              >
                Work
              </a>
              <a
                href="https://www.linkedin.com/in/reshma-lokanathan19/"
                target="_blank"
                rel="noopener noreferrer"
                className={navLinkClass}
              >
                LinkedIn
              </a>
              <a
                href="https://reshma-lok.framer.website/ai-playground"
                target="_blank"
                rel="noopener noreferrer"
                className={navLinkClass}
              >
                AI Playground
              </a>
            </div>

            <button
              type="button"
              className="flex md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="primary-mobile-nav"
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              <HamburgerIcon />
            </button>
          </nav>

          <div
            id="primary-mobile-nav"
            aria-hidden={!mobileMenuOpen}
            className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-out motion-reduce:transition-none ${
              mobileMenuOpen
                ? 'max-h-[min(80vh,560px)]'
                : 'pointer-events-none max-h-0'
            }`}
          >
            <div className="mt-2 overflow-hidden rounded-2xl border border-black/10 bg-[#F7F6F2] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <a
                href="#home"
                className="block border-b border-black/10 px-4 py-4 font-sans text-sm text-[#000000] hover:bg-black/[0.04]"
                onClick={(e) => onMobileNavAnchor('home', e)}
              >
                Home
              </a>
              <a
                href="#work"
                className="block border-b border-black/10 px-4 py-4 font-sans text-sm text-[#000000] hover:bg-black/[0.04]"
                onClick={(e) => onMobileNavAnchor('work', e)}
              >
                Work
              </a>
              <a
                href={RESUME_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="block border-b border-black/10 px-4 py-4 font-sans text-sm text-[#000000] hover:bg-black/[0.04]"
                onClick={closeMobileMenu}
              >
                Resume
              </a>
              <a
                href="https://www.linkedin.com/in/reshma-lokanathan19/"
                target="_blank"
                rel="noopener noreferrer"
                className="block border-b border-black/10 px-4 py-4 font-sans text-sm text-[#000000] hover:bg-black/[0.04]"
                onClick={closeMobileMenu}
              >
                LinkedIn
              </a>
              <a
                href="https://reshma-lok.framer.website/ai-playground"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-4 font-sans text-sm text-[#000000] hover:bg-black/[0.04]"
                onClick={closeMobileMenu}
              >
                AI Playground
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Matches prior in-flow spacing: inset (top offset) + ~76px nav bar */}
      <div
        aria-hidden
        className="relative z-10 min-h-[calc(16px+76px)] shrink-0 sm:min-h-[calc(20px+76px)]"
      />

      {/* Hero */}
      <header
        className="relative z-10 flex flex-col items-center justify-center px-5 pb-[112px] text-center"
        style={{ paddingTop: 'calc(8rem - 79px + 44px)' }}
      >
        <span className="animate-fade-rise mb-3 inline-flex rounded-[999px] bg-[rgba(107,53,184,0.12)] px-[11px] py-1.5 font-dmSans text-[13px] font-medium leading-none text-[#6B35B8]">
          Product Designer
        </span>
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
