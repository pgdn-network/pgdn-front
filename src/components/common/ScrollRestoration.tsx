import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// Store scroll positions for different routes
const scrollPositions = new Map<string, number>()

export function ScrollRestoration() {
  const { pathname } = useLocation()
  const isInitialMount = useRef(true)

  useEffect(() => {
    // Save current scroll position before navigation
    const saveScrollPosition = () => {
      scrollPositions.set(pathname, window.scrollY)
    }

    // Restore scroll position or scroll to top
    const restoreScrollPosition = () => {
      const savedPosition = scrollPositions.get(pathname)
      
      if (savedPosition !== undefined && !isInitialMount.current) {
        // Restore saved position
        window.scrollTo(0, savedPosition)
      } else {
        // Scroll to top for new pages or initial load
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          })
        } else {
          window.scrollTo(0, 0)
        }
      }
    }

    // Save position before the component unmounts
    window.addEventListener('beforeunload', saveScrollPosition)

    // Restore position after navigation
    const timer = setTimeout(restoreScrollPosition, 100)
    
    isInitialMount.current = false

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeunload', saveScrollPosition)
    }
  }, [pathname])

  return null
} 