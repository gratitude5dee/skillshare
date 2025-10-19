import React from 'react';
import { motion } from 'framer-motion';

interface KineticTypographyProps {
  phase: 'silence' | 'whisper' | 'genesis' | 'consciousness' | 'integration';
  primaryText: string;
  secondaryText: string;
}

export const KineticTypography: React.FC<KineticTypographyProps> = ({
  phase,
  primaryText,
  secondaryText
}) => {
  const getTextAnimation = () => {
    switch (phase) {
      case 'consciousness':
      case 'integration':
        return {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          filter: phase === 'integration' ? 'blur(0px)' : 'blur(0px)'
        };
      case 'genesis':
        return {
          opacity: 0.3,
          y: 30,
          scale: 0.8,
          rotateX: 45,
          filter: 'blur(2px)'
        };
      default:
        return {
          opacity: 0,
          y: 50,
          scale: 0.6,
          rotateX: 90,
          filter: 'blur(10px)'
        };
    }
  };

  const textState = getTextAnimation();

  return (
    <motion.div
      className="text-center space-y-4 perspective-1000"
      animate={textState}
      transition={{
        duration: 1.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: phase === 'consciousness' ? 0.5 : 0
      }}
    >
      {/* Primary Text - WZRD.work */}
      <div className="relative">
        {/* Background Glow */}
        <motion.h1
          className="absolute inset-0 text-6xl font-bold tracking-tight text-transparent"
          style={{
            background: 'linear-gradient(45deg, hsl(280, 100%, 70%), hsl(320, 100%, 60%), hsl(260, 100%, 80%))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            filter: 'blur(8px)',
          }}
          animate={{
            opacity: phase === 'consciousness' || phase === 'integration' ? 0.6 : 0,
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {primaryText}
        </motion.h1>

        {/* Main Text */}
        <motion.h1
          className="relative text-6xl font-bold tracking-tight text-white"
          style={{
            textShadow: phase === 'integration' 
              ? '0 0 20px hsl(280, 100%, 70%), 0 0 40px hsl(280, 100%, 70%, 0.5)' 
              : 'none'
          }}
        >
          {primaryText.split('').map((char, index) => (
            <motion.span
              key={index}
              className="inline-block"
              animate={{
                rotateY: phase === 'consciousness' ? [0, 10, 0] : 0,
                scale: phase === 'consciousness' ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: 2,
                delay: index * 0.1,
                repeat: phase === 'consciousness' ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              {char === '.' ? (
                <motion.span
                  className="inline-block"
                  animate={{
                    color: phase === 'integration' 
                      ? ['hsl(280, 100%, 70%)', 'hsl(320, 100%, 60%)', 'hsl(280, 100%, 70%)']
                      : 'hsl(0, 0%, 100%)',
                    scale: phase === 'integration' ? [1, 1.3, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {char}
                </motion.span>
              ) : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Holographic Distortion */}
        <motion.div
          className="absolute inset-0 text-6xl font-bold tracking-tight pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(280, 100%, 70%, 0.3), transparent)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
          animate={{
            x: phase === 'consciousness' ? ['-100%', '100%'] : '-100%',
            opacity: phase === 'consciousness' ? [0, 1, 0] : 0,
          }}
          transition={{
            x: { duration: 3, repeat: Infinity, ease: "linear" },
            opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {primaryText}
        </motion.div>
      </div>

      {/* Secondary Text - powered by Gemini */}
      <motion.div
        className="relative"
        animate={{
          opacity: phase === 'consciousness' || phase === 'integration' ? 1 : 0,
          y: phase === 'consciousness' || phase === 'integration' ? 0 : 20,
        }}
        transition={{
          duration: 1.5,
          delay: 0.8,
          ease: "easeOut"
        }}
      >
        {/* Secondary Text Glow */}
        <motion.p
          className="absolute inset-0 text-xl text-transparent"
          style={{
            background: 'linear-gradient(45deg, hsl(260, 100%, 60%), hsl(300, 100%, 70%))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            filter: 'blur(4px)',
          }}
          animate={{
            opacity: phase === 'integration' ? 0.4 : 0,
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {secondaryText}
        </motion.p>

        {/* Main Secondary Text */}
        <motion.p
          className="relative text-xl text-gray-300"
          style={{
            textShadow: phase === 'integration' 
              ? '0 0 10px hsl(260, 100%, 60%, 0.5)' 
              : 'none'
          }}
        >
          {secondaryText.split(' ').map((word, wordIndex) => (
            <motion.span
              key={wordIndex}
              className="inline-block mr-2"
              animate={{
                opacity: [0.7, 1, 0.7],
                y: phase === 'integration' ? [0, -2, 0] : 0,
              }}
              transition={{
                duration: 3,
                delay: wordIndex * 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {word.split('').map((char, charIndex) => (
                <motion.span
                  key={charIndex}
                  className="inline-block"
                  animate={{
                    color: word === 'Manus' && phase === 'integration'
                      ? ['hsl(260, 100%, 60%)', 'hsl(280, 100%, 70%)', 'hsl(260, 100%, 60%)']
                      : 'hsl(0, 0%, 80%)',
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: charIndex * 0.1,
                    ease: "easeInOut"
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>
          ))}
        </motion.p>

        {/* Digital Glitch Effect */}
        {phase === 'consciousness' && (
          <motion.div
            className="absolute inset-0 text-xl pointer-events-none"
            style={{
              color: 'hsl(280, 100%, 70%)',
              mixBlendMode: 'screen',
            }}
            animate={{
              opacity: [0, 0.3, 0],
              x: [0, 2, -1, 0],
              filter: ['blur(0px)', 'blur(1px)', 'blur(0px)'],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          >
            {secondaryText}
          </motion.div>
        )}
      </motion.div>

      {/* 3D Text Extrusion Effect */}
      {phase === 'integration' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: -1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 1 }}
        >
          <div
            className="text-6xl font-bold tracking-tight text-purple-400"
            style={{
              transform: 'translateZ(-10px) translateX(2px) translateY(2px)',
              filter: 'blur(1px)',
            }}
          >
            {primaryText}
          </div>
        </motion.div>
      )}

      {/* Particle Text Formation */}
      {phase === 'genesis' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};