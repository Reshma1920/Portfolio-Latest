import { Helmet } from 'react-helmet-async'
import { Link, useLocation } from 'react-router-dom'
import type { CSSProperties, ReactNode, RefObject } from 'react'
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'

/** L-shaped markers: 12px arm, 1.5px #000 */
function CornerMarkers() {
  return (
    <>
      <span
        className="pointer-events-none absolute left-0 top-0 z-[1] h-[12px] w-[12px] border-l-[1.5px] border-t-[1.5px] border-solid border-black"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute right-0 top-0 z-[1] h-[12px] w-[12px] border-r-[1.5px] border-t-[1.5px] border-solid border-black"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-0 left-0 z-[1] h-[12px] w-[12px] border-b-[1.5px] border-l-[1.5px] border-solid border-black"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-0 right-0 z-[1] h-[12px] w-[12px] border-b-[1.5px] border-r-[1.5px] border-solid border-black"
        aria-hidden
      />
    </>
  )
}

function SectionDivider() {
  return <div className="h-px w-full bg-[#e0e0e0]" aria-hidden />
}

/** Numbered pill + tag */
function SectionPill({
  children,
  preserveCase = false,
}: {
  children: string
  /** When true, skip uppercase (e.g. title-style labels). */
  preserveCase?: boolean
}) {
  return (
    <span
      className={`inline-block bg-[rgba(107,53,184,0.1)] px-2 py-1 font-sans text-[14px] font-medium tracking-[0.04em] text-[#6B35B8] ${
        preserveCase ? '' : 'uppercase'
      }`}
    >
      {children}
    </span>
  )
}

function HeroTagPill({ children }: { children: string }) {
  return (
    <span className="inline-block bg-[rgba(107,53,184,0.1)] px-2 py-1 font-dmSans text-[14px] font-medium tracking-[0.02em] text-[#6B35B8]">
      {children}
    </span>
  )
}

const bodyClass = 'font-dmSans text-[16px] leading-[1.7] text-[#333]'
const sectionTitleClass = 'font-dmSans text-[32px] font-semibold text-black'

