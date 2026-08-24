'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import {
  HOME_GUIDE_LINE,
  HOME_GUIDE_MARKER_PX,
  HOME_GUIDE_SIDE_FLUSH_CLASS,
  HOME_GUIDE_SIDE_INSET_VAR,
  HOME_GUIDE_SIDE_PADDING_CLASS,
} from '../case-studies/caseStudyLayout'

type PolaroidPhoto = {
  src: string
  alt: string
  /** Initial left % of the photo board */
  x: number
  /** Initial top % of the photo board */
  y: number
  rotate: number
}

const PHOTOS: PolaroidPhoto[] = [
  {
    src: '/about/01-presentation.png',
    alt: 'Presenting on campus event planning',
    x: 2,
    y: 4,
    rotate: -8,
  },
  {
    src: '/about/02-portrait-stone.png',
    alt: 'Portrait in front of stone architecture',
    x: 46,
    y: 2,
    rotate: 6,
  },
  {
    src: '/about/03-grad-bench.png',
    alt: 'Graduation portrait on a park bench',
    x: 12,
    y: 26,
    rotate: 4,
  },
  {
    src: '/about/04-grad-mountain.png',
    alt: 'Graduation portrait with mountain backdrop',
    x: 50,
    y: 22,
    rotate: -5,
  },
  {
    src: '/about/05-edinburgh.png',
    alt: 'Portrait in Edinburgh city park',
    x: 0,
    y: 46,
    rotate: 9,
  },
  {
    src: '/about/06-grad-diploma.png',
    alt: 'Graduation day with diploma and flowers',
    x: 48,
    y: 44,
    rotate: -3,
  },
  {
    src: '/about/07-overlook.png',
    alt: 'At a mountain overlook',
    x: 20,
    y: 58,
    rotate: 7,
  },
]

type PhotoPose = {
  x: number
  y: number
  rotate: number
  z: number
}

const DRAG_THRESHOLD_PX = 8

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function PolaroidStack() {
  const boardRef = useRef<HTMLDivElement>(null)
  const loadedIds = useRef(new Set<number>())
  const [inView, setInView] = useState(false)
  const [poses, setPoses] = useState<PhotoPose[]>(() =>
    PHOTOS.map((p, i) => ({ x: p.x, y: p.y, rotate: p.rotate, z: i + 1 })),
  )
  const [loadedCount, setLoadedCount] = useState(0)
  const [revealedCount, setRevealedCount] = useState(0)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const dragRef = useRef<{
    id: number
    startClientX: number
    startClientY: number
    originX: number
    originY: number
    active: boolean
  } | null>(null)
  const zTopRef = useRef(PHOTOS.length)
  const posesRef = useRef(poses)
  posesRef.current = poses

  const allLoaded = inView && loadedCount >= PHOTOS.length
  const canDrag = allLoaded && revealedCount >= PHOTOS.length

  const markLoaded = useCallback((id: number) => {
    if (loadedIds.current.has(id)) return
    loadedIds.current.add(id)
    setLoadedCount(loadedIds.current.size)
  }, [])

  /** Start when the photo board enters the viewport. */
  useEffect(() => {
    const board = boardRef.current
    if (!board) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { root: null, threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(board)
    return () => io.disconnect()
  }, [])

  /** Also start when the cursor enters the About photo area. */
  const onBoardPointerEnter = () => {
    setInView(true)
  }

  useEffect(() => {
    if (!allLoaded) return
    let cancelled = false
    let i = 0
    const timers: number[] = []
    const tick = () => {
      if (cancelled) return
      i += 1
      setRevealedCount(i)
      if (i < PHOTOS.length) timers.push(window.setTimeout(tick, 110))
    }
    timers.push(window.setTimeout(tick, 40))
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [allLoaded])

  const onPointerDown = (id: number, e: PointerEvent<HTMLButtonElement>) => {
    if (!canDrag || e.button !== 0) return
    const pose = posesRef.current[id]
    if (!pose) return

    dragRef.current = {
      id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      originX: pose.x,
      originY: pose.y,
      active: false,
    }
  }

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    const board = boardRef.current
    if (!drag || drag.id == null) return

    const dx = e.clientX - drag.startClientX
    const dy = e.clientY - drag.startClientY

    if (!drag.active) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
      drag.active = true
      zTopRef.current += 1
      setPoses((prev) =>
        prev.map((p, i) => (i === drag.id ? { ...p, z: zTopRef.current } : p)),
      )
      setDraggingId(drag.id)
      e.currentTarget.setPointerCapture(e.pointerId)
    }

    if (!board) return
    e.preventDefault()

    const boardRect = board.getBoundingClientRect()
    if (boardRect.width <= 0 || boardRect.height <= 0) return

    const about = document.getElementById('about')
    const aboutRect = about?.getBoundingClientRect()
    const card = e.currentTarget
    const cardW = card.offsetWidth
    const cardH = card.offsetHeight

    let left = boardRect.left + (drag.originX / 100) * boardRect.width + dx
    let top = boardRect.top + (drag.originY / 100) * boardRect.height + dy

    // Stay inside the About section, but free to overflow the photo column.
    if (aboutRect) {
      left = clamp(left, aboutRect.left, aboutRect.right - cardW)
      top = clamp(top, aboutRect.top, aboutRect.bottom - cardH)
    }

    const nextX = ((left - boardRect.left) / boardRect.width) * 100
    const nextY = ((top - boardRect.top) / boardRect.height) * 100

    setPoses((prev) =>
      prev.map((p, i) => (i === drag.id ? { ...p, x: nextX, y: nextY } : p)),
    )
  }

  const endDrag = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    dragRef.current = null
    setDraggingId(null)
  }

  return (
    <div
      ref={boardRef}
      onPointerEnter={onBoardPointerEnter}
      className="relative h-[560px] w-full overflow-visible select-none sm:h-[580px] md:h-[600px] lg:h-[640px]"
      aria-label="Photo stack. Drag polaroids after they appear."
    >
      {PHOTOS.map((photo, id) => {
        const pose = poses[id]!
        const visible = inView && id < revealedCount
        const isDragging = draggingId === id

        return (
          <button
            key={photo.src}
            type="button"
            aria-label={photo.alt}
            disabled={!canDrag}
            onPointerDown={(e) => onPointerDown(id, e)}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={`absolute w-[min(42%,168px)] origin-center bg-white p-[8px] pb-[28px] text-left shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-[opacity,box-shadow] duration-300 ease-out sm:w-[min(38%,200px)] sm:p-[10px] sm:pb-[36px] md:w-[min(40%,220px)] md:p-3 md:pb-11 lg:w-[min(42%,240px)] ${
              canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            } ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'} ${
              isDragging
                ? 'z-50 touch-none shadow-[0_16px_40px_rgba(0,0,0,0.2)]'
                : 'touch-pan-y'
            }`}
            style={{
              left: `${pose.x}%`,
              top: `${pose.y}%`,
              zIndex: pose.z,
              transform: `rotate(${pose.rotate}deg)${isDragging ? ' scale(1.03)' : ''}`,
            }}
          >
            {inView ? (
              <img
                src={photo.src}
                alt=""
                draggable={false}
                onLoad={() => markLoaded(id)}
                onError={() => markLoaded(id)}
                ref={(img) => {
                  if (img?.complete) markLoaded(id)
                }}
                className="pointer-events-none aspect-[3/4] w-full bg-[#eee] object-cover"
              />
            ) : (
              <div className="aspect-[3/4] w-full bg-[#eee]" aria-hidden />
            )}
          </button>
        )
      })}
    </div>
  )
}

