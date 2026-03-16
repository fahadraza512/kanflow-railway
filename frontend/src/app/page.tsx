"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import KanbanVisual from "@/components/home/KanbanVisual";
import Stats from "@/components/home/Stats";
import Features from "@/components/home/Features";
import DemoVideo from "@/components/home/DemoVideo";
import WhoItsFor from "@/components/home/WhoItsFor";
import Integrations from "@/components/home/Integrations";
import Testimonials from "@/components/home/Testimonials";
import Comparison from "@/components/home/Comparison";
import Pricing from "@/components/home/Pricing";
import FAQ from "@/components/home/FAQ";
import CTABanner from "@/components/home/CTABanner";
import ContactSection from "@/components/home/ContactSection";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/layout/Footer";

export default function Home() {
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token || !user) return;

    // Logged-in user should never see the landing page
    const shouldOnboard =
      !user.onboardingCompleted &&
      !(user as any).activeWorkspaceId &&
      !(user as any).skipOnboarding;

    router.replace(shouldOnboard ? "/onboarding" : "/dashboard");
  }, [token, user, router]);

  // If logged in, render nothing while redirecting
  if (token && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Reserve space for fixed navbar to prevent layout shift */}
      <div className="h-20" />
      <Navbar />
      <main className="animate-fade-in" style={{ willChange: 'opacity' }}>
        <Hero />
        <KanbanVisual />
        <Stats />
        <Features />
        <DemoVideo />
        <WhoItsFor />
        <Integrations />
        <Testimonials />
        <Comparison />
        <Pricing />
        <FAQ />
        <CTABanner />
        <ContactSection />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
