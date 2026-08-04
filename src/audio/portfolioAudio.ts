'use client'

const PIXEL_DRAG_SRC = '/Pixel%20draging%20.mp3'
const CLICK_SRC = '/Click-enter%20Sounds.mp3'

type Sounds = {
  pixelDrag: HTMLAudioElement
  click: HTMLAudioElement
}

let sounds: Sounds | null = null

function getSounds(): Sounds | null {
  if (sounds) return sounds
  // Avoid SSR/prerender crashes: `Audio` is browser-only.
  if (typeof Audio === 'undefined') return null
  sounds = {
    pixelDrag: new Audio(PIXEL_DRAG_SRC),
    click: new Audio(CLICK_SRC),
  }
  return sounds
}

let preloaded = false
let unlocked = false

export function preloadPortfolioSounds(): void {
  if (preloaded) return
  preloaded = true

  const s = getSounds()
  if (!s) return

  s.pixelDrag.loop = true
  s.pixelDrag.preload = 'auto'
  s.click.preload = 'auto'

  for (const audio of Object.values(s)) {
    audio.load()
  }
}

export function isPortfolioAudioUnlocked(): boolean {
  return unlocked
}

/** Call after the user's first pointer or keyboard interaction. */
export function unlockPortfolioAudio(): void {
  if (unlocked) return
  unlocked = true

  const s = getSounds()
  if (!s) return

  const probe = s.click.cloneNode(true) as HTMLAudioElement
  probe.volume = 0.001
  void probe.play().then(() => probe.pause()).catch(() => {})
}

export function getPixelDragAudio(): HTMLAudioElement {
  const s = getSounds()
  // If called during SSR (shouldn't happen), return a dummy element.
  return s?.pixelDrag ?? ({} as HTMLAudioElement)
}

export function playClickSound(): void {
  if (!unlocked) return
  const s = getSounds()
  if (!s) return
  const clip = s.click.cloneNode(true) as HTMLAudioElement
  clip.volume = 0.2
  void clip.play().catch(() => {})
}

export const PIXEL_DRAG_VOLUME = 0.15
export const PIXEL_DRAG_FADE_MS = 300
