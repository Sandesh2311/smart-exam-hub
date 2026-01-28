import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <section id="features">
          <Features />
        </section>
        <Pricing />
        <Testimonials />
        <section id="faq">
          <FAQ />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
