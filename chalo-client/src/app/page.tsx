import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import SocialProof from "@/components/landing/SocialProof";
import ProblemStatement from "@/components/landing/ProblemStatement";
import Solution from "@/components/landing/Solution";
import HowItWorks from "@/components/landing/HowItWorks";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF8] text-[#292524]">
      {/* 1. Landing Page Navbar */}
      <Navbar />

      {/* Main Landing Content */}
      <main className="flex-1">
        {/* 2. Hero Section with strong CTAs */}
        <Hero />

        {/* 3. Social Proof / Stats Section */}
        <SocialProof />

        {/* 4. Problem Statement Section */}
        <ProblemStatement />

        {/* 5. Solution & Value Proposition with CTA */}
        <Solution />

        {/* 6. How It Works (Step-by-step guide) */}
        <HowItWorks />

        {/* 7. FAQs Section */}
        <FAQ />
      </main>

      {/* 8. Footer with CTA */}
      <Footer />
    </div>
  );
}
