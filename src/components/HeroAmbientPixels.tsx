'use client'

import { useEffect, useRef } from 'react'

const CELL = 6
const GAP = 1
const STRIDE = CELL + GAP

const SPAWN_INTERVAL_MS = 1000
const CLUSTERS_PER_SPAWN = 12
const MIN_CLUSTER_DISTANCE = 94
const CLUSTER_LIFE_MS = 2400
const FADE_IN_MS = 420
const FADE_OUT_MS = 680

const MAX_ALPHA = 0.052
const CLUSTER_RADIUS_MIN = 36
const CLUSTER_RADIUS_MAX = 83

/** Brand purple #6B35B8 → soft lavender for cluster gradients. */
const PURPLE_DEEP = { r: 107, g: 53, b: 184 }
const PURPLE_LIGHT = { r: 196, g: 168, b: 232 }

type AmbientCluster = {
  x: number
  y: number
  born: number
  radius: number
  seed: number
}

type HeroAmbientPixelsProps = {
  topOffsetPx: number
  bottomOffsetPx: number
}

function cellHash(gx: number, gy: number, seed: number): number {
  let h = gx * 374761393 + gy * 668265263 + seed * 982451653
  h = (h ^ (h >> 13)) * 1274126177
  return (h ^ (h >> 16)) >>> 0
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

function purpleRgb(radial: number, hash: number): { r: number; g: number; b: number } {
  const mix = radial * 0.68 + ((hash & 0xff) / 255) * 0.32
  return {
    r: Math.round(PURPLE_LIGHT.r + (PURPLE_DEEP.r - PURPLE_LIGHT.r) * mix),
    g: Math.round(PURPLE_LIGHT.g + (PURPLE_DEEP.g - PURPLE_LIGHT.g) * mix),
    b: Math.round(PURPLE_LIGHT.b + (PURPLE_DEEP.b - PURPLE_LIGHT.b) * mix),
  }
}

function drawCluster(
  ctx: CanvasRenderingContext2D,
  cluster: AmbientCluster,
  strength: number,
  seed: number,
) {
  if (strength <= 0.003) return

  const minGx = Math.floor((cluster.x - cluster.radius) / STRIDE)
  const maxGx = Math.ceil((cluster.x + cluster.radius) / STRIDE)
  const minGy = Math.floor((cluster.y - cluster.radius) / STRIDE)
  const maxGy = Math.ceil((cluster.y + cluster.radius) / STRIDE)

  for (let gy = minGy; gy <= maxGy; gy += 1) {
    for (let gx = minGx; gx <= maxGx; gx += 1) {
      const px = gx * STRIDE
      const py = gy * STRIDE
      const cx = px + CELL / 2
      const cy = py + CELL / 2
      const dist = Math.hypot(cx - cluster.x, cy - cluster.y)
      if (dist >= cluster.radius) continue

      const edgeT = dist / cluster.radius
      const keepChance = Math.pow(1 - edgeT, 2.2) * 0.82
      const rnd = (cellHash(gx, gy, seed) & 0xfff) / 0xfff
      if (rnd > keepChance) continue

      const radial = 1 - edgeT
      const cellVar = 0.58 + ((cellHash(gx, gy, seed) >> 12) & 0xff) / 360
      const alpha = MAX_ALPHA * radial * radial * cellVar * strength
      if (alpha < 0.004) continue

      const hash = cellHash(gx, gy, seed)
      const { r, g, b } = purpleRgb(radial, hash)
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
      ctx.fillRect(px, py, CELL, CELL)
    }
  }
}

export function HeroAmbientPixels({ topOffsetPx, bottomOffsetPx }: HeroAmbientPixelsProps) {
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

    function spawnClusters(now: number) {
      const margin = CLUSTER_RADIUS_MAX + STRIDE * 2
      const placed: { x: number; y: number }[] = []

      for (let i = 0; i < CLUSTERS_PER_SPAWN; i += 1) {
        let x = margin
        let y = margin

        for (let attempt = 0; attempt < 28; attempt += 1) {
          x = margin + Math.random() * Math.max(1, w - margin * 2)
          y = margin + Math.random() * Math.max(1, h - margin * 2)
          const farEnough = placed.every(
            (point) => Math.hypot(point.x - x, point.y - y) >= MIN_CLUSTER_DISTANCE,
          )
          if (farEnough) break
        }

        placed.push({ x, y })
        const clusterSeed = seed
        seed += 1

        clusters.push({
          x,
          y,
          born: now + i * 45,
          radius:
            CLUSTER_RADIUS_MIN +
            Math.random() * (CLUSTER_RADIUS_MAX - CLUSTER_RADIUS_MIN),
          seed: clusterSeed,
        })
      }
    }

    function frame(now: number) {
      const canvasEl = canvasRef.current
      if (!canvasEl) return
      const ctx2 = canvasEl.getContext('2d')
      if (!ctx2) return

      if (!lastSpawn) {
        lastSpawn = now
        spawnClusters(now)
      } else if (now - lastSpawn >= SPAWN_INTERVAL_MS) {
        lastSpawn = now
        spawnClusters(now)
      }

      for (let i = clusters.length - 1; i >= 0; i -= 1) {
        if (now - clusters[i].born >= CLUSTER_LIFE_MS) clusters.splice(i, 1)
      }

      ctx2.clearRect(0, 0, w, h)
      for (const cluster of clusters) {
        drawCluster(ctx2, cluster, clusterStrength(now, cluster.born), cluster.seed)
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
  }, [topOffsetPx, bottomOffsetPx])

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-x-0 z-[1]"
      style={{ top: topOffsetPx, bottom: bottomOffsetPx }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
