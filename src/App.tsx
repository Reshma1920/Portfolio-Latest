import { Helmet, HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { CinematicHero } from './components/CinematicHero'
import { PageCursorPixels } from './components/PageCursorPixels'
import { PortfolioInteractionSounds } from './components/PortfolioInteractionSounds'
import { ScrollToTop } from './components/ScrollToTop'
import { WorkSection } from './components/WorkSection'
import HDFCCaseStudy from './pages/HDFCCaseStudy'
import OktoCaseStudy from './pages/OktoCaseStudy'

const homeDescription =
  'Portfolio of Reshma Lokanathan — product designer specializing in enterprise and fintech, with case studies in complex workflows and design systems.'

function HomePage() {
  return (
    <>
      <Helmet>
        <title>Reshma Lokanathan — Product Designer</title>
        <meta name="description" content={homeDescription} />
        <meta property="og:title" content="Reshma Lokanathan — Product Designer" />
        <meta property="og:description" content={homeDescription} />
        <meta property="og:url" content="https://reshmalokanathan.com/" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[#F7F6F2]"
        aria-hidden
      />
      <PageCursorPixels />
      <div className="relative z-[2]">
        <CinematicHero />
        {/* Mobile-only horizontal inset (16px); md:contents removes wrapper box on desktop. */}
        <div className="min-w-0 max-md:px-4 md:contents">
          <WorkSection />
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <>
          <PortfolioInteractionSounds />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hdfc" element={<HDFCCaseStudy />} />
            <Route path="/okto" element={<OktoCaseStudy />} />
          </Routes>
          <Analytics />
        </>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
