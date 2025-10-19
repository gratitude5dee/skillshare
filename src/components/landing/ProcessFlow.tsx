import { motion } from "framer-motion";
import { Video, Cloud, Zap } from "lucide-react";

export const ProcessFlow: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Record',
      description: 'Capture any process on your screen with our intelligent recorder. Works with any application.',
      features: ['One-click recording', 'Multi-app support', 'Secure & private'],
      icon: Video,
      delay: 0,
    },
    {
      number: '02',
      title: 'Upload',
      description: 'Send your recording to our AI for instant analysis. Processing happens in the cloud.',
      features: ['Automatic analysis', 'Cloud processing', 'Real-time progress'],
      icon: Cloud,
      delay: 0.2,
    },
    {
      number: '03',
      title: 'Generate',
      description: 'Get production-ready workflows with detected actions, UI elements, and automation scripts.',
      features: ['Export code', 'Multiple formats', 'Integration ready'],
      icon: Zap,
      delay: 0.4,
    },
  ];

  return (
    <section id="how-it-works" className="py-32 relative">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            className="text-5xl font-headline font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="text-xl text-white/70"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Three simple steps to automate any workflow
          </motion.p>
        </div>

        {/* Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: step.delay, duration: 0.6 }}
              >
                {/* Card */}
                <div
                  className="relative h-full p-12 rounded-3xl border border-white/8 transition-all duration-500 overflow-hidden hover:border-purple-500/30 hover:-translate-y-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Gradient glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: 'radial-gradient(600px circle at 50% 50%, rgba(139, 92, 246, 0.15), transparent 40%)',
                    }}
                  />

                  {/* Step Number Badge */}
                  <div className="absolute top-8 left-8 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-24 h-24 mx-auto mb-8 mt-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
                    <Icon className="w-12 h-12 text-white" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-semibold text-white mb-4 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {step.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed mb-6 text-base">
                      {step.description}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-3">
                      {step.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-white/60">
                          <svg className="w-5 h-5 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <a
                      href="#"
                      className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mt-6"
                    >
                      Learn more
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>

                  {/* Hover Border Glow */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                       style={{
                         boxShadow: '0 20px 60px rgba(139, 92, 246, 0.2)'
                       }}
                  />
                </div>

                {/* Connection Line (not on last card) */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden md:block absolute top-1/2 left-full w-8 h-0.5 transform -translate-y-1/2 z-0"
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 0.5 }}
                    viewport={{ once: true }}
                    transition={{ delay: step.delay + 0.5, duration: 0.8 }}
                    style={{
                      background: 'linear-gradient(90deg, #8B5CF6, #00D9FF)',
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
