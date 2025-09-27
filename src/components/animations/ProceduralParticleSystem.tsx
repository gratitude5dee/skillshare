import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface ProceduralParticleSystemProps {
  phase: 'silence' | 'whisper' | 'genesis' | 'consciousness' | 'integration';
  particleCount?: number;
  intensity?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'quantum' | 'energy' | 'consciousness' | 'neural';
}

export const ProceduralParticleSystem: React.FC<ProceduralParticleSystemProps> = ({
  phase,
  particleCount = 100,
  intensity = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();

  // Initialize particles based on phase
  useEffect(() => {
    const generateParticles = (): Particle[] => {
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < particleCount; i++) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        let particle: Particle;
        
        switch (phase) {
          case 'whisper':
            particle = {
              id: i,
              x: centerX + (Math.random() - 0.5) * 100,
              y: centerY + (Math.random() - 0.5) * 100,
              vx: (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.5,
              size: Math.random() * 2 + 0.5,
              life: Math.random() * 100 + 50,
              maxLife: Math.random() * 100 + 50,
              color: `hsl(${280 + Math.random() * 40}, 80%, 70%)`,
              type: 'quantum'
            };
            break;
            
          case 'genesis':
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random() * 300 + 100;
            particle = {
              id: i,
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius,
              vx: -Math.cos(angle) * (2 + Math.random() * 3),
              vy: -Math.sin(angle) * (2 + Math.random() * 3),
              size: Math.random() * 4 + 1,
              life: Math.random() * 150 + 100,
              maxLife: Math.random() * 150 + 100,
              color: `hsl(${260 + Math.random() * 60}, 90%, 65%)`,
              type: 'energy'
            };
            break;
            
          case 'consciousness':
            particle = {
              id: i,
              x: centerX + (Math.random() - 0.5) * 400,
              y: centerY + (Math.random() - 0.5) * 400,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              size: Math.random() * 3 + 1,
              life: Math.random() * 200 + 150,
              maxLife: Math.random() * 200 + 150,
              color: `hsl(${270 + Math.random() * 50}, 95%, 75%)`,
              type: 'consciousness'
            };
            break;
            
          case 'integration':
            particle = {
              id: i,
              x: centerX + (Math.random() - 0.5) * 200,
              y: centerY + (Math.random() - 0.5) * 200,
              vx: (Math.random() - 0.5) * 1,
              vy: (Math.random() - 0.5) * 1,
              size: Math.random() * 2 + 0.5,
              life: Math.random() * 300 + 200,
              maxLife: Math.random() * 300 + 200,
              color: `hsl(${280 + Math.random() * 20}, 85%, 80%)`,
              type: 'neural'
            };
            break;
            
          default:
            particle = {
              id: i,
              x: centerX,
              y: centerY,
              vx: 0,
              vy: 0,
              size: 0,
              life: 0,
              maxLife: 0,
              color: 'transparent',
              type: 'quantum'
            };
        }
        
        newParticles.push(particle);
      }
      
      return newParticles;
    };

    if (phase !== 'silence') {
      setParticles(generateParticles());
    } else {
      setParticles([]);
    }
  }, [phase, particleCount]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || particles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      const updatedParticles = particles.map(particle => {
        // Physics based on particle type
        switch (particle.type) {
          case 'quantum':
            // Quantum uncertainty principle
            particle.vx += (Math.random() - 0.5) * 0.1;
            particle.vy += (Math.random() - 0.5) * 0.1;
            break;
            
          case 'energy':
            // Gravitational attraction to center
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const dx = centerX - particle.x;
            const dy = centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 50) {
              particle.vx += (dx / distance) * 0.05;
              particle.vy += (dy / distance) * 0.05;
            }
            break;
            
          case 'consciousness':
            // Neural network-like behavior
            particles.forEach(other => {
              if (other.id !== particle.id && other.type === 'consciousness') {
                const dx = other.x - particle.x;
                const dy = other.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100 && distance > 20) {
                  const force = 0.001;
                  particle.vx += (dx / distance) * force;
                  particle.vy += (dy / distance) * force;
                }
              }
            });
            break;
            
          case 'neural':
            // Harmonious flow
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            particle.vx += Math.sin(Date.now() * 0.001 + particle.id) * 0.02;
            particle.vy += Math.cos(Date.now() * 0.001 + particle.id) * 0.02;
            break;
        }

        // Update position
        particle.x += particle.vx * intensity;
        particle.y += particle.vy * intensity;
        
        // Update life
        particle.life -= 1;
        
        // Boundary wrapping
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        return particle;
      }).filter(particle => particle.life > 0);

      // Draw particles
      updatedParticles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Add glow effect
        if (particle.type === 'consciousness' || particle.type === 'energy') {
          ctx.globalAlpha = alpha * 0.3;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
        }
        
        ctx.restore();
      });

      // Draw connections for consciousness particles
      if (phase === 'consciousness') {
        updatedParticles.forEach((particle, i) => {
          if (particle.type !== 'consciousness') return;
          
          updatedParticles.forEach((other, j) => {
            if (j <= i || other.type !== 'consciousness') return;
            
            const dx = other.x - particle.x;
            const dy = other.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
              const alpha = (1 - distance / 120) * 0.3;
              
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.strokeStyle = `hsl(280, 100%, 70%)`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
              ctx.restore();
            }
          });
        });
      }

      setParticles(updatedParticles);
      
      if (phase !== 'silence' && updatedParticles.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles, phase, intensity]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: phase === 'silence' ? 0 : 1,
        filter: phase === 'genesis' ? 'blur(0.5px)' : 'none'
      }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    />
  );
};