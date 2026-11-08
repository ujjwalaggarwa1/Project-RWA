import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout.jsx'
import Home from './pages/Home.jsx'
import { useGlow } from './components/js/glow.js'
import PageNotFound from './pages/404.jsx'

const About = lazy(() => import('./pages/About.jsx'))

// temporary delay so to see loader
// const About = lazy(() =>
//     new Promise(r => setTimeout(r, 10000)).then(() => import('./pages/About.jsx'))
// )

export default function App() {
    useGlow()

    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                
                <Route path="*" element={<PageNotFound/>} />
            </Route>
        </Routes>
    )
}