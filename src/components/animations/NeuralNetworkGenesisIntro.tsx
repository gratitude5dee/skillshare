import React, { useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import geminiLogo from '@/assets/gemini-logo.png';
import geminiLogoGradient from '@/assets/gemini-logo-gradient.png';

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

export const NeuralNetworkGenesisIntro: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState<'particles' | 'network' | 'tagline' | 'process' | 'cta' | 'complete'>('particles');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [particles, setParticles] = useState<Particle[]>([]);
  const controls = useAnimation();

  useEffect(() => {
    // Generate particles
    const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      targetX: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      targetY: window.innerHeight / 2 + (Math.random() - 0.5) * 200,
    }));
    setParticles(newParticles);

    // Timeline
    const timeline = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setStage('particles');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setStage('network');
      await new Promise(resolve => setTimeout(resolve, 1300));
      
      setStage('tagline');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStage('process');
      await new Promise(resolve => setTimeout(resolve, 1700));
      
      setStage('cta');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStage('complete');
      onComplete();
    };

    timeline();
  }, [onComplete]);

  // Reduced motion fallback
  if (prefersReducedMotion) {
    return (
      <motion.div
        className="fixed inset-0 z-50 bg-gradient-to-br from-[#0A0E27] via-[#141B34] to-[#0A0E27] flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        onAnimationComplete={onComplete}
      >
        <img src={geminiLogoGradient} alt="WZRD.work" className="w-32 h-32" />
      </motion.div>
    );
  }

  return (
    <>
      {/* Skip Intro Button */}
      <button
        className="fixed top-4 right-4 z-[60] px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg text-sm hover:bg-white/20 transition-colors"
        onClick={onComplete}
        aria-label="Skip introduction animation"
      >
        Skip Intro →
      </button>

      <motion.div
        className="fixed inset-0 z-50 bg-gradient-to-br from-[#0A0E27] via-[#141B34] to-[#0A0E27] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 'complete' ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Atmospheric Background */}
        <div className="absolute inset-0">
          {/* Floating particles */}
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={`bg-particle-${i}`}
              className="absolute w-1 h-1 bg-cyan-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Gradient mesh */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.1, 0.2],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        {/* Scene 1: Logo Materialization */}
        <AnimatePresence>
          {(stage === 'particles' || stage === 'network') && (
            <div className="relative w-full h-full flex items-center justify-center">
              {particles.map((particle, index) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-2 h-2 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-full"
                  initial={{
                    x: particle.x,
                    y: particle.y,
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    x: particle.targetX,
                    y: particle.targetY,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.02,
                    ease: [0.65, 0, 0.35, 1],
                  }}
                />
              ))}
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotateY: [0, 5, 0],
                }}
                transition={{
                  opacity: { delay: 0.6, duration: 0.4 },
                  scale: { delay: 0.6, duration: 0.4, type: 'spring', stiffness: 100, damping: 15 },
                  rotateY: { delay: 0.8, duration: 0.8 },
                }}
                className="relative z-10"
              >
                <motion.img
                  src={geminiLogo}
                  alt="Gemini Logo"
                  className="w-32 h-32 object-contain"
                  animate={{
                    filter: ['drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))', 'drop-shadow(0 0 40px rgba(0, 217, 255, 0.5))', 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))'],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Scene 2: Neural Network Expansion */}
        <AnimatePresence>
          {stage === 'network' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30) * (Math.PI / 180);
                const length = 200;
                const cx = window.innerWidth / 2;
                const cy = window.innerHeight / 2;
                const x2 = cx + Math.cos(angle) * length;
                const y2 = cy + Math.sin(angle) * length;

                return (
                  <motion.line
                    key={`line-${i}`}
                    x1={cx}
                    y1={cy}
                    x2={x2}
                    y2={y2}
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeInOut' }}
                  />
                );
              })}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
                  <stop offset="50%" stopColor="#00D9FF" stopOpacity="1" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </AnimatePresence>

        {/* Scene 3: Tagline Emergence */}
        <AnimatePresence>
          {(stage === 'tagline' || stage === 'process' || stage === 'cta') && (
            <motion.div
              className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
                {['Turn', 'Recordings', 'into', 'Workflows'].map((word, i) => (
                  <motion.span
                    key={word}
                    className={i === 3 ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent' : 'text-white'}
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      delay: i * 0.15,
                      duration: 0.5,
                      ease: 'easeOut',
                    }}
                  >
                    {word}{' '}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scene 4: Process Flow Visualization */}
        <AnimatePresence>
          {(stage === 'process' || stage === 'cta') && (
            <motion.div
              className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 flex gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[
                { icon: '🎥', label: 'Record', delay: 0 },
                { icon: '☁️', label: 'Upload', delay: 0.5 },
                { icon: '⚡', label: 'Generate', delay: 1.0 },
              ].map((step, i) => (
                <motion.div
                  key={step.label}
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{
                    delay: step.delay,
                    duration: 0.5,
                    type: 'spring',
                    stiffness: 120,
                    damping: 20,
                  }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-2xl"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(139, 92, 246, 0.3)',
                        '0 0 40px rgba(0, 217, 255, 0.5)',
                        '0 0 20px rgba(139, 92, 246, 0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {step.icon}
                  </motion.div>
                  <span className="text-white/80 text-sm font-medium">{step.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scene 5: CTA Activation */}
        <AnimatePresence>
          {stage === 'cta' && (
            <motion.button
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-xl font-semibold text-lg shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                boxShadow: [
                  '0 10px 40px rgba(139, 92, 246, 0.4)',
                  '0 15px 60px rgba(0, 217, 255, 0.6)',
                  '0 10px 40px rgba(139, 92, 246, 0.4)',
                ],
              }}
              transition={{
                opacity: { duration: 0.3 },
                scale: { type: 'spring', stiffness: 200 },
                boxShadow: { duration: 2, repeat: Infinity },
              }}
            >
              Get Started
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
