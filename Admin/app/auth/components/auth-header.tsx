"use client" // Required for useState and event handlers

import Link from "next/link"
import { ShoppingBag, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

interface AuthHeaderProps {
  activePage: "login" | "signup" | "none"
}

export function AuthHeader({ activePage }: AuthHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on resize to larger screens if it's open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        // 768px is Tailwind's md breakpoint
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobileMenuOpen])

  const navLinks = (
    <>
      <Link
        href="#"
        className="block py-2 px-3 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0"
      >
        Pricing
      </Link>
      <Link
        href="#"
        className="block py-2 px-3 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0"
      >
        Learn
      </Link>
      <Link
        href="#"
        className="block py-2 px-3 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0"
      >
        Support
      </Link>
      {activePage === "login" && (
        <Link
          href="/auth/signup"
          className="block py-2 px-3 text-primary rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 font-semibold"
        >
          Sign up
        </Link>
      )}
      {activePage === "signup" && (
        <Link
          href="/auth/login"
          className="block py-2 px-3 text-primary rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 font-semibold"
        >
          Log in
        </Link>
      )}
      {activePage === "none" && (
        <>
          <Link
            href="/auth/login"
            className="block py-2 px-3 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="block py-2 px-3 text-primary rounded hover:bg-green-50 md:hover:bg-transparent md:border md:border-primary md:hover:bg-green-50 md:px-3 md:py-1.5 font-semibold"
          >
            Sign up
          </Link>
        </>
      )}
    </>
  )

  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-12 xl:px-20 py-3.5">
        {" "}
        {/* Reduced py slightly */}
        <Link href="/" className="flex items-center">
          <ShoppingBag className="h-7 w-7 text-primary" />
          <span className="ml-2 text-xl font-semibold text-gray-800">Retail-Link</span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-5 sm:space-x-7">{navLinks}</nav>
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            type="button"
            className="inline-flex items-center justify-center p-2 w-10 h-10 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
          id="mobile-menu"
        >
          <nav className="flex flex-col space-y-1 px-4 pt-2 pb-3">{navLinks}</nav>
        </div>
      )}
    </header>
  )
}
