import { Helmet, HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { CinematicHero } from './components/CinematicHero'
import { ScrollToTop } from './components/ScrollToTop'
import { WanderingPuppy } from './components/WanderingPuppy'
import { WorkSection } from './components/WorkSection'
import HDFCCaseStudy from './pages/HDFCCaseStudy'

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
      <CinematicHero />
      <WorkSection />
    </>
  )
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hdfc" element={<HDFCCaseStudy />} />
          </Routes>
          <WanderingPuppy />
          <Analytics />
        </>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
