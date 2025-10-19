import { motion } from "framer-motion";

export const SocialProofBar: React.FC = () => {
  const stats = [
    { number: 50, label: 'Workflows Created', suffix: 'K+' },
    { number: 10, label: 'Active Teams', suffix: 'K+' },
    { number: 98, label: 'Time Saved', suffix: '%' },
  ];

  const logos = Array(12).fill(null); // Placeholder for client logos

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
      
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <motion.div
                className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2"
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.2, type: "spring", stiffness: 200 }}
              >
                {stat.number}{stat.suffix}
              </motion.div>
              <p className="text-white/70 text-sm uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Client Logos Marquee */}
        <div className="relative overflow-hidden">
          <div className="flex gap-16 items-center animate-marquee">
            {logos.map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-32 h-16 bg-white/5 rounded-lg flex items-center justify-center grayscale hover:grayscale-0 transition-all"
              >
                <span className="text-white/30 text-xs">Logo {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
