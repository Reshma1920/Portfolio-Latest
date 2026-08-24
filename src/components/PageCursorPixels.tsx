'use client'

import { useEffect, useRef } from 'react'

const CELL = 6
const GAP = 1
const STRIDE = CELL + GAP

const MAX_ALPHA = 0.08
const CLUSTER_BASE = 70
const CLUSTER_WOBBLE = 14
/** Solid black square centered on the cursor tip. */
const CURSOR_SQUARE = 6

const HEAD_SMOOTH = 0.14
const TRAIL_SPACING = 11
const TRAIL_MAX = 12
const POINT_TTL_MS = 720
const IDLE_FADE_MS = 600

type TrailPoint = { x: number; y: number; born: number }
type Center = { x: number; y: number; strength: number }

function clusterRadius(cx: number, cy: number): number {
  return CLUSTER_BASE + CLUSTER_WOBBLE * Math.sin(cx * 0.15) * Math.cos(cy * 0.15)
}

function cellHash(gx: number, gy: number): number {
  let h = gx * 374761393 + gy * 668265263
  h = (h ^ (h >> 13)) * 1274126177
  return (h ^ (h >> 16)) >>> 0
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function pointStrength(now: number, born: number): number {
  const age = now - born
  if (age >= POINT_TTL_MS) return 0
  return 1 - easeInOutCubic(age / POINT_TTL_MS)
}

function cellAlphaAt(
  gx: number,
  gy: number,
  centerX: number,
  centerY: number,
  strength: number,
): number {
  if (strength <= 0.003) return 0

  const x = gx * STRIDE
  const y = gy * STRIDE
  const cx = x + CELL / 2
  const cy = y + CELL / 2
  const dist = Math.hypot(cx - centerX, cy - centerY)
  const limit = clusterRadius(cx, cy)
  if (dist >= limit) return 0

  const edgeT = dist / limit
  const keepChance = Math.pow(1 - edgeT, 2.1) * 0.88
  const rnd = (cellHash(gx, gy) & 0xfff) / 0xfff
  if (rnd > keepChance) return 0

  const radial = 1 - edgeT
  const cellVar = 0.62 + ((cellHash(gx, gy) >> 12) & 0xff) / 340
  return MAX_ALPHA * radial * radial * cellVar * strength
}

export function PageCursorPixels() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reducedMotion) return

    let w = 0
    let h = 0
    let targetX = -1e9
    let targetY = -1e9
    let smoothX = -1e9
    let smoothY = -1e9
    let lastTrailX = -1e9
    let lastTrailY = -1e9
    let lastMove = 0
    let hasPointer = false
    let raf = 0

    const trail: TrailPoint[] = []
    const centers: Center[] = []
    const maxRadius = CLUSTER_BASE + CLUSTER_WOBBLE + STRIDE * 2

    function resize() {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      w = window.innerWidth
      h = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function idleFade(now: number): number {
      if (!hasPointer) return 0
      return Math.max(0, 1 - (now - lastMove) / IDLE_FADE_MS)
    }

    function pushTrail(x: number, y: number, now: number) {
      if (lastTrailX > -1e8) {
        const dx = x - lastTrailX
        const dy = y - lastTrailY
        const dist = Math.hypot(dx, dy)
        const steps = Math.max(1, Math.ceil(dist / TRAIL_SPACING))
        for (let i = 1; i <= steps; i++) {
          const t = i / steps
          trail.push({
            x: lastTrailX + dx * t,
            y: lastTrailY + dy * t,
            born: now,
          })
        }
      } else {
        trail.push({ x, y, born: now })
      }

      while (trail.length > TRAIL_MAX) trail.shift()
      lastTrailX = x
      lastTrailY = y
    }

    function drawFrame() {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const now = performance.now()
      const idle = idleFade(now)

      smoothX += (targetX - smoothX) * HEAD_SMOOTH
      smoothY += (targetY - smoothY) * HEAD_SMOOTH

      ctx.clearRect(0, 0, w, h)

      centers.length = 0

      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i]!
        const life = pointStrength(now, p.born) * idle
        if (life <= 0.003) {
          trail.splice(i, 1)
          continue
        }
        centers.push({ x: p.x, y: p.y, strength: life * 0.88 })
      }

      if (idle > 0.001) {
        const moving = now - lastMove < 90
        centers.push({ x: smoothX, y: smoothY, strength: idle * (moving ? 1 : 0.75) })
      }

      if (centers.length > 0) {
        let minGX = Infinity
        let maxGX = -Infinity
        let minGY = Infinity
        let maxGY = -Infinity

        for (const c of centers) {
          minGX = Math.min(minGX, Math.floor((c.x - maxRadius) / STRIDE))
          maxGX = Math.max(maxGX, Math.ceil((c.x + maxRadius) / STRIDE))
          minGY = Math.min(minGY, Math.floor((c.y - maxRadius) / STRIDE))
          maxGY = Math.max(maxGY, Math.ceil((c.y + maxRadius) / STRIDE))
        }

        for (let gy = minGY; gy <= maxGY; gy++) {
          for (let gx = minGX; gx <= maxGX; gx++) {
            const x = gx * STRIDE
            const y = gy * STRIDE
            if (x + CELL < 0 || y + CELL < 0 || x > w || y > h) continue

            let alpha = 0
            for (const c of centers) {
              alpha = Math.max(
                alpha,
                cellAlphaAt(gx, gy, c.x, c.y, c.strength),
              )
            }

            if (alpha < 0.01) continue
            ctx.fillStyle = `rgba(0,0,0,${alpha})`
            ctx.fillRect(x, y, CELL, CELL)
          }
        }
      }

      // Solid black square at the cursor tip — pixel trail unchanged
      if (hasPointer && idle > 0.001 && smoothX > -1e8) {
        const half = CURSOR_SQUARE / 2
        ctx.fillStyle = `rgba(0,0,0,${idle})`
        ctx.fillRect(smoothX - half, smoothY - half, CURSOR_SQUARE, CURSOR_SQUARE)
      }
    }

    function tick() {
      drawFrame()
      const now = performance.now()
      const idle = idleFade(now)
      const settling = Math.hypot(targetX - smoothX, targetY - smoothY) > 0.2
      const active = idle > 0.001 || trail.length > 0 || settling

      if (hasPointer && active) {
        raf = requestAnimationFrame(tick)
        return
      }

      raf = 0
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)
      trail.length = 0
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    function onPointerMove(e: PointerEvent) {
      const now = performance.now()
      targetX = e.clientX
      targetY = e.clientY

      if (!hasPointer) {
        smoothX = targetX
        smoothY = targetY
        lastTrailX = targetX
        lastTrailY = targetY
      } else {
        pushTrail(targetX, targetY, now)
      }

      lastMove = now
      hasPointer = true
      schedule()
    }

    function onPointerLeave() {
      lastMove = performance.now()
      schedule()
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerleave', onPointerLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] block h-full w-full border-0 outline-none"
    />
  )
}
