import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CinematicHero } from './components/CinematicHero'
import { ScrollToTop } from './components/ScrollToTop'
import { WanderingPuppy } from './components/WanderingPuppy'
import { WorkSection } from './components/WorkSection'
import HDFCCaseStudy from './pages/HDFCCaseStudy'

function HomePage() {
  return (
    <>
      <CinematicHero />
      <WorkSection />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hdfc" element={<HDFCCaseStudy />} />
        </Routes>
        <WanderingPuppy />
      </>
    </BrowserRouter>
  )
}

export default App
