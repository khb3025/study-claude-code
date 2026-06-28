"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

const DARK_THEME = "dark"
const LIGHT_THEME = "light"

/** 라이트/다크 모드 전환 아이콘 버튼 */
export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    function handleToggle() {
        setTheme(theme === DARK_THEME ? LIGHT_THEME : DARK_THEME)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            aria-label="Toggle theme"
        >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    )
}
