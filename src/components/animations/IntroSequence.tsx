import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedManusLogo } from './AnimatedManusLogo';
import { ParticleSystem } from './ParticleSystem';
import { LightingEffects } from './LightingEffects';
import { SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IntroSequenceProps {
  onComplete: () => void;
  canSkip?: boolean;
}

type Phase = 'void' | 'genesis' | 'consciousness' | 'integration';

export const IntroSequence: React.FC<IntroSequenceProps> = ({ 
  onComplete, 
  canSkip = true 
}) => {
  const [currentPhase, setCurrentPhase] = useState<Phase>('void');
  const [showSkip, setShowSkip] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const phaseTimings = [
      { phase: 'void' as Phase, delay: 0 },
      { phase: 'genesis' as Phase, delay: 800 },
      { phase: 'consciousness' as Phase, delay: 2200 },
      { phase: 'integration' as Phase, delay: 3500 },
    ];

    const timeouts = phaseTimings.map(({ phase, delay }) =>
      setTimeout(() => setCurrentPhase(phase), delay)
    );

    // Show skip button after 1.5s
    const skipTimeout = setTimeout(() => setShowSkip(true), 1500);

    // Auto-complete after full sequence
    const completeTimeout = setTimeout(() => {
      setIsCompleted(true);
      onComplete();
    }, 4200);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(skipTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsCompleted(true);
    onComplete();
  };

  return (
    <AnimatePresence>
      {!isCompleted && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Background Effects */}
          <LightingEffects phase={currentPhase} />
          <ParticleSystem phase={currentPhase} />

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
            {/* Logo */}
            <AnimatedManusLogo 
              phase={currentPhase}
              onComplete={() => {
                if (currentPhase === 'integration') {
                  setTimeout(() => {
                    setIsCompleted(true);
                    onComplete();
                  }, 500);
                }
              }}
            />

            {/* Title */}
            <motion.div
              className="text-center space-y-2"
              animate={{
                opacity: currentPhase === 'consciousness' || currentPhase === 'integration' ? 1 : 0,
                y: currentPhase === 'consciousness' || currentPhase === 'integration' ? 0 : 20,
                scale: currentPhase === 'consciousness' || currentPhase === 'integration' ? 1 : 0.9,
              }}
              transition={{
                duration: 1.3,
                ease: 'easeOut',
              }}
            >
              <h1 className="text-4xl font-bold text-foreground tracking-tight">
                WZRD.work
              </h1>
              <p className="text-muted-foreground text-lg">
                powered by Manus AI
              </p>
            </motion.div>

            {/* Loading Indicator */}
            <motion.div
              className="w-64 h-1 bg-muted rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: currentPhase === 'void' ? 0 : 0.6 
              }}
              transition={{ delay: 1 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                initial={{ x: '-100%' }}
                animate={{
                  x: currentPhase === 'void' ? '-100%' :
                     currentPhase === 'genesis' ? '-60%' :
                     currentPhase === 'consciousness' ? '-20%' :
                     '0%'
                }}
                transition={{ 
                  duration: 0.8,
                  ease: 'easeOut'
                }}
              />
            </motion.div>
          </div>

          {/* Skip Button */}
          <AnimatePresence>
            {showSkip && canSkip && (
              <motion.div
                className="absolute top-8 right-8 z-20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkip}
                  className="backdrop-blur-sm bg-background/20 border-border/50 hover:bg-background/40"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip Intro
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {(['void', 'genesis', 'consciousness', 'integration'] as Phase[]).map((phase, index) => (
              <motion.div
                key={phase}
                className="w-2 h-2 rounded-full"
                animate={{
                  backgroundColor: 
                    phase === currentPhase ? 'hsl(var(--primary))' :
                    index < (['void', 'genesis', 'consciousness', 'integration'] as Phase[]).indexOf(currentPhase) ? 
                    'hsl(var(--primary) / 0.5)' : 'hsl(var(--muted))',
                  scale: phase === currentPhase ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};