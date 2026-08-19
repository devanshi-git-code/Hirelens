'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-balance">
                HireLens
              </h1>

              <h2 className="text-2xl sm:text-3xl font-semibold text-muted-foreground text-balance">
                Your Personal Placement Intelligence Platform
              </h2>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
              Practice AI-powered interviews, improve communication skills,
              analyze your resume, and track your placement readiness—all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">

              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-green-700 text-white rounded-xl px-8 transition-all duration-200 transform hover:scale-105"
                >
                  Start Mock Interview
                </Button>
              </Link>

              <Link href="/communication">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary text-primary hover:bg-green-50 rounded-xl px-8 transition-all duration-200"
                >
                  Communication Practice
                </Button>
              </Link>

            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative h-96 lg:h-full min-h-96 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-delay">
            <Image
              src="/hero-illustration.png"
              alt="AI interview preparation"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl" />
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDelay {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fadeInDelay 0.8s ease-out 0.2s both;
        }
      `}</style>
    </section>
  )
}