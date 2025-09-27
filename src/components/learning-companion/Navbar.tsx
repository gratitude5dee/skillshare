
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import ConnectWalletButton from "./ConnectWalletButton";
import manusLogo from "@/assets/manus-logo.png";

export const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="justify-between items-center backdrop-blur-md bg-[rgba(255,255,255,0.80)] flex w-full px-16 py-4 max-md:px-4"
      aria-label="Top navigation bar"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="self-stretch flex min-w-60 w-full flex-col items-center flex-1 shrink basis-[0%] my-auto pt-6">
        <motion.div 
          className={`min-h-[100px] ${isMobile ? 'w-[160px]' : 'w-[223px]'} max-w-full relative cursor-pointer`}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ 
            scale: 1.08, 
            y: -2,
            transition: { duration: 0.4, ease: "easeOut" }
          }}
        >
          <motion.img
            src={manusLogo}
            className="aspect-[2.22] object-contain w-full relative z-10"
            alt="Manus Logo"
            initial={{ scale: 0.9, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            whileHover={{ 
              filter: "brightness(1.1) saturate(1.1) drop-shadow(0 15px 35px rgba(0,0,0,0.15))",
              transition: { duration: 0.3 }
            }}
          />
          
          {/* Magical glow effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 50%, transparent 70%)',
            }}
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1.2 : 1
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />

          {/* Orbiting elements */}
          {isHovered && (
            <>
              {[0, 60, 120, 180, 240, 300].map((rotation, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    transformOrigin: '0 0',
                    transform: `translate(-50%, -50%) translate(${isMobile ? '50px' : '70px'}, 0) rotate(${rotation}deg)`
                  }}
                  initial={{
                    scale: 0,
                    opacity: 0
                  }}
                  animate={{
                    scale: [0, 1, 0.8, 1],
                    opacity: [0, 1, 0.7, 1],
                    rotate: rotation + 360
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.1
                  }}
                />
              ))}
            </>
          )}

          {/* Ripple rings */}
          <motion.div
            className="absolute inset-0 rounded-full border border-blue-400/30"
            animate={{
              scale: isHovered ? [1, 1.6] : 1,
              opacity: isHovered ? [0.6, 0] : 0
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
              ease: "easeOut"
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-purple-400/20"
            animate={{
              scale: isHovered ? [1, 1.4] : 1,
              opacity: isHovered ? [0.4, 0] : 0
            }}
            transition={{
              duration: 1.2,
              delay: 0.2,
              repeat: isHovered ? Infinity : 0,
              ease: "easeOut"
            }}
          />
        </motion.div>
      </div>
      
      <motion.div 
        className="flex items-center"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <ConnectWalletButton />
      </motion.div>
    </motion.div>
  );
};

export default Navbar;
