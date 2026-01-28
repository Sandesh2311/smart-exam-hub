import { Navbar } from "@/components/landing/Navbar";
import { Pricing as PricingSection } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <PricingSection />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
