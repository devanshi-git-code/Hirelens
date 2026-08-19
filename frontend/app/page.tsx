import Navbar from '@/components/sections/navbar'
import Hero from '@/components/sections/hero'
import Features from '@/components/sections/features'
import HowItWorks from '@/components/sections/how-it-works'
import Stats from '@/components/sections/stats'
import Preview from '@/components/sections/preview'
import Testimonials from '@/components/sections/testimonials'
import FinalCTA from '@/components/sections/final-cta'
import Footer from '@/components/sections/footer'

export default function Page() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <Preview />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  )
}