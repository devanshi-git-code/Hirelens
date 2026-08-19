'use client'

const stats = [
  {
    value: '95%',
    label: 'Resume Analysis Accuracy',
  },
  {
    value: '100+',
    label: 'Interview Questions',
  },
  {
    value: 'AI Powered',
    label: 'Personalized Interview Experience',
  },
  {
    value: '24/7',
    label: 'Available Practice Anytime',
  },
]

export default function Stats() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative p-8 bg-background rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative space-y-2">
                <p className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
