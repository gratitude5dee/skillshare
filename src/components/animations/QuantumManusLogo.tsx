import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import manusLogo from '@/assets/manus-logo.png';

interface QuantumManusLogoProps {
  phase: 'silence' | 'whisper' | 'genesis' | 'consciousness' | 'integration';
  onPhaseComplete?: (phase: string) => void;
}

export const QuantumManusLogo: React.FC<QuantumManusLogoProps> = ({ 
  phase, 
  onPhaseComplete 
}) => {
  const [quantumParticles, setQuantumParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
  }>>([]);
  
  const logoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate quantum particles for logo assembly
  useEffect(() => {
    if (phase === 'genesis') {
      const particles = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        x: Math.random() * 400 - 200,
        y: Math.random() * 400 - 200,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1
      }));
      setQuantumParticles(particles);
    }
  }, [phase]);

  // Canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || quantumParticles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw quantum field
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      quantumParticles.forEach((particle, index) => {
        // Quantum attraction to center
        const dx = -particle.x;
        const dy = -particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
          particle.vx += dx * 0.002;
          particle.vy += dy * 0.002;
        }
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98; // Friction
        particle.vy *= 0.98;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${280 + index * 2}, 100%, 70%, ${particle.life})`;
        ctx.fill();
        
        // Draw quantum connections
        quantumParticles.forEach((other, otherIndex) => {
          if (otherIndex <= index) return;
          const dx2 = other.x - particle.x;
          const dy2 = other.y - particle.y;
          const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          
          if (dist < 50) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `hsl(280, 100%, 70%, ${0.1 * (1 - dist / 50)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      
      ctx.restore();
      
      if (phase === 'genesis') {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [quantumParticles, phase]);

  return (
    <motion.div
      ref={logoRef}
      className="relative flex items-center justify-center"
      initial={{ scale: 0, rotateY: 180 }}
      animate={{
        scale: phase === 'silence' ? 0 : 
               phase === 'whisper' ? 0.3 :
               phase === 'genesis' ? 0.8 :
               phase === 'consciousness' ? 1.2 :
               1,
        rotateY: phase === 'silence' ? 180 : 0,
        rotateX: phase === 'genesis' ? 360 : 0,
      }}
      transition={{
        duration: phase === 'genesis' ? 2 : 1.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      onAnimationComplete={() => {
        if (phase === 'integration') {
          onPhaseComplete?.(phase);
        }
      }}
    >
      {/* Quantum Field Canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="absolute inset-0 pointer-events-none"
        style={{ 
          opacity: phase === 'genesis' ? 1 : 0,
          transition: 'opacity 1s ease-out'
        }}
      />

      {/* Holographic Ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2"
        style={{
          borderColor: 'hsl(280, 100%, 70%)',
          borderStyle: 'solid',
          width: '200px',
          height: '200px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        animate={{
          opacity: phase === 'consciousness' || phase === 'integration' ? 1 : 0,
          scale: phase === 'consciousness' ? [1, 1.2, 1] : 1,
          rotate: phase === 'consciousness' ? 360 : 0,
        }}
        transition={{
          opacity: { duration: 0.8 },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "linear" }
        }}
      />

      {/* Neural Network Lines */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: phase === 'genesis' || phase === 'consciousness' ? 1 : 0,
        }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-r from-transparent via-purple-400 to-transparent h-px"
            style={{
              width: '150px',
              left: '50%',
              top: '50%',
              transformOrigin: '0 50%',
              transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
            }}
            animate={{
              scaleX: phase === 'genesis' ? [0, 1, 0.8] : 0,
              opacity: [0, 1, 0.6]
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.1,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>

      {/* Consciousness Lightning */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: phase === 'consciousness' ? 1 : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 60}deg)`,
            }}
          >
            <motion.div
              className="w-1 bg-gradient-to-t from-transparent via-cyan-400 to-transparent"
              style={{ height: '100px' }}
              animate={{
                scaleY: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Logo */}
      <motion.div
        className="relative z-10"
        animate={{
          opacity: phase === 'silence' ? 0 : 1,
          filter: phase === 'genesis' ? 'brightness(2) contrast(1.2)' : 
                  phase === 'consciousness' ? 'brightness(1.5) saturate(1.5)' :
                  'brightness(1)',
        }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <img 
          src={manusLogo} 
          alt="Gemini Logo" 
          className="w-24 h-24 object-contain"
          style={{
            filter: phase === 'integration' ? 
              'drop-shadow(0 0 20px hsl(280, 100%, 70%)) drop-shadow(0 0 40px hsl(280, 100%, 70%, 0.5))' : 
              'none'
          }}
        />
      </motion.div>

      {/* Quantum Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, 
            hsl(280, 100%, 70%, 0.3) 0%, 
            hsl(320, 100%, 60%, 0.2) 30%, 
            hsl(260, 100%, 80%, 0.1) 60%, 
            transparent 100%)`
        }}
        animate={{
          opacity: phase === 'consciousness' || phase === 'integration' ? 1 : 0,
          scale: phase === 'consciousness' ? [1, 1.5, 1] : 1,
        }}
        transition={{
          opacity: { duration: 1 },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Energy Distortion Field */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, 
            transparent, 
            hsl(280, 100%, 70%, 0.1), 
            transparent, 
            hsl(320, 100%, 60%, 0.1), 
            transparent)`
        }}
        animate={{
          opacity: phase === 'genesis' ? 1 : 0,
          rotate: phase === 'genesis' ? 360 : 0,
        }}
        transition={{
          opacity: { duration: 0.8 },
          rotate: { duration: 4, repeat: Infinity, ease: "linear" }
        }}
      />
    </motion.div>
  );
};