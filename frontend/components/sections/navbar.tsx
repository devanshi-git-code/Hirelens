'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link
          href="/"
          className="text-2xl font-bold text-slate-900"
        >
          Hire<span className="text-emerald-600">Lens</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/">Home</Link>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#preview">Preview</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline">
              Login
            </Button>
          </Link>

          <Link href="/login">
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
              Get Started
            </Button>
          </Link>
        </div>

      </div>
    </header>
  )
}