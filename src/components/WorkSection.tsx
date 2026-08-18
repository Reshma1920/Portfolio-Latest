'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  HOME_GUIDE_LINE,
  HOME_GUIDE_MARKER_PX,
  HOME_GUIDE_SIDE_FLUSH_CLASS,
  HOME_GUIDE_SIDE_INSET_VAR,
  HOME_GUIDE_SIDE_PADDING_CLASS,
} from '../case-studies/caseStudyLayout'

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

function GuideMark({
  className = '',
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      className={`pointer-events-none absolute z-[30] bg-black ${className}`}
      style={{
        width: HOME_GUIDE_MARKER_PX,
        height: HOME_GUIDE_MARKER_PX,
        ...style,
      }}
      aria-hidden
    />
  )
}

/** Solid black squares at the four corners of each case study card. */
function CardCornerMarks() {
  const half = HOME_GUIDE_MARKER_PX / 2
  return (
    <>
      <GuideMark
        className="left-0 top-0"
        style={{ marginLeft: -half, marginTop: -half }}
      />
      <GuideMark
        className="right-0 top-0"
        style={{ marginRight: -half, marginTop: -half }}
      />
      <GuideMark
        className="bottom-0 left-0"
        style={{ marginLeft: -half, marginBottom: -half }}
      />
      <GuideMark
        className="bottom-0 right-0"
        style={{ marginRight: -half, marginBottom: -half }}
      />
    </>
  )
}

/**
 * L-markers on the media panel — only where they don’t sit on the same
 * corner as a card-level black square.
 * - Desktop: keep left (column-split) corners; drop right (card edge) corners
 * - Mobile: keep top (mid-card) corners; drop bottom (card edge) corners
 */
function MediaCornerBrackets() {
  return (
    <>
      <span
        className="pointer-events-none absolute left-0 top-0 z-[30] h-2 w-2 border-solid border-black border-l-[1px] border-t-[1px]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute right-0 top-0 z-[30] h-2 w-2 border-solid border-black border-r-[1px] border-t-[1px] md:hidden"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-0 left-0 z-[30] hidden h-2 w-2 border-solid border-black border-b-[1px] border-l-[1px] md:block"
        aria-hidden
      />
    </>
  )
}

/**
 * Full-bleed top/bottom horizontals on each case card.
 * Drawn under card content; card corner squares sit above.
 */
function WorkCardGuideFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 z-[10] w-screen -translate-x-1/2"
        aria-hidden
      >
        <span
          className="absolute inset-x-0 top-0 h-px"
          style={{ backgroundColor: HOME_GUIDE_LINE }}
        />
        <span
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ backgroundColor: HOME_GUIDE_LINE }}
        />
      </div>
      <div className="relative z-[20]">{children}</div>
    </div>
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
  /** Pill tags above title; defaults to global TAGS */
  tags?: readonly string[]
  /** Pill at bottom-left of media area (white background) */
  comingSoon?: boolean
  /** When true, video plays from start to natural end (no HDFC-style in/out trim) */
  mediaVideoFullDuration?: boolean
  /** Inset padding (px) around video; placeholder box size stays the same */
  mediaVideoPaddingPx?: number
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
  mediaVideoFullDuration = false,
  mediaVideoPaddingPx,
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
          if (!mediaVideoFullDuration) {
            el.currentTime = VIDEO_TRIM_START_SEC
          } else {
            el.currentTime = 0
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [mediaVideoSrc, mediaVideoFullDuration])

  return (
    <article className="relative flex w-full flex-col border border-solid border-[#e0e0e0] bg-white md:flex-row md:items-stretch">
      <CardCornerMarks />

      {/* Left column — text */}
      <div className="flex w-full shrink-0 flex-col px-[40px] pb-[63px] pt-0 md:w-[45%] md:border-r md:border-solid md:border-[#e0e0e0] md:pb-0">
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

        <div className="-mx-[40px] flex flex-1 flex-col justify-center px-[40px] py-[80px]">
          <div className="flex flex-wrap items-center justify-start gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-[999px] bg-[rgba(107,53,184,0.12)] px-[11px] py-1.5 font-dmSans text-[13px] font-medium leading-none text-[#6B35B8]"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="mt-[10px] font-dmSans text-[28px] font-medium leading-snug text-[#000000]">
            {projectTitle}
          </h3>

          <p className="mt-[10px] font-dmSans text-[14px] font-normal leading-[1.6] text-[#6F6F6F]">
            {description}
          </p>

          {bullets.length > 0 ? (
            <ul className="mt-[68px] list-none space-y-0 font-dmSans text-[14px] font-normal leading-[2] text-[#333333]">
              {bullets.map((line) => (
                <li key={line}>° {line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* Right column — cross pattern + optional centered video + non-overlapping corner markers */}
      <div className="relative max-md:aspect-[16/10] w-full shrink-0 overflow-visible border-t border-solid border-[#e0e0e0] md:aspect-auto md:w-[55%] md:border-t-0 md:min-h-0 md:self-stretch">
        <div
          className="absolute inset-0 bg-[url('/crosspattern.png')] bg-repeat opacity-40"
          aria-hidden
        />
        {mediaVideoSrc ? (
          <div className="absolute inset-0 z-[1] bg-[#F6F5F3]">
            {comingSoon ? <ComingSoonMediaTag /> : null}
            <div
              className="absolute overflow-hidden"
              style={
                mediaVideoPaddingPx
                  ? { inset: `${mediaVideoPaddingPx}px` }
                  : { inset: 0 }
              }
            >
              <video
                ref={videoRef}
                src={mediaVideoSrc}
                preload="metadata"
                className="block h-full w-full object-cover object-center [box-shadow:0_8px_32px_rgba(0,0,0,0.12)]"
                muted
                loop
                playsInline
                aria-hidden
                onLoadedMetadata={
                  mediaVideoFullDuration
                    ? undefined
                    : (e) => {
                        e.currentTarget.currentTime = VIDEO_TRIM_START_SEC
                      }
                }
                onTimeUpdate={
                  mediaVideoFullDuration
                    ? undefined
                    : (e) => {
                        const v = e.currentTarget
                        if (v.currentTime >= VIDEO_TRIM_END_SEC) {
                          v.currentTime = VIDEO_TRIM_START_SEC
                        }
                      }
                }
              />
            </div>
          </div>
        ) : mediaLayered ? (
          <div className="absolute inset-0 z-[1] flex min-h-0 items-center justify-center overflow-hidden bg-[#F6F5F3] p-6 md:p-8">
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
          <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#F6F5F3] p-6 md:p-8">
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
        <MediaCornerBrackets />
      </div>
    </article>
  )
}

export function WorkSection() {
  return (
    <section id="work" className="w-full pt-[100px] font-dmSans">
      {/* Title aligns to the same guide inset as the case study cards */}
      <div
        className={`mb-[70px] flex items-baseline justify-between gap-6 ${HOME_GUIDE_SIDE_PADDING_CLASS}`}
      >
        <h2 className="flex items-center gap-3 font-display text-left text-[40px] font-medium text-[#000000]">
          <span
            className="inline-block shrink-0 bg-black md:-translate-x-1/2"
            style={{ width: HOME_GUIDE_MARKER_PX, height: HOME_GUIDE_MARKER_PX }}
            aria-hidden
          />
          Selected Work
        </h2>
        <p className="shrink-0 text-right font-dmSans text-[14px] font-normal leading-snug text-[#646464]">
          Enterprise, B2B, Financial Services
        </p>
      </div>

      <div className="relative w-full pb-[80px]">
        {/* Continuous outer verticals connecting all three cards */}
        <div className="pointer-events-none absolute inset-0 z-[10] hidden lg:block" aria-hidden>
          <span
            className="absolute inset-y-0 w-px"
            style={{ left: HOME_GUIDE_SIDE_INSET_VAR, backgroundColor: HOME_GUIDE_LINE }}
          />
          <span
            className="absolute inset-y-0 w-px"
            style={{ right: HOME_GUIDE_SIDE_INSET_VAR, backgroundColor: HOME_GUIDE_LINE }}
          />
        </div>

        <div className={`relative z-[20] flex w-full flex-col gap-[142px] ${HOME_GUIDE_SIDE_FLUSH_CLASS}`}>
            <WorkCardGuideFrame>
              <Link
                href="/latch"
                onClick={() => {
                  window.scrollTo(0, 0)
                }}
                className="block text-inherit no-underline outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/40"
                aria-label="Open Latch case study (SuperLabs)"
              >
                <ProjectCard
                  companyName="Latch AI"
                  logoSrc="/superlabs-logo.png"
                  projectTitle="Voice and Recording-Led Setup Flow for AI Workflow Automation"
                  description="Designing for the tension between delegation and control — where users hand off work to AI without losing transparency or trust."
                  bullets={[]}
                  tags={[
                    'Enterprise UX',
                    'B2B',
                    'Workflow Automation',
                    'Privacy & Trust',
                  ]}
                  mediaVideoSrc="/Latch_Final.mov"
                  mediaVideoFullDuration
                />
              </Link>
            </WorkCardGuideFrame>

            <WorkCardGuideFrame>
              <Link
                href="/hdfc"
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
                  bullets={[]}
                  mediaVideoSrc="/HDFC%20Video%20.mp4"
                  mediaVideoPaddingPx={30}
                />
              </Link>
            </WorkCardGuideFrame>

            <WorkCardGuideFrame>
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
            </WorkCardGuideFrame>
        </div>
      </div>
    </section>
  )
}
