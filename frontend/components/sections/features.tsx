'use client'

import { FileText, Mic, MessageCircle, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Resume Intelligence',
    description: 'AI analyzes resumes and identifies strengths, projects and skills.',
    color: 'text-primary',
  },
  {
    icon: Mic,
    title: 'AI Voice Interview',
    description: 'Conduct personalized voice interviews based on the uploaded resume.',
    color: 'text-accent',
  },
  {
    icon: MessageCircle,
    title: 'Communication Coach',
    description: 'Practice speaking, HR conversations and self introductions.',
    color: 'text-primary',
  },
  {
    icon: BarChart3,
    title: 'Placement Readiness',
    description: 'Receive a complete performance report with improvement roadmap.',
    color: 'text-accent',
  },
]

export default function Features() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Powerful Features for Success
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need to master your placement journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative p-8 bg-background rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative space-y-4">
                  <div className={`${feature.color} w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
