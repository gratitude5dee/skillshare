import React from 'react';
import { motion } from 'framer-motion';

interface LightingEffectsProps {
  phase: 'void' | 'genesis' | 'consciousness' | 'integration';
}

export const LightingEffects: React.FC<LightingEffectsProps> = ({ phase }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Main Volumetric Light */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          opacity: phase === 'void' ? 0 : phase === 'genesis' ? 0.8 : phase === 'consciousness' ? 1 : 0,
          scale: phase === 'void' ? 0 : phase === 'genesis' ? 1.5 : phase === 'consciousness' ? 2 : 0,
          rotate: phase === 'consciousness' ? 360 : 0,
        }}
        transition={{ 
          duration: phase === 'consciousness' ? 1.3 : 1.4,
          ease: "easeOut",
        }}
      >
        <div
          className="w-96 h-96 rounded-full"
          style={{
            background: `
              radial-gradient(
                circle at center,
                hsl(var(--primary) / 0.4) 0%,
                hsl(var(--primary) / 0.2) 30%,
                hsl(var(--accent) / 0.1) 60%,
                transparent 100%
              )
            `,
            filter: 'blur(40px)',
          }}
        />
      </motion.div>

      {/* Rim Lighting */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          opacity: phase === 'void' ? 0 : phase === 'genesis' ? 0.6 : phase === 'consciousness' ? 0.8 : 0,
        }}
        transition={{ duration: 1.4 }}
      >
        <div
          className="w-32 h-32 rounded-full border-2 border-primary/30"
          style={{
            boxShadow: `
              0 0 20px hsl(var(--primary) / 0.5),
              inset 0 0 20px hsl(var(--primary) / 0.3)
            `,
            filter: 'blur(2px)',
          }}
        />
      </motion.div>

      {/* Chromatic Aberration Layers */}
      {phase === 'consciousness' && (
        <>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              x: [-2, 2, -1, 1, 0],
              opacity: [0.3, 0.6, 0.4, 0.7, 0.5],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <div
              className="w-20 h-20 rounded-full"
              style={{
                background: 'hsl(0, 100%, 50%)',
                filter: 'blur(10px)',
                opacity: 0.2,
              }}
            />
          </motion.div>
          
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              x: [2, -2, 1, -1, 0],
              opacity: [0.3, 0.6, 0.4, 0.7, 0.5],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: 0.1,
            }}
          >
            <div
              className="w-20 h-20 rounded-full"
              style={{
                background: 'hsl(240, 100%, 50%)',
                filter: 'blur(10px)',
                opacity: 0.2,
              }}
            />
          </motion.div>
        </>
      )}

      {/* Depth of Field Layers */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: phase === 'void' ? 0 : phase === 'genesis' ? 0.3 : phase === 'consciousness' ? 0.6 : 0,
        }}
        transition={{ duration: 1 }}
        style={{
          background: `
            radial-gradient(
              ellipse at center,
              transparent 40%,
              hsl(var(--background) / 0.1) 60%,
              hsl(var(--background) / 0.3) 80%,
              hsl(var(--background) / 0.5) 100%
            )
          `,
          filter: 'blur(3px)',
        }}
      />
    </div>
  );
};