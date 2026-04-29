import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CinematicHero } from './components/CinematicHero'
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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hdfc" element={<HDFCCaseStudy />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
