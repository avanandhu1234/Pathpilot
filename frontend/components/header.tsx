"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Compass, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const navLinks = [
  { href: "/job-finder", label: "Job Finder" },
  { href: "/assisted-apply", label: "Assisted Apply" },
  { href: "/resume-builder", label: "Resume Builder" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/career-guidance", label: "Career Guidance" },
  { href: "/pricing", label: "Pricing" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Compass className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">PathPilot</span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA - Right aligned. Match server/client until auth has loaded to avoid hydration mismatch. */}
        <div className="hidden items-center gap-3 md:flex">
          {!authLoading && isAuthenticated && user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign up free</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile - Spacer to push menu button right */}
        <div className="flex-1 md:hidden" />

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t">
              {!authLoading && isAuthenticated && user ? (
                <>
                  <span className="text-sm text-muted-foreground px-2">{user.email}</span>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => { setMobileMenuOpen(false); logout(); }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/sign-up">Sign up free</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
