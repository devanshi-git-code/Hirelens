'use client'

import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export default function FinalCTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-white via-background to-white border border-border p-12 sm:p-16 text-center overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

          <div className="relative space-y-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
                Ready to ace your placement interviews?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                Join thousands of students who are preparing with HireLens and landing their dream jobs.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-green-700 text-white rounded-xl px-10 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Get Started Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary text-primary hover:bg-green-50 rounded-xl px-10 transition-all duration-200"
              >
                Learn More
              </Button>
            </div>

            {/* Subtext */}
            <p className="text-sm text-muted-foreground">
              No credit card required. Start practicing for free.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
