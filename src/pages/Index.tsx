import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { NeuralNetworkGenesisIntro } from "@/components/animations/NeuralNetworkGenesisIntro";
import { Navbar } from "@/components/learning-companion/Navbar";
import { Hero } from "@/components/learning-companion/Hero";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { ProcessFlow } from "@/components/landing/ProcessFlow";
import { BentoFeatures } from "@/components/landing/BentoFeatures";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/learning-companion/Footer";

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('intro-seen');
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleIntroComplete = () => {
    sessionStorage.setItem('intro-seen', 'true');
    setShowIntro(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#050816] via-[#0A0E27] to-[#050816]">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#050816] via-[#0A0E27] to-[#050816]">
        <div className="text-lg text-white">Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <>
      {showIntro && <NeuralNetworkGenesisIntro onComplete={handleIntroComplete} />}
      
      <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0A0E27] to-[#050816]">
        <Navbar />
        <Hero />
        <SocialProofBar />
        <ProcessFlow />
        <BentoFeatures />
        <PricingSection />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
};

export default Index;
