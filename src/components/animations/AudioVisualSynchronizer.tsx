import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualSynchronizerProps {
  phase: 'silence' | 'whisper' | 'genesis' | 'consciousness' | 'integration';
  audioContext: AudioContext | null;
}

export const AudioVisualSynchronizer: React.FC<AudioVisualSynchronizerProps> = ({
  phase,
  audioContext
}) => {
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize audio synthesis
  useEffect(() => {
    if (!audioContext || phase === 'silence') {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (e) {
          // Oscillator already stopped
        }
        oscillatorRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    // Create audio nodes
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    gainNodeRef.current = gainNode;

    // Connect nodes
    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);

    // Create frequency data array
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    setAudioData(dataArray);

    // Generate phase-specific audio
    const generateAudio = () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (e) {
          // Oscillator already stopped
        }
      }

      const oscillator = audioContext.createOscillator();
      oscillatorRef.current = oscillator;

      // Phase-specific audio parameters
      switch (phase) {
        case 'whisper':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 2);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + 1);
          break;

        case 'genesis':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(110, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 3);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.5);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
          break;

        case 'consciousness':
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(330, audioContext.currentTime + 0.5);
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 1);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.3);
          break;

        case 'integration':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 2);
          gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
          break;
      }

      // Connect and start
      oscillator.connect(gainNode);
      oscillator.start();
      setIsPlaying(true);

      // Stop after phase duration
      const duration = phase === 'genesis' ? 3000 : 2000;
      setTimeout(() => {
        if (oscillatorRef.current === oscillator) {
          try {
            oscillator.stop();
          } catch (e) {
            // Oscillator already stopped
          }
          setIsPlaying(false);
        }
      }, duration);
    };

    generateAudio();

    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (e) {
          // Oscillator already stopped
        }
      }
    };
  }, [audioContext, phase]);

  // Audio analysis loop
  useEffect(() => {
    if (!analyserRef.current || !audioData || !isPlaying) return;

    const analyseAudio = () => {
      if (analyserRef.current && audioData) {
        analyserRef.current.getByteFrequencyData(audioData);
        setAudioData(new Uint8Array(audioData));
      }
      
      if (isPlaying) {
        requestAnimationFrame(analyseAudio);
      }
    };

    analyseAudio();
  }, [audioData, isPlaying]);

  // Calculate audio-reactive values
  const getAudioReactiveValues = () => {
    if (!audioData) return { bassLevel: 0, midLevel: 0, trebleLevel: 0, overall: 0 };

    const bassEnd = Math.floor(audioData.length * 0.1);
    const midEnd = Math.floor(audioData.length * 0.5);
    
    let bassSum = 0, midSum = 0, trebleSum = 0;
    
    for (let i = 0; i < bassEnd; i++) {
      bassSum += audioData[i];
    }
    
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += audioData[i];
    }
    
    for (let i = midEnd; i < audioData.length; i++) {
      trebleSum += audioData[i];
    }

    const bassLevel = bassSum / (bassEnd * 255);
    const midLevel = midSum / ((midEnd - bassEnd) * 255);
    const trebleLevel = trebleSum / ((audioData.length - midEnd) * 255);
    const overall = (bassLevel + midLevel + trebleLevel) / 3;

    return { bassLevel, midLevel, trebleLevel, overall };
  };

  const { bassLevel, midLevel, trebleLevel, overall } = getAudioReactiveValues();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Audio-Reactive Background Pulse */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, 
            hsl(280, 100%, 70%, ${overall * 0.3}) 0%,
            hsl(280, 100%, 70%, ${overall * 0.15}) 30%,
            transparent 70%)`,
        }}
        animate={{
          scale: 1 + overall * 0.2,
          opacity: isPlaying ? 1 : 0,
        }}
        transition={{ duration: 0.1 }}
      />

      {/* Bass-Reactive Outer Ring */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: 1 + bassLevel * 0.5,
          opacity: isPlaying ? bassLevel : 0,
        }}
        transition={{ duration: 0.1 }}
      >
        <div
          className="w-96 h-96 rounded-full border-2"
          style={{
            borderColor: `hsl(280, 100%, 70%, ${bassLevel})`,
            filter: `blur(${2 + bassLevel * 8}px)`,
          }}
        />
      </motion.div>

      {/* Mid-Reactive Particles */}
      {isPlaying && [...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: `hsl(${260 + i * 10}, 100%, 70%)`,
            left: `${50 + Math.cos(i * (Math.PI * 2) / 12) * 30}%`,
            top: `${50 + Math.sin(i * (Math.PI * 2) / 12) * 30}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: 1 + midLevel * 2,
            opacity: midLevel,
            x: Math.cos(i * (Math.PI * 2) / 12) * midLevel * 50,
            y: Math.sin(i * (Math.PI * 2) / 12) * midLevel * 50,
          }}
          transition={{ duration: 0.1 }}
        />
      ))}

      {/* Treble-Reactive Lightning */}
      {isPlaying && trebleLevel > 0.1 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: '2px',
                height: `${50 + trebleLevel * 100}px`,
                backgroundColor: `hsl(${300 + i * 15}, 100%, 80%)`,
                transform: `rotate(${i * 60}deg)`,
                filter: 'blur(1px)',
              }}
              animate={{
                opacity: trebleLevel,
                scaleY: 1 + trebleLevel,
              }}
              transition={{ duration: 0.05 }}
            />
          ))}
        </div>
      )}

      {/* Audio Waveform Visualization */}
      {isPlaying && audioData && (
        <motion.div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-end space-x-1 h-12">
            {Array.from({ length: 32 }).map((_, i) => {
              const dataIndex = Math.floor((i / 32) * audioData.length);
              const amplitude = audioData[dataIndex] / 255;
              
              return (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-purple-600 to-purple-300"
                  animate={{
                    height: `${2 + amplitude * 40}px`,
                  }}
                  transition={{ duration: 0.05 }}
                />
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Phase-Specific Visual Effects */}
      {phase === 'consciousness' && isPlaying && (
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 30% 40%, hsl(280, 100%, 70%, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 60%, hsl(300, 100%, 60%, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 30%, hsl(260, 100%, 80%, 0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Haptic Feedback Indicator */}
      {isPlaying && 'vibrate' in navigator && (
        <motion.div
          className="absolute top-4 left-4 w-3 h-3 rounded-full bg-purple-400"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          onAnimationComplete={() => {
            if (overall > 0.5) {
              navigator.vibrate?.(50);
            }
          }}
        />
      )}
    </div>
  );
};