function ImagePlaceholder({
  width,
  height,
  label,
  className = '',
  hideCornerMarkers = false,
  noBorder = false,
  imageSrc,
  imageAlt,
  /** Tailwind classes for padding around `imageSrc` (default `p-6 sm:p-10`). */
  imagePaddingClassName,
  /** Extra classes on the `img` when `imageSrc` is set (e.g. max height). */
  imageClassName,
  /** Fill `height` and vertically center `imageSrc` in the frame (short/wide assets). */
  centerImageInFrame = false,
  /** Stretch to parent height (grid/flex); keeps minHeight from `height`. */
  fillHeight = false,
  hideCrossPattern = false,
  /** Full-bleed backdrop inside the frame; hides cross pattern unless `crossPatternBehindCover`. */
  backgroundCoverSrc,
  /** How the backdrop fills the frame when `backgroundCoverSrc` is set. */
  backgroundCoverFit = 'cover',
  /** When using `backgroundCoverSrc`, also tile the cross pattern underneath (e.g. SVG with transparency). */
  crossPatternBehindCover = false,
  children,
  labelClassName,
  /** Screen recording or demo clip (MOV/WebM/MP4); native controls, above cross pattern when visible. */
  videoSrc,
}: {
  width: number | string
  height: number | string
  label?: string
  className?: string
  hideCornerMarkers?: boolean
  noBorder?: boolean
  /** When set, shows artwork inside the cross-pattern frame (HDFC-style). */
  imageSrc?: string
  imageAlt?: string
  /** Tailwind classes for padding around `imageSrc` (default `p-6 sm:p-10`). */
  imagePaddingClassName?: string
  /** Extra classes on the `img` when `imageSrc` is set. */
  imageClassName?: string
  centerImageInFrame?: boolean
  fillHeight?: boolean
  hideCrossPattern?: boolean
  backgroundCoverSrc?: string
  backgroundCoverFit?: 'cover' | 'contain'
  crossPatternBehindCover?: boolean
  children?: ReactNode
  /** Override label chip styles (default: cream translucent bg). */
  labelClassName?: string
  videoSrc?: string
}) {
  const h = typeof height === 'number' ? `${height}px` : height
  const w = typeof width === 'number' ? `${width}px` : width
  const borderClass = noBorder ? 'border-0' : 'border border-solid border-[#e0e0e0]'
  const minH =
    typeof height === 'number' || (typeof height === 'string' && !height.endsWith('%'))
      ? h
      : undefined
  const hasVideo = Boolean(videoSrc)
  const hasImage = Boolean(imageSrc && imageAlt)
  const effectiveHasImage = hasImage && !hasVideo

  const outerStyle: CSSProperties = fillHeight
    ? {
        width: w,
        maxWidth: '100%',
        height: '100%',
        ...(minH !== undefined ? { minHeight: minH } : {}),
      }
    : effectiveHasImage && !centerImageInFrame
      ? {
          width: w,
          maxWidth: '100%',
          minHeight: minH ?? h,
          height: 'auto',
        }
      : {
          width: w,
          maxWidth: '100%',
          height: h,
          ...(minH !== undefined ? { minHeight: minH } : {}),
        }

  const innerFillClass = fillHeight ? 'flex min-h-0 flex-1 flex-col justify-center' : ''

  const outerFlexClass =
    fillHeight && children != null
      ? 'flex min-h-0 flex-1 flex-col'
      : fillHeight
        ? 'min-h-0 flex-1'
        : 'shrink-0'

  const showCrossPatternLayer =
    !hideCrossPattern && (!backgroundCoverSrc || crossPatternBehindCover)

  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useLayoutEffect(() => {
    if (!videoSrc) return
    const root = rootRef.current
    const video = videoRef.current
    if (!root || !video) return

    let intersecting = false

    const syncPlayback = () => {
      if (!intersecting || document.visibilityState !== 'visible') {
        video.pause()
        return
      }
      void video.play().catch(() => {
        /* autoplay blocked — user can press play */
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        intersecting = entry.isIntersecting
        syncPlayback()
      },
      { threshold: 0, rootMargin: '0px' },
    )
    observer.observe(root)

    const onVisibility = () => syncPlayback()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      observer.disconnect()
      video.pause()
    }
  }, [videoSrc])

  return (
    <div
      ref={rootRef}
      style={outerStyle}
      className={`relative box-border bg-[#f0eeea] ${borderClass} ${outerFlexClass} ${className} ${effectiveHasImage && centerImageInFrame ? 'flex min-h-0 flex-col' : ''}`}
    >
      {showCrossPatternLayer ? (
        <div className="absolute inset-0 bg-[url('/cross_pattern.png')] bg-repeat opacity-40" aria-hidden />
      ) : null}
      {backgroundCoverSrc && !videoSrc ? (
        <div
          className={`absolute inset-0 z-[1] bg-center bg-no-repeat ${backgroundCoverFit === 'contain' ? 'bg-contain' : 'bg-cover'}`}
          style={{ backgroundImage: `url(${backgroundCoverSrc})` }}
          aria-hidden
        />
      ) : null}
      {videoSrc ? (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center p-2 sm:p-3 [&_video]:pointer-events-auto">
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            muted
            playsInline
            preload="auto"
            className="h-full w-full max-h-full max-w-full object-contain"
            aria-label={label ?? 'Screen recording'}
          />
        </div>
      ) : null}
      {effectiveHasImage ? (
        <div
          className={`relative z-[1] min-h-0 ${centerImageInFrame ? 'flex flex-1 flex-col items-center justify-center' : ''} ${imagePaddingClassName ?? 'p-6 sm:p-10'}`}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className={`mx-auto h-auto w-full max-w-full object-contain ${imageClassName ?? ''}`}
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}
      {!videoSrc && children != null ? (
        <div className={`relative z-[1] w-full ${innerFillClass}`}>{children}</div>
      ) : null}
      {!hideCornerMarkers ? <CornerMarkers /> : null}
      {label ? (
        <span
          className={`absolute bottom-3 left-3 z-[2] px-2 py-1 font-dmSans text-[13px] text-[#333] ${labelClassName ?? 'bg-[rgba(247,246,242,0.92)]'}`}
        >
          {label}
        </span>
      ) : null}
    </div>
  )
}

function QuestionPill({ question, children }: { question: string; children: string }) {
  return (
    <div className="rounded-none border border-solid border-[#e0e0e0] bg-white p-4 font-dmSans text-[14px] leading-[1.65] text-[#333]">
      <p className="m-0 font-semibold">{question}</p>
      <p className="m-0 mt-2 font-normal">{children}</p>
    </div>
  )
}

function CalloutBox({
  label,
  body,
  variant = 'light',
}: {
  label: string
  body: string
  variant?: 'light' | 'dark'
}) {
  const wrap =
    variant === 'dark'
      ? 'border border-solid border-white/20 bg-white/[0.06] p-6 sm:p-8'
      : 'border border-solid border-[#e0e0e0] bg-[#fdfcfa] p-8'
  const labelCls =
    variant === 'dark'
      ? 'font-dmSans text-[13px] font-semibold uppercase tracking-wide text-white/70'
      : 'font-dmSans text-[13px] font-semibold uppercase tracking-wide text-[#555]'
  const bodyCls =
    variant === 'dark'
      ? `${bodyClass} mt-3 text-white/85`
      : `${bodyClass} mt-3`
  return (
    <div className={`rounded-none ${wrap}`}>
      <p className={`m-0 ${labelCls}`}>{label}</p>
      <p className={`m-0 ${bodyCls}`}>{body}</p>
    </div>
  )
}

const navLinkClass = 'text-sm text-muted transition-colors hover:text-foreground'
const navPillBase =
  'inline-flex items-center rounded-[12px] border-[1.5px] px-3.5 py-1.5 text-sm transition-[color,border-color] duration-200 motion-reduce:transition-none'
const navPillInactive = `${navPillBase} border-transparent bg-transparent text-muted hover:text-foreground`
const navPillActive = `${navPillBase} border-[#111] bg-transparent text-foreground`

function CaseStudyNavbar() {
  const { pathname, hash } = useLocation()
  const onCaseStudy = pathname === '/okto'
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
          <Link to="/" className={homeActive ? navPillActive : navPillInactive}>
            Home
          </Link>
          <Link to={{ pathname: '/', hash: 'work' }} className={workActive ? navPillActive : navPillInactive}>
            Work
          </Link>
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
      </nav>
    </div>
  )
}

