import React from 'react';
import { motion } from 'framer-motion';
import manusLogo from '@/assets/manus-logo.png';

interface AnimatedManusLogoProps {
  phase: 'void' | 'genesis' | 'consciousness' | 'integration';
  onComplete?: () => void;
}

export const AnimatedManusLogo: React.FC<AnimatedManusLogoProps> = ({ phase, onComplete }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{
          opacity: phase === 'void' ? 0 : phase === 'genesis' ? 0.4 : phase === 'consciousness' ? 0.7 : 0,
          scale: phase === 'void' ? 0 : phase === 'genesis' ? 1.5 : phase === 'consciousness' ? 2 : 0,
        }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
      
      {/* Main Logo */}
      <motion.div
        className="relative z-10"
        style={{ 
          transformOrigin: 'center',
        }}
        animate={{
          opacity: phase === 'void' ? 0 : 1,
          scale: phase === 'void' ? 0 : phase === 'genesis' ? 1 : phase === 'consciousness' ? 1.05 : 1,
          rotateY: phase === 'void' ? 180 : 0,
          filter: phase === 'void' ? 'blur(20px) brightness(0)' : 'blur(0px) brightness(1)',
        }}
        transition={{ 
          duration: phase === 'genesis' ? 1.4 : 1.3,
          ease: "easeOut" 
        }}
        onAnimationComplete={() => {
          if (phase === 'integration' && onComplete) {
            onComplete();
          }
        }}
      >
        <img 
          src={manusLogo} 
          alt="Manus" 
          className="h-16 w-auto filter drop-shadow-lg"
        />
      </motion.div>

      {/* Neural Network Lines */}
      {phase === 'genesis' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-gradient-to-r from-transparent via-primary/30 to-transparent h-px"
              style={{
                left: '50%',
                top: '50%',
                width: '200px',
                transformOrigin: 'left center',
                transform: `rotate(${i * 45}deg) translateX(-100px)`,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ 
                delay: 0.8 + i * 0.1, 
                duration: 0.6,
                ease: 'easeOut'
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Consciousness Lightning */}
      {phase === 'consciousness' && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-accent to-transparent"
              style={{
                width: '120px',
                left: '50%',
                top: '50%',
                transformOrigin: 'left center',
                transform: `rotate(${i * 60}deg) translateX(-60px)`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scaleX: [0.5, 1.2, 0.8],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                repeatDelay: 1.5,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};