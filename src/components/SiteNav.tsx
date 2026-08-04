'use client'

import type { MouseEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { scrollToSectionId } from '../utils/scroll'
import {
  HOME_GUIDE_MARKER_PX,
  HOME_GUIDE_SIDE_INSET_PX,
} from '../case-studies/caseStudyLayout'

const RESUME_HREF = '/resume.pdf'

const navLinkClass =
  'text-sm text-muted transition-colors duration-300 ease-out hover:text-foreground motion-reduce:transition-none'
const navLinkActiveClass =
  'text-sm text-foreground transition-colors duration-300 ease-out motion-reduce:transition-none'

/** Solid bar — always opaque so content never shows through while scrolling */
const navBarSurfaceClass = 'bg-[#F7F6F2]'

function computeWorkSectionActive(work: HTMLElement): boolean {
  const r = work.getBoundingClientRect()
  const vh = window.innerHeight
  const enter = r.top < vh * 0.5 && r.bottom > vh * 0.18
  return enter
}

function HamburgerIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" className="text-[#000000]" aria-hidden>
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function NavActiveMark() {
  return (
    <span
      className="inline-block shrink-0 bg-black"
      style={{ width: HOME_GUIDE_MARKER_PX, height: HOME_GUIDE_MARKER_PX }}
      aria-hidden
    />
  )
}

function NavItemLabel({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      {active ? <NavActiveMark /> : null}
      {children}
    </span>
  )
}

type SiteNavProps = {
  variant: 'home' | 'case-study'
}

export function SiteNav({ variant }: SiteNavProps) {
  const pathname = usePathname()
  const isCaseStudy = variant === 'case-study'
  const onCaseStudyRoute = pathname === '/latch' || pathname === '/hdfc'
  const atWorkAnchor =
    pathname === '/' &&
    typeof window !== 'undefined' &&
    (window.location.hash === '#work' || window.location.hash.startsWith('#work'))

  const [homeScrollNav, setHomeScrollNav] = useState<'home' | 'work'>(() =>
    typeof window !== 'undefined' && window.location.hash === '#work' ? 'work' : 'home',
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navShellRef = useRef<HTMLDivElement>(null)

  const homeActive = isCaseStudy
    ? pathname === '/' && !atWorkAnchor && !onCaseStudyRoute
    : homeScrollNav === 'home'
  const workActive = isCaseStudy
    ? onCaseStudyRoute || atWorkAnchor
    : homeScrollNav === 'work'

  useEffect(() => {
    if (isCaseStudy) return
    if (window.location.hash !== '#work') return
    setHomeScrollNav('work')
    requestAnimationFrame(() => scrollToSectionId('work'))
  }, [isCaseStudy])

  useEffect(() => {
    if (isCaseStudy) return

    const work = document.getElementById('work')
    if (!work) return

    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setHomeScrollNav(computeWorkSectionActive(work) ? 'work' : 'home')
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
  }, [isCaseStudy])

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

  function onHomeAnchor(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    closeMobileMenu()
    scrollToSectionId('home')
  }

  function onWorkAnchor(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    closeMobileMenu()
    scrollToSectionId('work')
  }

  const nameLink = isCaseStudy ? (
    <Link
      href="/"
      className="shrink-0 text-[#000000] transition-colors duration-300 ease-out hover:text-foreground motion-reduce:transition-none"
      style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
      onClick={closeMobileMenu}
    >
      <span className="font-display text-[17px] font-normal leading-[1.12] tracking-[-0.02em] sm:text-[18px] md:text-[20px]">
        Reshma Lokanathan
      </span>
    </Link>
  ) : (
    <a
      href="#home"
      className="shrink-0 text-[#000000] transition-colors duration-300 ease-out hover:text-foreground motion-reduce:transition-none"
      style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
      onClick={onHomeAnchor}
    >
      <span className="font-display text-[17px] font-normal leading-[1.12] tracking-[-0.02em] sm:text-[18px] md:text-[20px]">
        Reshma Lokanathan
      </span>
    </a>
  )

  const homeLink = isCaseStudy ? (
    <Link
      href="/"
      aria-current={homeActive ? 'page' : undefined}
      className={homeActive ? navLinkActiveClass : navLinkClass}
      onClick={closeMobileMenu}
    >
      <NavItemLabel active={homeActive}>Home</NavItemLabel>
    </Link>
  ) : (
    <a
      href="#home"
      aria-current={homeActive ? 'page' : undefined}
      className={homeActive ? navLinkActiveClass : navLinkClass}
      onClick={onHomeAnchor}
    >
      <NavItemLabel active={homeActive}>Home</NavItemLabel>
    </a>
  )

  const workLink = isCaseStudy ? (
    <Link
      href="/#work"
      aria-current={workActive ? 'page' : undefined}
      className={workActive ? navLinkActiveClass : navLinkClass}
      onClick={closeMobileMenu}
    >
      <NavItemLabel active={workActive}>Work</NavItemLabel>
    </Link>
  ) : (
    <a
      href="#work"
      aria-current={workActive ? 'page' : undefined}
      className={workActive ? navLinkActiveClass : navLinkClass}
      onClick={onWorkAnchor}
    >
      <NavItemLabel active={workActive}>Work</NavItemLabel>
    </a>
  )

  const mobileHomeLink = isCaseStudy ? (
    <Link
      href="/"
      className={`inline-flex py-3 font-sans ${homeActive ? navLinkActiveClass : navLinkClass}`}
      onClick={closeMobileMenu}
    >
      <NavItemLabel active={homeActive}>Home</NavItemLabel>
    </Link>
  ) : (
    <a
      href="#home"
      className={`inline-flex py-3 font-sans ${homeActive ? navLinkActiveClass : navLinkClass}`}
      onClick={onHomeAnchor}
    >
      <NavItemLabel active={homeActive}>Home</NavItemLabel>
    </a>
  )

  const mobileWorkLink = isCaseStudy ? (
    <Link
      href="/#work"
      className={`inline-flex py-3 font-sans ${workActive ? navLinkActiveClass : navLinkClass}`}
      onClick={closeMobileMenu}
    >
      <NavItemLabel active={workActive}>Work</NavItemLabel>
    </Link>
  ) : (
    <a
      href="#work"
      className={`inline-flex py-3 font-sans ${workActive ? navLinkActiveClass : navLinkClass}`}
      onClick={onWorkAnchor}
    >
      <NavItemLabel active={workActive}>Work</NavItemLabel>
    </a>
  )

  const navRow = (
    <>
      <nav
        className="flex w-full flex-wrap items-center justify-between gap-4 py-4 md:gap-6"
        aria-label="Primary"
      >
        {nameLink}

        <div className="hidden max-w-full flex-1 flex-wrap items-center justify-end gap-x-8 gap-y-2 md:flex md:flex-initial md:justify-end">
          {homeLink}
          {workLink}
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
          className="flex p-1 md:hidden"
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
          mobileMenuOpen ? 'max-h-[min(80vh,560px)]' : 'pointer-events-none max-h-0'
        }`}
      >
        <div className="border-t border-black/10 pb-4 pt-2">
          {mobileHomeLink}
          {mobileWorkLink}
          <a
            href={RESUME_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className={`block py-3 font-sans ${navLinkClass}`}
            onClick={closeMobileMenu}
          >
            Resume
          </a>
          <a
            href="https://www.linkedin.com/in/reshma-lokanathan19/"
            target="_blank"
            rel="noopener noreferrer"
            className={`block py-3 font-sans ${navLinkClass}`}
            onClick={closeMobileMenu}
          >
            LinkedIn
          </a>
          <a
            href="https://reshma-lok.framer.website/ai-playground"
            target="_blank"
            rel="noopener noreferrer"
            className={`block py-3 font-sans ${navLinkClass}`}
            onClick={closeMobileMenu}
          >
            AI Playground
          </a>
        </div>
      </div>
    </>
  )

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[80]">
      <div
        ref={navShellRef}
        className={`pointer-events-auto ${navBarSurfaceClass}`}
      >
        <div
          style={{
            // Match home: 40px breathing room inside the 90px guide verticals
            paddingLeft: HOME_GUIDE_SIDE_INSET_PX + 40,
            paddingRight: HOME_GUIDE_SIDE_INSET_PX + 40,
          }}
        >
          {navRow}
        </div>
        <div className="h-px w-full bg-[#e0e0e0]" aria-hidden />
      </div>
    </div>
  )
}

/** Spacer matching fixed nav height (content row + full-width rule). */
export function SiteNavSpacer() {
  return <div aria-hidden className="relative z-10 min-h-[57px] shrink-0" />
}
