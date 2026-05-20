import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  playClickSound,
  playHoverSound,
  unlockPortfolioAudio,
} from '../audio/portfolioAudio'

type CardDef = {
  id: string
  title: string
  body: string
}

const CARDS: CardDef[] = [
  {
    id: 'ai',
    title: "What can you do that AI can't?",
    body: 'I read the room. I know when to push, when to listen, and what to cut. Most of my best design decisions came from conversations, disagreements, and figuring things out in the middle of the mess.',
  },
  {
    id: 'vibe',
    title: 'Your design vibe?',
    body: "Dreamcore meets systems thinking. I want every interaction to feel inevitable, like it couldn't have been designed any other way.",
  },
  {
    id: 'designing',
    title: 'Designing for...',
    body: 'Trust. User Control. Privacy.',
  },
]

type Pos = { x: number; y: number }

/** Horizontal band + vertical anchor (0–1), plus fine-tune offsets (px). */
const CARD_LAYOUT_SLOTS = [
  { id: 'vibe', xAnchor: 0.1, yAnchor: 0.38, offsetX: 80, offsetY: -36 },
  { id: 'ai', xAnchor: 0.5, yAnchor: 0.06, offsetX: 0, offsetY: 140 },
  { id: 'designing', xAnchor: 0.9, yAnchor: 0.4, offsetX: -80, offsetY: 0 },
] as const

const OVERLAP_PAD = 24
const EDGE_PAD = 20

function clampPos(
  x: number,
  y: number,
  cardW: number,
  cardH: number,
  boxW: number,
  boxH: number,
): Pos {
  return {
    x: Math.max(0, Math.min(x, Math.max(0, boxW - cardW))),
    y: Math.max(0, Math.min(y, Math.max(0, boxH - cardH))),
  }
}

function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  pad: number,
): boolean {
  return (
    ax < bx + bw + pad &&
    ax + aw + pad > bx &&
    ay < by + bh + pad &&
    ay + ah + pad > by
  )
}

function posFromAnchor(
  xAnchor: number,
  yAnchor: number,
  cardW: number,
  cardH: number,
  boxW: number,
  boxH: number,
): Pos {
  const maxX = Math.max(0, boxW - cardW)
  const maxY = Math.max(0, boxH - cardH)
  const x = Math.min(
    maxX - EDGE_PAD,
    Math.max(EDGE_PAD, boxW * xAnchor - cardW / 2),
  )
  const y = maxY * yAnchor
  return clampPos(x, y, cardW, cardH, boxW, boxH)
}

function layoutDefaultPositions(
  sizes: { id: string; w: number; h: number }[],
  boxW: number,
  boxH: number,
): Record<string, Pos> {
  const placed: { id: string; x: number; y: number; w: number; h: number }[] = []
  const next: Record<string, Pos> = {}

  for (const slot of CARD_LAYOUT_SLOTS) {
    const size = sizes.find((s) => s.id === slot.id)
    if (!size) continue

    let pos = posFromAnchor(slot.xAnchor, slot.yAnchor, size.w, size.h, boxW, boxH)
    pos = clampPos(
      pos.x + slot.offsetX,
      pos.y + slot.offsetY,
      size.w,
      size.h,
      boxW,
      boxH,
    )

    for (let attempt = 0; attempt < 12; attempt++) {
      const hit = placed.find((p) =>
        rectsOverlap(pos.x, pos.y, size.w, size.h, p.x, p.y, p.w, p.h, OVERLAP_PAD),
      )
      if (!hit) break
      pos = clampPos(pos.x, hit.y + hit.h + OVERLAP_PAD, size.w, size.h, boxW, boxH)
    }

    next[slot.id] = pos
    placed.push({ id: slot.id, x: pos.x, y: pos.y, w: size.w, h: size.h })
  }

  return next
}

type CardProps = {
  card: CardDef
  pos: Pos
  minimized: boolean
  cardRef: (node: HTMLElement | null) => void
  onDragStart: (id: string, e: React.PointerEvent) => void
  onToggleMinimize: (id: string) => void
}

