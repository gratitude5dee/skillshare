
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/learning-companion/Navbar";
import Hero from "../components/learning-companion/Hero";
import Features from "../components/learning-companion/Features";
import NoMoreStuck from "../components/learning-companion/NoMoreStuck";
import StudySmarter from "../components/learning-companion/StudySmarter";
import Footer from "../components/learning-companion/Footer";

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // All hooks must be called at the top level
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Redirecting to dashboard...</div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="flex flex-col max-w-[1920px] mx-auto px-[70px] max-md:px-4">
      <div className="items-start bg-white relative flex gap-2.5 overflow-hidden">
        <div className="absolute z-0 flex min-w-60 w-[1597px] shrink-0 h-[959px] left-[-127px] top-[220px] max-md:max-w-full" />
        <div className="z-0 flex min-w-60 w-full flex-col items-stretch my-auto">
          <Navbar />
          <Hero />
          <Features />
          <NoMoreStuck />
          <StudySmarter />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
