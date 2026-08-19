'use client'

import { Upload, Sparkles, Mic2, TrendingUp, CheckCircle } from 'lucide-react'

const steps = [
  { icon: Upload, label: 'Upload Resume' },
  { icon: Sparkles, label: 'AI Resume Analysis' },
  { icon: Mic2, label: 'Voice Interview' },
  { icon: TrendingUp, label: 'Performance Evaluation' },
  { icon: CheckCircle, label: 'Placement Readiness Report' },
]

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            A simple yet powerful journey to placement success
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary/50 -translate-y-1/2" />

          {/* Steps */}
          <div className="grid md:grid-cols-5 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={index}
                  className="group flex flex-col items-center text-center"
                >
                  {/* Icon Circle */}
                  <div className="relative mb-6 w-24 h-24 flex items-center justify-center z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full opacity-0 group-hover:opacity-20 transition-all" />
                    <div className="relative w-16 h-16 bg-white border-2 border-primary rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:scale-110 transition-all">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  {/* Label */}
                  <p className="text-sm font-semibold text-foreground text-balance px-2">
                    {step.label}
                  </p>

                  {/* Arrow (hidden on last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute left-full top-1/3 w-8 text-accent text-2xl -translate-x-2">
                      →
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
