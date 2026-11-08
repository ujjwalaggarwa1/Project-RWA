import { useState, useEffect } from "react"
import { useTheme } from "../../context/ThemeContext.jsx"

const svg_paths = [
    //moon - index:0
    <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008" />
    </>,

    //moon-slashed - index:1
    <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M7.962 3.949a8.97 8.97 0 0 1 4.038 -.957v.008h.393a7.478 7.478 0 0 0 -2.07 3.308m-.141 3.84c.186 .823 .514 1.626 .989 2.373a7.49 7.49 0 0 0 4.586 3.268m3.893 -.11c.223 -.067 .444 -.144 .663 -.233a9.088 9.088 0 0 1 -.274 .597m-1.695 2.337a9 9 0 0 1 -12.71 -12.749" />
        <path d="M3 3l18 18" />
    </>,
    
    //sun-moon - index:2
    <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M9.173 14.83a4 4 0 1 1 5.657 -5.657" />
        <path d="M11.294 12.707l.174 .247a7.5 7.5 0 0 0 8.845 2.492a9 9 0 0 1 -14.671 2.914" />
        <path d="M3 12h1" />
        <path d="M12 3v1" />
        <path d="M5.6 5.6l.7 .7" />
        <path d="M3 21l18 -18" />
    </>,

    //sun-slashed - index:3
    <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 3l18 18" />
        <path d="M16 12a4 4 0 0 0 -4 -4m-2.834 1.177a4 4 0 0 0 5.66 5.654" />
        <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
    </>,

    //low-sun - index:4
    <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
        <path d="M4 12h.01" />
        <path d="M12 4v.01" />
        <path d="M20 12h.01" />
        <path d="M12 20v.01" />
        <path d="M6.31 6.31l-.01 -.01" />
        <path d="M17.71 6.31l-.01 -.01" />
        <path d="M17.7 17.7l.01 .01" />
        <path d="M6.3 17.7l.01 .01" />
    </>,

    //sun - index:5
    <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
        <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
    </>,

    //sun-high - index:6
    <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M14.828 14.828a4 4 0 1 0 -5.656 -5.656a4 4 0 0 0 5.656 5.656" />
        <path d="M6.343 17.657l-1.414 1.414" />
        <path d="M6.343 6.343l-1.414 -1.414" />
        <path d="M17.657 6.343l1.414 -1.414" />
        <path d="M17.657 17.657l1.414 1.414" />
        <path d="M4 12h-2" />
        <path d="M12 4v-2" />
        <path d="M20 12h2" />
        <path d="M12 20v2" />
    </>
]

export default function ThemeIcon({ stepMs = 71 }) {

    const { isDark } = useTheme()
    const last = svg_paths.length - 1

    // start on the frame that matches the current theme
    const [currentIndex, set_currentIndex] = useState(isDark ? 0 : last)
    
    useEffect(() => {

        const incomingDark = !isDark            // isDark flips later, at commit
        const target = incomingDark ? 0 : last
        if (currentIndex === target) return

        const step = target > currentIndex ? 1 : -1
        let i = currentIndex

        const timer = setInterval(() => {
            i += step
            set_currentIndex(i)
            if (i === target) clearInterval(timer)
        }, stepMs)

        return () => clearInterval(timer)       // fast click or unmount
    }, [])

    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`min-h-6 min-w-30 relative
                        rotate-180 dark:rotate-0 
                        z-2000 w-6 h-6
                        dark:-translate-x-7 translate-x-7
                        transition-all duration-500 ease-in-out`}>
                {svg_paths[currentIndex]}
        </svg>
    )
}