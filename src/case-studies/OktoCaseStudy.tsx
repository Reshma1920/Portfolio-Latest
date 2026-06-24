'use client'

import { Helmet } from 'react-helmet-async'
import { SiteNav, SiteNavSpacer } from '../components/SiteNav'
import { caseStudyContainerClass, caseStudyMainClass } from './caseStudyLayout'
import type { CSSProperties, ReactNode, RefObject } from 'react'
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/** L-shaped markers: 8px arm, 1.5px #000 */
function CornerMarkers() {
  return (
    <>
      <span
        className="pointer-events-none absolute left-0 top-0 z-[1] h-[8px] w-[8px] border-l-[1.5px] border-t-[1.5px] border-solid border-black"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute right-0 top-0 z-[1] h-[8px] w-[8px] border-r-[1.5px] border-t-[1.5px] border-solid border-black"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-0 left-0 z-[1] h-[8px] w-[8px] border-b-[1.5px] border-l-[1.5px] border-solid border-black"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-0 right-0 z-[1] h-[8px] w-[8px] border-b-[1.5px] border-r-[1.5px] border-solid border-black"
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
const sectionTitleClass = 'font-dmSans text-[28px] font-semibold text-black'
const inDepthPanelTitleClass = 'font-dmSans text-[22px] font-semibold text-black'
/** 24px first-line box (leading-6) aligns 24×24 icon center with first line via items-start. */
const featureInsightIconRowClass = 'flex items-start gap-3'
const featureInsightTitleClass = 'font-dmSans text-[18px] font-semibold leading-6 text-black'

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
  /** Wrapper around `<video>` when `videoSrc` is set; default centered with `p-2 sm:p-3`. */
  videoContainerClassName,
  /** Extra classes on `<video>` when `videoSrc` is set (e.g. hover-only controls helper). */
  videoClassName,
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
  videoContainerClassName?: string
  videoClassName?: string
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
        <div
          className={
            videoContainerClassName ??
            'pointer-events-none absolute inset-0 z-[1] flex items-center justify-center p-2 sm:p-3 [&_video]:pointer-events-auto'
          }
        >
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            muted
            playsInline
            preload="auto"
            className={
              videoClassName
                ? `max-h-full max-w-full shrink-0 object-contain ${videoClassName}`
                : 'h-full w-full max-h-full max-w-full object-contain'
            }
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

const researchOverviewFieldLabelClass =
  'font-dmSans text-[13px] font-semibold uppercase tracking-wide text-[#555]'

type ResearchOverviewColumn = {
  tag: string
  number: string
  subtitle: string
  whatWeDid: string
  keyMoment: string
  decision: string
  imageSrc?: string
  imageAlt?: string
}

const RESEARCH_OVERVIEW_COLUMNS: ResearchOverviewColumn[] = [
  {
    tag: 'Foundation',
    number: '01',
    subtitle: 'Secondary data analysis + competitive analysis',
    imageSrc: '/okto-primary-research-charts.png',
    imageAlt:
      'ATUS/BLS charts: how employees split their workday and manual repetitive work hours per week by role.',
    whatWeDid:
      'We used ATUS/BLS data to identify which industries carry the highest manual workflow burden, then evaluated 10 competitors to understand where existing tools fall short.',
    keyMoment:
      'Vercept was acquired by Anthropic the same week we downloaded it. That made the pace of this industry very concrete.',
    decision:
      'We scoped to SMB employees in high-manual-workflow industries and moved away from designing for executives. The data told us where the real gap was.',
  },
  {
    tag: 'Grounding',
    number: '02',
    subtitle: '6 participants across diverse industries',
    imageSrc: '/okto-affinity-mapping-notes.png',
    imageAlt:
      'Affinity mapping notes from user research sessions — clustered themes and participant insights across diverse industries.',
    whatWeDid:
      "We recruited across industries intentionally, our target user wasn't one type of worker. We looked for patterns across very different contexts.",
    keyMoment:
      'Every user had a completely different mental model of what automation should do for them. That range was the core design challenge.',
    decision:
      'We shifted our research questions entirely to the employee side, focusing on trust and control rather than metrics and executive dashboards.',
  },
  {
    tag: 'Validation',
    number: '03',
    subtitle: 'Usability testing + prototyping',
    whatWeDid:
      'We built two prototypes at opposite ends of a spectrum — one minimal, one familiar — and tested both to see where users actually land.',
    keyMoment:
      'Nobody landed cleanly on either end. Users wanted the control of one and the simplicity of the other.',
    decision:
      'We combined both directions into one final prototype with full visual polish and design system consistency, grounded in what users showed us.',
    imageSrc: '/okto-validation-prototype.png',
    imageAlt:
      'Superlabs validation prototype dashboard: Hey Joey greeting, automate prompt, suggested task cards, and automation stats showing time saved.',
  },
]

function OktoResearchOverviewSection() {
  return (
    <section className="py-14">
      <SectionPill>02 • Research Overview</SectionPill>

      <div className="mt-10 grid grid-cols-1 divide-y divide-[#e0e0e0] border border-solid border-[#e0e0e0] bg-white md:grid-cols-3 md:grid-rows-[repeat(6,auto)] md:divide-x md:divide-y-0">
        {RESEARCH_OVERVIEW_COLUMNS.map((column) => (
          <article
            key={column.number}
            className="grid min-w-0 grid-rows-[repeat(6,auto)] px-6 py-8 sm:px-7 sm:py-9 md:row-span-6 md:grid-rows-subgrid md:items-start"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center justify-center bg-[rgba(107,53,184,0.12)] px-2.5 py-2 font-sans text-[13px] font-semibold tabular-nums tracking-tight text-[#4f2d8a]">
                {column.number}
              </span>
              <span className="font-sans text-[14px] font-medium uppercase tracking-[0.04em] text-black">
                {column.tag}
              </span>
            </div>

            <div className="mt-4 w-full md:mt-0 md:pt-4">
              <ImagePlaceholder
                width="100%"
                height={168}
                className="w-full"
                centerImageInFrame={Boolean(column.imageSrc)}
                {...(column.imageSrc && column.imageAlt
                  ? {
                      imageSrc: column.imageSrc,
                      imageAlt: column.imageAlt,
                      hideCrossPattern: true,
                      imagePaddingClassName: 'p-3 sm:p-4',
                      imageClassName: 'max-h-full max-w-full object-contain',
                    }
                  : {})}
              />
            </div>

            <p className="m-0 mt-4 font-dmSans text-[11px] font-semibold uppercase tracking-[0.06em] text-[#555] md:mt-0 md:pt-4">
              {column.subtitle}
            </p>

            <div className="mt-8 md:mt-0 md:pt-8">
              <p className={`m-0 ${researchOverviewFieldLabelClass}`}>What we did</p>
              <p className="m-0 mt-2 font-dmSans text-[13px] leading-[1.65] text-[#333]">{column.whatWeDid}</p>
            </div>

            <div className="mt-6 md:mt-0 md:pt-6">
              <p className={`m-0 ${researchOverviewFieldLabelClass}`}>Key moment</p>
              <p className="m-0 mt-2 font-dmSans text-[13px] leading-[1.65] text-[#333]">{column.keyMoment}</p>
            </div>

            <div className="mt-6 md:mt-0 md:pt-6">
              <div className="border border-solid border-[rgba(107,53,184,0.2)] bg-[rgba(107,53,184,0.1)] p-[14px]">
                <p className="m-0 font-dmSans text-[13px] font-semibold uppercase tracking-wide text-[#6B35B8]">
                  Decision it drove
                </p>
                <p className="m-0 mt-2 font-dmSans text-[13px] leading-[1.65] text-[#333]">{column.decision}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function OktoTldrSection() {
  const challengeCard = {
    title: 'Challenge',
    intro:
      'Teaching a non-technical user to articulate their own processes clearly for a machine to understand them.',
    scopeItems: [
      'design the UI for the first-time recording experience',
      'develop principles to shape voice-based interactions between user and agent.',
    ],
  }

  const bottomCards = [
    {
      title: 'What we did',
      body:
        '6 user interviews across construction, CPG, and consulting. Competitive analysis of 10 tools across 4 categories. Two prototypes at opposite ends of a spectrum — one ambient and minimal, one Zoom-like and explicit — tested with real users and merged into a single final direction.',
    },
    {
      title: 'What we found',
      body:
        "Users don't choose between control and simplicity. They want simplicity during recording and control at review. The biggest blocker is the inability to capture enough context to build it reliably.",
    },
  ] as const

  const cardPaddingClass = 'px-6 py-6 sm:px-7 sm:py-7'

  return (
    <section className="py-14">
      <h2 className={sectionTitleClass}>TL;DR</h2>

      <div className="relative mt-6 border border-solid border-[#e0e0e0] bg-[#fdfcfa]">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,65%)_minmax(0,35%)]">
          <div className="relative min-w-0 aspect-video border-b border-solid border-[#e0e0e0] lg:border-r lg:border-[#e0e0e0]">
            <ImagePlaceholder
              width="100%"
              height="100%"
              fillHeight
              noBorder
              hideCrossPattern
              className="absolute inset-0 h-full w-full !bg-transparent"
              videoSrc="/Latch_Final.mov"
              videoContainerClassName="absolute inset-0 z-[1] flex items-center justify-center p-0 [&_video]:pointer-events-auto"
              videoClassName="okto-video-controls-hover h-full w-full object-cover"
            />
          </div>

          <article className={`min-w-0 border-b border-solid border-[#e0e0e0] ${cardPaddingClass}`}>
            <p className="m-0 font-sans text-[18px] text-black">{challengeCard.title}</p>
            <p className={`mb-0 mt-3 ${bodyClass}`}>
              {challengeCard.intro}
              <br />
              <br />
              The scope:
              <br />
              {challengeCard.scopeItems.map((item, index) => (
                <Fragment key={item}>
                  ({index + 1}) {item}
                  {index < challengeCard.scopeItems.length - 1 ? <br /> : null}
                </Fragment>
              ))}
            </p>
          </article>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {bottomCards.map((card, index) => (
            <article
              key={card.title}
              className={`${cardPaddingClass} ${index === 0 ? 'border-b border-solid border-[#e0e0e0] lg:border-b-0 lg:border-r lg:border-[#e0e0e0]' : ''}`}
            >
              <p className="m-0 font-sans text-[18px] text-black">{card.title}</p>
              <p className={`mb-0 mt-3 ${bodyClass}`}>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function CaseStudyAccordionItem({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-solid border-[#e0e0e0] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={`group flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors sm:px-7 ${
          open
            ? 'bg-[rgba(107,53,184,0.1)]'
            : 'bg-white hover:bg-[rgba(107,53,184,0.1)]'
        }`}
      >
        <span
          className={`font-dmSans text-[17px] font-semibold transition-colors ${
            open ? 'text-[#6B35B8]' : 'text-black group-hover:text-[#6B35B8]'
          }`}
        >
          {title}
        </span>
        <span
          className={`shrink-0 font-dmSans text-[22px] font-light leading-none tabular-nums transition-colors ${
            open ? 'text-[#6B35B8]' : 'text-[#555] group-hover:text-[#6B35B8]'
          }`}
          aria-hidden
        >
          {open ? '−' : '+'}
        </span>
      </button>
      {open ? (
        <div className="border-t border-solid border-[#e0e0e0] bg-[#fdfcfa] px-6 py-8 sm:px-7 sm:py-9">
          {children}
        </div>
      ) : null}
    </div>
  )
}

function OktoUserResearchPanelContent({
  statInterviews,
  statManual,
}: {
  statInterviews: number
  statManual: number
}) {
  return (
    <>
      <h2 className={`${inDepthPanelTitleClass} mb-6`}>
        We talked to 6 people across construction, CPG, and consulting. Not about automation — about what
        broke last week.
      </h2>

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
              backgroundCoverFit="contain"
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
                {rowIdx > 0 ? <div className="h-px w-full shrink-0 bg-[#e0e0e0]" aria-hidden /> : null}
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
                        <h3 className="mt-5 font-dmSans text-[17px] font-semibold leading-snug text-[#1a1a1a]">
                          {card.title}
                        </h3>
                        <p className={`mt-3 mb-0 font-dmSans text-[13px] leading-[1.65] text-[#5c5c5c]`}>
                          {card.body}
                        </p>
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
    </>
  )
}

function OktoCompetitiveAnalysisPanelContent() {
  return (
    <>
      <h2 className={`${inDepthPanelTitleClass} mb-6`}>Everyone is selling to IT. Nobody is selling to Joey.</h2>
      <p className={`${bodyClass} max-w-[900px]`}>
        We mapped vendors across two axes: how technical the buyer expects to be, and how much of the workflow
        lives inside a single vendor versus orchestration across tools. The crowded quadrant was “enterprise IT
        installs this for you”—thin air for the admin lead wiring fourteen SaaS apps.
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
                  Competitive landscape logos in three rows of three: Gumloop, Flowise, Dify, Power Automate,
                  Palantir Foundry, Vercept, ServiceNow, Tropic, and Zylo.
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
                "ROI needs to be visible and specific. The most effective competitors quantify savings in dollar amounts and surface metrics relevant to each user's role.",
              ] as const
            ).map((text, i) => (
              <div key={i} className="flex flex-1 basis-0 flex-col justify-center px-5 py-6 sm:px-6">
                <span className="inline-flex items-center justify-center self-start rounded-md bg-[rgba(107,53,184,0.12)] px-2.5 py-2 font-sans text-[13px] font-semibold tabular-nums tracking-tight text-[#4f2d8a]">
                  Insight {String(i + 1).padStart(2, '0')}
                </span>
                <p className="m-0 mt-4 font-dmSans text-[13px] leading-[1.65] text-[#333]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function OktoUserJourneyPanelContent() {
  return (
    <>
      <h2 className={`${inDepthPanelTitleClass} mb-6`}>
        We tried a lot of versions before we knew what we were building.
      </h2>
      <p className={`${bodyClass} max-w-[900px]`}>
        Journey explorations stayed deliberately messy—whiteboards with parallel flows for billing, onboarding
        vendors, and exec scheduling—until patterns condensed into three interacting modes instead of three
        disconnected features.
      </p>

      <div className="mt-10 grid grid-cols-1 overflow-hidden border border-solid border-[#e0e0e0] bg-white lg:grid-cols-[minmax(0,30%)_minmax(0,70%)] lg:items-stretch">
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
        Recording mode carried the most baggage culturally—associations with surveillance tooling ran hot—so we
        prototyped consent rhythms, visible indicators, and granular deletion paths before we chased clever
        inference.
      </p>
      <p className={`${bodyClass} mt-10 max-w-[900px]`}>
        What consolidated was less a linear funnel than a spiral: capture enough fidelity to replay, pause for
        human checkpoints at ambiguous forks, and let conversation compress weeks of tacit knowledge into
        something shareable.
      </p>
    </>
  )
}

function OktoInDepthSection({
  statInterviews,
  statManual,
}: {
  statInterviews: number
  statManual: number
}) {
  return (
    <section className="pt-[26px] pb-14">
      <p className="m-0 font-dmSans text-[13px] font-semibold uppercase tracking-wide text-[#555]">In Depth</p>

      <div className="mt-4 overflow-hidden border border-solid border-[#e0e0e0] bg-white">
        <CaseStudyAccordionItem title="2.1. User Research">
          <OktoUserResearchPanelContent statInterviews={statInterviews} statManual={statManual} />
        </CaseStudyAccordionItem>
        <CaseStudyAccordionItem title="2.2. Competitor Analysis">
          <OktoCompetitiveAnalysisPanelContent />
        </CaseStudyAccordionItem>
        <CaseStudyAccordionItem title="2.3. User Journey Explorations">
          <OktoUserJourneyPanelContent />
        </CaseStudyAccordionItem>
      </div>
    </section>
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

const FINAL_DESIGN_PANELS = [
  {
    id: 'okto-final-screens',
    navLabel: 'Workflow Capture',
    title: 'Step 1: Workflow Capture',
    subtitle: 'Show Latch how you work',
    bullets: [
      'Latch listens and watches simultaneously while users work normally.',
      'The overlay stays compact so Latch never competes with the work happening beneath it',
      'Latch notices app switches and on-screen actions, referencing them in its questions',
    ],
    decision:
      "A floating overlay keeps the user's work primary. Latch stays peripheral, present enough to follow along, invisible enough not to interrupt.",
    imageLabel: 'Workflow Capture',
    imageTag: 'Show Latch how you work',
    imageSrc: '/okto-workflow-capture.png',
    imageAlt:
      'Latch floating overlay during workflow capture — show me how it\'s done prompt with mute, pause, timer, and observation log.',
    imageHeight: 'auto' as const,
    imagePaddingClassName: 'p-[42px]',
  },
  {
    id: 'okto-follow-up',
    navLabel: 'Follow-up',
    title: 'Step 2: Follow-up',
    subtitle: 'Clarify without breaking flow',
    bullets: [
      'Latch asks one anchored question at a time',
      'It waits for natural pauses in speech, never interrupts mid-thought',
    ],
    decision: 'Keeping users focused on the work, not on managing the AI.',
    imageLabel: 'Follow-up',
    imageTag: 'Clarify without breaking flow',
    imageSrc: '/okto-follow-up.png',
    imageAlt:
      'Latch follow-up prompt asking why the user is copying content into Trello, with action needed dismiss control.',
    imageHeight: 'auto' as const,
    imagePaddingClassName: 'p-[42px]',
  },
  {
    id: 'okto-revisit-rerecord',
    navLabel: 'Revisit / Re-record',
    title: 'Step 3: Revisit / Re-record',
    subtitle: 'Correct without starting over',
    bullets: [
      'An observation log lets users see exactly what Latch tracked at any moment',
      'Users can re-record, add context, or upload supporting files',
      "Users can revisit recordings alongside the model's interpretation of their session",
    ],
    decision:
      "Correcting a mistake shouldn't mean starting over. Prior context is preserved so users can fix without losing what was already captured.",
    imageLabel: 'Revisit / Re-record',
    imageTag: 'Correct without starting over',
    imageSrc: '/okto-revisit-rerecord.png',
    imageAlt:
      'Latch observation log showing captured workflow steps from email to Trello board with expandable action history.',
    imageHeight: 'auto' as const,
    imagePaddingClassName: 'p-[42px]',
  },
  {
    id: 'okto-wrap-up-summary',
    navLabel: 'Wrap-up Summary',
    title: 'Step 4: Wrap-up Summary',
    subtitle: 'Confirm before you commit',
    bullets: [
      'Review the full recording alongside everything Latch captured before anything is built',
      'Answer any questions the user skipped during recording, Latch surfaces them here so nothing is missed',
      'Hit Build only when it looks right, nothing is handed off until the user confirms',
    ],
    decision:
      'The review screen is where trust is confirmed. Typing to answer deferred questions — rather than speaking — came directly from testing feedback.',
    imageLabel: 'Wrap-up Summary',
    imageTag: 'Confirm before you commit',
    imageSrc: '/okto-wrap-up-summary.png',
    imageAlt:
      'Latch wrap-up summary with video playback, observation log, deferred questions panel, and Build confirmation.',
    imageHeight: 'auto' as const,
    imagePaddingClassName: 'p-[42px]',
  },
] as const

const FINAL_DESIGN_SCROLL_OFFSET_PX = 108

const finalDesignStepTitleClass =
  'font-dmSans text-[18px] font-semibold text-white sm:text-[20px]'
const finalDesignBodyClass = 'font-dmSans text-sm leading-[1.7] text-white/70'
const finalDesignDecisionClass = 'font-dmSans text-sm leading-[1.7] text-white/60'

function FinalDesignPanel({
  panel,
  panelRef,
}: {
  panel: (typeof FINAL_DESIGN_PANELS)[number]
  panelRef: (el: HTMLDivElement | null) => void
}) {
  return (
    <div
      id={panel.id}
      ref={panelRef}
      className="scroll-mt-[100px] md:scroll-mt-[108px]"
    >
      {panel.title ? <h3 className={`m-0 ${finalDesignStepTitleClass}`}>{panel.title}</h3> : null}

      <ImagePlaceholder
        width="100%"
        height={panel.imageHeight}
        label={panel.imageTag ?? (panel.imageSrc ? undefined : panel.imageLabel)}
        imageSrc={panel.imageSrc}
        imageAlt={panel.imageAlt}
        imagePaddingClassName={panel.imagePaddingClassName}
        hideCrossPattern={Boolean(panel.imageSrc)}
        className={`w-full ${panel.title ? 'mt-6' : ''}`}
      />

      {panel.bullets.length > 0 ? (
        <ul className={`${finalDesignBodyClass} m-0 mt-6 list-none space-y-0.5 p-0`}>
          {panel.bullets.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      ) : null}

      {panel.decision ? (
        <p className={`${finalDesignDecisionClass} m-0 mt-6 max-w-[640px]`}>
          <strong className="font-semibold text-white/85">DECISION:</strong> {panel.decision}
        </p>
      ) : null}
    </div>
  )
}

function OktoFinalDesignsSection() {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIdx, setActiveIdx] = useState(0)

  const scrollToPanel = useCallback((i: number) => {
    const panel = FINAL_DESIGN_PANELS[i]
    if (!panel) return

    const el = document.getElementById(panel.id)
    if (!el) return

    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const top = window.scrollY + el.getBoundingClientRect().top - FINAL_DESIGN_SCROLL_OFFSET_PX

    window.scrollTo({ top: Math.max(0, top), behavior: prefersReduce ? 'auto' : 'smooth' })
    setActiveIdx(i)
    window.history.replaceState(null, '', `#${panel.id}`)
  }, [])

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    const idx = FINAL_DESIGN_PANELS.findIndex((panel) => panel.id === hash)
    if (idx < 0) return
    requestAnimationFrame(() => scrollToPanel(idx))
  }, [scrollToPanel])

  useLayoutEffect(() => {
    const nodes = FINAL_DESIGN_PANELS.map((panel) => document.getElementById(panel.id)).filter(
      (node): node is HTMLDivElement => Boolean(node),
    )
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting && e.intersectionRatio > 0)
        if (visible.length === 0) return
        const top = visible.reduce((a, b) => (a.intersectionRatio >= b.intersectionRatio ? a : b))
        const idx = FINAL_DESIGN_PANELS.findIndex((panel) => panel.id === top.target.id)
        if (idx >= 0) setActiveIdx(idx)
      },
      {
        root: null,
        rootMargin: `-${FINAL_DESIGN_SCROLL_OFFSET_PX}px 0px -38% 0px`,
        threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
      },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative mt-20 ml-[calc(50%-50vw)] w-screen max-w-[100vw] border-b border-solid border-[#e0e0e0] bg-[#050505] py-16 text-white sm:py-24">
      <div className={caseStudyContainerClass}>
        <div className="grid gap-14 lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16">
          <aside className="lg:sticky lg:top-[140px] lg:col-span-4 lg:self-start">
            <span className="inline-block border border-white/20 bg-white/[0.06] px-2.5 py-1 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-white/75 sm:text-[12px]">
              06 • FINAL DESIGNS
            </span>
            <h2 className="mt-6 font-dmSans text-[36px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[44px] md:text-[48px]">
              Latch Design
            </h2>
            <p className="mt-5 max-w-[340px] font-dmSans text-[16px] font-normal leading-relaxed text-white/50 sm:text-[17px]">
              A recording experience that stays out of way but never out of sight.
            </p>
            <nav className="mt-10 flex flex-col gap-0.5" aria-label="Jump to final design">
              {FINAL_DESIGN_PANELS.map((block, i) => (
                <a
                  key={block.id}
                  href={`#${block.id}`}
                  aria-current={activeIdx === i ? 'true' : undefined}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToPanel(i)
                  }}
                  className={`border-l-2 py-2.5 pl-4 text-left font-dmSans text-[15px] font-medium transition-colors sm:text-[16px] ${
                    activeIdx === i
                      ? 'border-white text-white'
                      : 'border-transparent text-white/45 hover:text-white/75'
                  }`}
                >
                  {block.navLabel}
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex flex-col gap-14 sm:gap-16 md:gap-20 lg:col-span-8 lg:pt-[52px]">
            <FinalDesignPanel
              panel={FINAL_DESIGN_PANELS[0]}
              panelRef={(el) => {
                sectionRefs.current[0] = el
              }}
            />
            <FinalDesignPanel
              panel={FINAL_DESIGN_PANELS[1]}
              panelRef={(el) => {
                sectionRefs.current[1] = el
              }}
            />
            <FinalDesignPanel
              panel={FINAL_DESIGN_PANELS[2]}
              panelRef={(el) => {
                sectionRefs.current[2] = el
              }}
            />
            <FinalDesignPanel
              panel={FINAL_DESIGN_PANELS[3]}
              panelRef={(el) => {
                sectionRefs.current[3] = el
              }}
            />
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

function PrivacyShieldCheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.5 5 5.75v5.25c0 4.55 2.95 8.8 7 10 4.05-1.2 7-5.45 7-10V5.75L12 2.5z"
        stroke="#6B35B8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m9.25 12 1.75 1.75L14.75 10"
        stroke="#6B35B8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PrivacyShieldSearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.5 5 5.75v5.25c0 4.55 2.95 8.8 7 10 4.05-1.2 7-5.45 7-10V5.75L12 2.5z"
        stroke="#6B35B8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="11.25" cy="11" r="2.25" stroke="#6B35B8" strokeWidth="1.5" />
      <path d="m13.1 13.1 1.65 1.65" stroke="#6B35B8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PrivacyShieldLockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.5 5 5.75v5.25c0 4.55 2.95 8.8 7 10 4.05-1.2 7-5.45 7-10V5.75L12 2.5z"
        stroke="#6B35B8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="9.5" y="10.5" width="5" height="4" rx="0.75" stroke="#6B35B8" strokeWidth="1.5" />
      <path
        d="M10.25 10.5V9.5a1.75 1.75 0 0 1 3.5 0v1"
        stroke="#6B35B8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

type PrivacyFeature = {
  id: string
  icon: ReactNode
  label: string
  title: string
  description: string
  imageSrc: string
  imageAlt: string
}

function FeaturesBriefcaseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="8" width="16" height="11" rx="1.5" stroke="#6B35B8" strokeWidth="1.5" />
      <path d="M9 8V6.5A2.5 2.5 0 0 1 11.5 4h1A2.5 2.5 0 0 1 15 6.5V8" stroke="#6B35B8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 12h16" stroke="#6B35B8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function FeaturesEyeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="#6B35B8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" stroke="#6B35B8" strokeWidth="1.5" />
    </svg>
  )
}

function FeaturesDragIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 6v12M12 6v12M16 6v12" stroke="#6B35B8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 9h3M5 15h3M16 9h3M16 15h3" stroke="#6B35B8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function FeaturesMonitorCheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="12" rx="1.5" stroke="#6B35B8" strokeWidth="1.5" />
      <path d="M9 20h6" stroke="#6B35B8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m8.5 11 2 2 5-4.5" stroke="#6B35B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FeaturesAlignmentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="9" r="3" stroke="#6B35B8" strokeWidth="1.5" />
      <path d="M11 9h7M11 12h5M11 15h7" stroke="#6B35B8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 6.5v5" stroke="#6B35B8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function FeaturesEditIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 19h3.5l9.4-9.4a1.5 1.5 0 0 0 0-2.12l-1.38-1.38a1.5 1.5 0 0 0-2.12 0L5 15.5V19Z"
        stroke="#6B35B8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m13.5 6.5 4 4" stroke="#6B35B8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

type FeatureInsight = {
  id: string
  icon: ReactNode
  title: string
  description: string
}

const FEATURES_NON_INTRUSIVE: FeatureInsight[] = [
  {
    id: 'stays-out-of-way',
    icon: <FeaturesBriefcaseIcon />,
    title: 'Stays out of your way',
    description:
      'The controls live in a compact overlay so Latch never competes with the work happening beneath it.',
  },
  {
    id: 'transparent-by-default',
    icon: <FeaturesEyeIcon />,
    title: 'Transparent by default',
    description:
      'An observation log lets users peek at exactly what Latch is tracking at any moment. In testing, seeing the log significantly increased confidence.',
  },
  {
    id: 'drag-it-anywhere',
    icon: <FeaturesDragIcon />,
    title: 'Drag it anywhere',
    description:
      "The overlay is fully draggable so it never blocks the content that matters. Users can position it wherever it's least intrusive.",
  },
]

const FEATURES_FLEXIBILITY_CONTROL: FeatureInsight[] = [
  {
    id: 'review-before-committing',
    icon: <FeaturesMonitorCheckIcon />,
    title: 'Review before committing',
    description:
      'Users needed to verify what the model captured before committing to automation.',
  },
  {
    id: 'alignment-understanding',
    icon: <FeaturesAlignmentIcon />,
    title: 'Alignment of understanding and recording',
    description:
      "Users wanted to revisit recordings alongside the model's interpretation of their session.",
  },
  {
    id: 'edit-refine',
    icon: <FeaturesEditIcon />,
    title: 'Edit, refine, make it yours',
    description:
      'The editable review layer lets users re-record, add context, or upload supporting files.',
  },
]

const FEATURE_COLUMNS = [
  {
    title: 'Non-intrusive interface',
    imageSrc: '/okto-features-non-intrusive-interface.png',
    imageAlt:
      'Latch compact overlay on a Trello board: draggable controls, observation log, and minimal footprint over the underlying work.',
    imageLabel: 'Non-intrusive interface',
    features: FEATURES_NON_INTRUSIVE,
  },
  {
    title: 'Flexibility and control',
    imageSrc: '/okto-features-flexibility-control.png',
    imageAlt:
      'Latch action item logging UI: captured steps listed for review with options to edit, re-record, and add context before committing to automation.',
    imageLabel: 'Flexibility and control',
    features: FEATURES_FLEXIBILITY_CONTROL,
  },
] as const

const PRIVACY_FEATURES: PrivacyFeature[] = [
  {
    id: 'watches-screen',
    icon: <PrivacyShieldCheckIcon />,
    label: 'Latch watches your screen',
    title: 'Users are wary of AI observation',
    description:
      'Trust and transparency around data access were identified as critical barriers to adoption.',
    imageSrc: '/okto-privacy-watches-screen.png',
    imageAlt: 'Onboarding screen explaining that Latch takes screen snapshots at key moments.',
  },
  {
    id: 'listens',
    icon: <PrivacyShieldSearchIcon />,
    label: 'Latch listens to you',
    title: 'Modes of observation explained',
    description: 'Users are informed of all access permissions before recording begins.',
    imageSrc: '/okto-privacy-listens.png',
    imageAlt: 'Onboarding screen explaining that Latch listens to voice narration during capture.',
  },
  {
    id: 'follows-clicks',
    icon: <PrivacyShieldLockIcon />,
    label: 'Latch follows your clicks',
    title: 'Users are in control',
    description:
      'Users retain full control to pause or mute at any point to protect sensitive information during process automation.',
    imageSrc: '/okto-privacy-follows-clicks.png',
    imageAlt: 'Onboarding screen explaining that Latch tracks clicks on buttons and fields.',
  },
]

const AGENT_BEHAVIOR_PRINCIPLES = [
  {
    title: 'Latch listens',
    body: "Follows along as you record, tracking what's been covered and reflecting it back to confirm understanding.",
  },
  {
    title: 'Latch watches',
    body: "Grounds itself in what's on screen, noticing when you switch views or take action to stay in context.",
  },
  {
    title: 'Latch waits',
    body: "Doesn't interrupt mid-thought. It reads natural pauses in speech to confirm, recap, or ask one focused question.",
  },
  {
    title: 'Latch earns every question',
    body: 'Every question is tied to your workflow, probing for branches and exceptions, never filler.',
  },
  {
    title: 'Latch stays out of the way',
    body: "Lives in the corner of your screen. Mute it, dismiss a question, pause for privacy, or turn it off entirely. You're always in control.",
  },
] as const

const RESPONSIBLE_AI_RISKS = [
  {
    number: '01',
    title: 'Data & Surveillance Risk',
    body:
      'Latch captures screen activity, audio, and behavioral patterns. The risk is that users in high-pressure workplaces may feel coerced into being observed.',
    mitigation:
      'explicit consent before every session, privacy pause at any moment, and no data retained beyond the active session unless the user saves it.',
  },
  {
    number: '02',
    title: 'Bias in Workflow Capture',
    body:
      "When one person's way of doing a task becomes the captured workflow, it quietly becomes the default for everyone who runs that automation after them. If that person's approach reflects individual bias or inefficiency, it scales.",
    mitigation:
      "the review step lets users challenge and edit what was captured before it's built.",
  },
  {
    number: '03',
    title: 'Accountability & Automation Errors',
    body:
      "When an automation fails, it's not always clear whether the user, the AI, or the system is responsible. Non-technical users are especially vulnerable to accepting outputs they can't evaluate.",
    mitigation:
      'every automated step is traceable, irreversible actions are flagged as manual steps, and humans remain accountable for the final output.',
  },
] as const

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
      <SiteNav variant="case-study" />
      <SiteNavSpacer />

      <main className={caseStudyMainClass}>
        {/* Hero */}
        <section className="border-y border-solid border-[#e0e0e0] py-14">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start lg:gap-10">
            <div className="min-w-0">
              <HeroTagPill>Superlabs Inc</HeroTagPill>
              <h1 className="mt-6 max-w-[920px] font-dmSans text-[44px] font-semibold leading-[1.1] text-black sm:text-[48px]">
                Voice and Recording-Led Setup Flow for AI Workflow Automation
              </h1>
              <p className={`mt-6 max-w-[900px] ${bodyClass}`}>
                Latch (fka SuperLabs) is a pre-seed startup building a B2B product to capture how work
                actually happens, structure it into machine-readable workflows, and enable AI systems to
                automate them safely.
              </p>
            </div>
            <div className="min-w-0">
              <ImagePlaceholder
                width="85%"
                height={323}
                className="mx-auto w-[85%] max-w-full"
                imageSrc="/Hero_Image_CS.png"
                imageAlt="Okto workflow automation interface — Show me how it's done"
                imagePaddingClassName="p-[18px]"
                imageClassName="max-h-full max-w-full shrink-0 object-contain"
              />
            </div>
          </div>
          <div
            ref={statsRef}
            className="mt-12 grid grid-cols-1 gap-px border border-solid border-[#e0e0e0] bg-[#e0e0e0] sm:grid-cols-2 lg:grid-cols-5"
          >
            {(
              [
                ['Company', 'Latch AI'],
                ['Product', 'Latch'],
                ['My role', 'Product Designer'],
                ['Team', '4 (2 designers, 1 PM, 1 researcher)'],
                ['Status', 'Shipped • Spring 2026'],
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

        <SectionDivider />

        <OktoTldrSection />

        <SectionDivider />

        {/* 01 — Context */}
        <section className="py-14">
          <SectionPill>01 • Context</SectionPill>
          <h2 className={`${sectionTitleClass} mt-4`}>
            Superlabs wants to let non-technical people automate their own work — without IT, without a
            developer.
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,35%)_minmax(0,65%)] lg:items-start lg:gap-10">
            <div className="min-w-0">
              <p className={`${bodyClass} mt-0`}>
                The way in: show the AI how you do it. It builds the automation.
              </p>
              <p className={`${bodyClass} mt-4`}>
                We were asked to design the dashboard where users monitor their automations.
              </p>
              <p className={`${bodyClass} mt-4`}>
                But you can&apos;t monitor automations that were never properly captured. The real blocker was
                upstream.
              </p>
            </div>
            <div className="min-w-0">
              <ImagePlaceholder
                width="100%"
                height="auto"
                label="Joey's repetitive workflow - the problem"
                className="w-full"
                imageSrc="/okto-joey-workflow-storyboard.png"
                imageAlt="Eight-panel illustrated storyboard of Joey’s daily workflow: juggling SAP, Excel, CRM, PDF sign-off, report builder, colleague pings, fragmented tasks, and the desire for a better way."
                imagePaddingClassName="p-10"
              />
            </div>
          </div>
        </section>

        <SectionDivider />

        <OktoResearchOverviewSection />

        <OktoInDepthSection statInterviews={statInterviews} statManual={statManual} />

        <SectionDivider />

        {/* 03 — Design Question */}
        <section className="py-14">
          <div className="mb-6">
            <SectionPill>03 • Design Question</SectionPill>
            <div className="relative mt-10 flex flex-col gap-4 p-6 sm:gap-5 sm:p-8">
              <CornerMarkers />
              <h2 className={`${sectionTitleClass} m-0`}>
                Q. How might we make workflow documentation feel approachable to non-technical users?
              </h2>
              <h2 className={`${sectionTitleClass} m-0`}>
                Q. How do we design a capture experience that feels observable, not surveilled?
              </h2>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* 04 — Testing adoption signals */}
        <section className="py-14">
          <div className="mb-6">
            <SectionPill>04 · Testing adoption signals</SectionPill>
            <h2 className={`${sectionTitleClass} mt-4`}>We built two working prototypes in Cursor and tested the extremes.</h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
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
              height={348}
              label="Adoption testing - A"
              className="w-full"
              videoSrc="/okto-adoption-testing-recording.mov"
              videoContainerClassName="pointer-events-none absolute inset-0 z-[1] flex items-start justify-center py-[30px] px-2 sm:px-3 [&_video]:pointer-events-auto"
              videoClassName="w-full h-auto"
            />
            <ImagePlaceholder
              width="100%"
              height={336}
              label="Adoption testing - B"
              className="w-full"
              videoSrc="/okto-adoption-pearl-recording.mov"
              videoContainerClassName="pointer-events-none absolute inset-0 z-[1] flex items-start justify-center py-[30px] px-2 sm:px-3 [&_video]:pointer-events-auto"
              videoClassName="w-full h-auto"
            />
          </div>

          <p className={`${sectionTitleClass} mt-10 max-w-[900px]`}>
            Users didn&apos;t fall cleanly on either end.
          </p>
          <p className={`${bodyClass} mt-4 max-w-[900px]`}>
            So, we merged them into one direction, keeping the restraint of A and the legibility of B.
          </p>
        </section>

        <SectionDivider />

        {/* 05 — Features */}
        <section className="py-14">
          <div className="mb-6">
            <SectionPill>05 • FEATURES</SectionPill>
            <h2 className={`${sectionTitleClass} mt-4`}>Privacy</h2>
          </div>
          <p className={`${bodyClass} -mt-[10px] max-w-[900px]`}>
            Before capture starts, users see exactly what Latch will observe — screen, voice, and clicks each
            get a clear consent moment so recording feels teachable, not surveilled.
          </p>
          <p className={`${bodyClass} mt-6 max-w-[900px]`}>
            <strong>DECISION:</strong> Fear of invisible observation was the biggest adoption blocker. Showing
            users exactly what Latch accesses before anything starts removes that barrier upfront.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PRIVACY_FEATURES.map((feature) => (
              <article key={feature.id} className="flex min-w-0 flex-col gap-6">
                <ImagePlaceholder
                  width="100%"
                  height={304}
                  label={feature.label}
                  labelClassName="bg-white"
                  className="w-full shrink-0"
                  imageSrc={feature.imageSrc}
                  imageAlt={feature.imageAlt}
                  imagePaddingClassName="p-[32px]"
                  centerImageInFrame
                />
                <div className="flex min-w-0 flex-col gap-4">
                  <div className={featureInsightIconRowClass}>
                    <span className="shrink-0">{feature.icon}</span>
                    <h3 className={featureInsightTitleClass}>{feature.title}</h3>
                  </div>
                  <p className={`mb-0 ${bodyClass}`}>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-20 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
            {FEATURE_COLUMNS.map((column) => (
              <div key={column.title} className="flex min-w-0 flex-col gap-6">
                <h3 className={`m-0 ${sectionTitleClass}`}>{column.title}</h3>
                <ImagePlaceholder
                  width="100%"
                  height={304}
                  label={column.imageLabel}
                  labelClassName="bg-white"
                  className="w-full shrink-0"
                  imageSrc={column.imageSrc}
                  imageAlt={column.imageAlt}
                  imagePaddingClassName="p-[32px]"
                  centerImageInFrame
                />
                <div className="flex flex-col gap-8">
                  {column.features.map((feature) => (
                    <div key={feature.id} className="flex min-w-0 flex-col gap-4">
                      <div className={featureInsightIconRowClass}>
                        <span className="shrink-0">{feature.icon}</span>
                        <h4 className={`m-0 ${featureInsightTitleClass}`}>{feature.title}</h4>
                      </div>
                      <p className={`mb-0 ${bodyClass}`}>{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <OktoFinalDesignsSection />

        {/* 07 — Agent Behaviour */}
        <section className="mt-20 py-14">
          <div className="mb-6">
            <SectionPill>07 • Agent Behaviour</SectionPill>
            <h2 className={`${sectionTitleClass} mt-4`}>Shaping Agent Behavior</h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[7fr_3fr] lg:items-stretch lg:gap-10">
            <ImagePlaceholder
              width="100%"
              height="100%"
              fillHeight
              centerImageInFrame
              className="h-full min-h-0 w-full"
              imageSrc="/okto-agent-behavior-settings.png"
              imageAlt="Latch agent behavior settings — during capture toggles for memory, screen context, pause timing, yield on speech, and question relevance."
              imagePaddingClassName="p-3 sm:p-4"
              hideCrossPattern
            />

            <div className="flex h-full min-w-0 flex-col divide-y divide-[#e0e0e0] border-y border-solid border-[#e0e0e0]">
              {AGENT_BEHAVIOR_PRINCIPLES.map((principle) => (
                <div
                  key={principle.title}
                  className="flex flex-1 flex-col justify-center py-3 lg:py-2.5"
                >
                  <h3 className="m-0 font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-black sm:text-[12px]">
                    {principle.title}
                  </h3>
                  <p className="mb-0 mt-1.5 font-dmSans text-[13px] leading-[1.45] text-[#333] sm:text-[14px]">
                    {principle.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 08 — Responsible AI */}
        <section className="mt-20 py-14">
          <div className="mb-6">
            <SectionPill>08 • Responsible AI</SectionPill>
            <h2 className={`${sectionTitleClass} mt-4`}>Responsible AI (RAI) and risk mitigation</h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {RESPONSIBLE_AI_RISKS.map((risk) => (
              <article
                key={risk.number}
                className="flex min-w-0 flex-col border border-solid border-[rgba(107,53,184,0.2)] bg-[rgba(107,53,184,0.1)] px-6 py-8 sm:px-7 sm:py-9"
              >
                <span className="inline-flex w-fit items-center justify-center bg-[rgba(107,53,184,0.12)] px-2.5 py-2 font-sans text-[13px] font-semibold tabular-nums tracking-tight text-[#4f2d8a]">
                  {risk.number}
                </span>
                <h3 className={`m-0 mt-4 ${featureInsightTitleClass}`}>{risk.title}</h3>
                <p className="mb-0 mt-4 font-dmSans text-[13px] leading-[1.65] text-[#333]">{risk.body}</p>
                <p className="mb-0 mt-6 font-dmSans text-[13px] leading-[1.65] text-[#333]">
                  <span className="font-semibold text-[#6B35B8]">Mitigation:</span> {risk.mitigation}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
