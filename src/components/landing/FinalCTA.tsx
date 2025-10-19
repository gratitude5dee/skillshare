import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

export const FinalCTA: React.FC = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-cyan-900/30"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ backgroundSize: '400% 400%' }}
        />
        
        {/* Floating particles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`cta-particle-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
        <motion.h2
          className="text-5xl md:text-7xl font-headline font-bold text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ready to Transform Your{' '}
          <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Workflow?
          </span>
        </motion.h2>

        <motion.p
          className="text-xl text-white/80 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Join 10,000+ teams automating with AI. Start free, no credit card required.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="gradient"
            size="xl"
            className="gap-3 group"
          >
            Start Free Trial
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </Button>
          <Button
            variant="outline"
            size="xl"
          >
            Schedule Demo
          </Button>
        </motion.div>

        {/* Trust Signals */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 mt-12 text-white/60"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { text: '14-day free trial' },
            { text: 'No credit card' },
            { text: 'Cancel anytime' },
          ].map((signal) => (
            <div key={signal.text} className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>{signal.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
