import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const VIDEO_TRIM_START_SEC = 7
const VIDEO_TRIM_END_SEC = 32

const TAGS = ['Enterprise UX', 'B2B', 'FinTech'] as const

/** Placeholder — swap copy or wire per-project data later */
const COMPANY_NAME = 'Company name'

const PROJECT_TITLE =
  'Process Automation - Setup workflow for non-technical users'

const DESCRIPTION =
  'Placeholder description summarizing how this project simplifies workflows for teams through thoughtful automation and clear UX patterns.'

const BULLETS = [
  'Placeholder bullet highlighting user research and workflow discovery.',
  'Placeholder bullet covering integration design and rollout considerations.',
  'Placeholder bullet noting measurable outcomes and iteration cycles.',
]

function CornerBrackets() {
  return (
    <>
      <span
        className="pointer-events-none absolute left-0 top-0 z-[3] h-3 w-3 border-solid border-black border-l-[1px] border-t-[1px]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute right-0 top-0 z-[3] h-3 w-3 border-solid border-black border-r-[1px] border-t-[1px]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-0 left-0 z-[3] h-3 w-3 border-solid border-black border-b-[1px] border-l-[1px]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-0 right-0 z-[3] h-3 w-3 border-solid border-black border-b-[1px] border-r-[1px]"
        aria-hidden
      />
    </>
  )
}

/** Horizontal rule spanning entire viewport width (centered under max-width layout). */
function ViewportRule({ edge }: { edge: 'top' | 'bottom' }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute left-1/2 z-[2] h-px w-screen max-w-none -translate-x-1/2 bg-[#e0e0e0] ${edge === 'top' ? 'top-0' : 'bottom-0'}`}
    />
  )
}

function ComingSoonMediaTag() {
  return (
    <span className="pointer-events-none absolute bottom-6 left-6 z-[5] border border-solid border-[#e0e0e0] bg-white px-3 py-1.5 font-dmSans text-[12px] font-medium leading-none tracking-wide text-[#333333] md:bottom-8 md:left-8">
      Coming soon
    </span>
  )
}

type MediaLayeredProps = {
  baseSrc: string
  /** Optional floating images on top of base */
  topRightSrc?: string
  bottomRightSrc?: string
  baseAlt?: string
}

