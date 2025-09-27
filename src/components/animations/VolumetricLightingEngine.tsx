import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface VolumetricLightingEngineProps {
  phase: 'silence' | 'whisper' | 'genesis' | 'consciousness' | 'integration';
  intensity?: number;
}

export const VolumetricLightingEngine: React.FC<VolumetricLightingEngineProps> = ({
  phase,
  intensity = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const getLightingConfig = () => {
    switch (phase) {
      case 'silence':
        return {
          keyLight: { opacity: 0, color: 'hsl(280, 100%, 70%)', blur: 40 },
          fillLight: { opacity: 0, color: 'hsl(260, 100%, 60%)', blur: 60 },
          rimLight: { opacity: 0, color: 'hsl(300, 100%, 80%)', blur: 30 },
          volumetric: { opacity: 0, intensity: 0 }
        };
      
      case 'whisper':
        return {
          keyLight: { opacity: 0.1 * intensity, color: 'hsl(280, 100%, 70%)', blur: 40 },
          fillLight: { opacity: 0.05 * intensity, color: 'hsl(260, 100%, 60%)', blur: 60 },
          rimLight: { opacity: 0.08 * intensity, color: 'hsl(300, 100%, 80%)', blur: 30 },
          volumetric: { opacity: 0.1 * intensity, intensity: 0.2 }
        };
      
      case 'genesis':
        return {
          keyLight: { opacity: 0.4 * intensity, color: 'hsl(280, 100%, 70%)', blur: 35 },
          fillLight: { opacity: 0.3 * intensity, color: 'hsl(260, 100%, 60%)', blur: 50 },
          rimLight: { opacity: 0.5 * intensity, color: 'hsl(300, 100%, 80%)', blur: 25 },
          volumetric: { opacity: 0.6 * intensity, intensity: 0.8 }
        };
      
      case 'consciousness':
        return {
          keyLight: { opacity: 0.8 * intensity, color: 'hsl(280, 100%, 70%)', blur: 30 },
          fillLight: { opacity: 0.6 * intensity, color: 'hsl(260, 100%, 60%)', blur: 45 },
          rimLight: { opacity: 0.9 * intensity, color: 'hsl(300, 100%, 80%)', blur: 20 },
          volumetric: { opacity: 1 * intensity, intensity: 1 }
        };
      
      case 'integration':
        return {
          keyLight: { opacity: 0.5 * intensity, color: 'hsl(280, 100%, 70%)', blur: 35 },
          fillLight: { opacity: 0.4 * intensity, color: 'hsl(260, 100%, 60%)', blur: 55 },
          rimLight: { opacity: 0.6 * intensity, color: 'hsl(300, 100%, 80%)', blur: 25 },
          volumetric: { opacity: 0.7 * intensity, intensity: 0.6 }
        };
      
      default:
        return {
          keyLight: { opacity: 0, color: 'hsl(280, 100%, 70%)', blur: 40 },
          fillLight: { opacity: 0, color: 'hsl(260, 100%, 60%)', blur: 60 },
          rimLight: { opacity: 0, color: 'hsl(300, 100%, 80%)', blur: 30 },
          volumetric: { opacity: 0, intensity: 0 }
        };
    }
  };

  const config = getLightingConfig();

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Key Light - Main illumination */}
      <motion.div
        className="absolute"
        style={{
          top: '20%',
          left: '30%',
          width: '40%',
          height: '40%',
          background: `radial-gradient(ellipse at center, 
            ${config.keyLight.color}40 0%,
            ${config.keyLight.color}20 30%,
            ${config.keyLight.color}10 60%,
            transparent 100%)`,
          filter: `blur(${config.keyLight.blur}px)`,
        }}
        animate={{
          opacity: config.keyLight.opacity,
          scale: phase === 'genesis' ? [1, 1.3, 1] : 1,
        }}
        transition={{
          opacity: { duration: 1.5, ease: "easeOut" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Fill Light - Ambient illumination */}
      <motion.div
        className="absolute"
        style={{
          bottom: '10%',
          right: '20%',
          width: '60%',
          height: '50%',
          background: `radial-gradient(ellipse at center, 
            ${config.fillLight.color}30 0%,
            ${config.fillLight.color}15 40%,
            ${config.fillLight.color}08 70%,
            transparent 100%)`,
          filter: `blur(${config.fillLight.blur}px)`,
        }}
        animate={{
          opacity: config.fillLight.opacity,
          x: phase === 'consciousness' ? [0, 20, 0] : 0,
        }}
        transition={{
          opacity: { duration: 1.8, ease: "easeOut" },
          x: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Rim Light - Edge definition */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, 
            transparent 0deg,
            ${config.rimLight.color}40 45deg,
            transparent 90deg,
            ${config.rimLight.color}30 135deg,
            transparent 180deg,
            ${config.rimLight.color}40 225deg,
            transparent 270deg,
            ${config.rimLight.color}30 315deg,
            transparent 360deg)`,
          filter: `blur(${config.rimLight.blur}px)`,
          mixBlendMode: 'screen',
        }}
        animate={{
          opacity: config.rimLight.opacity,
          rotate: phase === 'consciousness' ? 360 : 0,
        }}
        transition={{
          opacity: { duration: 1.2, ease: "easeOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "linear" }
        }}
      />

      {/* Volumetric God Rays */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(45deg, 
            transparent 0%,
            ${config.keyLight.color}${Math.floor(config.volumetric.opacity * 20).toString(16).padStart(2, '0')} 20%,
            transparent 40%,
            ${config.keyLight.color}${Math.floor(config.volumetric.opacity * 15).toString(16).padStart(2, '0')} 60%,
            transparent 80%,
            ${config.keyLight.color}${Math.floor(config.volumetric.opacity * 10).toString(16).padStart(2, '0')} 100%)`,
          filter: 'blur(2px)',
          mixBlendMode: 'overlay',
        }}
        animate={{
          opacity: config.volumetric.opacity,
          x: phase === 'genesis' ? ['-10%', '10%', '-10%'] : 0,
        }}
        transition={{
          opacity: { duration: 2, ease: "easeOut" },
          x: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Atmospheric Fog */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 70%, 
            ${config.fillLight.color}15 0%,
            ${config.fillLight.color}08 30%,
            ${config.fillLight.color}04 60%,
            transparent 100%)`,
          filter: 'blur(80px)',
          mixBlendMode: 'overlay',
        }}
        animate={{
          opacity: config.volumetric.opacity * 0.6,
          scale: phase === 'consciousness' ? [1, 1.1, 1] : 1,
        }}
        transition={{
          opacity: { duration: 2.5, ease: "easeOut" },
          scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Caustic Light Patterns */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg at 30% 30%, 
            transparent 0deg,
            ${config.keyLight.color}20 60deg,
            transparent 120deg,
            ${config.keyLight.color}15 180deg,
            transparent 240deg,
            ${config.keyLight.color}25 300deg,
            transparent 360deg)`,
          filter: 'blur(15px)',
          mixBlendMode: 'color-dodge',
          transformOrigin: '30% 30%',
        }}
        animate={{
          opacity: phase === 'consciousness' ? config.volumetric.opacity * 0.4 : 0,
          rotate: phase === 'consciousness' ? [0, 360] : 0,
          scale: phase === 'consciousness' ? [1, 1.2, 1] : 1,
        }}
        transition={{
          opacity: { duration: 1, ease: "easeOut" },
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Dynamic Light Flares */}
      {phase === 'genesis' && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 20}%`,
                width: '10px',
                height: '10px',
                background: config.keyLight.color,
                borderRadius: '50%',
                filter: 'blur(3px)',
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 2, 0.5],
                x: [0, Math.random() * 100 - 50, 0],
                y: [0, Math.random() * 100 - 50, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
        </>
      )}

      {/* Color Temperature Shift Overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: phase === 'consciousness' 
            ? 'linear-gradient(45deg, hsl(280, 100%, 70%, 0.1), hsl(320, 100%, 60%, 0.1))'
            : phase === 'genesis'
            ? 'linear-gradient(45deg, hsl(260, 100%, 80%, 0.1), hsl(300, 100%, 70%, 0.1))'
            : 'transparent',
          mixBlendMode: 'overlay',
        }}
        animate={{
          opacity: config.volumetric.intensity,
        }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
    </div>
  );
};