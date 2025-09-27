import React from 'react';
import { motion } from 'framer-motion';

interface ParticleSystemProps {
  phase: 'void' | 'genesis' | 'consciousness' | 'integration';
  particleCount?: number;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
  phase, 
  particleCount = 50 
}) => {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-primary/40 to-accent/40"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            filter: 'blur(1px)',
          }}
          animate={{
            opacity: phase === 'void' ? 0.1 : phase === 'genesis' ? 0.8 : phase === 'consciousness' ? 0.4 : 0,
            scale: phase === 'void' ? 0.2 : phase === 'genesis' ? particle.size / 5 : phase === 'consciousness' ? particle.size / 3 : 0,
            x: phase === 'void' ? `${particle.initialX}vw` : 
               phase === 'genesis' ? '50vw' :
               phase === 'consciousness' ? `${50 + Math.sin(particle.id) * 20}vw` : '50vw',
            y: phase === 'void' ? `${particle.initialY}vh` : 
               phase === 'genesis' ? '50vh' :
               phase === 'consciousness' ? `${50 + Math.cos(particle.id) * 20}vh` : '50vh',
          }}
          transition={{
            duration: 1.4,
            delay: particle.delay,
            ease: "easeInOut",
          }}
          initial={{
            opacity: 0.1,
            x: `${particle.initialX}vw`,
            y: `${particle.initialY}vh`,
            scale: 0.2,
          }}
        />
      ))}
      
      {/* Quantum Field Effect */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, hsl(var(--accent) / 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, hsl(var(--secondary) / 0.1) 0%, transparent 50%)
          `,
        }}
        animate={{
          opacity: phase === 'void' ? 0.1 : phase === 'genesis' ? 0.3 : phase === 'consciousness' ? 0.5 : 0,
        }}
        transition={{ duration: 1 }}
      />
    </div>
  );
};