import { createContext, useContext, useState, useLayoutEffect } from "react"

const ThemeContext = createContext(null)

// initializes the theme
function initTheme() {
    const saved = localStorage.getItem("theme")
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    return saved === "dark" || (!saved && systemDark)
}


export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(initTheme)
    const toggleTheme = () => setIsDark(prev => !prev)

    useLayoutEffect(() => {
        document.documentElement.classList.toggle("dark", isDark)
        localStorage.setItem("theme", isDark ? "dark" : "light")
    }, [isDark])


    return (
        <ThemeContext.Provider value={{ isDark, setIsDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
    return ctx
}