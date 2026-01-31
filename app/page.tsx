import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { Accommodations } from "@/components/sections/accommodations"
import { Gallery } from "@/components/sections/gallery"
import { Calendar } from "@/components/sections/calendar"
import { Location } from "@/components/sections/location"
import { Pricing } from "@/components/sections/pricing"
import { Contact } from "@/components/sections/contact"
import { Footer } from "@/components/sections/footer"
import { ScrollToTop } from "@/components/ui/scroll-to-top"
import { ScrollIndicator } from "@/components/ui/scroll-indicator"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

export default function HomePage() {
  return (
    <>
      {/* Scroll Progress Indicator */}
      <ScrollIndicator />

      <main id="main-content" className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Hero Section */}
        <Hero />

        {/* Accommodations Section */}
        <Accommodations />

        {/* Features Section */}
        <Features />

        {/* Gallery Section */}
        <Gallery />

        {/* Pricing Section */}
        <Pricing />

        {/* Calendar Section */}
        <Calendar />

        {/* Contact Section (Merged Channels) */}
        <Contact />

        {/* Location Section */}
        <Location />

        {/* Footer */}
        <Footer />

        {/* Floating Action Buttons */}
        <WhatsAppButton />
        <ScrollToTop />
      </main>
    </>
  )
}
