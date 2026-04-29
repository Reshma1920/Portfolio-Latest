import { Link, useLocation } from 'react-router-dom'
import type { RefObject } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/** L-shaped markers: 12px arm, 2px #000 — matches specification */
function CornerMarkers() {
  return (
    <>
      <span className="pointer-events-none absolute left-0 top-0 z-[1] h-[12px] w-[12px] border-l-[2px] border-t-[2px] border-solid border-black" aria-hidden />
      <span className="pointer-events-none absolute right-0 top-0 z-[1] h-[12px] w-[12px] border-r-[2px] border-t-[2px] border-solid border-black" aria-hidden />
      <span className="pointer-events-none absolute bottom-0 left-0 z-[1] h-[12px] w-[12px] border-b-[2px] border-l-[2px] border-solid border-black" aria-hidden />
      <span className="pointer-events-none absolute bottom-0 right-0 z-[1] h-[12px] w-[12px] border-b-[2px] border-r-[2px] border-solid border-black" aria-hidden />
    </>
  )
}

function SectionDivider() {
  return <div className="h-px w-full bg-[#e0e0e0]" aria-hidden />
}

/** Numbered pill + tag (Inter 12px) */
function SectionPill({
  children,
}: {
  children: string
}) {
  return (
    <span className="inline-block bg-[rgba(107,53,184,0.1)] px-2 py-1 font-sans text-[14px] font-medium uppercase tracking-[0.04em] text-[#6B35B8]">
      {children}
    </span>
  )
}

const bodyClass = 'font-dmSans text-[16px] leading-[1.7] text-[#333]'
const sectionTitleClass = 'font-dmSans text-[32px] font-semibold text-black'

/** cross_pattern.png (symlink → crosspattern.png), tiled at 40% opacity, base #f0eeea */
function ImagePlaceholder({
  width,
  height,
  label,
  className = '',
  hideCornerMarkers = false,
  noBorder = false,
}: {
  width: number | string
  height: number | string
  label?: string
  className?: string
  hideCornerMarkers?: boolean
  noBorder?: boolean
}) {
  const h = typeof height === 'number' ? `${height}px` : height
  const w = typeof width === 'number' ? `${width}px` : width
  const borderClass = noBorder ? 'border-0' : 'border border-solid border-[#e0e0e0]'
  // Avoid min-height: 100% with height: 100% — duplicates sizing and can cause 1px row mismatch in grids.
  const minH =
    typeof height === 'number' || (typeof height === 'string' && !height.endsWith('%')) ? h : undefined
  return (
    <div
      style={{ width: w, maxWidth: '100%', height: h, ...(minH !== undefined ? { minHeight: minH } : {}) }}
      className={`relative box-border shrink-0 bg-[#f0eeea] ${borderClass} ${className}`}
    >
      <div className="absolute inset-0 bg-[url('/cross_pattern.png')] bg-repeat opacity-40" aria-hidden />
      {!hideCornerMarkers ? <CornerMarkers /> : null}
      {label ? (
        <span className="absolute bottom-3 left-3 z-[2] bg-[rgba(247,246,242,0.92)] px-2 py-1 font-dmSans text-[13px] text-[#333]">
          {label}
        </span>
      ) : null}
    </div>
  )
}

const COLLAB_LEAD_INDEX = 4
const COLLAB_TOP_INDICES = [0, 1, 2, 3] as const
const COLLAB_BOTTOM_INDICES = [5, 6, 7, 8] as const

/** One trunk from lead + horizontal bus + drops to each role — top and bottom halves. */
function buildCollaboratorHubPaths(
  root: DOMRect,
  pillRefs: (HTMLDivElement | null)[],
): string[] {
  const rect = (i: number) => pillRefs[i]?.getBoundingClientRect()
  if (COLLABORATOR_GRID.some((_, i) => !rect(i))) return []

  const leadR = rect(COLLAB_LEAD_INDEX)!
  const leadCx = leadR.left + leadR.width / 2 - root.left
  const leadTop = leadR.top - root.top
  const leadMidY = (leadR.top + leadR.bottom) / 2 - root.top

  const centerOf = (i: number) => {
    const el = rect(i)!
    return {
      x: el.left + el.width / 2 - root.left,
      y: el.top + el.height / 2 - root.top,
    }
  }

  const topPts = COLLAB_TOP_INDICES.map(centerOf)
  const avgTopY = topPts.reduce((s, p) => s + p.y, 0) / topPts.length
  const yBusUp = (avgTopY + leadTop) / 2

  let minTopX = Math.min(...topPts.map((p) => p.x), leadCx)
  let maxTopX = Math.max(...topPts.map((p) => p.x), leadCx)

  const botPts = COLLAB_BOTTOM_INDICES.map(centerOf)
  const avgBotY = botPts.reduce((s, p) => s + p.y, 0) / botPts.length
  const yBusDown = (avgBotY + leadMidY) / 2

  let minBotX = Math.min(...botPts.map((p) => p.x), leadCx)
  let maxBotX = Math.max(...botPts.map((p) => p.x), leadCx)

  const paths: string[] = []

  for (const i of COLLAB_TOP_INDICES) {
    const p = centerOf(i)
    paths.push(`M${p.x},${p.y} L${p.x},${yBusUp}`)
  }
  paths.push(`M${minTopX},${yBusUp} L${maxTopX},${yBusUp}`)
  paths.push(`M${leadCx},${yBusUp} L${leadCx},${leadTop}`)
  paths.push(`M${leadCx},${leadMidY} L${leadCx},${yBusDown}`)

  paths.push(`M${minBotX},${yBusDown} L${maxBotX},${yBusDown}`)
  for (const i of COLLAB_BOTTOM_INDICES) {
    const p = centerOf(i)
    paths.push(`M${p.x},${p.y} L${p.x},${yBusDown}`)
  }

  return paths
}

