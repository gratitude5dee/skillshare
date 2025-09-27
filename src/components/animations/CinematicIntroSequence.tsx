import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuantumManusLogo } from './QuantumManusLogo';
import { ProceduralParticleSystem } from './ProceduralParticleSystem';
import { VolumetricLightingEngine } from './VolumetricLightingEngine';
import { KineticTypography } from './KineticTypography';
import { AudioVisualSynchronizer } from './AudioVisualSynchronizer';
import { EmotionalCrescendoManager } from './EmotionalCrescendoManager';
import { CinematicCamera } from './CinematicCamera';
import { SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CinematicIntroSequenceProps {
  onComplete: () => void;
  canSkip?: boolean;
}

type CinematicPhase = 'silence' | 'whisper' | 'genesis' | 'consciousness' | 'integration';

export const CinematicIntroSequence: React.FC<CinematicIntroSequenceProps> = ({ 
  onComplete, 
  canSkip = true 
}) => {
  const [currentPhase, setCurrentPhase] = useState<CinematicPhase>('silence');
  const [showSkip, setShowSkip] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const ctx = new AudioContext();
      setAudioContext(ctx);
    }

    const phaseTimings = [
      { phase: 'silence' as CinematicPhase, delay: 0 },
      { phase: 'whisper' as CinematicPhase, delay: 500 },
      { phase: 'genesis' as CinematicPhase, delay: 1700 },
      { phase: 'consciousness' as CinematicPhase, delay: 3500 },
      { phase: 'integration' as CinematicPhase, delay: 5000 },
    ];

    const timeouts = phaseTimings.map(({ phase, delay }) =>
      setTimeout(() => {
        console.log(`Phase transition: ${phase}`);
        setCurrentPhase(phase);
      }, delay)
    );

    // Show skip button after 2s
    const skipTimeout = setTimeout(() => setShowSkip(true), 2000);

    // Auto-complete after full sequence
    const completeTimeout = setTimeout(() => {
      setIsCompleted(true);
      onComplete();
    }, 6000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(skipTimeout);
      clearTimeout(completeTimeout);
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [onComplete, audioContext]);

  const handleSkip = () => {
    setIsCompleted(true);
    onComplete();
  };

  const getPhaseIntensity = () => {
    switch (currentPhase) {
      case 'silence': return 0;
      case 'whisper': return 0.2;
      case 'genesis': return 0.8;
      case 'consciousness': return 1.0;
      case 'integration': return 0.6;
      default: return 0;
    }
  };

  return (
    <AnimatePresence>
      {!isCompleted && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-50 bg-black overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.1,
            filter: "blur(20px)"
          }}
          transition={{ 
            duration: 1.2, 
            ease: [0.25, 0.46, 0.45, 0.94] 
          }}
        >
          {/* Cinematic Camera Container */}
          <CinematicCamera phase={currentPhase}>
            {/* Volumetric Lighting Engine */}
            <VolumetricLightingEngine 
              phase={currentPhase} 
              intensity={getPhaseIntensity()}
            />

            {/* Procedural Particle System */}
            <ProceduralParticleSystem 
              phase={currentPhase}
              particleCount={currentPhase === 'genesis' ? 200 : 100}
              intensity={getPhaseIntensity()}
            />

            {/* Audio Visual Synchronizer */}
            <AudioVisualSynchronizer 
              phase={currentPhase}
              audioContext={audioContext}
            />

            {/* Emotional Crescendo Manager */}
            <EmotionalCrescendoManager phase={currentPhase} />

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-12">
              {/* Quantum Manus Logo */}
              <QuantumManusLogo 
                phase={currentPhase}
                onPhaseComplete={(phase) => {
                  if (phase === 'integration') {
                    setTimeout(() => {
                      setIsCompleted(true);
                      onComplete();
                    }, 800);
                  }
                }}
              />

              {/* Kinetic Typography */}
              <KineticTypography 
                phase={currentPhase}
                primaryText="WZRD.work"
                secondaryText="powered by Manus AI"
              />

              {/* Quantum Progress Indicator */}
              <motion.div
                className="relative w-80 h-2 rounded-full overflow-hidden"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ 
                  opacity: currentPhase === 'silence' ? 0 : 0.8,
                  scaleX: currentPhase === 'silence' ? 0 : 1
                }}
                transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
              >
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-full" />
                
                {/* Quantum Progress Bar */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, 
                      hsl(280, 100%, 70%) 0%, 
                      hsl(320, 100%, 60%) 25%, 
                      hsl(260, 100%, 80%) 50%, 
                      hsl(300, 100%, 70%) 75%, 
                      hsl(280, 100%, 70%) 100%)`
                  }}
                  initial={{ x: '-100%' }}
                  animate={{
                    x: currentPhase === 'silence' ? '-100%' :
                       currentPhase === 'whisper' ? '-70%' :
                       currentPhase === 'genesis' ? '-40%' :
                       currentPhase === 'consciousness' ? '-10%' :
                       '0%'
                  }}
                  transition={{ 
                    duration: 1.2,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                />
                
                {/* Quantum Glow */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, 
                      transparent 0%, 
                      hsl(280, 100%, 70%, 0.6) 50%, 
                      transparent 100%)`
                  }}
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
          </CinematicCamera>

          {/* Skip Button with Quantum Effect */}
          <AnimatePresence>
            {showSkip && canSkip && (
              <motion.div
                className="absolute top-8 right-8 z-30"
                initial={{ opacity: 0, y: -30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.8 }}
                transition={{ 
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkip}
                  className="backdrop-blur-xl bg-black/20 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 shadow-2xl"
                  style={{
                    boxShadow: '0 0 20px hsl(280, 100%, 70%, 0.3), inset 0 1px 0 hsl(0, 0%, 100%, 0.1)'
                  }}
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip Intro
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quantum Progress Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {(['silence', 'whisper', 'genesis', 'consciousness', 'integration'] as CinematicPhase[]).map((phase, index) => (
              <motion.div
                key={phase}
                className="relative w-3 h-3 rounded-full"
                animate={{
                  scale: phase === currentPhase ? 1.4 : 1,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Dot Background */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    backgroundColor: 
                      phase === currentPhase ? 'hsl(280, 100%, 70%)' :
                      index < (['silence', 'whisper', 'genesis', 'consciousness', 'integration'] as CinematicPhase[]).indexOf(currentPhase) ? 
                      'hsl(280, 100%, 70%, 0.6)' : 'hsl(0, 0%, 40%)',
                  }}
                  transition={{ duration: 0.4 }}
                />
                
                {/* Quantum Glow */}
                {phase === currentPhase && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: 'hsl(280, 100%, 70%)',
                      filter: 'blur(6px)'
                    }}
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      scale: [1.2, 1.8, 1.2]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};