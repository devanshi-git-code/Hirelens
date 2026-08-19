'use client'

import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer',
    company: 'Tech Startup',
    quote:
      'HireLens completely transformed my interview preparation. The AI feedback was incredibly detailed and helped me improve my communication skills significantly.',
    rating: 5,
  },
  {
    name: 'Arjun Patel',
    role: 'Product Manager',
    company: 'Fortune 500',
    quote:
      'The mock interviews felt so realistic! I got placed at my dream company within 3 months. The platform is a game-changer for placements.',
    rating: 5,
  },
  {
    name: 'Divya Kapoor',
    role: 'Data Scientist',
    company: 'Analytics Firm',
    quote:
      'Finally, a platform that understands what placement coordinators are looking for. HireLens gives actionable insights that actually work.',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Hear from students who landed their dream jobs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group p-8 bg-background rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative space-y-4">
                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-accent text-accent"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground text-sm leading-relaxed italic">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="pt-4 border-t border-border">
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
