import { useCallback } from 'react'

export const useScrollToTop = () => {
  const scrollToTop = useCallback((smooth = true) => {
    if (smooth && 'scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    } else {
      window.scrollTo(0, 0)
    }
  }, [])

  return scrollToTop
} 