import { useEffect, useRef } from 'react'
import { HeroCanvasCards } from './HeroCanvasCards'

/** 6×6 tiles, flush grid (no gap between cells) */
const CELL = 6
const STRIDE = CELL

/** Sky occupies roughly the top band of the hero frame */
const SKY_MAX_ROW_FRACTION = 0.44

/** Cursor trail + idle redraw; ambient twinkle uses TWINKLE below */
const SYCAMORE = {
  timeScale: 0.0026,
  waveAmp1: 17,
  waveAmp2: 10,
  waveAmp3: 5,
  swirl1: 15,
  swirl2: 24,
  baseThreshold: 140,
  trailRadius: 150,
  trailInfluence: 200,
  textSpeed: 0.03,
  textStep: 10,
  delayRange: 1000,
  targetFps: 12,
}

/** Subtle star-like twinkle — sparse, per-pixel, capped brighten */
const TWINKLE = {
  activeFraction: 0.002,
  cycleMs: 2400,
  riseMs: 1200,
  spawnIntervalMs: 2000,
  spawnMin: 3,
  spawnMax: 4,
  channelAdd: 40,
}

const GLYPHS = ['●', '◦', '·', '◌'] as const

type Props = {
  src: string
  alt?: string
  className?: string
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dw: number,
  dh: number,
) {
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  if (!iw || !ih) return
  const scale = Math.max(dw / iw, dh / ih)
  const sw = iw * scale
  const sh = ih * scale
  const ox = (dw - sw) / 2
  const oy = (dh - sh) / 2
  ctx.drawImage(img, ox, oy, sw, sh)
}

function clamp255(n: number): number {
  return Math.min(255, Math.max(0, Math.round(n)))
}

function easeInOutSmooth(t: number): number {
  return t * t * (3 - 2 * t)
}

/** 0 → 1 → 0 over TWINKLE.cycleMs with ease on each 1200ms half */
function twinklePulse(elapsedMs: number): number {
  if (elapsedMs >= TWINKLE.cycleMs) return 0
  if (elapsedMs < TWINKLE.riseMs) {
    return easeInOutSmooth(elapsedMs / TWINKLE.riseMs)
  }
  return easeInOutSmooth(1 - (elapsedMs - TWINKLE.riseMs) / TWINKLE.riseMs)
}

function drawPixelCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
) {
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.fillRect(x, y, CELL, CELL)
}

function brightness(r: number, g: number, b: number): number {
  return (r * 85 + g * 85 + b * 85) / 255
}

/** Peach-pink sky in the upper band; mountain / trees / foreground react */
function isSkySample(
  r: number,
  g: number,
  b: number,
  row: number,
  totalRows: number,
): boolean {
  if (row / totalRows > SKY_MAX_ROW_FRACTION) return false
  const br = brightness(r, g, b)
  if (br < 95) return false
  const warm = r >= g * 0.88 && g >= b * 0.75
  const light = br > 115
  return warm && light
}

function globalWave(t: number): number {
  const w =
    Math.sin(t) * SYCAMORE.waveAmp1 +
    Math.sin(t * 0.5 + 1.3) * SYCAMORE.waveAmp2 +
    Math.cos(t * 1.7) * SYCAMORE.waveAmp3
  return Math.max(-60, Math.min(60, w))
}

function cellSwirl(t: number, col: number, row: number): number {
  return (
    Math.sin(col * 0.4 + row * 0.4 + t * 1.5) * SYCAMORE.swirl1 +
    Math.cos(col * 0.2 - row * 0.3 + t * 1.125) * SYCAMORE.swirl2
  )
}

/** Irregular cursor zone (hard edge) */
function isCursorZone(
  cx: number,
  cy: number,
  cursorX: number,
  cursorY: number,
): boolean {
  const dist = Math.hypot(cx - cursorX, cy - cursorY)
  const limit = 100 + 20 * Math.sin(cx * 0.15) * Math.cos(cy * 0.15)
  return dist < limit
}

function trailInfluence(
  cx: number,
  cy: number,
  trail: readonly number[],
): number {
  const n = trail.length >> 1
  if (n === 0) return 0
  let ti = 0
  for (let i = 0; i < n && i < 20; i++) {
    const d = Math.hypot(cx - trail[i * 2]!, cy - trail[i * 2 + 1]!)
    ti += Math.max(0, 1 - d / SYCAMORE.trailRadius) * (i / Math.max(n, 1))
  }
  return Math.min(1, ti)
}

