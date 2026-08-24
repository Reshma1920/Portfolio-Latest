'use client'

import type { MouseEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { scrollToSectionId } from '../utils/scroll'
import {
  guideSideInsetPlus,
  HOME_GUIDE_MARKER_PX,
} from '../case-studies/caseStudyLayout'

const RESUME_HREF =
  'https://drive.google.com/file/d/16ARJFqU-a44qndQp50JnsGTM_xprohdS/view?usp=sharing'
const LINKEDIN_HREF = 'https://www.linkedin.com/in/reshma-lokanathan19/'
const LETS_TALK_HREF = 'mailto:reshma.lokanathan19@gmail.com'

const navIconButtonClass =
  'inline-flex shrink-0 items-center justify-center rounded-none border border-solid border-[#e0e0e0] bg-white p-[7px] text-[#919191] transition-[border-radius,border-color,color] duration-300 ease-out hover:rounded-xl hover:border-black/30 hover:text-[#333333] motion-reduce:transition-none'

const NAV_INACTIVE = '#919191'
const NAV_TRACK = '#D6D6D6'
/** Viewport probe ratio — which point in the window picks the active section / short-section progress. */
const SECTION_PROBE_RATIO = 0.35

type NavSection = 'home' | 'work' | 'about'

type SectionNavState = {
  activeSection: NavSection
  homeProgress: number
  workProgress: number
  aboutProgress: number
  /** Hero default = transparent nav; scrolled = bg + border (Figma “Scrol” variant). */
  navDocked: boolean
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function sectionBounds(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const top = rect.top + window.scrollY
  return { top, bottom: top + rect.height, height: rect.height }
}

/** Map viewport probe position to 0→1 across a section (aligned with active-section handoff). */
function progressFromProbe(probe: number, start: number, end: number): number {
  const span = end - start
  if (span <= 0) return 0
  return clamp01((probe - start) / span)
}

function resolveActiveSection(
  probe: number,
  workTop: number,
  aboutTop: number | undefined,
): NavSection {
  if (aboutTop != null && probe >= aboutTop) return 'about'
  if (probe >= workTop) return 'work'
  return 'home'
}

function computeSectionNavState(isLandingHome: boolean): SectionNavState {
  const scrollY = window.scrollY
  const viewportHeight = window.innerHeight
  const probe = scrollY + viewportHeight * SECTION_PROBE_RATIO
  const navDocked = !isLandingHome || scrollY > 8

  const home = document.getElementById('home')
  const work = document.getElementById('work')
  const about = document.getElementById('about')

  if (!home || !work) {
    return {
      activeSection: 'home',
      homeProgress: 0,
      workProgress: 0,
      aboutProgress: 0,
      navDocked,
    }
  }

  const homeBounds = sectionBounds(home)
  const workBounds = sectionBounds(work)
  const aboutBounds = about ? sectionBounds(about) : null

  const homeTop = homeBounds.top
  const workTop = workBounds.top
  const aboutTop = aboutBounds?.top
  const aboutBottom = aboutBounds?.bottom ?? document.documentElement.scrollHeight

  const activeSection = resolveActiveSection(probe, workTop, aboutTop)
  const workEnd = aboutTop ?? aboutBottom

  return {
    activeSection,
    homeProgress:
      activeSection === 'home' ? progressFromProbe(probe, homeTop, workTop) : 0,
    workProgress:
      activeSection === 'work' ? progressFromProbe(probe, workTop, workEnd) : 0,
    aboutProgress:
      activeSection === 'about' && aboutTop != null
        ? progressFromProbe(probe, aboutTop, aboutBottom)
        : 0,
    navDocked,
  }
}

function HamburgerIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" className="text-black" aria-hidden>
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ResumeIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M8 11v5M8 8h.01"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M12 11v5M12 11a2.5 2.5 0 0 1 5 0v5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type NavTrackProps = {
  label: string
  active: boolean
  progress: number
  onClick: (event: MouseEvent<HTMLElement>) => void
}

function NavTrack({ label, active, progress, onClick }: NavTrackProps) {
  const fillPct = `${progress * 100}%`
  const markerAtStart = active && progress <= 0

  return (
    <div className="hidden w-[102px] shrink-0 flex-col gap-[3px] lg:flex">
      <button
        type="button"
        onClick={onClick}
        className={`text-left font-dmSans text-[13px] font-medium leading-[19.5px] transition-colors motion-reduce:transition-none ${
          active ? 'text-black' : 'text-[#919191]'
        }`}
      >
        {label}
      </button>
      <div className="relative h-px w-full" style={{ backgroundColor: NAV_TRACK }}>
        {active ? (
          <div
            className="absolute left-0 top-0 h-px bg-black will-change-[width]"
            style={{ width: fillPct }}
          />
        ) : null}
        <span
          className="absolute top-1/2 will-change-[left]"
          style={{
            width: HOME_GUIDE_MARKER_PX,
            height: HOME_GUIDE_MARKER_PX,
            backgroundColor: active ? '#000000' : NAV_INACTIVE,
            left: markerAtStart ? 0 : fillPct,
            transform: markerAtStart ? 'translate(-3px, -50%)' : 'translate(-50%, -50%)',
          }}
          aria-hidden
        />
      </div>
    </div>
  )
}

type SiteNavProps = {
  variant: 'home' | 'case-study'
}

export function SiteNav({ variant }: SiteNavProps) {
  const pathname = usePathname()
  const isCaseStudy = variant === 'case-study'
  const isLandingHome = !isCaseStudy && pathname === '/'
  const onCaseStudyRoute = pathname === '/latch' || pathname === '/hdfc'

  const [navState, setNavState] = useState<SectionNavState>({
    activeSection: 'home',
    homeProgress: 0,
    workProgress: 0,
    aboutProgress: 0,
    navDocked: isCaseStudy,
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navShellRef = useRef<HTMLDivElement>(null)

  const homeActive = isCaseStudy ? false : navState.activeSection === 'home'
  const workActive = isCaseStudy ? onCaseStudyRoute : navState.activeSection === 'work'
  const aboutActive = !isCaseStudy && navState.activeSection === 'about'

  useEffect(() => {
    if (!isLandingHome) return
    const hash = window.location.hash.replace('#', '')
    if (hash === 'work' || hash === 'about' || hash === 'home') {
      requestAnimationFrame(() => scrollToSectionId(hash as 'home' | 'work' | 'about'))
    }
  }, [isLandingHome])

  useEffect(() => {
    let raf = 0
    let ticking = false

    const update = () => {
      ticking = false
      if (isCaseStudy) {
        setNavState((prev) => ({ ...prev, navDocked: true, activeSection: 'work' }))
        return
      }
      setNavState(computeSectionNavState(isLandingHome))
    }

    const scheduleUpdate = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(update)
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    const home = document.getElementById('home')
    const work = document.getElementById('work')
    const about = document.getElementById('about')
    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleUpdate) : null
    if (ro) {
      if (home) ro.observe(home)
      if (work) ro.observe(work)
      if (about) ro.observe(about)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      ro?.disconnect()
    }
  }, [isCaseStudy, isLandingHome])

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

  function onHomeJump(event: MouseEvent<HTMLElement>) {
    event.preventDefault()
    closeMobileMenu()
    if (isCaseStudy) {
      window.location.href = '/#home'
      return
    }
    scrollToSectionId('home')
  }

  function onWorkJump(event: MouseEvent<HTMLElement>) {
    event.preventDefault()
    closeMobileMenu()
    if (isCaseStudy) {
      window.location.href = '/#work'
      return
    }
    scrollToSectionId('work')
  }

  function onAboutJump(event: MouseEvent<HTMLElement>) {
    event.preventDefault()
    closeMobileMenu()
    if (isCaseStudy) {
      window.location.href = '/#about'
      return
    }
    scrollToSectionId('about')
  }

  const nameLink = isCaseStudy ? (
    <Link
      href="/"
      className="block min-w-0 truncate font-display text-[18px] font-normal leading-[20.16px] tracking-[-0.02em] text-black transition-colors hover:text-foreground motion-reduce:transition-none"
      style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
      onClick={closeMobileMenu}
    >
      Reshma Lokanathan
    </Link>
  ) : (
    <a
      href="#home"
      className="block min-w-0 truncate font-display text-[18px] font-normal leading-[20.16px] tracking-[-0.02em] text-black transition-colors hover:text-foreground motion-reduce:transition-none"
      style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
      onClick={onHomeJump}
    >
      Reshma Lokanathan
    </a>
  )

  const dockActions = (
    <div className="flex shrink-0 items-center gap-2">
      <a
        href={RESUME_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className={navIconButtonClass}
        aria-label="Resume"
        onClick={closeMobileMenu}
      >
        <ResumeIcon />
      </a>
      <a
        href={LINKEDIN_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className={navIconButtonClass}
        aria-label="LinkedIn"
        onClick={closeMobileMenu}
      >
        <LinkedInIcon />
      </a>
      <a
        href={LETS_TALK_HREF}
        className="inline-flex shrink-0 items-center gap-2 rounded-none bg-black px-[14px] py-[6px] font-dmSans text-[13px] font-medium text-white transition-[border-radius,opacity] duration-300 ease-out hover:rounded-xl hover:opacity-90 motion-reduce:transition-none"
        onClick={closeMobileMenu}
      >
        Let&apos;s talk
        <span aria-hidden>→</span>
      </a>
      <button
        type="button"
        className="inline-flex p-1 lg:hidden"
        aria-expanded={mobileMenuOpen}
        aria-controls="primary-mobile-nav"
        onClick={() => setMobileMenuOpen((o) => !o)}
      >
        <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
        <HamburgerIcon />
      </button>
    </div>
  )

  const navDocked = navState.navDocked

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[68px]">
      <div
        ref={navShellRef}
        className="pointer-events-auto relative flex h-full items-center"
        style={{
          paddingLeft: guideSideInsetPlus(40),
          paddingRight: guideSideInsetPlus(40),
        }}
      >
        <div
          className={`relative flex w-full min-w-0 items-center px-4 py-2.5 transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none ${
            navDocked
              ? 'border border-solid border-[#e0e0e0] bg-[#fdfcfa] shadow-[0_1px_0_rgba(0,0,0,0.04)]'
              : 'border border-solid border-transparent bg-transparent shadow-none'
          }`}
        >
          <div className="relative z-[1] flex min-w-0 flex-1 items-center justify-start">
            {nameLink}
          </div>

          <div className="relative z-[1] flex shrink-0 items-center gap-4">
            <div className="hidden items-center gap-4 lg:flex">
              <NavTrack
                label="Home"
                active={homeActive}
                progress={navState.homeProgress}
                onClick={onHomeJump}
              />
              <NavTrack
                label="Work"
                active={workActive}
                progress={isCaseStudy ? 0 : navState.workProgress}
                onClick={onWorkJump}
              />
              <NavTrack
                label="About"
                active={aboutActive}
                progress={navState.aboutProgress}
                onClick={onAboutJump}
              />
            </div>
            {dockActions}
          </div>
        </div>

        <div
          id="primary-mobile-nav"
          aria-hidden={!mobileMenuOpen}
          className={`absolute inset-x-0 top-[68px] overflow-hidden border border-solid border-[#e0e0e0] bg-[#f7f6f2] shadow-sm transition-[max-height] duration-300 ease-out motion-reduce:transition-none lg:hidden ${
            mobileMenuOpen ? 'max-h-[min(80vh,420px)]' : 'pointer-events-none max-h-0'
          }`}
        >
          <div className="space-y-1 px-4 py-3">
            <button
              type="button"
              className={`block w-full py-2 text-left font-dmSans text-[13px] font-medium ${
                homeActive ? 'text-black' : 'text-[#919191]'
              }`}
              onClick={onHomeJump}
            >
              Home
            </button>
            <button
              type="button"
              className={`block w-full py-2 text-left font-dmSans text-[13px] font-medium ${
                workActive ? 'text-black' : 'text-[#919191]'
              }`}
              onClick={onWorkJump}
            >
              Work
            </button>
            <button
              type="button"
              className={`block w-full py-2 text-left font-dmSans text-[13px] font-medium ${
                aboutActive ? 'text-black' : 'text-[#919191]'
              }`}
              onClick={onAboutJump}
            >
              About
            </button>
            <a
              href={RESUME_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2 font-dmSans text-[13px] font-medium text-[#919191]"
              onClick={closeMobileMenu}
            >
              <ResumeIcon />
              Resume
            </a>
            <a
              href={LINKEDIN_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2 font-dmSans text-[13px] font-medium text-[#919191]"
              onClick={closeMobileMenu}
            >
              <LinkedInIcon />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Spacer matching fixed nav height (68px). */
export function SiteNavSpacer() {
  return <div aria-hidden className="relative z-10 h-[68px] min-h-[68px] shrink-0" />
}