/** Opaque lavender matching SectionPill tint — solid so connector lines don’t show through */
const collabLeadPillClass =
  'z-[2] rounded-none bg-[#eae4f3] px-2 py-2 font-dmSans text-[11px] font-medium normal-case leading-snug tracking-normal text-[#6B35B8] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] sm:px-2.5 sm:py-2.5 sm:text-[12px]'

const COLLABORATOR_GRID = [
  { label: '2 Product Managers' },
  { label: '1 Operations' },
  { label: '4 Marketing' },
  { label: '1 Customer Success' },
  { label: 'Lead Product Designer (me)', highlight: true },
  { label: '1 Sales' },
  { label: '2 Legal' },
  { label: '4 Development' },
  { label: '2 Finance' },
] as const

/**
 * 2-column pairs, Lead full-width hub row, then Sales/Legal and Dev/Finance.
 * Connector geometry is built in buildCollaboratorHubPaths (hub-and-spoke from lead bar).
 */
function CollaboratorsNetworkOverlay() {
  const containerRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef<(HTMLDivElement | null)[]>([])
  const [pathData, setPathData] = useState<Array<{ d: string; len: number }>>([])
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [linePhase, setLinePhase] = useState<'draw' | 'dashed'>('draw')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const fn = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  useEffect(() => {
    if (!pathData.length) return
    if (prefersReducedMotion) {
      setLinePhase('dashed')
      return
    }
    setLinePhase('draw')
    const t = window.setTimeout(() => setLinePhase('dashed'), 1260)
    return () => clearTimeout(t)
  }, [pathData, prefersReducedMotion])

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measureAndSetPaths = () => {
      const root = el.getBoundingClientRect()
      if (root.width < 16 || root.height < 16) return

      const nextPaths = buildCollaboratorHubPaths(root, pillRefs.current)
      if (!nextPaths.length) return

      setPathData(
        nextPaths.map((d) => {
          const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          p.setAttribute('d', d)
          return { d, len: p.getTotalLength() }
        }),
      )
    }

    const schedule = () => {
      requestAnimationFrame(() => requestAnimationFrame(measureAndSetPaths))
    }

    const ro = new ResizeObserver(schedule)
    ro.observe(el)
    schedule()

    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-[2] flex min-h-0 flex-col justify-center overflow-visible px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-7"
    >
      <p className="sr-only">
        Stakeholder map: product, operations, marketing, and customer success connect above the lead
        product designer; sales, legal, engineering, and finance connect below — one hub in the middle.
      </p>
      <svg className="absolute left-0 top-0 z-0 h-full w-full overflow-visible" aria-hidden>
        {pathData.map(({ d, len }, i) => {
          if (len < 0.5) return null
          const dashed = prefersReducedMotion || linePhase === 'dashed'
          const runDrawAnim = !prefersReducedMotion && linePhase === 'draw'
          return (
            <path
              key={`${i}-${len.toFixed(0)}`}
              d={d}
              fill="none"
              stroke="#c4c4c4"
              strokeWidth={1.25}
              strokeLinecap="butt"
              strokeLinejoin="miter"
              style={{
                strokeDasharray: dashed ? '5 7' : len,
                strokeDashoffset: dashed ? 0 : len,
              }}
              className={runDrawAnim ? 'animate-collab-line-draw' : undefined}
            />
          )
        })}
      </svg>

      <div className="relative z-[1] mx-auto grid min-h-0 w-full max-w-[22rem] grid-cols-2 auto-rows-auto content-center justify-items-stretch gap-x-6 gap-y-6 px-4 py-5 sm:max-w-[26rem] sm:gap-x-7 sm:gap-y-7 sm:px-5 sm:py-6 md:gap-x-8 md:gap-y-8 md:px-6 md:py-7">
        {COLLABORATOR_GRID.map((item, i) => {
          const isLead = 'highlight' in item && item.highlight
          return (
            <div
              key={item.label}
              className={`flex min-w-0 items-center justify-center ${isLead ? 'col-span-2' : ''}`}
            >
              <div
                ref={(node) => {
                  pillRefs.current[i] = node
                }}
                className={`w-full min-w-0 text-balance text-center leading-snug ${
                  isLead
                    ? collabLeadPillClass
                    : 'rounded-none bg-black px-2 py-2 font-dmSans text-[11px] font-medium text-white sm:px-2.5 sm:py-2.5 sm:text-[12px] md:text-[13px]'
                } motion-safe:animate-collab-node-in motion-safe:[animation-delay:80ms] motion-safe:[animation-fill-mode:both] motion-reduce:animate-none motion-reduce:opacity-100`}
              >
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const navLinkClass =
  'text-sm text-muted transition-colors hover:text-foreground'

const navPillBase =
  'inline-flex items-center rounded-[12px] border-[1.5px] px-3.5 py-1.5 text-sm transition-[color,border-color] duration-200 motion-reduce:transition-none'
const navPillInactive = `${navPillBase} border-transparent bg-transparent text-muted hover:text-foreground`
const navPillActive =
  `${navPillBase} border-[#111] bg-transparent text-foreground`

function CaseStudyNavbar() {
  const { pathname, hash } = useLocation()
  const onCaseStudy = pathname === '/hdfc'
  const atWorkAnchor = pathname === '/' && (hash === '#work' || hash.startsWith('#work'))
  const homeActive = pathname === '/' && !atWorkAnchor && !onCaseStudy
  const workActive = onCaseStudy || atWorkAnchor

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] px-3 sm:top-5 sm:px-5">
      <nav className="pointer-events-auto mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-transparent bg-[#F7F6F2] px-7 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]">
        <Link
          to="/"
          className="font-display text-3xl tracking-tight text-[#000000] transition-colors duration-300"
          style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
        >
          Reshma Lokanathan
        </Link>

        <div className="flex max-w-full flex-1 flex-wrap items-center justify-end gap-x-8 gap-y-3 md:flex-initial md:justify-end">
          <Link
            to="/"
            className={homeActive ? navPillActive : navPillInactive}
          >
            Home
          </Link>
          <Link
            to={{ pathname: '/', hash: 'work' }}
            className={workActive ? navPillActive : navPillInactive}
          >
            Work
          </Link>
          <a href="/#resume" className={navLinkClass}>
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
          <a href="/#ai-playground" className={navLinkClass}>
            AI Playground
          </a>
        </div>
      </nav>
    </div>
  )
}

function useIntersectionOnce<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onIntersect: () => void,
) {
  const cbRef = useRef(onIntersect)
  cbRef.current = onIntersect
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          cbRef.current()
          observer.disconnect()
        }
      },
      { threshold: 0.2, rootMargin: '0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
}

function useCountNumber(
  end: number,
  durationMs: number,
  started: boolean,
): number {
  const [value, setValue] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (!started) return
    const prefersReduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduce) {
      setValue(end)
      return
    }

    let raf = 0
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t
      const p = Math.min(1, (t - startRef.current) / durationMs)
      const eased = 1 - (1 - p) ** 3
      setValue(Math.round(eased * end))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, durationMs, end])

  return started ? value : 0
}

