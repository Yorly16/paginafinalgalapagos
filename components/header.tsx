"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const scrollToMap = () => {
  const mapSection = document.getElementById('mapa-interactivo')
  if (mapSection) {
    // Si estamos en la página principal, hacer scroll
    mapSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  } else {
    // Si no estamos en la página principal, navegar a ella con el hash
    window.location.href = '/#mapa-interactivo'
  }
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-lg text-foreground">Galápagos DataLens</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/especies" className="text-muted-foreground hover:text-foreground transition-colors">
              Especies
            </Link>
            <button 
              onClick={scrollToMap}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Mapa
            </button>
            <Link href="/investigadores" className="text-muted-foreground hover:text-foreground transition-colors">
              Investigadores
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/registro">Registrarse</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/especies"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Especies
              </Link>
              <button
                onClick={() => {
                  scrollToMap()
                  setIsMenuOpen(false)
                }}
                className="text-muted-foreground hover:text-foreground transition-colors text-left cursor-pointer"
              >
                Mapa
              </button>
              <Link
                href="/investigadores"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Investigadores
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/registro">Registrarse</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
