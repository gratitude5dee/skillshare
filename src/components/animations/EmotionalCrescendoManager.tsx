import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface EmotionalCrescendoManagerProps {
  phase: 'silence' | 'whisper' | 'genesis' | 'consciousness' | 'integration';
}

export const EmotionalCrescendoManager: React.FC<EmotionalCrescendoManagerProps> = ({
  phase
}) => {
  const [emotionalIntensity, setEmotionalIntensity] = useState(0);
  const [breathingRate, setBreathingRate] = useState(4000); // ms per breath cycle
  const [heartRate, setHeartRate] = useState(1000); // ms per heartbeat

  // Calculate emotional state based on phase
  useEffect(() => {
    const phaseEmotions = {
      silence: { intensity: 0, breathing: 6000, heart: 1200 },
      whisper: { intensity: 0.2, breathing: 5000, heart: 1000 },
      genesis: { intensity: 0.8, breathing: 3000, heart: 600 },
      consciousness: { intensity: 1.0, breathing: 2500, heart: 500 },
      integration: { intensity: 0.6, breathing: 4000, heart: 800 }
    };

    const emotion = phaseEmotions[phase];
    setEmotionalIntensity(emotion.intensity);
    setBreathingRate(emotion.breathing);
    setHeartRate(emotion.heart);
  }, [phase]);

  // Color palette based on emotional intensity
  const getEmotionalColors = () => {
    const baseHue = 280;
    const saturation = 100;
    const lightness = 70;
    
    return {
      primary: `hsl(${baseHue}, ${saturation}%, ${lightness}%)`,
      secondary: `hsl(${baseHue + 30}, ${saturation}%, ${lightness - 10}%)`,
      accent: `hsl(${baseHue - 20}, ${saturation}%, ${lightness + 10}%)`,
      ambient: `hsl(${baseHue + 10}, ${saturation - 20}%, ${lightness - 20}%)`
    };
  };

  const colors = getEmotionalColors();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Emotional Breathing Effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, 
            ${colors.primary}${Math.floor(emotionalIntensity * 20).toString(16).padStart(2, '0')} 0%,
            ${colors.ambient}${Math.floor(emotionalIntensity * 10).toString(16).padStart(2, '0')} 60%,
            transparent 100%)`,
        }}
        animate={{
          scale: [1, 1 + emotionalIntensity * 0.1, 1],
          opacity: [emotionalIntensity * 0.3, emotionalIntensity * 0.6, emotionalIntensity * 0.3],
        }}
        transition={{
          duration: breathingRate / 1000,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Heartbeat Pulse */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: emotionalIntensity > 0.5 ? [1, 1.02, 1, 1.01, 1] : 1,
        }}
        transition={{
          duration: heartRate / 1000,
          repeat: Infinity,
          ease: "easeOut"
        }}
      >
        <div
          className="w-32 h-32 rounded-full"
          style={{
            background: `radial-gradient(circle, 
              ${colors.primary}${Math.floor(emotionalIntensity * 40).toString(16).padStart(2, '0')} 0%,
              transparent 50%)`,
            filter: `blur(${10 + emotionalIntensity * 20}px)`,
          }}
        />
      </motion.div>

      {/* Emotional Tension Rings */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1 + (i + 1) * emotionalIntensity * 0.1, 1],
            opacity: [0, emotionalIntensity * 0.3, 0],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut"
          }}
        >
          <div
            className="rounded-full border"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              borderColor: colors.secondary,
              borderWidth: '1px',
              borderStyle: 'solid',
              opacity: emotionalIntensity * 0.4,
            }}
          />
        </motion.div>
      ))}

      {/* Consciousness Emergence */}
      {phase === 'consciousness' && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Neural Network Connections */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                width: '200px',
                height: '2px',
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  ${colors.accent} 50%, 
                  transparent 100%)`,
                transformOrigin: '0 50%',
                transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
              }}
              animate={{
                scaleX: [0, 1, 0.8],
                opacity: [0, 1, 0.6],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Synaptic Flashes */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: colors.accent,
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`,
                filter: 'blur(1px)',
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 2, 0.5],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Genesis Energy Burst */}
      {phase === 'genesis' && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Energy Spiral */}
          <motion.div
            className="absolute"
            style={{
              width: '300px',
              height: '300px',
              background: `conic-gradient(from 0deg, 
                transparent 0deg,
                ${colors.primary} 60deg,
                transparent 120deg,
                ${colors.secondary} 180deg,
                transparent 240deg,
                ${colors.accent} 300deg,
                transparent 360deg)`,
              borderRadius: '50%',
              filter: 'blur(8px)',
            }}
            animate={{
              rotate: 360,
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />

          {/* Energy Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: i % 2 === 0 ? colors.primary : colors.accent,
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: Math.cos(i * (Math.PI * 2) / 20) * (100 + Math.random() * 100),
                y: Math.sin(i * (Math.PI * 2) / 20) * (100 + Math.random() * 100),
                opacity: [0, 1, 0],
                scale: [0, 2, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Integration Harmony */}
      {phase === 'integration' && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Harmonic Waves */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{
                background: `linear-gradient(${i * 30}deg, 
                  transparent 0%,
                  ${colors.ambient}20 30%,
                  transparent 70%,
                  ${colors.ambient}15 100%)`,
              }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                rotate: [0, 360],
              }}
              transition={{
                opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 20 + i * 5, repeat: Infinity, ease: "linear" }
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Emotional State Indicator */}
      <motion.div
        className="absolute bottom-16 right-8 flex flex-col items-end space-y-2"
        animate={{ opacity: emotionalIntensity > 0 ? 0.6 : 0 }}
        transition={{ duration: 1 }}
      >
        {/* Intensity Meter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-white/60">Intensity</span>
          <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: colors.primary }}
              animate={{ width: `${emotionalIntensity * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Phase Label */}
        <motion.span
          className="text-xs text-white/80 capitalize"
          animate={{
            color: colors.primary,
          }}
          transition={{ duration: 0.5 }}
        >
          {phase}
        </motion.span>
      </motion.div>
    </div>
  );
};