function glyphIndex(
  frame: number,
  col: number,
  row: number,
  ti: number,
  r: number,
  g: number,
  b: number,
): number {
  const delay = (1 - ti) * SYCAMORE.delayRange
  const stepped =
    Math.floor(frame * SYCAMORE.textSpeed * SYCAMORE.textStep) /
    SYCAMORE.textStep
  const flow = stepped - delay / 1000
  const tint = Math.floor(r * 0.299 + g * 0.587 + b * 0.114) % 4
  let index = Math.floor(flow + col * 0.3 + row * 0.2 + tint)
  let finalIdx = index - Math.floor(index / 4) * 4
  if (finalIdx < 0) finalIdx += 4
  return finalIdx
}

export function HeroPixelTorch({ src, alt = '', className = '' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrapNode = wrapRef.current
    const canvasNode = canvasRef.current
    if (!wrapNode || !canvasNode) return

    const wrapEl: HTMLDivElement = wrapNode
    const canvasEl: HTMLCanvasElement = canvasNode

    let w = 1
    let h = 1
    let cols = 0
    let rows = 0
    let cellCount = 0

    let baseR = new Uint8ClampedArray(0)
    let baseG = new Uint8ClampedArray(0)
    let baseB = new Uint8ClampedArray(0)
    let baseBr = new Float32Array(0)
    let inImage = new Uint8Array(0)
    let isSky = new Uint8Array(0)
    let actThresholdAdj = 150
    let offsetX = 0
    let offsetY = 0
    let bgFill = '#F7F6F2'

    const trail: number[] = []
    let cursorX = -1e9
    let cursorY = -1e9
    let pointerActive = false
    let trailIdleTimer = 0

    let frame = 0
    let raf = 0
    let lastDraw = 0
    let ready = false
    let visible = true

    const activeTwinkles = new Map<number, number>()
    let lastTwinkleSpawn = 0

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const loader = new Image()

    function gridDims(width: number, height: number) {
      return {
        c: Math.max(1, Math.floor(width / CELL)),
        r: Math.max(1, Math.floor(height / CELL)),
      }
    }

    function sampleFromImage(): boolean {
      if (!loader.complete || loader.naturalWidth === 0) return false

      const rect = wrapEl.getBoundingClientRect()
      w = Math.max(1, Math.floor(rect.width))
      h = Math.max(1, Math.floor(rect.height))

      const { c, r } = gridDims(w, h)
      cols = c
      rows = r
      cellCount = cols * rows

      baseR = new Uint8ClampedArray(cellCount)
      baseG = new Uint8ClampedArray(cellCount)
      baseB = new Uint8ClampedArray(cellCount)
      baseBr = new Float32Array(cellCount)
      inImage = new Uint8Array(cellCount)
      isSky = new Uint8Array(cellCount)

      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const octx = off.getContext('2d', { willReadFrequently: true })
      if (!octx) return false

      drawCover(octx, loader, w, h)
      const { data, width: iw } = octx.getImageData(0, 0, w, h)

      const imgW = loader.naturalWidth
      const imgH = loader.naturalHeight
      const coverScale = Math.max(w / imgW, h / imgH)
      const coverW = imgW * coverScale
      const coverH = imgH * coverScale
      const coverOx = (w - coverW) / 2
      const coverOy = (h - coverH) / 2

      const gridW = cols * CELL
      const gridH = rows * CELL
      offsetX = Math.floor((w - gridW) / 2)
      offsetY = Math.floor((h - gridH) / 2)

      let sumBr = 0
      let idx = 0
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const sx = Math.min(
            w - 1,
            offsetX + i * CELL + Math.floor(CELL / 2),
          )
          const sy = Math.min(
            h - 1,
            offsetY + j * CELL + Math.floor(CELL / 2),
          )
          const p = (sy * iw + sx) * 4
          const r = data[p]!
          const g = data[p + 1]!
          const b = data[p + 2]!
          baseR[idx] = r
          baseG[idx] = g
          baseB[idx] = b
          const br = brightness(r, g, b)
          baseBr[idx] = br
          const inside =
            sx >= coverOx &&
            sx < coverOx + coverW &&
            sy >= coverOy &&
            sy < coverOy + coverH
          inImage[idx] = inside ? 1 : 0
          isSky[idx] =
            inside && isSkySample(r, g, b, j, rows) ? 1 : 0
          if (inside && !isSky[idx]) sumBr += br
          idx++
        }
      }

      let landCount = 0
      for (let k = 0; k < cellCount; k++) {
        if (inImage[k] && !isSky[k]) landCount++
      }
      const meanBr = landCount > 0 ? sumBr / landCount : sumBr / cellCount
      actThresholdAdj = meanBr * 0.98 + 32
      bgFill = '#F7F6F2'

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvasEl.width = Math.floor(w * dpr)
      canvasEl.height = Math.floor(h * dpr)
      canvasEl.style.width = `${w}px`
      canvasEl.style.height = `${h}px`

      const ctx = canvasEl.getContext('2d')
      if (!ctx) return false
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      activeTwinkles.clear()
      lastTwinkleSpawn = performance.now()
      ready = true
      return true
    }

    function maxTwinkles() {
      return Math.max(1, Math.floor(cellCount * TWINKLE.activeFraction))
    }

    function updateTwinkles(now: number) {
      for (const [idx, start] of activeTwinkles) {
        if (now - start >= TWINKLE.cycleMs) activeTwinkles.delete(idx)
      }
      if (now - lastTwinkleSpawn < TWINKLE.spawnIntervalMs) return
      lastTwinkleSpawn = now

      const cap = maxTwinkles()
      if (activeTwinkles.size >= cap) return

      const batch =
        TWINKLE.spawnMin +
        Math.floor(Math.random() * (TWINKLE.spawnMax - TWINKLE.spawnMin + 1))
      let added = 0
      let attempts = 0
      const limit = Math.min(batch, cap - activeTwinkles.size)
      while (added < limit && attempts < limit * 32) {
        attempts++
        const pick = Math.floor(Math.random() * cellCount)
        if (activeTwinkles.has(pick)) continue
        if (!inImage[pick] || isSky[pick]) continue
        if (baseBr[pick]! >= actThresholdAdj + 18) continue
        activeTwinkles.set(pick, now)
        added++
      }
    }

    function twinkleBoostFor(idx: number, now: number): number {
      const start = activeTwinkles.get(idx)
      if (start === undefined) return 0
      return TWINKLE.channelAdd * twinklePulse(now - start)
    }

    function drawGlyph(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      glyph: string,
      r: number,
      g: number,
      b: number,
    ) {
      const lum = (r + g + b) / 3
      const ink = lum > 140 ? 'rgba(28,24,32,0.78)' : 'rgba(40,36,44,0.7)'
      const cx = x + CELL / 2
      const cy = y + CELL / 2 + 0.5

      ctx.fillStyle = ink
      ctx.strokeStyle = ink
      ctx.lineWidth = 0.75

      if (glyph === '●') {
        ctx.beginPath()
        ctx.arc(cx, cy, 1.75, 0, Math.PI * 2)
        ctx.fill()
        return
      }
      if (glyph === '◦') {
        ctx.beginPath()
        ctx.arc(cx, cy, 1.75, 0, Math.PI * 2)
        ctx.stroke()
        return
      }
      if (glyph === '·') {
        ctx.beginPath()
        ctx.arc(cx, cy, 0.9, 0, Math.PI * 2)
        ctx.fill()
        return
      }
      ctx.beginPath()
      ctx.arc(cx, cy, 1.35, 0, Math.PI * 2)
      ctx.stroke()
    }

    function canInteract(idx: number): boolean {
      return inImage[idx] === 1 && isSky[idx] === 0
    }

    function shouldDrawGlyph(
      idx: number,
      ti: number,
      act: boolean,
      sm: boolean,
    ): boolean {
      if (!canInteract(idx) || ti <= 0.08) return false
      if (!sm) return true
      return act || ti > 0.22
    }

    function drawFrameStatic() {
      if (!ready || cellCount === 0) return
      const ctx = canvasEl.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = bgFill
      ctx.fillRect(0, 0, w, h)
      let idx = 0
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = offsetX + i * STRIDE
          const y = offsetY + j * STRIDE
          drawPixelCell(ctx, x, y, baseR[idx]!, baseG[idx]!, baseB[idx]!)
          idx++
        }
      }
    }

    function drawFrame() {
      if (!ready || cellCount === 0) return
      const ctx = canvasEl.getContext('2d')
      if (!ctx) return

      frame++
      const t = frame * SYCAMORE.timeScale
      const wWave = globalWave(t)
      const now = performance.now()
      updateTwinkles(now)

      ctx.fillStyle = bgFill
      ctx.fillRect(0, 0, w, h)

      let idx = 0
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = offsetX + i * STRIDE
          const y = offsetY + j * STRIDE

          const cx = x + CELL / 2
          const cy = y + CELL / 2
          const br = baseBr[idx]!
          const sw = cellSwirl(t, i, j)

          const inCursorReveal =
            pointerActive && isCursorZone(cx, cy, cursorX, cursorY)

          const interactive = canInteract(idx)
          const ti = trailInfluence(cx, cy, trail)
          const act = interactive && br < actThresholdAdj + sw
          const threshold =
            SYCAMORE.baseThreshold + wWave + sw + ti * SYCAMORE.trailInfluence
          const sm = !interactive || !(br < threshold)

          if (inCursorReveal && interactive) {
            drawPixelCell(ctx, x, y, baseR[idx]!, baseG[idx]!, baseB[idx]!)
            if (shouldDrawGlyph(idx, ti, act, sm)) {
              const gi = glyphIndex(
                frame,
                i,
                j,
                ti,
                baseR[idx]!,
                baseG[idx]!,
                baseB[idx]!,
              )
              drawGlyph(ctx, x, y, GLYPHS[gi]!, baseR[idx]!, baseG[idx]!, baseB[idx]!)
            }
            idx++
            continue
          }

          let r = baseR[idx]!
          let g = baseG[idx]!
          let b = baseB[idx]!

          const boost = interactive ? twinkleBoostFor(idx, now) : 0
          if (boost > 0) {
            r = clamp255(r + boost)
            g = clamp255(g + boost)
            b = clamp255(b + boost)
          }

          drawPixelCell(ctx, x, y, r, g, b)

          if (pointerActive && shouldDrawGlyph(idx, ti, act, sm)) {
            const gi = glyphIndex(
              frame,
              i,
              j,
              ti,
              baseR[idx]!,
              baseG[idx]!,
              baseB[idx]!,
            )
            drawGlyph(ctx, x, y, GLYPHS[gi]!, baseR[idx]!, baseG[idx]!, baseB[idx]!)
          }

          idx++
        }
      }
    }

    const frameInterval = 1000 / SYCAMORE.targetFps

    function tick(now: number) {
      if (!reducedMotion && visible && ready) {
        const twinkling = activeTwinkles.size > 0
        if (pointerActive || twinkling || now - lastDraw >= frameInterval) {
          drawFrame()
          lastDraw = now
        }
      }
      raf = requestAnimationFrame(tick)
    }

    function startLoop() {
      cancelAnimationFrame(raf)
      lastDraw = 0
      raf = requestAnimationFrame(tick)
      if (!reducedMotion) drawFrame()
    }

    function clientToLocal(clientX: number, clientY: number) {
      const rect = canvasEl.getBoundingClientRect()
      const scaleX = rect.width > 0 ? w / rect.width : 1
      const scaleY = rect.height > 0 ? h / rect.height : 1
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      }
    }

    function onPointerMove(e: PointerEvent) {
      const p = clientToLocal(e.clientX, e.clientY)
      cursorX = p.x
      cursorY = p.y
      trail.push(p.x, p.y)
      if (trail.length > 40) {
        trail.shift()
        trail.shift()
      }
      pointerActive = true
      window.clearTimeout(trailIdleTimer)
    }

    function onPointerLeave() {
      window.clearTimeout(trailIdleTimer)
      trailIdleTimer = window.setTimeout(() => {
        pointerActive = false
        trail.length = 0
      }, 2000)
    }

    function onImageReady() {
      if (!sampleFromImage()) return
      if (reducedMotion) {
        drawFrameStatic()
        return
      }
      startLoop()
    }

    canvasEl.addEventListener('pointermove', onPointerMove)
    canvasEl.addEventListener('pointerenter', onPointerMove)
    canvasEl.addEventListener('pointerleave', onPointerLeave)

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (sampleFromImage()) drawFrame()
      })
    })
    ro.observe(wrapEl)

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true
      },
      { threshold: 0 },
    )
    io.observe(wrapEl)

    loader.addEventListener('load', onImageReady)
    loader.src = src
    if (loader.complete && loader.naturalWidth > 0) onImageReady()

    return () => {
      ready = false
      cancelAnimationFrame(raf)
      window.clearTimeout(trailIdleTimer)
      ro.disconnect()
      io.disconnect()
      loader.removeEventListener('load', onImageReady)
      canvasEl.removeEventListener('pointermove', onPointerMove)
      canvasEl.removeEventListener('pointerenter', onPointerMove)
      canvasEl.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [src])

  return (
    <div ref={wrapRef} className={`relative overflow-hidden border-0 bg-[#F7F6F2] outline-none ${className}`}>
      <canvas ref={canvasRef} className="block h-full w-full touch-none border-0 outline-none" />
      <HeroCanvasCards containerRef={wrapRef} />
      {alt ? <span className="sr-only">{alt}</span> : null}
    </div>
  )
}
