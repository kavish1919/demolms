import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { CoursesPreview } from "@/components/home/courses-preview";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CTASection } from "@/components/home/cta-section";
import { Footer } from "@/components/home/footer";
import { NavbarClient } from "@/components/home/navbar-client";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <NavbarClient />
      <HeroSection />
      <FeaturesSection />
      <CoursesPreview />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
