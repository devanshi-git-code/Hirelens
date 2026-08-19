'use client'

import Image from 'next/image'

export default function Preview() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            See It In Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Explore our intelligent dashboard designed for your success
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
          {/* Dashboard Preview Image */}
          <div className="relative w-full h-96 sm:h-[500px] lg:h-[600px]">
            <Image
              src="/dashboard-preview.png"
              alt="HireLens Dashboard"
              fill
              className="object-cover"
            />
          </div>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-40 pointer-events-none" />
        </div>

        {/* Features Highlight Below Preview */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide">
              Resume Score
            </p>
            <p className="text-foreground text-sm leading-relaxed">
              Instant analysis of your resume with detailed improvement suggestions.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-accent uppercase tracking-wide">
              Communication Score
            </p>
            <p className="text-foreground text-sm leading-relaxed">
              Real-time feedback on speaking patterns, clarity, and confidence.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide">
              Placement Readiness
            </p>
            <p className="text-foreground text-sm leading-relaxed">
              Comprehensive assessment and personalized roadmap to success.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
