import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import geminiLogo from "@/assets/gemini-logo.png";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide logic
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setHidden(true); // Scrolling down
      } else {
        setHidden(false); // Scrolling up
      }
      
      setIsScrolled(currentScrollY > 50);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "backdrop-filter backdrop-blur-xl bg-[rgba(5,8,22,0.7)]",
        "border-b border-white/6",
        isScrolled && "shadow-lg"
      )}
      initial={{ y: 0 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-[1920px] mx-auto px-16 max-md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <img src={geminiLogo} alt="WZRD.work" className="w-10 h-10" />
            <span className="text-xl font-headline font-bold text-white">
              WZRD.work
            </span>
          </motion.a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
            {['Features', 'How It Works', 'Pricing'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                className="relative text-white/80 hover:text-white text-base font-medium transition-colors"
                whileHover="hover"
              >
                {item}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400"
                  variants={{
                    hover: { scaleX: 1, opacity: 1 },
                  }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            variant="gradient"
            size="default"
            className="h-11 px-6"
            onClick={() => navigate("/auth")}
          >
            Start Free Trial
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