export function AboutSection() {
  return (
    <section id="about" className="relative overflow-visible w-full pb-[80px] pt-[80px] font-dmSans sm:pb-[100px] sm:pt-[100px] lg:pb-[120px]">
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

      <div
        className={`relative z-[20] mb-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 sm:mb-[70px] ${HOME_GUIDE_SIDE_PADDING_CLASS}`}
      >
        <h2 className="flex min-w-0 items-center gap-3 font-display text-left text-[32px] font-medium text-[#000000] sm:text-[40px]">
          <span
            className="inline-block shrink-0 bg-black md:-translate-x-1/2"
            style={{ width: HOME_GUIDE_MARKER_PX, height: HOME_GUIDE_MARKER_PX }}
            aria-hidden
          />
          About
        </h2>
        <p className="shrink-0 text-right font-dmSans text-[13px] font-normal leading-snug text-[#646464] sm:text-[14px]">
          Product designer
        </p>
      </div>

      <div className={`relative z-[20] overflow-visible ${HOME_GUIDE_SIDE_FLUSH_CLASS}`}>
        <div className="grid grid-cols-1 items-start gap-8 overflow-visible md:gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="relative z-[2] min-w-0 overflow-visible">
            <PolaroidStack />
          </div>

          <div className="relative z-[1] flex min-w-0 flex-col justify-center lg:min-h-[560px] lg:py-4">
            <p
              className="max-w-[520px] font-display text-[24px] font-normal leading-[1.25] tracking-[-0.02em] text-black sm:text-[28px] md:text-[32px]"
              style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
            >
              I design for people navigating complex systems — connecting data, workflows, and
              decisions into experiences that feel clear and trustworthy.
            </p>
            <p className="mt-5 max-w-[480px] font-dmSans text-[14px] leading-[1.65] text-[#646464] sm:mt-6 sm:text-[15px] md:text-[16px]">
              4+ years in product design across enterprise, B2B, and financial services. MS HCDE at
              UW. Based in Atlanta, GA.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
