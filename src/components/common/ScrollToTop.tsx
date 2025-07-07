import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Use smooth scrolling for better UX
    const scrollToTop = () => {
      // Check if the browser supports smooth scrolling
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        })
      } else {
        // Fallback for older browsers
        window.scrollTo(0, 0)
      }
    }

    // Small delay to ensure the new page content is rendered
    const timer = setTimeout(scrollToTop, 100)
    
    return () => clearTimeout(timer)
  }, [pathname])

  return null
} 