function useIntersectionOnce<T extends HTMLElement>(ref: RefObject<T | null>, onIntersect: () => void) {
  const cbRef = useRef(onIntersect)
  cbRef.current = onIntersect
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
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

function useCountNumber(end: number, durationMs: number, started: boolean): number {
  const [value, setValue] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (!started) return
    const prefersReduce =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
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

const FINAL_PANELS = [
  { id: 'okto-final-screens', navLabel: 'Final screens' },
  { id: 'okto-recording-mode', navLabel: 'Recording mode' },
  { id: 'okto-conversation-mode', navLabel: 'Conversation mode' },
] as const

function OktoFinalDesignsSection() {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIdx, setActiveIdx] = useState(0)

  useLayoutEffect(() => {
    const nodes = FINAL_PANELS.map((_, i) => sectionRefs.current[i]).filter((n): n is HTMLDivElement =>
      Boolean(n),
    )
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting && e.intersectionRatio > 0)
        if (visible.length === 0) return
        const top = visible.reduce((a, b) => (a.intersectionRatio >= b.intersectionRatio ? a : b))
        const idx = nodes.indexOf(top.target as HTMLDivElement)
        if (idx >= 0) setActiveIdx(idx)
      },
      {
        root: null,
        rootMargin: '-12% 0px -38% 0px',
        threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
      },
    )

    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [])

  const scrollToPanel = (i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative ml-[calc(50%-50vw)] w-screen max-w-[100vw] border-b border-solid border-[#e0e0e0] bg-[#050505] py-16 text-white sm:py-24">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16">
          <aside className="lg:sticky lg:top-[140px] lg:col-span-4 lg:self-start">
            <span className="inline-block border border-white/20 bg-white/[0.06] px-2.5 py-1 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-white/75 sm:text-[12px]">
              11 · Final designs
            </span>
            <h2 className="mt-6 font-dmSans text-[36px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[44px] md:text-[48px]">
              Okto. Eight arms, one goal.
            </h2>
            <p className="mt-5 max-w-[340px] font-dmSans text-[16px] font-normal leading-relaxed text-white/50 sm:text-[17px]">
              We aimed for a product that feels calm when it&apos;s quiet and explicit when it&apos;s
              working—so someone like Maria can hand off a workflow without surrendering control.
            </p>
            <p className="mt-4 max-w-[340px] font-dmSans text-[16px] font-normal leading-relaxed text-white/50 sm:text-[17px]">
              The UI stacks recording, review, and conversation into one coherent spine: capture what
              you do, show how the system understood it, and leave room to correct course early.
            </p>
            <div className="mt-8">
              <CalloutBox
                variant="dark"
                label="The arc of trust"
                body="Trust isn't granted at onboarding—it accumulates through traceability: visible capture, legible interpretation, and reversible steps until outcomes match intuition."
              />
            </div>
            <nav className="mt-10 flex flex-col gap-0.5" aria-label="Jump to final design">
              {FINAL_PANELS.map((block, i) => (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => scrollToPanel(i)}
                  className={`border-l-2 py-2.5 pl-4 text-left font-dmSans text-[15px] font-medium transition-colors sm:text-[16px] ${
                    activeIdx === i
                      ? 'border-white text-white'
                      : 'border-transparent text-white/45 hover:text-white/75'
                  }`}
                >
                  {block.navLabel}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex flex-col gap-14 sm:gap-16 md:gap-20 lg:col-span-8">
            <div
              id={FINAL_PANELS[0].id}
              ref={(el) => {
                sectionRefs.current[0] = el
              }}
              className="scroll-mt-[100px] md:scroll-mt-[108px]"
            >
              <ImagePlaceholder width="100%" height={520} label="Okto — final design screens" className="w-full" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              <div
                id={FINAL_PANELS[1].id}
                ref={(el) => {
                  sectionRefs.current[1] = el
                }}
                className="scroll-mt-[100px] md:scroll-mt-[108px]"
              >
                <ImagePlaceholder width="100%" height={340} label="Recording mode" className="w-full" />
              </div>
              <div
                id={FINAL_PANELS[2].id}
                ref={(el) => {
                  sectionRefs.current[2] = el
                }}
                className="scroll-mt-[100px] md:scroll-mt-[108px]"
              >
                <ImagePlaceholder width="100%" height={340} label="Conversation mode" className="w-full" />
              </div>
            </div>
            <p className="max-w-[560px] font-dmSans text-[16px] font-normal leading-relaxed text-[#a1a1a1] sm:text-[17px]">
              Where we landed treats automation less like a black box and more like a teammate on a
              short leash: visible presence, interruptible actions, and language that mirrors how
              people already explain their jobs across tools.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

const oktoDescription =
  'UX case study (in progress): Okto by Superlabs — designing a voice and recording-led setup flow so non-technical teams can automate workflows without IT-heavy implementations.'

/** Favicon-derived marks per domain; swap files in /public/competitor-logos/ for official brand assets. */
const COMPETITOR_LANDSCAPE_LOGOS = [
  { src: '/competitor-logos/gumloop.png', name: 'Gumloop' },
  { src: '/competitor-logos/flowise.jpg', name: 'Flowise' },
  { src: '/competitor-logos/dify.png', name: 'Dify' },
  { src: '/competitor-logos/power-automate.png', name: 'Power Automate' },
  { src: '/competitor-logos/palantir.png', name: 'Palantir Foundry' },
  { src: '/competitor-logos/vercept.png', name: 'Vercept' },
  { src: '/competitor-logos/servicenow.png', name: 'ServiceNow' },
  { src: '/competitor-logos/tropic.png', name: 'Tropic' },
  { src: '/competitor-logos/zylo.png', name: 'Zylo' },
] as const

const COMPETITOR_LANDSCAPE_ROWS = [
  COMPETITOR_LANDSCAPE_LOGOS.slice(0, 3),
  COMPETITOR_LANDSCAPE_LOGOS.slice(3, 6),
  COMPETITOR_LANDSCAPE_LOGOS.slice(6, 9),
]

export default function OktoCaseStudy() {
  const statsRef = useRef<HTMLDivElement | null>(null)
  const [statsStarted, setStatsStarted] = useState(false)
  useIntersectionOnce(statsRef, () => setStatsStarted(true))
  const statInterviews = useCountNumber(6, 1200, statsStarted)
  const statManual = useCountNumber(47, 1400, statsStarted)

  return (
    <div className="min-h-screen overflow-x-clip bg-[#F7F6F2] text-foreground antialiased">
      <Helmet>
        <title>Okto — Superlabs | UX Case Study (In Progress) | Reshma Lokanathan</title>
        <meta name="description" content={oktoDescription} />
        <meta property="og:title" content="Okto — Superlabs | UX Case Study | Reshma Lokanathan" />
        <meta property="og:description" content={oktoDescription} />
        <meta property="og:url" content="https://reshmalokanathan.com/okto" />
        <meta property="og:type" content="website" />
      </Helmet>
      <CaseStudyNavbar />

      <div className="pt-[calc(16px+76px)] sm:pt-[calc(20px+76px)]" />

      <main className="mx-auto w-full max-w-[1200px] px-4 pb-28 sm:px-6">
        {/* Hero */}
        <section className="border-y border-solid border-[#e0e0e0] py-14">
          <HeroTagPill>Superlabs Inc</HeroTagPill>
          <h1 className="mt-6 max-w-[920px] font-dmSans text-[44px] font-semibold leading-[1.1] text-black sm:text-[48px]">
            Designing a Voice and Recording-Led Setup Flow for AI Workflow Automation
          </h1>
          <p className={`mt-6 max-w-[900px] ${bodyClass}`}>
            Superlabs is a pre-seed startup with a bold idea: non-technical people should be able to
            automate their own workflows, without IT, without a developer, and without a three-month
            implementation. We were brought in to figure out what that actually looks like.
          </p>
          <div
            ref={statsRef}
            className="mt-12 grid grid-cols-1 gap-px border border-solid border-[#e0e0e0] bg-[#e0e0e0] sm:grid-cols-2 lg:grid-cols-5"
          >
            {(
              [
                ['Company', 'Superlabs Inc.'],
                ['Product', 'Okto'],
                ['My role', 'Product Designer'],
                ['Team', '4 (2 designers, 1 PM, 1 researcher)'],
                ['Status', 'Ongoing · Spring 2026'],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="bg-[#fdfcfa] px-5 py-6">
                <p className="m-0 font-dmSans text-[13px] font-semibold uppercase tracking-wide text-[#555]">
                  {k}
                </p>
                <p className="mt-2 mb-0 font-dmSans text-[15px] leading-snug text-black">{v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 01 — Project Overview */}
        <section className="py-14">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,35%)_minmax(0,65%)] lg:items-start lg:gap-10">
            <div className="min-w-0">
              <SectionPill>01 · Project Overview</SectionPill>
              <h2 className={`${sectionTitleClass} mt-4`}>Everything built from scratch</h2>
              <p className={`${bodyClass} mt-4`}>
                There was no mature product to iterate on—only hypotheses, investor decks, and the
                founder&apos;s proof that bespoke automations could be stitched together manually if someone
                technical babysat the toolchain long enough.
              </p>
              <p className={`${bodyClass} mt-4`}>
                Our challenge was to translate that founder grit into something repeatable: an experience
                where operations-minded people could externalize tacit process knowledge without feeling
                like they had joined an engineering team by accident.
              </p>
            </div>
            <div className="min-w-0">
              <ImagePlaceholder
                width="100%"
                height={520}
                label="Joey's repetitive workflow - the problem"
                className="w-full"
                imageSrc="/okto-joey-workflow-storyboard.png"
                imageAlt="Eight-panel illustrated storyboard of Joey’s daily workflow: juggling SAP, Excel, CRM, PDF sign-off, report builder, colleague pings, fragmented tasks, and the desire for a better way."
              />
            </div>
          </div>
          <div className="mt-10">
            <CalloutBox
              label="The scope we landed on"
              body="After months of research and iteration, we focused on one moment: the first time a user sits down to capture their workflow and hand it to an AI. Get this right, and the rest becomes possible."
            />
          </div>
        </section>

        <SectionDivider />

        {/* 02 — Research */}
        <section className="py-14">
          <div className="mb-6">
            <SectionPill preserveCase>User Research</SectionPill>
            <h2 className={`${sectionTitleClass} mt-4`}>The pattern across six very different jobs.</h2>
          </div>
          <p className={`${bodyClass} max-w-[900px]`}>
            We paired foundational interviews with diary prompts about “what broke last week” so people
            weren&apos;t performing expertise—they were narrating friction. The same phrases surfaced
            again and again: visibility, blame, and the quiet shame of not knowing which tool actually
            held the truth.
          </p>
          <p className={`${bodyClass} mt-4 max-w-[900px]`}>
            Synthesis wasn&apos;t a tidy persona exercise; it was an argument with ourselves about what
            automation replaces (clicks) versus what it must preserve (accountability and narrative).
          </p>

          <div className="mt-12 grid grid-cols-1 divide-y divide-[#e0e0e0] border border-solid border-[#e0e0e0] bg-white md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="font-sans text-[18px] text-black">User interviews</span>
              <p className="mt-3 mb-0 font-dmSans text-[36px] font-bold tabular-nums leading-none text-black">
                {statInterviews}
              </p>
              <span className={`mt-3 ${bodyClass}`}>sessions across roles and industries</span>
            </div>
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="font-sans text-[18px] text-black">Manual work</span>
              <p className="mt-3 mb-0 font-dmSans text-[36px] font-bold tabular-nums leading-none text-black">
                {statManual}%
              </p>
              <span className={`mt-3 ${bodyClass}`}>of the workday spent on manual tasks (self-reported bands)</span>
            </div>
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="font-sans text-[18px] text-black">Themes</span>
              <p className="mt-3 mb-0 font-dmSans text-[36px] font-bold tabular-nums leading-none text-black">
                4
              </p>
              <span className={`mt-3 ${bodyClass}`}>core themes from affinity clustering</span>
            </div>
          </div>

          <div className="mt-10 overflow-hidden border border-solid border-[#e0e0e0] bg-white lg:mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-stretch">
              <div className="flex min-h-[380px] min-w-0 flex-col border-b border-solid border-[#e0e0e0] lg:h-full lg:min-h-0 lg:border-b-0 lg:border-r lg:border-[#e0e0e0]">
                <ImagePlaceholder
                  width="100%"
                  height={380}
                  label="Affinity mapping — secondary data visualizations"
                  className="w-full flex-1"
                  fillHeight
                  noBorder
                  backgroundCoverSrc="/okto-affinity-mapping-notes.png"
                />
              </div>
              <div className="flex min-w-0 flex-col bg-white lg:h-full lg:min-h-0">
                {(
                  [
                    [
                      {
                        title: 'Trust is built like you train an intern',
                        body:
                          'People mentally simulate oversight loops—what they check first, what proof counts—and automation has to earn passes through those same gates.',
                      },
                      {
                        title: 'Adoption fails in the handoff not the launch',
                        body:
                          'Excitement evaporates when outputs land in someone else’s inbox with no shared story about how they were produced.',
                      },
                    ],
                    [
                      {
                        title: 'The anxiety is about invisibility',
                        body:
                          'The scary part isn’t “AI”; it’s not being able to point to the moment the system misunderstood you.',
                      },
                      {
                        title: 'Everyone is already a human API',
                        body:
                          'Office managers already translate between tools; we’re designing for people who broker glue work between SaaS islands.',
                      },
                    ],
                  ] as const
                ).map((row, rowIdx) => (
                  <Fragment key={`theme-row-${rowIdx}`}>
                    {rowIdx > 0 ? (
                      <div className="h-px w-full shrink-0 bg-[#e0e0e0]" aria-hidden />
                    ) : null}
                    <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                      {row.map((card, ci) => {
                        const themeNum = rowIdx * 2 + ci + 1
                        return (
                          <article
                            key={card.title}
                            className={`flex flex-col border-solid border-[#e0e0e0] px-7 py-8 ${ci === 1 ? 'border-t md:border-t-0 md:border-l' : ''}`}
                          >
                            <span className="inline-flex items-center justify-center self-start rounded-md bg-[rgba(107,53,184,0.12)] px-2.5 py-2 font-sans text-[13px] font-semibold tabular-nums tracking-tight text-[#4f2d8a]">
                              Theme {String(themeNum).padStart(2, '0')}
                            </span>
                            <h3 className="mt-5 font-dmSans text-[17px] font-semibold leading-snug text-[#1a1a1a]">{card.title}</h3>
                            <p className={`mt-3 mb-0 font-dmSans text-[13px] leading-[1.65] text-[#5c5c5c]`}>{card.body}</p>
                          </article>
                        )
                      })}
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          <blockquote className="mt-12 max-w-[900px] border-l-2 border-solid border-[#6B35B8] pl-6 font-dmSans text-[18px] font-normal italic leading-relaxed text-[#333] sm:text-[20px]">
            “I need to see with my own eyes that it&apos;s doing it the right way before I start trusting it.”
            <footer className="mt-4 font-dmSans text-[15px] font-medium not-italic text-[#555]">
              — P3, Project Manager · Construction
            </footer>
          </blockquote>
        </section>

        <SectionDivider />

        {/* 03 — Competitive Analysis */}
        <section className="py-14">
          <div className="mb-6">
            <SectionPill>03 · Competitive Analysis</SectionPill>
            <h2 className={`${sectionTitleClass} mt-4`}>Everyone is selling to IT. Nobody is selling to Joey.</h2>
          </div>
          <p className={`${bodyClass} max-w-[900px]`}>
            We mapped vendors across two axes: how technical the buyer expects to be, and how much of the
            workflow lives inside a single vendor versus orchestration across tools. The crowded quadrant
            was “enterprise IT installs this for you”—thin air for the admin lead wiring fourteen SaaS apps.
          </p>
          <p className={`${bodyClass} mt-4 max-w-[900px]`}>
            That gap clarified positioning: Okto isn&apos;t permissioned automation inside one suite—it&apos;s
            legible capture across the messy reality of operational glue work.
          </p>
          <div className="mt-10 overflow-hidden border border-solid border-[#e0e0e0] bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,60%)_minmax(0,40%)] lg:items-stretch">
              <div className="flex min-h-[520px] min-w-0 flex-col border-b border-solid border-[#e0e0e0] lg:h-full lg:min-h-0 lg:border-b-0 lg:border-r lg:border-[#e0e0e0]">
                <ImagePlaceholder
                  width="100%"
                  height={520}
                  label="Competitive landscape map"
                  labelClassName="bg-white"
                  className="w-full flex-1"
                  fillHeight
                  noBorder
                >
                  <div className="flex flex-1 flex-col items-center justify-center gap-y-10 px-6 py-8 sm:px-8 sm:py-10">
                    <p className="sr-only">
                      Competitive landscape logos in three rows of three: Gumloop, Flowise, Dify, Power
                      Automate, Palantir Foundry, Vercept, ServiceNow, Tropic, and Zylo.
                    </p>
                    <div className="flex flex-col items-center gap-y-10">
                      {COMPETITOR_LANDSCAPE_ROWS.map((row, rowIdx) => (
                        <div
                          key={rowIdx}
                          className="flex max-w-full flex-wrap justify-center gap-x-6 gap-y-8 sm:gap-x-8 md:gap-x-10"
                        >
                          {row.map((logo) => (
                            <div
                              key={logo.name}
                              className="flex w-[112px] shrink-0 flex-col items-center gap-2 text-center sm:w-[124px] md:w-[136px]"
                            >
                              <img
                                src={logo.src}
                                alt={`${logo.name} logo`}
                                className="h-[56px] w-auto max-w-[120px] object-contain sm:h-[68px] sm:max-w-[132px] md:h-[76px] md:max-w-[144px]"
                                loading="lazy"
                                decoding="async"
                              />
                              <span className="font-dmSans text-[11px] font-medium leading-snug text-[#333] sm:text-[12px]">
                                {logo.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </ImagePlaceholder>
              </div>
              <div className="flex min-h-0 flex-col divide-y divide-[#e0e0e0] bg-[#fdfcfa] lg:h-full">
                {(
                  [
                    'Technical complexity remains a barrier. Competitors still require dedicated technical teams. Intuitive, conversational approaches consistently stand out as the differentiator.',
                    'Users want to prove value on their own terms. Free trials, self-serve dashboards, and small implementations let users experience results before committing.',
                    'ROI needs to be visible and specific. The most effective competitors quantify savings in dollar amounts and surface metrics relevant to each user\'s role.',
                  ] as const
                ).map((text, i) => (
                  <div
                    key={i}
                    className="flex flex-1 basis-0 flex-col justify-center px-5 py-6 sm:px-6"
                  >
                    <span className="inline-flex items-center justify-center self-start rounded-md bg-[rgba(107,53,184,0.12)] px-2.5 py-2 font-sans text-[13px] font-semibold tabular-nums tracking-tight text-[#4f2d8a]">
                      Insight {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="m-0 mt-4 font-dmSans text-[13px] leading-[1.65] text-[#333]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10">
            <CalloutBox
              label="Vercept"
              body="Vercept sat closest to “ambient monitoring” narratives—we pushed harder on consentful capture and reversible teaching moments rather than silent observation."
            />
          </div>
          <p className={`${bodyClass} mt-8 max-w-[900px]`}>
            Five takeaways anchored downstream decisions: sell outcomes not connectors; pair capture with
            confirmation UI; avoid surveillance framing; design for partial automation; and assume every
            workflow has a human escalation path that must remain dignified.
          </p>
        </section>

        <SectionDivider />

        {/* 04 — User Journey Explorations */}
        <section className="py-14">
          <div className="mb-6">
            <SectionPill>04 · User Journey Explorations</SectionPill>
            <h2 className={`${sectionTitleClass} mt-4`}>We tried a lot of versions before we knew what we were building.</h2>
          </div>
          <p className={`${bodyClass} max-w-[900px]`}>
            Journey explorations stayed deliberately messy—whiteboards with parallel flows for billing,
            onboarding vendors, and exec scheduling—until patterns condensed into three interacting modes
            instead of three disconnected features.
          </p>

          <div className="mt-10 overflow-hidden border border-solid border-[#e0e0e0] bg-white grid grid-cols-1 lg:grid-cols-[minmax(0,30%)_minmax(0,70%)] lg:items-stretch">
            <div className="divide-y divide-[#e0e0e0]">
              {(
                [
                  {
                    title: 'Record',
                    body:
                      'Ambient capture with explicit start/stop cues so “being watched” transforms into “being taught.”',
                  },
                  {
                    title: 'Prompt',
                    body:
                      'Lightweight clarifying questions that stitch gaps without turning setup into an interrogation.',
                  },
                  {
                    title: 'Conversation',
                    body:
                      'A readable dialogue layer where corrections feel like coaching—not debugging terminal output.',
                  },
                ] as const
              ).map((c) => (
                <article key={c.title} className="px-7 py-8">
                  <h3 className="font-dmSans text-[17px] font-semibold leading-snug text-[#1a1a1a]">{c.title}</h3>
                  <p className={`mt-3 mb-0 font-dmSans text-[15px] leading-[1.65] text-[#5c5c5c]`}>{c.body}</p>
                </article>
              ))}
            </div>
            <div className="flex h-full min-h-[460px] min-w-0 flex-col border-t border-solid border-[#e0e0e0] lg:min-h-0 lg:border-t-0 lg:border-l lg:border-[#e0e0e0]">
              <ImagePlaceholder
                width="100%"
                height={460}
                label="User flow iterations — Joey's billing workflow"
                labelClassName="bg-white"
                className="w-full flex-1"
                fillHeight
                noBorder
                backgroundCoverSrc="/Userflow.svg"
                backgroundCoverFit="contain"
                crossPatternBehindCover
              />
            </div>
          </div>

          <p className={`${bodyClass} mt-10 max-w-[900px]`}>
            Recording mode carried the most baggage culturally—associations with surveillance tooling ran
            hot—so we prototyped consent rhythms, visible indicators, and granular deletion paths before we
            chased clever inference.
          </p>
          <p className={`${bodyClass} mt-10 max-w-[900px]`}>
            What consolidated was less a linear funnel than a spiral: capture enough fidelity to replay,
            pause for human checkpoints at ambiguous forks, and let conversation compress weeks of tacit
            knowledge into something shareable.
          </p>
        </section>

        <SectionDivider />

        {/* 05 — Challenges Around Recording */}
        <section className="py-14">
          <div className="mb-6">
            <SectionPill>05 · Challenges Around Recording</SectionPill>
            <h2 className={`${sectionTitleClass} mt-4`}>Recording sounds simple. It isn&apos;t.</h2>
          </div>
          <p className={`${bodyClass} max-w-[900px]`}>
            Each assumption—what counts as a step, whether narration is natural, how collaborators enter
            frame—had downstream implications for trust and legal comfort. We surfaced disagreements early so
            engineering didn&apos;t optimize the wrong latency bottleneck.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            <QuestionPill question="How much is enough?">
              Define minimum viable fidelity without pushing users into infinite capture anxiety—or brittle,
              overfitted automations.
            </QuestionPill>
            <QuestionPill question="Will users actually narrate?">
              Test prompts, pacing, and recovery when someone forgets mid-flow; narration can&apos;t be the
              only channel for intent.
            </QuestionPill>
            <QuestionPill question="Real-time feedback: helpful or surveillance?">
              Balance reassurance cues against the feeling of being scored while doing normal work.
            </QuestionPill>
            <QuestionPill question="What about collaborative workflows?">
              Attribute edits without turning coworkers into suspects; shared ownership needs shared safety.
            </QuestionPill>
          </div>
          <div className="mt-10">
            <CalloutBox
              label="The tension we kept returning to"
              body="Visibility heals trust when it's paired with control—otherwise it becomes proof-of-work theater that punishes the people we're trying to empower."
            />
          </div>
        </section>

        <SectionDivider />

        {/* 06 — Emerging Questions */}
        <section className="py-14">
          <div className="mb-6">
            <SectionPill>06 · Emerging Questions</SectionPill>
            <h2 className={`${sectionTitleClass} mt-4`}>The more we designed, the more we didn&apos;t know.</h2>
          </div>
          <p className={`${bodyClass} max-w-[900px]`}>
            Open questions became guardrails: we documented them publicly inside the team so scope debates
            referenced risks instead of personalities—especially where product metaphors touched enterprise
            procurement realities we hadn&apos;t stress-tested yet.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <QuestionPill question="Parts vs. wholes">
              Should automation chunks mirror tickets, emails, or human mental models of “the job”?
            </QuestionPill>
            <QuestionPill question="Controls without overwhelm">
              Progressive disclosure versus expert surfaces—who earns density, and when?
            </QuestionPill>
            <QuestionPill question="What happens offline?">
              Capture degrades gracefully when VPNs fail mid-task—the workflow can&apos;t strand Maria.
            </QuestionPill>
            <QuestionPill question="Resilience over time">
              Drift detection when apps update underneath recorded flows—how loudly should Okto complain?
            </QuestionPill>
            <QuestionPill question="The escalation chain">
              When automation misfires, who sees it first—and what language prevents blame cascades?
            </QuestionPill>
          </div>
        </section>

        <SectionDivider />

        {/* 07 — Testing adoption signals */}
        <section className="py-14">
          <div className="mb-6">
            <SectionPill>07 · Testing adoption signals</SectionPill>
            <h2 className={`${sectionTitleClass} mt-4`}>We built two prototypes and watched people use them.</h2>
          </div>
          <p className={`${bodyClass} max-w-[900px]`}>
            We recruited participants with operational breadth—not just software fluency—and ran moderated
            sessions that emphasized think-aloud during capture and retrospective trust calibration after.
          </p>
          <p className={`${bodyClass} mt-4 max-w-[900px]`}>
            Prototypes diverged on how explicitly Okto announced itself in the OS chrome versus staying
            whisper-quiet until summoned; reactions split cleanly across risk posture and role power dynamics.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="border border-solid border-[#e0e0e0] bg-[#fdfcfa] p-8">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="m-0 font-dmSans text-[20px] font-semibold text-black">Prototype A</h3>
                <span className="inline-block border border-solid border-[#e0e0e0] bg-white px-2 py-1 font-dmSans text-[12px] font-medium text-[#333]">
                  ambient, minimal
                </span>
              </div>
              <p className={`${bodyClass} mt-4`}>
                Favored by participants who wanted automation to feel like a quiet copilot—until something
                broke and they hunted for where Okto was “looking.”
              </p>
              <p className="mt-4 mb-0 font-dmSans text-[13px] font-semibold text-[#6B35B8]">Tension · Legibility vs. calm</p>
            </div>
            <div className="border border-solid border-[#e0e0e0] bg-[#fdfcfa] p-8">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="m-0 font-dmSans text-[20px] font-semibold text-black">Prototype B</h3>
                <span className="inline-block border border-solid border-[#e0e0e0] bg-white px-2 py-1 font-dmSans text-[12px] font-medium text-[#333]">
                  Zoom-like, explicit control
                </span>
              </div>
              <p className={`${bodyClass} mt-4`}>
                Preferred when participants wanted theatrical clarity—clear modes, obvious boundaries—at the
                cost of feeling “always on stage” during sensitive screens.
              </p>
              <p className="mt-4 mb-0 font-dmSans text-[13px] font-semibold text-[#6B35B8]">Tension · Performance anxiety</p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <ImagePlaceholder
              width="100%"
              height={460}
              label="Adoption testing - A"
              className="w-full"
              videoSrc="/okto-adoption-testing-recording.mov"
            />
            <ImagePlaceholder
              width="100%"
              height={460}
              label="Adoption testing - B"
              className="w-full"
              videoSrc="/okto-adoption-pearl-recording.mov"
            />
          </div>

          <p className={`${bodyClass} mt-10 max-w-[900px]`}>
            Results weren&apos;t a winner-take-all verdict—they were a calibration curve. Teams with stronger IT
            partnerships tolerated ambient patterns; smaller shops skewed toward explicit guardrails that
            doubled as training wheels.
          </p>
          <p className={`${bodyClass} mt-4 max-w-[900px]`}>
            We logged failures as richly as successes: hesitation clicks, repeated pauses at consent screens,
            and language participants invented to describe “where the agent is” became interaction copy seeds.
          </p>
          <p className={`${bodyClass} mt-4 max-w-[900px]`}>
            The through-line was consent ergonomics: participants forgave imperfection when they felt able to
            steer, interrupt, and roll back—less so when intelligence felt theatrical or coy.
          </p>

          <blockquote className="mt-10 max-w-[900px] border-l-2 border-solid border-[#6B35B8] pl-6 font-dmSans text-[18px] font-normal italic leading-relaxed text-[#333] sm:text-[20px]">
            “Where is Pearl&apos;s eye looking right now?”
            <footer className="mt-4 font-dmSans text-[15px] font-medium not-italic text-[#555]">
              — Testing participant
            </footer>
          </blockquote>
        </section>

        <SectionDivider />

        {/* 08 — Presence Indicators */}
        <section className="py-14">
          <div className="mb-6">
            <SectionPill>08 · Presence Indicators</SectionPill>
            <h2 className={`${sectionTitleClass} mt-4`}>Making intelligence legible.</h2>
          </div>
          <p className={`${bodyClass} max-w-[900px]`}>
            Presence isn&apos;t ornament—it&apos;s the semantic bridge between “something smart is happening” and “I
            can intervene.” We treated indicators as a system: consistent posture in the menu bar, consistent
            semantics on-screen, and predictable escalation into explicit controls.
          </p>
          <p className={`${bodyClass} mt-4 max-w-[900px]`}>
            The goal was legibility without spectacle: calm defaults that intensify in informational density
            only when risk or ambiguity spikes.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {(
              [
                {
                  n: '01',
                  title: 'The menu bar icon',
                  body:
                    'A quiet heartbeat state when idle; shifts weight subtly during capture without mimicking surveillance recording LEDs.',
                },
                {
                  n: '02',
                  title: 'Screen-level reading highlights',
                  body:
                    'Transient emphasis tied to comprehension—not decorative gradients—so users map AI attention to concrete UI regions.',
                },
                {
                  n: '03',
                  title: 'Live comprehension feedback',
                  body:
                    'Short, reversible summaries during capture that invite correction (“Did you mean this invoice cycle?”).',
                },
                {
                  n: '04',
                  title: 'Controls as indicators',
                  body:
                    'Pause, exclude window, and redaction aren’t buried settings—they’re part of how Okto proves manners.',
                },
              ] as const
            ).map((row) => (
              <article
                key={row.n}
                className="flex flex-col gap-6 border border-solid border-[#e0e0e0] bg-white p-6"
              >
                <ImagePlaceholder
                  width="100%"
                  height={304}
                  label={row.title}
                  labelClassName="bg-white"
                  className="w-full shrink-0"
                  {...(row.n === '01'
                    ? {
                        backgroundCoverSrc: '/okto-presence-menu-bar-icon.png',
                        backgroundCoverFit: 'contain' as const,
                      }
                    : row.n === '02'
                      ? {
                          imageSrc: '/okto-presence-invoice-preview.png',
                          imageAlt:
                            'Composite workflow: Slack DM with TechSupplies invoice PDF highlighted, QuickBooks vendor expense form prefilled for TechSupplies Inc. INV-892 $847.50, and Okto overlay showing recording timer plus recent tracked steps linking Slack to QuickBooks.',
                          imagePaddingClassName: 'p-[32px]',
                        }
                      : row.n === '03'
                        ? {
                            imageSrc: '/okto-presence-live-comprehension-card.png',
                            imageAlt:
                              'Recent steps Okto tracked card: Recording armed with Joey\'s Slack DM and Vendor Expenses form centered; timestamp 2:08 PM.',
                            imagePaddingClassName: 'p-[32px]',
                            centerImageInFrame: true,
                          }
                        : row.n === '04'
                        ? {
                            imageSrc: '/okto-presence-controls-mini-preview.png',
                            imageAlt:
                              'Mini preview control panel marked LIVE with preview stage, Mute and Watch actions, green Stop Share button, and red End button.',
                            imagePaddingClassName: 'p-5',
                            imageClassName: 'max-h-[264px]',
                          }
                        : {})}
                />
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                  <span className="inline-flex h-10 min-w-[2.5rem] shrink-0 items-center justify-center bg-[rgba(107,53,184,0.12)] font-sans text-[14px] font-semibold tabular-nums text-[#4f2d8a]">
                    {row.n}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-dmSans text-[18px] font-semibold text-black">{row.title}</h3>
                    <p className={`mt-2 mb-0 ${bodyClass}`}>{row.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <SectionDivider />

        <OktoFinalDesignsSection />
      </main>

      <footer className="border-t border-solid border-[#e0e0e0] bg-[#F7F6F2] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-[1200px] font-dmSans text-[14px] leading-relaxed text-[#555]">
          HCDE Capstone · Team Brunch Club · Superlabs Inc., Seattle · Spring 2026. All participant quotes are
          anonymized. Project ongoing.
        </div>
      </footer>
    </div>
  )
}
