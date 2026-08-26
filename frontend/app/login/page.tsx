'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] =
    useState(false)

  const [rememberMe, setRememberMe] =
    useState(false)

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (!email || !password) {
      return
    }

    setLoading(true)

    // Temporary MVP authentication.
    // We will connect real authentication later.

    localStorage.setItem(
      'hirelens_user',
      JSON.stringify({
        email,
        rememberMe,
      })
    )

    window.location.href = '/upload'
  }

  return (
    <main className="min-h-screen bg-white flex">

      {/* LEFT SIDE */}

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex-col items-center justify-center p-12 relative overflow-hidden">

        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl" />

        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/10 rounded-full blur-3xl" />

        <div className="relative w-full h-full flex items-center justify-center">

          <Image
            src="/student-interview.png"
            alt="Student preparing for placement with AI interviewer"
            width={600}
            height={600}
            priority
            className="max-w-md w-full h-auto drop-shadow-lg"
          />

          <div className="absolute top-20 right-12 bg-white rounded-xl p-4 shadow-lg border border-gray-100">

            <div className="flex items-center gap-2 mb-2">

              <CheckCircle2 className="w-4 h-4 text-emerald-600" />

              <span className="text-xs font-semibold text-gray-700">
                Resume Analysis
              </span>

            </div>

            <div className="text-2xl font-bold text-emerald-600">
              AI
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Personalized
            </p>

          </div>

          <div className="absolute bottom-24 left-8 bg-white rounded-xl p-4 shadow-lg border border-gray-100">

            <div className="flex items-center gap-2 mb-2">

              <CheckCircle2 className="w-4 h-4 text-emerald-600" />

              <span className="text-xs font-semibold text-gray-700">
                Interview Score
              </span>

            </div>

            <div className="text-2xl font-bold text-emerald-600">
              10
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Questions
            </p>

          </div>

          <div className="absolute top-1/2 right-0 -translate-y-1/2 bg-white rounded-xl p-4 shadow-lg border border-gray-100">

            <div className="flex items-center gap-2 mb-2">

              <CheckCircle2 className="w-4 h-4 text-emerald-600" />

              <span className="text-xs font-semibold text-gray-700">
                AI Insights
              </span>

            </div>

            <p className="text-xs text-gray-600 max-w-[120px]">
              Personalized interview practice
            </p>

          </div>

        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">

        <div className="w-full max-w-md">

          {/* LOGO */}

          <div className="flex items-center gap-2 mb-12">

            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">

              <span className="text-white font-bold text-lg">
                H
              </span>

            </div>

            <span className="text-xl font-bold text-slate-900">
              HireLens
            </span>

          </div>


          {/* HEADING */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome Back
            </h1>

            <p className="text-gray-600 text-sm">
              Continue your placement journey.
            </p>

          </div>


          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-900 mb-2"
              >
                Email
              </label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-900 mb-2"
              >
                Password
              </label>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

              </div>

            </div>


            {/* REMEMBER */}

            <div className="flex items-center justify-between">

              <label className="flex items-center gap-2 cursor-pointer">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 text-emerald-600"
                />

                <span className="text-sm text-gray-600">
                  Remember me
                </span>

              </label>

              <span className="text-sm text-emerald-600">
                Forgot Password?
              </span>

            </div>


            {/* LOGIN */}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg"
            >

              {loading
                ? 'Signing in...'
                : 'Login'}

            </Button>

          </form>


          <div className="flex items-center gap-3 my-6">

            <div className="flex-1 h-px bg-gray-200" />

            <span className="text-xs text-gray-500">
              Or
            </span>

            <div className="flex-1 h-px bg-gray-200" />

          </div>


          <p className="text-center text-sm text-gray-600">

            Don't have an account?{' '}

            <span className="font-semibold text-emerald-600">
              Create Account
            </span>

          </p>


          <div className="mt-8 pt-6 border-t border-gray-200">

            <p className="text-center text-xs text-gray-500">
              ✓ Your data is secure and protected.
            </p>

          </div>

        </div>

      </div>

    </main>
  )
}