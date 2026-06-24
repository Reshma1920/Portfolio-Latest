'use client'

import { useEffect, useRef } from 'react'

const CELL = 6
const GAP = 1
const STRIDE = CELL + GAP

const SPAWN_INTERVAL_MS = 750
const CLUSTERS_PER_CORNER = 2
const CLUSTER_LIFE_MS = 3400
const FADE_IN_MS = 520
const FADE_OUT_MS = 900
const EXPAND_MS = 2200

const MAX_ALPHA = 0.048
const BASE_RADIUS_MIN = 18
const BASE_RADIUS_MAX = 42
/** Offset from corner toward interior at spawn. */
const CORNER_PAD_PX = 6
const CORNER_JITTER_PX = 28

/** Brand purple #6B35B8 → soft lavender for cluster gradients. */
const PURPLE_DEEP = { r: 107, g: 53, b: 184 }
const PURPLE_LIGHT = { r: 196, g: 168, b: 232 }

type CornerId = 'tl' | 'tr' | 'bl' | 'br'

type AmbientCluster = {
  x: number
  y: number
  born: number
  baseRadius: number
  maxRadius: number
  seed: number
  corner: CornerId
}

type HeroAmbientPixelsProps = {
  topOffsetPx: number
  bottomOffsetPx: number
  /** Matches hero guide corner horizontal inset. */
  sideInsetPx?: number
}

