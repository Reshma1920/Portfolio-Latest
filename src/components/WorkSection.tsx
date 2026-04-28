const TAGS = ['AI', 'Process Automation'] as const

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

function CornerBrackets() {
  return (
    <>
      <span
        className="pointer-events-none absolute left-0 top-0 z-[3] h-3 w-3 border-solid border-black border-l-[1.5px] border-t-[1.5px]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute right-0 top-0 z-[3] h-3 w-3 border-solid border-black border-r-[1.5px] border-t-[1.5px]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-0 left-0 z-[3] h-3 w-3 border-solid border-black border-b-[1.5px] border-l-[1.5px]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-0 right-0 z-[3] h-3 w-3 border-solid border-black border-b-[1.5px] border-r-[1.5px]"
        aria-hidden
      />
    </>
  )
}

/** Horizontal rule spanning entire viewport width (centered under max-width layout). */
function ViewportRule({ edge }: { edge: 'top' | 'bottom' }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute left-1/2 z-[2] h-px w-screen max-w-none -translate-x-1/2 bg-[#e0e0e0] ${edge === 'top' ? 'top-0' : 'bottom-0'}`}
    />
  )
}

type ProjectCardProps = {
  companyName?: string
  logoSrc?: string
}

function ProjectCard({
  companyName = COMPANY_NAME,
  logoSrc = '/company-logo.png',
}: ProjectCardProps = {}) {
  return (
    <article className="relative flex w-full flex-col border-x border-solid border-[#e0e0e0] bg-white md:flex-row md:items-stretch">
      <ViewportRule edge="top" />
      <ViewportRule edge="bottom" />

      {/* Left column — text */}
      <div className="flex w-full shrink-0 flex-col px-[40px] pb-[63px] pt-0 md:w-[45%] md:border-r md:border-solid md:border-[#e0e0e0] md:pb-[44px]">
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

        <div
          className="-mx-[40px]"
          style={{
            paddingTop: '40px',
            paddingBottom: '40px',
            paddingLeft: '40px',
            paddingRight: '40px',
          }}
        >
          <h3 className="font-dmSans text-[28px] font-medium leading-snug text-[#000000]">
            {PROJECT_TITLE}
          </h3>

          <p className="mt-[10px] font-dmSans text-[14px] font-normal leading-[1.6] text-[#6F6F6F]">
            {DESCRIPTION}
          </p>

          {/* Pills below description */}
          <div className="mt-[21px] flex flex-wrap items-center justify-start gap-2">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-[999px] bg-[rgba(107,53,184,0.12)] px-[11px] py-1.5 font-dmSans text-[13px] font-medium leading-none text-[#6B35B8]"
              >
                {tag}
              </span>
            ))}
          </div>

          <ul className="mt-[68px] list-none space-y-0 font-dmSans text-[14px] font-normal leading-[2] text-[#333333]">
            {BULLETS.map((line) => (
              <li key={line}>° {line}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right column — tiled pattern + corner markers */}
      <div className="relative max-md:aspect-[16/10] w-full shrink-0 border-t border-solid border-[#e0e0e0] md:aspect-auto md:w-[55%] md:border-t-0 md:min-h-0 md:self-stretch">
        <div
          className="absolute inset-0 bg-[url('/crosspattern.png')] bg-repeat opacity-40"
          aria-hidden
        />
        <CornerBrackets />
      </div>
    </article>
  )
}

export function WorkSection() {
  return (
    <section id="work" className="w-full bg-[#F7F6F2] font-dmSans">
      {/* Outer padding matches CinematicHero nav wrapper (px-3 sm:px-5); inner width matches nav bar (max-w-7xl). */}
      <div className="px-3 sm:px-5">
        <div className="mx-auto w-full max-w-7xl py-[80px]">
          <h2 className="text-center font-dmSans text-[40px] font-medium text-[#000000]">
            Explore my work
          </h2>

          <div className="mt-14 flex flex-col gap-[62px]">
            <ProjectCard
              companyName="SuperLabs Inc."
              logoSrc="/superlabs-logo.png"
            />
            <ProjectCard />
            <ProjectCard />
          </div>
        </div>
      </div>
    </section>
  )
}
