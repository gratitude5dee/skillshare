import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LoadingStateManager } from "@/components/animations/LoadingStateManager";
import { NeuralNetworkGenesisIntro } from "@/components/animations/NeuralNetworkGenesisIntro";
import Navbar from "../components/learning-companion/Navbar";
import Hero from "../components/learning-companion/Hero";
import Features from "../components/learning-companion/Features";
import NoMoreStuck from "../components/learning-companion/NoMoreStuck";
import StudySmarter from "../components/learning-companion/StudySmarter";
import Footer from "../components/learning-companion/Footer";

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#141B34] to-[#0A0E27]">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#141B34] to-[#0A0E27]">
        <div className="text-lg text-white">Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <>
      {showIntro && <NeuralNetworkGenesisIntro onComplete={() => setShowIntro(false)} />}
      
      <LoadingStateManager showIntro={false} skipIntroOnRepeat={true}>
        <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#141B34] to-[#0A0E27]">
          <Navbar />
          <Hero />
          <Features />
          <NoMoreStuck />
          <StudySmarter />
          <Footer />
        </div>
      </LoadingStateManager>
    </>
  );
};

export default Index;
