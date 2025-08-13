import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { Gallery } from "@/components/sections/gallery"
import { Calendar } from "@/components/sections/calendar"
import { Location } from "@/components/sections/location"
import { ContactForm } from "@/components/sections/contact-form"
import { Pricing } from "@/components/sections/pricing"
import { Contact } from "@/components/sections/contact"
import { Footer } from "@/components/sections/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Gallery Section */}
      <Gallery />

      {/* Calendar Section */}
      <Calendar />

      {/* Location Section */}
      <Location />

      {/* Contact Form Section */}
      <ContactForm />

      {/* Pricing Section */}
      <Pricing />

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <Footer />
    </main>
  )
}
