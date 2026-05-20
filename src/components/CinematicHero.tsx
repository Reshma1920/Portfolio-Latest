import { SiteNav, SiteNavSpacer } from './SiteNav'
import { HeroPixelTorch } from './HeroPixelTorch'

const HERO_IMAGE_SRC = '/Hero%20image.png'

export function CinematicHero() {
  return (
    <div
      id="home"
      className="relative min-h-screen w-full overflow-x-hidden text-foreground"
    >
      <SiteNav variant="home" />
      <SiteNavSpacer />

      {/* Hero */}
      <header className="relative z-10 mx-auto mt-14 w-full max-w-7xl px-5 pb-2 text-left sm:mt-16 md:mt-24 md:pb-4 lg:mt-28">
        <div className="grid gap-10 pt-20 md:grid-cols-[minmax(0,1fr)_minmax(0,0.42fr)] md:items-center md:gap-x-12 lg:gap-x-16">
          <div className="min-w-0">
            <span className="animate-fade-rise mb-4 inline-flex rounded-none bg-[rgba(107,53,184,0.12)] px-[11px] py-1.5 font-dmSans text-[13px] font-medium leading-none text-[#6B35B8]">
              Product Designer
            </span>
            <h1
              className="animate-fade-rise font-display text-4xl font-normal text-[#000000] sm:text-5xl md:text-6xl lg:text-[4.25rem] xl:text-[4.75rem]"
              style={{
                lineHeight: 1.06,
                letterSpacing: '-1.65px',
                fontFamily: '"Instrument Serif", Georgia, serif',
              }}
            >
              <span className="block">
                Designing for <em className="italic">people,</em>
              </span>
              <span className="block">
                in an <em className="italic">AI-first </em>world.
              </span>
            </h1>
          </div>

          <p className="animate-fade-rise-delay max-w-xl text-[13px] leading-relaxed text-[#646464] sm:text-[14px] md:self-center md:text-[14px] md:leading-relaxed lg:text-[15px]">
            4+ years designing and simplifying human experiences for complex systems
            by connecting data, workflows, and decisions.
          </p>
        </div>
      </header>

      <section
        className="relative z-10 -mt-1 w-screen max-w-none pb-12 md:pb-16"
        style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
        aria-label="Hero visual"
      >
        <HeroPixelTorch
          src={HERO_IMAGE_SRC}
          alt=""
          className="h-[clamp(220px,38vw,520px)] w-full"
        />
      </section>
    </div>
  )
}