function cellHash(gx: number, gy: number, seed: number): number {
  let h = gx * 374761393 + gy * 668265263 + seed * 982451653
  h = (h ^ (h >> 13)) * 1274126177
  return (h ^ (h >> 16)) >>> 0
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function clusterStrength(now: number, born: number): number {
  const age = now - born
  if (age >= CLUSTER_LIFE_MS) return 0
  if (age < FADE_IN_MS) return age / FADE_IN_MS
  if (age > CLUSTER_LIFE_MS - FADE_OUT_MS) {
    return (CLUSTER_LIFE_MS - age) / FADE_OUT_MS
  }
  return 1
}

function clusterRadius(cluster: AmbientCluster, now: number): number {
  const age = now - cluster.born
  const expandT = Math.min(1, age / EXPAND_MS)
  return cluster.baseRadius + (cluster.maxRadius - cluster.baseRadius) * easeOutCubic(expandT)
}

function purpleRgb(radial: number, hash: number): { r: number; g: number; b: number } {
  const mix = radial * 0.68 + ((hash & 0xff) / 255) * 0.32
  return {
    r: Math.round(PURPLE_LIGHT.r + (PURPLE_DEEP.r - PURPLE_LIGHT.r) * mix),
    g: Math.round(PURPLE_LIGHT.g + (PURPLE_DEEP.g - PURPLE_LIGHT.g) * mix),
    b: Math.round(PURPLE_LIGHT.b + (PURPLE_DEEP.b - PURPLE_LIGHT.b) * mix),
  }
}

function cornerAnchor(corner: CornerId, w: number, h: number): { x: number; y: number } {
  switch (corner) {
    case 'tl':
      return { x: 0, y: 0 }
    case 'tr':
      return { x: w, y: 0 }
    case 'bl':
      return { x: 0, y: h }
    case 'br':
      return { x: w, y: h }
  }
}

function isInBounds(px: number, py: number, w: number, h: number): boolean {
  return px >= 0 && py >= 0 && px + CELL <= w && py + CELL <= h
}

/** Keep pixels in the quadrant that opens toward the hero interior. */
function isInwardCell(cx: number, cy: number, corner: CornerId, anchorX: number, anchorY: number): boolean {
  switch (corner) {
    case 'tl':
      return cx >= anchorX && cy >= anchorY
    case 'tr':
      return cx <= anchorX && cy >= anchorY
    case 'bl':
      return cx >= anchorX && cy <= anchorY
    case 'br':
      return cx <= anchorX && cy <= anchorY
  }
}

function jitteredCornerOrigin(
  corner: CornerId,
  w: number,
  h: number,
  rand: () => number,
): { x: number; y: number; corner: CornerId } {
  const anchor = cornerAnchor(corner, w, h)
  const jitter = CORNER_PAD_PX + rand() * CORNER_JITTER_PX

  switch (corner) {
    case 'tl':
      return { x: anchor.x + jitter, y: anchor.y + jitter, corner }
    case 'tr':
      return { x: anchor.x - jitter, y: anchor.y + jitter, corner }
    case 'bl':
      return { x: anchor.x + jitter, y: anchor.y - jitter, corner }
    case 'br':
      return { x: anchor.x - jitter, y: anchor.y - jitter, corner }
  }
}

function drawCluster(
  ctx: CanvasRenderingContext2D,
  cluster: AmbientCluster,
  strength: number,
  radius: number,
  anchorX: number,
  anchorY: number,
  w: number,
  h: number,
) {
  if (strength <= 0.003 || radius <= 0) return

  const minGx = Math.floor((cluster.x - radius) / STRIDE)
  const maxGx = Math.ceil((cluster.x + radius) / STRIDE)
  const minGy = Math.floor((cluster.y - radius) / STRIDE)
  const maxGy = Math.ceil((cluster.y + radius) / STRIDE)

  for (let gy = minGy; gy <= maxGy; gy += 1) {
    for (let gx = minGx; gx <= maxGx; gx += 1) {
      const px = gx * STRIDE
      const py = gy * STRIDE
      if (!isInBounds(px, py, w, h)) continue

      const cx = px + CELL / 2
      const cy = py + CELL / 2
      const dist = Math.hypot(cx - cluster.x, cy - cluster.y)
      if (dist >= radius) continue
      if (!isInwardCell(cx, cy, cluster.corner, anchorX, anchorY)) continue

      const edgeT = dist / radius
      const keepChance = Math.pow(1 - edgeT, 2.05) * 0.86
      const rnd = (cellHash(gx, gy, cluster.seed) & 0xfff) / 0xfff
      if (rnd > keepChance) continue

      const radial = 1 - edgeT
      const cellVar = 0.58 + ((cellHash(gx, gy, cluster.seed) >> 12) & 0xff) / 360
      const alpha = MAX_ALPHA * radial * radial * cellVar * strength
      if (alpha < 0.004) continue

      const hash = cellHash(gx, gy, cluster.seed)
      const { r, g, b } = purpleRgb(radial, hash)
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
      ctx.fillRect(px, py, CELL, CELL)
    }
  }
}

const CORNERS: CornerId[] = ['tl', 'tr', 'bl', 'br']

export function HeroAmbientPixels({
  topOffsetPx,
  bottomOffsetPx,
  sideInsetPx = 90,
}: HeroAmbientPixelsProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let w = 0
    let h = 0
    let raf = 0
    let lastSpawn = 0
    let seed = Math.floor(Math.random() * 1_000_000)

    const clusters: AmbientCluster[] = []

    function resize() {
      const wrapEl = wrapRef.current
      const canvasEl = canvasRef.current
      if (!wrapEl || !canvasEl) return
      const ctx2 = canvasEl.getContext('2d')
      if (!ctx2) return

      const rect = wrapEl.getBoundingClientRect()
      w = Math.max(1, Math.floor(rect.width))
      h = Math.max(1, Math.floor(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvasEl.width = Math.floor(w * dpr)
      canvasEl.height = Math.floor(h * dpr)
      canvasEl.style.width = `${w}px`
      canvasEl.style.height = `${h}px`
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function maxRadiusForCorner(corner: CornerId, originX: number, originY: number, rand: () => number) {
      const reachX = corner === 'tl' || corner === 'bl' ? w - originX : originX
      const reachY = corner === 'tl' || corner === 'tr' ? h - originY : originY
      const diagonal = Math.hypot(reachX, reachY)
      return diagonal * (0.72 + rand() * 0.22)
    }

    function spawnCornerClusters(now: number) {
      let clusterIndex = 0

      for (const corner of CORNERS) {
        for (let i = 0; i < CLUSTERS_PER_CORNER; i += 1) {
          const rand = () => {
            const hsh = cellHash(clusterIndex, seed, corner.charCodeAt(0))
            clusterIndex += 1
            return (hsh & 0xffff) / 0xffff
          }

          const origin = jitteredCornerOrigin(corner, w, h, rand)
          const clusterSeed = seed
          seed += 1

          clusters.push({
            x: origin.x,
            y: origin.y,
            corner: origin.corner,
            born: now + i * 48 + CORNERS.indexOf(corner) * 28,
            baseRadius: BASE_RADIUS_MIN + rand() * (BASE_RADIUS_MAX - BASE_RADIUS_MIN),
            maxRadius: maxRadiusForCorner(corner, origin.x, origin.y, rand),
            seed: clusterSeed,
          })
        }
      }
    }

    function frame(now: number) {
      const canvasEl = canvasRef.current
      if (!canvasEl) return
      const ctx2 = canvasEl.getContext('2d')
      if (!ctx2) return

      if (!lastSpawn) {
        lastSpawn = now
        spawnCornerClusters(now)
      } else if (now - lastSpawn >= SPAWN_INTERVAL_MS) {
        lastSpawn = now
        spawnCornerClusters(now)
      }

      for (let i = clusters.length - 1; i >= 0; i -= 1) {
        if (now - clusters[i].born >= CLUSTER_LIFE_MS) clusters.splice(i, 1)
      }

      ctx2.clearRect(0, 0, w, h)
      for (const cluster of clusters) {
        const anchor = cornerAnchor(cluster.corner, w, h)
        drawCluster(
          ctx2,
          cluster,
          clusterStrength(now, cluster.born),
          clusterRadius(cluster, now),
          anchor.x,
          anchor.y,
          w,
          h,
        )
      }

      raf = requestAnimationFrame(frame)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [topOffsetPx, bottomOffsetPx, sideInsetPx])

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute z-[1] overflow-hidden"
      style={{
        top: topOffsetPx,
        bottom: bottomOffsetPx,
        left: sideInsetPx,
        right: sideInsetPx,
      }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
