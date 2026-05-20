const PIXEL_DRAG_SRC = '/Pixel%20draging%20.mp3'
const HOVER_SRC = '/Hover%20sound.mp3'
const CLICK_SRC = '/Click-enter%20Sounds.mp3'

const sounds = {
  pixelDrag: new Audio(PIXEL_DRAG_SRC),
  hover: new Audio(HOVER_SRC),
  click: new Audio(CLICK_SRC),
}

let preloaded = false
let unlocked = false

export function preloadPortfolioSounds(): void {
  if (preloaded) return
  preloaded = true

  sounds.pixelDrag.loop = true
  sounds.pixelDrag.preload = 'auto'
  sounds.hover.preload = 'auto'
  sounds.click.preload = 'auto'

  for (const audio of Object.values(sounds)) {
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

  const probe = sounds.hover.cloneNode(true) as HTMLAudioElement
  probe.volume = 0.001
  void probe.play().then(() => probe.pause()).catch(() => {})
}

export function getPixelDragAudio(): HTMLAudioElement {
  return sounds.pixelDrag
}

export function playHoverSound(): void {
  if (!unlocked) return
  const clip = sounds.hover.cloneNode(true) as HTMLAudioElement
  clip.volume = 0.2
  void clip.play().catch(() => {})
}

export function playClickSound(): void {
  if (!unlocked) return
  const clip = sounds.click.cloneNode(true) as HTMLAudioElement
  clip.volume = 0.2
  void clip.play().catch(() => {})
}

export const PIXEL_DRAG_VOLUME = 0.15
export const PIXEL_DRAG_FADE_MS = 300
