import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    console.log('📌 Tema salvo no localStorage:', savedTheme)
    
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    console.log('📌 Preferência do sistema:', systemPrefersDark)
    return systemPrefersDark
  })

  useEffect(() => {
    console.log('📌 darkMode mudou para:', darkMode)
    console.log('📌 Elemento html antes:', document.documentElement.classList.contains('dark'))
    
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    
    console.log('📌 Elemento html depois:', document.documentElement.classList.contains('dark'))
  }, [darkMode])

  const toggleDarkMode = () => {
    console.log('📌 toggleDarkMode chamado')
    setDarkMode(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}