/** TL;DR bento: Brief banner + 3-col grid (Overview | placeholder | metrics) */
function TldrBentoSection() {
  const observerRef = useRef<HTMLDivElement | null>(null)
  const [statsStarted, setStatsStarted] = useState(false)

  useIntersectionOnce(observerRef, () => setStatsStarted(true))

  const durationMonths = useCountNumber(8, 1400, statsStarted)
  const adopters = useCountNumber(500, 1600, statsStarted)

  const whatIDidBullets = [
    'Conducted 6 in-depth user interviews across 6 major cities',
    'Led cross-functional alignment with 7+ stakeholder teams',
    'Designed holistic dashboard view with key KPIs',
  ] as const

  return (
    <section className="py-14">
      <div className="mb-10">
        <SectionPill>02 · TL;DR</SectionPill>
        <h2 className={`${sectionTitleClass} mt-4`}>At a glance</h2>
      </div>

      <div
        ref={observerRef}
        className="relative border border-solid border-[#e0e0e0] bg-[#fdfcfb] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
      >
        <CornerMarkers />

        {/* Banner: The Brief + thesis */}
        <div className="border-b border-solid border-[#e0e0e0] px-6 py-10 text-center sm:px-10">
          <h3 className="mb-[12px] font-sans text-[18px] leading-normal text-black">
            The Brief
          </h3>
          <p className="mx-auto max-w-[880px] text-center font-dmSans text-[18px] font-normal italic leading-relaxed text-[#555] sm:text-[20px]">
            Translating a legacy manual workflow into a streamlined, fully digital experience.
            By tackling market-specific challenges and balancing business needs for accelerated
            approvals and improved transparency.
          </p>
        </div>

        {/* Wireframe: Overview | placeholder | metrics grid (3×2 + role / team row) */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,340px)] lg:items-stretch">
          <div className="flex flex-col border-b border-solid border-[#e0e0e0] lg:border-b-0 lg:border-r lg:border-solid lg:border-[#e0e0e0]">
            <div className="border-b border-solid border-[#e0e0e0] px-6 py-10 sm:px-8">
              <p className="mb-[12px] font-sans text-[18px] text-black lg:text-center">Overview</p>
              <p className={bodyClass}>
                HDFC&apos;s disbursement toolchain was fragmented across agents, spreadsheets, and legacy
                screens—a poor fit for high-volume tower projects—so borrowers and builders lacked
                a single coherent path from initiation to disbursement.
              </p>
            </div>
            <div className="px-6 py-10 sm:px-8">
              <p className="mb-[12px] font-sans text-[18px] text-black lg:text-center">What I did?</p>
              <ul className={`${bodyClass} m-0 list-none space-y-4 p-0`}>
                {whatIDidBullets.map((line) => (
                  <li key={line}>° {line}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative min-h-[260px] h-[min(520px,70vh)] w-full overflow-visible border-b border-solid border-[#e0e0e0] lg:h-full lg:min-h-[520px] lg:border-b-0 lg:border-r lg:border-solid lg:border-[#e0e0e0]">
            <ImagePlaceholder
              width="100%"
              height="100%"
              hideCornerMarkers
              noBorder
              className="block h-full min-h-0 w-full"
            />
            <CollaboratorsNetworkOverlay />
            <span className="pointer-events-none absolute bottom-3 left-3 z-[3] bg-white px-2 py-1 font-dmSans text-[12px] font-medium text-[#333] sm:bottom-4 sm:left-4 sm:text-[13px]">
              Stakeholder collaboration
            </span>
          </div>

          <div className="grid min-h-0 grid-cols-2 lg:grid-rows-[209px_209px_209px]">
            <div className="flex h-[206px] flex-col items-center justify-start border-b border-r border-solid border-[#e0e0e0] px-3 py-8 text-center sm:px-5 lg:h-full lg:min-h-0 lg:py-6">
              <span className="font-sans text-[18px] text-black">Duration</span>
              <p className="mt-[12px] font-dmSans text-[32px] font-bold tabular-nums leading-none text-black">
                {durationMonths}
              </p>
              <span className={`mt-4 max-w-[12rem] ${bodyClass}`}>months</span>
            </div>
            <div className="flex h-[207px] flex-col items-center justify-start border-b border-solid border-[#e0e0e0] px-3 py-8 text-center sm:px-5 lg:h-full lg:min-h-0 lg:py-6">
              <span className="font-sans text-[18px] text-black">Collaborators</span>
              <span className="mt-[12px] font-dmSans text-[32px] font-bold tabular-nums leading-none text-black">
                7+
              </span>
              <span className={`mt-4 max-w-[12rem] ${bodyClass}`}>Stakeholder teams aligned</span>
            </div>
            <div className="flex h-[207px] flex-col items-center justify-start border-b border-r border-solid border-[#e0e0e0] px-3 py-8 text-center sm:px-5 lg:h-full lg:min-h-0 lg:py-6">
              <span className="font-sans text-[18px] text-black">Adoption</span>
              <p className="mt-[12px] font-dmSans text-[32px] font-bold tabular-nums leading-none text-black">
                {adopters >= 500 ? '500K+' : adopters}
              </p>
              <span className={`mt-4 max-w-[12rem] ${bodyClass}`}>
                Users onboarded inside the first operational year
              </span>
            </div>
            <div className="flex h-[206px] flex-col items-center justify-start border-b border-solid border-[#e0e0e0] px-3 py-8 text-center sm:px-5 lg:h-full lg:min-h-0 lg:py-6">
              <span className="font-sans text-[18px] text-black">Loan Volume</span>
              <span className="mt-[12px] font-dmSans text-[32px] font-bold tabular-nums leading-none text-black">
                30%
              </span>
              <span className={`mt-4 max-w-[11rem] ${bodyClass}`}>Increase in loan volume</span>
            </div>
            <div className="flex min-h-[160px] flex-col items-center justify-start border-r border-solid border-[#e0e0e0] px-3 py-8 text-center sm:px-5 lg:h-full lg:min-h-0 lg:py-6">
              <span className="font-sans text-[18px] text-black">My role</span>
              <p className="mt-[12px] max-w-[11rem] font-dmSans text-[16px] font-semibold leading-snug text-black">
                Lead Product Designer
              </p>
            </div>
            <div className="flex min-h-[160px] flex-col items-center justify-start px-3 py-8 text-center sm:px-5 lg:h-full lg:min-h-0 lg:py-6">
              <span className="font-sans text-[18px] text-black">Team</span>
              <span className="mt-[12px] font-dmSans text-[32px] font-bold tabular-nums leading-none text-black">
                4
              </span>
              <span className={`mt-4 max-w-[12rem] ${bodyClass}`}>
                Design, Research, and PM
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

const philosophyCards = [
  {
    title: 'Design for Efficiency',
    body: 'Reduced workflow steps through guided paths, dashboards, and inline validation so analysts spend time on judgment, not data wrangling.',
  },
  {
    title: 'Design for Trust',
    body: 'Clear status timelines, disclosures, and feedback patterns so borrowers and developers understood where they stood.',
  },
  {
    title: 'Design for Scale',
    body: 'Component-based patterns and repeatable templates adapted as new projects and corridors onboarded.',
  },
  {
    title: 'Design for All Stakeholders',
    body: 'Kept HDFC analysts, borrowers, builders, and field teams united in shared objects and statuses.',
  },
  {
    title: 'Design for Resilience',
    body: 'Planned offline edge cases and exception flows so disruptions did not deadlock disbursement.',
  },
  {
    title: 'Design for Inclusion',
    body: 'Plain-language copy, multilingual consideration, and legible hierarchies lowered barriers for junior staff and borrowers.',
  },
] as const

export default function HDFCCaseStudy() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] text-foreground antialiased">
      <CaseStudyNavbar />

      <div className="pt-[calc(16px+76px)] sm:pt-[calc(20px+76px)]" />

      <main className="mx-auto w-full max-w-[1200px] px-4 pb-28 sm:px-6">

        {/* 01 */}
        <section className="border-y border-solid border-[#e0e0e0] py-14">
          <div className="mb-12 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
            <div className="min-w-0 flex-1">
              <p className="font-dmSans text-[13px] font-medium uppercase tracking-wide text-[#555]">
                HDFC Bank · Lead Product Designer
              </p>
              <h1 className="mt-6 max-w-xl font-dmSans text-[48px] font-semibold leading-[1.1] text-black">
                Loan Management Tool to Eliminate Agent Dependency
              </h1>
            </div>
            <ImagePlaceholder width={600} height={400} className="w-full lg:mt-14" />
          </div>
        </section>

        {/* 02 · TL;DR bento */}
        <TldrBentoSection />

        {/* 03 — CONTEXT */}
        <section className="py-14">
          <div className="mb-10">
            <SectionPill>03 · CONTEXT</SectionPill>
            <h2 className={`${sectionTitleClass} mt-3`}>Project background</h2>
          </div>
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 z-0 h-px max-w-[100vw] w-screen -translate-x-1/2 bg-[#e0e0e0]"
            />
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="relative border border-solid border-[#e0e0e0] bg-[#fdfcfa] p-8">
                <h3 className="font-dmSans text-[22px] font-semibold text-black">
                  Why did HDFC need this?
                </h3>
                <p className={`${bodyClass} mt-4`}>
                  India&apos;s urban housing market is dominated by large multistory apartment
                  projects. Existing onboarding systems were built for single-unit
                  listings, leading to bottlenecks, data errors, and delayed loan
                  processing.
                </p>
              </div>
              <div className="relative border border-solid border-[#e0e0e0] bg-[#fdfcfa] p-8">
                <h3 className="font-dmSans text-[22px] font-semibold text-black">
                  The opportunity
                </h3>
                <p className={`${bodyClass} mt-4`}>
                  Build a fully digital workflow that eliminates agent dependency, reduces
                  processing time, and scales with growing loan volume. Provides loan
                  visibility, transparency, and trust for users and business owners.
                </p>
              </div>
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-px max-w-[100vw] w-screen -translate-x-1/2 bg-[#e0e0e0]"
            />
          </div>
        </section>

        {/* 04 — PROBLEM */}
        <section className="border-b border-solid border-[#e0e0e0] py-14">
          <div className="mb-4">
            <SectionPill>04 · PROBLEM</SectionPill>
            <h2 className={`${sectionTitleClass} mt-3`}>Problem Overview</h2>
          </div>
          <blockquote className="max-w-[900px] py-0 font-dmSans text-[20px] font-normal leading-relaxed text-[#333]">
            The current system relies on legacy technologies, leading to inefficiencies,
            delays, and increased operational costs. It is not scalable, making it
            challenging to handle increasing project volume and complexity.
          </blockquote>
          <div className="mt-12 grid gap-9 md:grid-cols-2">
            <div>
              <p className="mb-3 font-dmSans text-sm font-semibold text-black">Problem</p>
              <div className="relative box-border w-full border border-solid border-[#e0e0e0] bg-[#f0eeea]">
                <div
                  className="absolute inset-0 bg-[url('/cross_pattern.png')] bg-repeat opacity-40"
                  aria-hidden
                />
                <div className="relative z-[1] p-10">
                  <img
                    src="/hdfc-agent-dependency-workflow.png"
                    alt="Agent dependency in legacy workflow: diagram of Housing Developers, Customers, Agent, and HDFC Bank with numbered steps and timeline."
                    className="mx-auto h-auto w-full max-w-full object-contain"
                    width={1024}
                    height={812}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <CornerMarkers />
              </div>
            </div>
            <div>
              <p className="mb-3 font-dmSans text-sm font-semibold text-black">
                Solution
              </p>
              <div className="relative box-border w-full border border-solid border-[#e0e0e0] bg-[#f0eeea]">
                <div
                  className="absolute inset-0 bg-[url('/cross_pattern.png')] bg-repeat opacity-40"
                  aria-hidden
                />
                <div className="relative z-[1] p-[40px]">
                  <img
                    src="/hdfc-streamlined-workflow.png"
                    alt="Streamlined workflow reducing dependencies: Unified Portal connecting Housing Developers and Customers to HDFC Bank with verification, approval, and disbursement steps and 8-day timeline."
                    className="mx-auto h-auto w-full max-w-full object-contain"
                    width={1024}
                    height={812}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <CornerMarkers />
              </div>
            </div>
          </div>
        </section>

        {/* 05 — RESEARCH */}
        <section className="py-14">
          <div className="mb-4">
            <SectionPill>05 · RESEARCH</SectionPill>
            <h2 className={`${sectionTitleClass} mt-3`}>
              Repeating themes from interviews
            </h2>
          </div>
          <p className="max-w-[900px] py-0 font-dmSans text-[20px] font-normal leading-relaxed text-[#333]">
            We conducted 6 interviews with housing developers in 6 cities across
            India ranging in different scale to understand the nuances and pain
            points.
          </p>
          <div className="mt-14 overflow-hidden rounded-sm border border-solid border-[#e0e0e0] bg-white grid grid-cols-1 divide-y divide-[#e0e0e0] md:grid-cols-3 md:divide-x md:divide-y-0">
            {[
              {
                tag: '01',
                title: 'Language Barriers',
                body: 'Mid level developers face language barriers and low comfort with digital tools',
              },
              {
                tag: '02',
                title: 'Reliance on Agents',
                body: "This dependency suggests the existing ecosystem doesn't meet user needs",
              },
              {
                tag: '03',
                title: 'Transparency in Status',
                body:
                  'Users experience frustration due to absence of direct visibility into loan status',
              },
            ].map((c) => (
              <article key={c.tag} className="flex min-h-0 flex-col bg-white">
                <div className="flex flex-1 flex-col px-7 py-8">
                  <span className="inline-flex h-9 min-w-[2.25rem] items-center justify-center self-start rounded-md bg-[rgba(107,53,184,0.12)] px-2.5 font-sans text-[13px] font-semibold tabular-nums tracking-tight text-[#4f2d8a]">
                    {c.tag}
                  </span>
                  <h3 className="mt-5 font-dmSans text-[17px] font-semibold leading-snug text-[#1a1a1a]">
                    {c.title}
                  </h3>
                  <p className="mt-3 font-dmSans text-[15px] leading-[1.65] text-[#5c5c5c]">
                    {c.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 06 — MARKET */}
        <section className="py-14">
          <div className="mb-4">
            <h2 className={sectionTitleClass}>Market Research</h2>
          </div>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h3 className="font-dmSans text-[22px] font-semibold text-black">
                Market Analysis
              </h3>
              <p className={`${bodyClass} mt-4`}>
                India&apos;s urban housing market is dominated by large multistory
                apartment projects (over 80%) involving hundreds of units per property.
              </p>
            </div>
            <div>
              <h3 className="font-dmSans text-[22px] font-semibold text-black">
                Competitor Benchmark
              </h3>
              <ul className={`${bodyClass} mt-4 list-none space-y-4`}>
                <li>° Other banks relied on manual Excel-based data entry, increasing risk of errors.</li>
                <li>
                  ° Real Estate platforms like MagicBricks and NoBroker optimized
                  end-user browsing but lacked enterprise onboarding workflows.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 07 — GAPS */}
        <section className="border-b border-solid border-[#e0e0e0] py-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
            <div className="min-w-0">
              <h2 className={sectionTitleClass}>Gaps &amp; Opportunities</h2>
              <p className="mt-4 max-w-[520px] py-0 font-dmSans text-[20px] font-normal leading-relaxed text-[#333]">
                Placeholder: brief narrative on the main gaps between user needs and the
                current experience, and how those informed the opportunity areas explored
                in the matrix.
              </p>
            </div>
            <div className="relative min-w-0 box-border w-full max-w-none border border-solid border-[#e0e0e0] bg-[#f0eeea]">
              <div
                className="absolute inset-0 bg-[url('/cross_pattern.png')] bg-repeat opacity-40"
                aria-hidden
              />
              <div className="relative z-[1] p-[40px]">
                <img
                  src="/hdfc-identifying-opportunities.png"
                  alt="Identifying opportunities: effort versus impact matrix with initiatives such as digital document submission, unified dashboard, and developer self-service portal."
                  className="mx-auto h-auto w-full max-w-full object-contain"
                  width={1024}
                  height={558}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <CornerMarkers />
            </div>
          </div>
          <SectionDivider />
        </section>

        {/* 08 — STAKEHOLDERS */}
        <section className="border-b border-solid border-[#e0e0e0] py-14">
          <div className="mb-10">
            <SectionPill>08 · STAKEHOLDER ALIGNMENT</SectionPill>
            <h2 className={`${sectionTitleClass} mt-3`}>Stakeholder alignment</h2>
          </div>
          <div className="relative grid lg:grid-cols-2">
            <div className="border-b border-solid border-[#e0e0e0] p-10 lg:border-b-0 lg:border-r">
              <h3 className="font-dmSans text-[22px] font-semibold text-black">
                Business Needs
              </h3>
              <p className={`${bodyClass} mt-4`}>
                Streamline home loan disbursement, reduce application completion time,
                minimize manual intervention, drive higher customer acquisition.
              </p>
            </div>
            <div className="p-10">
              <h3 className="font-dmSans text-[22px] font-semibold text-black">
                User Needs
              </h3>
              <p className={`${bodyClass} mt-4`}>
                Quick, intuitive, reliable platform with guided steps, real-time status
                updates, easy document access, and mobile responsiveness.
              </p>
            </div>
          </div>
          <div className="relative mt-12">
            <ImagePlaceholder width={1100} height={350} className="w-full" />
          </div>
          <SectionDivider />
        </section>

        {/* 09 — WORKFLOW */}
        <section className="border-b border-solid border-[#e0e0e0] py-14">
          <div className="mb-10">
            <SectionPill>09 · PROPOSED WORKFLOW</SectionPill>
            <h2 className={`${sectionTitleClass} mt-3`}>Proposed workflow</h2>
          </div>
          <blockquote className="relative border border-solid border-[#e0e0e0] bg-white p-10 font-dmSans text-[19px] leading-relaxed italic text-[#333]">
            <CornerMarkers />
            &ldquo;This workflow transforms the fragmented, agent-dependent manual process
            into a unified digital ecosystem that reduces processing time from 30 days to
            just 8 days — a 73% improvement.&rdquo;
          </blockquote>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            <div className="relative border border-solid border-[#e0e0e0] bg-[#fdfcfa] p-6">
              <CornerMarkers />
              <h3 className="font-dmSans text-[17px] font-semibold text-black">
                For HDFC
              </h3>
              <ul className={`${bodyClass} mt-4 space-y-3 list-none`}>
                <li>° Central underwriting queue with SLA tracking</li>
                <li>° Role-aware approvals and escalation paths</li>
                <li>° Integrated risk flags with audit trails</li>
                <li>° Dashboards for disbursement KPIs across regions</li>
                <li>° Batch exports for treasury and reconciliation</li>
              </ul>
            </div>
            <div className="relative border border-solid border-[#e0e0e0] bg-[#fdfcfa] p-6">
              <CornerMarkers />
              <h3 className="font-dmSans text-[17px] font-semibold text-black">
                For Customers
              </h3>
              <ul className={`${bodyClass} mt-4 space-y-3 list-none`}>
                <li>° Transparent application timelines</li>
                <li>° Digital document submission and previews</li>
                <li>° Status notifications via SMS/email</li>
                <li>° Self-help checklist for prerequisites</li>
                <li>° Mobile-responsive journey for co-applicants</li>
              </ul>
            </div>
            <div className="relative border border-solid border-[#e0e0e0] bg-[#fdfcfa] p-6">
              <CornerMarkers />
              <h3 className="font-dmSans text-[17px] font-semibold text-black">
                For Developers
              </h3>
              <ul className={`${bodyClass} mt-4 space-y-3 list-none`}>
                <li>° Portfolio view of towers and disbursement stages</li>
                <li>° Offline-friendly site progress capture</li>
                <li>° Shared document vault with versioning</li>
                <li>° Comment threads anchored to approvals</li>
                <li>° Export handoffs to compliance reviewers</li>
              </ul>
            </div>
          </div>
          <SectionDivider />
        </section>

        {/* 10 — PHILOSOPHY */}
        <section className="border-b border-solid border-[#e0e0e0] py-14">
          <div className="mb-10">
            <SectionPill>10 · DESIGN PHILOSOPHY</SectionPill>
            <h2 className={`${sectionTitleClass} mt-3`}>Design Philosophy</h2>
          </div>
          <div className="grid gap-10 sm:grid-cols-2">
            {philosophyCards.map((card, idx) => (
              <article
                key={card.title}
                className="relative border border-solid border-[#e0e0e0] bg-[#fdfcfa] p-6"
              >
                <CornerMarkers />
                <span className="font-sans text-[12px] font-medium text-[#6B35B8]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-dmSans text-[18px] font-semibold text-black">
                  {card.title}
                </h3>
                <p className={`mt-3 ${bodyClass}`}>{card.body}</p>
              </article>
            ))}
          </div>
          <SectionDivider />
        </section>

        {/* 11 — PROCESS */}
        <section className="border-b border-solid border-[#e0e0e0] py-14">
          <div className="mb-10">
            <SectionPill>11 · PROCESS</SectionPill>
            <h2 className={`${sectionTitleClass} mt-3`}>Collaborative IA + Ideation</h2>
          </div>

          <div className="mb-14">
            <h3 className="font-dmSans text-[22px] font-semibold text-black">
              Collaborative Information Architecture
            </h3>
            <p className={`${bodyClass} mt-4 max-w-[900px]`}>
              Mapped primary objects — projects, towers, disbursement clusters, approvals,
              borrowers, and supervisors — ensuring every route converged onto clear
              next actions for HDFC processors and counterparties.
            </p>
            <div className="relative mt-8">
              <ImagePlaceholder width={1100} height={450} className="w-full" />
            </div>
          </div>

          <div>
            <h3 className="font-dmSans text-[22px] font-semibold text-black">
              Brain-Paper Dump
            </h3>
            <p className={`${bodyClass} mt-4 max-w-[900px]`}>
              The team generated 68 ideations and narrowed down based on scope.
            </p>
            <div className="relative mt-8 grid gap-10 md:grid-cols-2">
              <ImagePlaceholder width={500} height={350} />
              <ImagePlaceholder width={500} height={350} />
            </div>
          </div>
          <SectionDivider />
        </section>

        {/* 12 — FINAL DESIGNS */}
        <section className="border-b border-solid border-[#e0e0e0] py-14">
          <div className="mb-12">
            <SectionPill>12 · FINAL DESIGNS</SectionPill>
            <h2 className={`${sectionTitleClass} mt-3`}>Final Designs</h2>
          </div>

          {[
            {
              title: 'Project Listing',
              desc:
                'Users can view projects and locate them on a map — surfacing approvals, timelines, and project health at glance.',
              h: 500,
            },
            {
              title: 'Disbursements',
              desc:
                'Users can view tower listing, customer details, and request disbursements.',
              h: 500,
            },
            {
              title: 'Work Progress',
              desc:
                'Developers keep banks informed about construction status with structured milestones.',
              h: 500,
            },
          ].map((block) => (
            <div
              key={block.title}
              className="border-b border-solid border-[#e0e0e0] py-14 first:pt-0 last:border-b-0 last:pb-0"
            >
              <h3 className="font-dmSans text-[22px] font-semibold text-black">
                {block.title}
              </h3>
              <p className={`mt-4 max-w-[900px] ${bodyClass}`}>{block.desc}</p>
              <div className="relative mt-8">
                <ImagePlaceholder width={1100} height={block.h} className="w-full" />
              </div>
            </div>
          ))}
          <SectionDivider />
        </section>

        {/* 13 — OUTCOMES */}
        <section className="pb-14 pt-14">
          <div className="mb-12">
            <SectionPill>13 · OUTCOMES &amp; LEARNINGS</SectionPill>
            <h2 className={`${sectionTitleClass} mt-3`}>Outcomes &amp; Learnings</h2>
          </div>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h3 className="font-dmSans text-[22px] font-semibold text-black">
                What worked
              </h3>
              <ul className={`${bodyClass} mt-4 list-none space-y-4`}>
                <li>° Embedding early checkpoints with underwriting led to tighter feedback loops.</li>
                <li>° Transparent milestones reduced inbox escalations.</li>
                <li>° Shared component library aligned dev and QA handoffs.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-dmSans text-[22px] font-semibold text-black">
                What I&apos;d do differently
              </h3>
              <ul className={`${bodyClass} mt-4 list-none space-y-4`}>
                <li>° Probe regional branch variations sooner in rollout planning.</li>
                <li>° Instrument analytics earlier to validate KPI adoption dashboards.</li>
                <li>° Expand multilingual pilot coverage for tier-3 cities earlier.</li>
              </ul>
            </div>
          </div>
          <div className="relative mt-16 border border-solid border-[#e0e0e0] bg-[#fdfcfa] p-10">
            <CornerMarkers />
            <h3 className="font-dmSans text-[22px] font-semibold text-black">
              Key takeaway
            </h3>
            <p className={`${bodyClass} mt-4`}>
              Harmonizing underwriting logic with humane status communication proved as
              important as optimizing screen flows — accelerating adoption required making
              the invisible bureaucracy legible across every stakeholder.
            </p>
          </div>
          <SectionDivider />
        </section>
      </main>
    </div>
  )
}
