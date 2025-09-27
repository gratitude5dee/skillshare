import React from 'react';
import { motion } from 'framer-motion';

interface CinematicCameraProps {
  phase: 'silence' | 'whisper' | 'genesis' | 'consciousness' | 'integration';
  children: React.ReactNode;
}

export const CinematicCamera: React.FC<CinematicCameraProps> = ({
  phase,
  children
}) => {
  const getCameraMovement = () => {
    switch (phase) {
      case 'silence':
        return {
          scale: 1.2,
          x: 0,
          y: 0,
          rotateZ: 0,
          filter: 'blur(5px)',
        };
      
      case 'whisper':
        return {
          scale: 1.1,
          x: 0,
          y: 0,
          rotateZ: 0,
          filter: 'blur(2px)',
        };
      
      case 'genesis':
        return {
          scale: [1.1, 0.9, 1.05],
          x: [0, -10, 5, 0],
          y: [0, 5, -3, 0],
          rotateZ: [0, -1, 0.5, 0],
          filter: 'blur(0px)',
        };
      
      case 'consciousness':
        return {
          scale: [1.05, 1.15, 1.08],
          x: [0, 8, -5, 0],
          y: [0, -3, 2, 0],
          rotateZ: [0, 0.5, -0.3, 0],
          filter: 'blur(0px) brightness(1.1)',
        };
      
      case 'integration':
        return {
          scale: 1,
          x: 0,
          y: 0,
          rotateZ: 0,
          filter: 'blur(0px) brightness(1)',
        };
      
      default:
        return {
          scale: 1,
          x: 0,
          y: 0,
          rotateZ: 0,
          filter: 'blur(0px)',
        };
    }
  };

  const cameraState = getCameraMovement();

  return (
    <div className="absolute inset-0 overflow-hidden perspective-1000">
      {/* Cinematic Aspect Ratio Bars */}
      <motion.div
        className="absolute top-0 left-0 right-0 bg-black z-20"
        animate={{
          height: phase === 'consciousness' || phase === 'integration' ? '8%' : '0%',
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-black z-20"
        animate={{
          height: phase === 'consciousness' || phase === 'integration' ? '8%' : '0%',
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Virtual Camera Container */}
      <motion.div
        className="absolute inset-0"
        animate={cameraState}
        transition={{
          duration: phase === 'genesis' ? 2.5 : phase === 'consciousness' ? 3 : 2,
          ease: [0.25, 0.46, 0.45, 0.94],
          times: phase === 'genesis' || phase === 'consciousness' ? [0, 0.3, 0.7, 1] : undefined,
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Depth of Field Blur Layers */}
        <motion.div
          className="absolute inset-0"
          animate={{
            filter: phase === 'genesis' 
              ? 'blur(0px)' 
              : phase === 'consciousness'
              ? 'blur(0px)'
              : 'blur(1px)',
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {children}
        </motion.div>

        {/* Focus Pull Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, 
              transparent 40%,
              rgba(0, 0, 0, 0.1) 70%,
              rgba(0, 0, 0, 0.3) 100%)`,
          }}
          animate={{
            opacity: phase === 'genesis' || phase === 'consciousness' ? 0.6 : 0,
            scale: phase === 'consciousness' ? [1, 1.1, 1] : 1,
          }}
          transition={{
            opacity: { duration: 1.5, ease: "easeOut" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </motion.div>

      {/* Camera Shake Effect */}
      {phase === 'genesis' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            x: [0, 1, -1, 0, 1, -1, 0],
            y: [0, -1, 1, 0, -1, 1, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: 3,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Lens Flare Effects */}
      {(phase === 'consciousness' || phase === 'integration') && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Primary Lens Flare */}
          <motion.div
            className="absolute"
            style={{
              top: '30%',
              left: '70%',
              width: '100px',
              height: '100px',
              background: 'radial-gradient(circle, hsl(280, 100%, 70%, 0.4) 0%, transparent 50%)',
              borderRadius: '50%',
              filter: 'blur(20px)',
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Secondary Flares */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full"
              style={{
                backgroundColor: `hsl(${280 + i * 20}, 100%, 70%, 0.6)`,
                left: `${60 + i * 5}%`,
                top: `${25 + i * 3}%`,
                filter: 'blur(2px)',
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Chromatic Aberration */}
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-multiply"
        style={{
          background: 'linear-gradient(45deg, transparent, hsl(280, 100%, 70%, 0.1), transparent)',
        }}
        animate={{
          opacity: phase === 'genesis' ? 0.3 : 0,
          x: phase === 'genesis' ? [0, 2, -2, 0] : 0,
        }}
        transition={{
          opacity: { duration: 1 },
          x: { duration: 0.1, repeat: Infinity }
        }}
      />

      {/* Film Grain */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
        animate={{
          opacity: phase === 'consciousness' || phase === 'integration' ? 0.05 : 0,
        }}
        transition={{ duration: 1.5 }}
      />

      {/* Vignette */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.8) 100%)',
        }}
        animate={{
          opacity: phase === 'consciousness' || phase === 'integration' ? 0.4 : 0.2,
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Lens Distortion */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, 
            transparent 0%, 
            transparent 60%, 
            rgba(120, 0, 255, 0.1) 80%, 
            rgba(120, 0, 255, 0.2) 100%)`,
          borderRadius: '50%',
          transform: 'scale(1.1)',
        }}
        animate={{
          opacity: phase === 'genesis' ? 0.3 : 0,
          scale: phase === 'genesis' ? [1.1, 1.15, 1.1] : 1.1,
        }}
        transition={{
          opacity: { duration: 1 },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      />
    </div>
  );
};