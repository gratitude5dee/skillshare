import { motion } from "framer-motion";
import { Lock, Zap, Plug, BarChart3 } from "lucide-react";

export const BentoFeatures: React.FC = () => {
  const smallFeatures = [
    { icon: Lock, title: 'Enterprise Security', desc: 'SOC 2 Type II certified', delay: 0.2 },
    { icon: Zap, title: 'Lightning Fast', desc: 'Sub-second response times', delay: 0.3 },
    { icon: Plug, title: 'Easy Integration', desc: '100+ app connectors', delay: 0.4 },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track performance metrics', delay: 0.5 },
  ];

  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-20">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[300px] gap-6">
          {/* Large Feature (2x2) - AI Analysis */}
          <motion.div
            className="md:col-span-2 md:row-span-2 group relative rounded-3xl overflow-hidden border-2 border-transparent hover:border-purple-500/50 transition-all duration-500"
            style={{
              background: 'linear-gradient(#141B34, #141B34) padding-box, linear-gradient(135deg, #8B5CF6, #00D9FF) border-box',
            }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative h-full p-8 flex flex-col">
              {/* Visual */}
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-cyan-900/20 mb-6">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-cyan-600/30"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 2, 0],
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  AI-Powered Analysis
                </h3>
                <p className="text-white/70 mb-4">
                  Advanced computer vision detects every action, click, and input with 99.8% accuracy
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                  Explore AI Engine
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Medium Feature (2x1) - Real-time Processing */}
          <motion.div
            className="md:col-span-2 md:row-span-1 group rounded-3xl overflow-hidden border border-white/8 hover:border-purple-500/30 transition-all duration-500 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="p-8 h-full flex items-center gap-6">
              <div className="flex-1">
                <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  3.2s
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Real-time Processing
                </h3>
                <p className="text-white/70">
                  Generate workflows in <strong>seconds</strong>, not hours
                </p>
              </div>
            </div>
          </motion.div>

          {/* Small Features (1x1) */}
          {smallFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="group rounded-3xl overflow-hidden border border-white/8 hover:border-cyan-500/30 transition-all duration-500 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl"
                whileHover={{ scale: 1.05, y: -4 }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
              >
                <div className="p-8 h-full flex flex-col justify-center items-center text-center">
                  <div className="w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-xl">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-white/60">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