/** Base image, optional right overlays; all clipped to this box. */
function ProjectCardLayeredMedia({
  baseSrc,
  topRightSrc,
  bottomRightSrc,
  baseAlt = 'Product interface mockup',
}: MediaLayeredProps) {
  return (
    <div className="relative w-[85%] max-h-full min-h-0 max-w-full shrink-0 overflow-hidden">
      <img
        src={baseSrc}
        alt={baseAlt}
        className="relative z-0 block h-auto max-h-full w-full object-contain"
        loading="lazy"
        decoding="async"
      />
      {topRightSrc ? (
        <img
          src={topRightSrc}
          alt=""
          aria-hidden
          className="pointer-events-none absolute right-[2%] top-[4%] z-[1] max-h-[40%] w-[34%] max-w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      ) : null}
      {bottomRightSrc ? (
        <img
          src={bottomRightSrc}
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-[4%] right-[2%] z-[2] max-h-[46%] w-[46%] max-w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      ) : null}
    </div>
  )
}

type ProjectCardProps = {
  companyName?: string
  logoSrc?: string
  projectTitle?: string
  description?: string
  bullets?: readonly string[]
  mediaVideoSrc?: string
  /** Renders when no video and no layered media; 85% width, centered */
  mediaImageSrc?: string
  /** Base + floating cards (takes precedence over single mediaImageSrc) */
  mediaLayered?: MediaLayeredProps
  /** Pill tags below description; defaults to global TAGS */
  tags?: readonly string[]
  /** Pill at bottom-left of media area (white background) */
  comingSoon?: boolean
}

function ProjectCard({
  companyName = COMPANY_NAME,
  logoSrc = '/company-logo.png',
  projectTitle = PROJECT_TITLE,
  description = DESCRIPTION,
  bullets = BULLETS,
  mediaVideoSrc,
  mediaImageSrc,
  mediaLayered,
  tags = TAGS,
  comingSoon = false,
}: ProjectCardProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!mediaVideoSrc) return
    const el = videoRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          void el.play().catch(() => {})
        } else {
          el.pause()
          el.currentTime = VIDEO_TRIM_START_SEC
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [mediaVideoSrc])

  return (
    <article className="relative flex w-full flex-col border-x border-solid border-[#e0e0e0] bg-white md:flex-row md:items-stretch">
      <ViewportRule edge="top" />
      <ViewportRule edge="bottom" />

      {/* Left column — text */}
      <div className="flex w-full shrink-0 flex-col px-[40px] pb-[63px] pt-0 md:w-[45%] md:border-r md:border-solid md:border-[#e0e0e0] md:pb-[44px]">
        <div className="-mx-[40px] border-b border-solid border-[#e0e0e0] px-[40px] py-[24px]">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-solid border-[#e0e0e0] bg-white">
              <img
                src={logoSrc}
                alt={`${companyName} logo`}
                width={40}
                height={40}
                className="m-0 block h-full w-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="min-w-0 flex-1 font-dmSans text-[18px] font-medium leading-snug text-[#000000]">
              {companyName}
            </p>
          </div>
        </div>

        <div
          className="-mx-[40px]"
          style={{
            paddingTop: '40px',
            paddingBottom: '40px',
            paddingLeft: '40px',
            paddingRight: '40px',
          }}
        >
          <h3 className="font-dmSans text-[28px] font-medium leading-snug text-[#000000]">
            {projectTitle}
          </h3>

          <p className="mt-[10px] font-dmSans text-[14px] font-normal leading-[1.6] text-[#6F6F6F]">
            {description}
          </p>

          {/* Pills below description */}
          <div className="mt-[21px] flex flex-wrap items-center justify-start gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-[999px] bg-[rgba(107,53,184,0.12)] px-[11px] py-1.5 font-dmSans text-[13px] font-medium leading-none text-[#6B35B8]"
              >
                {tag}
              </span>
            ))}
          </div>

          <ul className="mt-[68px] list-none space-y-0 font-dmSans text-[14px] font-normal leading-[2] text-[#333333]">
            {bullets.map((line) => (
              <li key={line}>° {line}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right column — cross pattern + optional centered video + corner markers */}
      <div className="relative max-md:aspect-[16/10] w-full shrink-0 border-t border-solid border-[#e0e0e0] md:aspect-auto md:w-[55%] md:border-t-0 md:min-h-0 md:self-stretch">
        <div
          className="absolute inset-0 bg-[url('/crosspattern.png')] bg-repeat opacity-40"
          aria-hidden
        />
        {mediaVideoSrc ? (
          <div className="absolute inset-0 z-[1] flex items-center justify-center p-6 md:p-8">
            {comingSoon ? <ComingSoonMediaTag /> : null}
            <video
              ref={videoRef}
              src={mediaVideoSrc}
              className="h-auto max-h-full w-[85%] object-contain [box-shadow:0_8px_32px_rgba(0,0,0,0.12)]"
              muted
              loop
              playsInline
              aria-hidden
              onLoadedMetadata={(e) => {
                e.currentTarget.currentTime = VIDEO_TRIM_START_SEC
              }}
              onTimeUpdate={(e) => {
                const v = e.currentTarget
                if (v.currentTime >= VIDEO_TRIM_END_SEC) {
                  v.currentTime = VIDEO_TRIM_START_SEC
                }
              }}
            />
          </div>
        ) : mediaLayered ? (
          <div className="absolute inset-0 z-[1] flex min-h-0 items-center justify-center overflow-hidden p-6 md:p-8">
            {comingSoon ? <ComingSoonMediaTag /> : null}
            <div className="relative flex h-full max-h-full w-full min-w-0 items-center justify-center">
              <ProjectCardLayeredMedia
                baseSrc={mediaLayered.baseSrc}
                topRightSrc={mediaLayered.topRightSrc}
                bottomRightSrc={mediaLayered.bottomRightSrc}
                baseAlt={mediaLayered.baseAlt}
              />
            </div>
          </div>
        ) : mediaImageSrc ? (
          <div className="absolute inset-0 z-[1] flex items-center justify-center p-6 md:p-8">
            {comingSoon ? <ComingSoonMediaTag /> : null}
            <img
              src={mediaImageSrc}
              alt="Impact Dashboard showing automation metrics, time saved, and workflow performance"
              className="h-auto max-h-full w-[85%] object-contain [box-shadow:0_8px_32px_rgba(0,0,0,0.12)]"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
        <CornerBrackets />
      </div>
    </article>
  )
}

export function WorkSection() {
  return (
    <section id="work" className="w-full bg-[#F7F6F2] font-dmSans">
      {/* Outer padding matches CinematicHero nav wrapper (px-3 sm:px-5); inner width matches nav bar (max-w-7xl). */}
      <div className="px-3 sm:px-5">
        <div className="mx-auto w-full max-w-7xl pb-[80px] pt-[80px]">
          <div className="mb-[80px] flex justify-center">
            <div className="relative border border-solid border-[#e0e0e0] bg-white px-[64px] py-[16px]">
              <CornerBrackets />
              <h2 className="font-display text-center text-[40px] font-medium text-[#000000]">
                Explore my work
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-[62px]">
            <Link
              to="/hdfc"
              onClick={() => {
                window.scrollTo(0, 0)
              }}
              className="block text-inherit no-underline outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/40"
              aria-label="Open HDFC case study"
            >
              <ProjectCard
                companyName="HDFC Bank"
                logoSrc="/hdfc-bank-logo.png"
                projectTitle="Enterprise Loan Management Platform for India's Largest Private Bank"
                description="End-to-end B2B platform enabling real estate developers to manage construction-linked loan disbursements, track project progress, and eliminate dependency on bank agents — built for scale across 500K+ users."
                bullets={[
                  '12-step workflow consolidated into 1 unified system for 500K+ users',
                  'Reduced loan processing time from 25 days to 8 days — a 68% improvement',
                  'Delivered modular, component-based designs enabling rapid implementation in React.js',
                ]}
                mediaVideoSrc="/HDFC%20Video%20.mp4"
              />
            </Link>
            <ProjectCard
              companyName="SuperLabs Inc."
              logoSrc="/superlabs-logo.png"
              projectTitle="AI Workflow Automation: Designing the First-Time Workflow Setup Experience"
              description="This project explores how non-technical professionals set up AI-powered workflow automation for the first time — recording their processes, transferring institutional knowledge, and delegating work to AI while maintaining trust, transparency, and data security throughout."
              bullets={[
                'Designed around core tensions between delegation and control — ensuring users can hand off their work to AI while maintaining transparency, traceability, and confidence that the system understands their process correctly.',
              ]}
              tags={[
                'Enterprise UX',
                'B2B',
                'Workflow Automation',
                'Privacy & Trust',
              ]}
              mediaImageSrc="/superlabs-impact-dashboard.png"
              comingSoon
            />
            <ProjectCard
              companyName="Zsuite Technologies"
              projectTitle="Redesigning APR configuration workflow for financial institutions that reduced ops team dependency"
              description="Enabling self-service interest rate configuration for financial institutions by redesigning an internal, ops-only workflow."
              bullets={[
                'Simplified a multi-level payment distribution system across 13 verticals.',
                'Enabled clear APR management that could scale to 120+ FI users and impact 2,000+ subaccounts per institution.',
              ]}
              mediaLayered={{
                baseSrc: '/superlabs-fi-dashboard-base.png',
                baseAlt:
                  'ZSuite FI Settings dashboard with category list, organization and subaccounts tables, and Interest Information panel',
              }}
              comingSoon
            />
          </div>
        </div>
      </div>
    </section>
  )
}
