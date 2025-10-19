import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Atmospheric Background Effects */}
      <div className="absolute inset-0 -z-10">
        {/* Animated gradient mesh */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[150px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.25, 0.15, 0.25],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        {/* Floating particles */}
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-[1400px] mx-auto px-8 lg:px-16 w-full">
        {/* Hero Content */}
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          {/* Main Headline with gradient text */}
          <motion.h1
            className="font-headline font-bold tracking-tight leading-[1.1]"
            style={{
              fontSize: 'clamp(48px, 8vw, 96px)',
              letterSpacing: '-0.03em',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Turn{' '}
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Recordings
            </span>
            {' '}into{' '}
            <motion.span
              className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                backgroundSize: '200% 200%',
                textShadow: '0 0 60px rgba(139, 92, 246, 0.3)',
              }}
            >
              Workflows
            </motion.span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-white/85 font-light leading-relaxed mx-auto"
            style={{
              fontSize: 'clamp(18px, 2vw, 24px)',
              maxWidth: '720px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            AI-powered automation that analyzes screen recordings, detects actions,
            maps UI elements, and generates production-ready workflows in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              variant="gradient"
              size="xl"
              className="gap-3 group"
              onClick={() => navigate("/auth")}
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Start Recording Free
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="gap-3 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                🎬
              </span>
              Watch Demo
            </Button>
          </motion.div>
        </div>

        {/* 3D Hero Visual (Placeholder for future Three.js implementation) */}
        <motion.div
          className="relative mt-20 h-[500px] rounded-3xl overflow-hidden border border-white/10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          style={{
            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.1), transparent 70%)',
          }}
        >
          {/* Placeholder for Three.js scene */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-80 h-80 bg-gradient-to-br from-purple-600/20 to-cyan-500/20 rounded-3xl"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{
                boxShadow: '0 0 100px rgba(139, 92, 246, 0.5)',
              }}
            />
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/60 text-sm">Scroll to explore</span>
            <svg
              className="w-6 h-6 text-white/60"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
