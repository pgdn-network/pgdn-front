import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-md w-9 h-9 bg-surface hover:bg-surface-hover border border-border transition-colors"
      title="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-secondary" />
      ) : (
        <Moon className="h-4 w-4 text-secondary" />
      )}
    </button>
  )
}