function OverlayCard({
  card,
  pos,
  minimized,
  cardRef,
  onDragStart,
  onToggleMinimize,
}: CardProps) {
  return (
    <article
      ref={cardRef}
      className="pointer-events-auto absolute w-[min(100%,300px)] select-none rounded-[5px] border border-solid border-[#2a2a2a] bg-[#121212] shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
      style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
    >
      <header
        className={`flex cursor-grab items-center gap-2 px-4 py-3 active:cursor-grabbing ${
          minimized ? '' : 'border-b border-solid border-[#222222]'
        }`}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return
          onDragStart(card.id, e)
        }}
      >
        <button
          type="button"
          data-hero-canvas-sound
          aria-label={minimized ? `Expand ${card.title}` : `Minimize ${card.title}`}
          aria-expanded={!minimized}
          className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-[3px] border border-solid border-[#444444] bg-transparent p-0 font-dmSans text-[11px] font-medium leading-none text-[#888888] transition-colors hover:border-[#666666] hover:text-[#bbbbbb]"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseEnter={() => playHoverSound()}
          onClick={() => {
            unlockPortfolioAudio()
            playClickSound()
            onToggleMinimize(card.id)
          }}
        >
          <span aria-hidden>{minimized ? '+' : '−'}</span>
        </button>
        <h3 className="m-0 min-w-0 flex-1 font-dmSans text-[11px] font-semibold uppercase leading-[14px] tracking-[0.06em] text-[#c45c26]">
          {card.title}
        </h3>
      </header>
      {!minimized ? (
        <p className="m-0 px-4 py-4 font-dmSans text-[13px] font-normal leading-[1.55] text-[#cccccc]">
          {card.body}
        </p>
      ) : null}
    </article>
  )
}

type Props = {
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function HeroCanvasCards({ containerRef }: Props) {
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map())
  const dragRef = useRef<{
    id: string
    offsetX: number
    offsetY: number
  } | null>(null)

  const [minimized, setMinimized] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CARDS.map((c) => [c.id, false])),
  )
  const [positions, setPositions] = useState<Record<string, Pos>>({})
  const [laidOut, setLaidOut] = useState(false)
  const placedInitialRef = useRef(false)

  const layoutFromContainer = useCallback(() => {
    const box = containerRef.current
    if (!box) return

    const { width: boxW, height: boxH } = box.getBoundingClientRect()
    if (boxW <= 0 || boxH <= 0) return

    const sizes = CARDS.map((card) => {
      const el = cardRefs.current.get(card.id)
      return {
        id: card.id,
        w: el?.offsetWidth ?? 280,
        h: el?.offsetHeight ?? 160,
      }
    })

    setPositions((prev) => {
      if (placedInitialRef.current) {
        const next: Record<string, Pos> = {}
        for (const { id, w, h } of sizes) {
          next[id] = clampPos(prev[id]?.x ?? 0, prev[id]?.y ?? 0, w, h, boxW, boxH)
        }
        return next
      }

      placedInitialRef.current = true
      return layoutDefaultPositions(sizes, boxW, boxH)
    })
    setLaidOut(true)
  }, [containerRef])

  useLayoutEffect(() => {
    layoutFromContainer()
  }, [layoutFromContainer])

  useEffect(() => {
    const box = containerRef.current
    if (!box) return

    const ro = new ResizeObserver(() => layoutFromContainer())
    ro.observe(box)
    return () => ro.disconnect()
  }, [containerRef, layoutFromContainer])

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      const drag = dragRef.current
      const box = containerRef.current
      if (!drag || !box) return

      const rect = box.getBoundingClientRect()
      const el = cardRefs.current.get(drag.id)
      const cardW = el?.offsetWidth ?? 280
      const cardH = el?.offsetHeight ?? 160

      const x = e.clientX - rect.left - drag.offsetX
      const y = e.clientY - rect.top - drag.offsetY
      const clamped = clampPos(x, y, cardW, cardH, rect.width, rect.height)

      setPositions((prev) => ({ ...prev, [drag.id]: clamped }))
    }

    function onPointerUp() {
      dragRef.current = null
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [containerRef])

  function handleDragStart(id: string, e: React.PointerEvent) {
    const box = containerRef.current
    const el = cardRefs.current.get(id)
    if (!box || !el) return

    const cardRect = el.getBoundingClientRect()
    dragRef.current = {
      id,
      offsetX: e.clientX - cardRect.left,
      offsetY: e.clientY - cardRect.top,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handleToggleMinimize(id: string) {
    setMinimized((m) => ({ ...m, [id]: !m[id] }))
    dragRef.current = null
    requestAnimationFrame(() => layoutFromContainer())
  }

  const setCardRef = (id: string) => (node: HTMLElement | null) => {
    if (node) cardRefs.current.set(id, node)
    else cardRefs.current.delete(id)
  }

  return (
    <div
      data-hero-canvas-cards
      className={`pointer-events-none absolute inset-0 z-10 ${laidOut ? '' : 'opacity-0'}`}
    >
      {CARDS.map((card) => (
        <OverlayCard
          key={card.id}
          card={card}
          pos={positions[card.id] ?? { x: 0, y: 0 }}
          minimized={minimized[card.id] ?? false}
          cardRef={setCardRef(card.id)}
          onDragStart={handleDragStart}
          onToggleMinimize={handleToggleMinimize}
        />
      ))}
    </div>
  )
}
