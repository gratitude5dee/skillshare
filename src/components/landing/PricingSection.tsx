import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export const PricingSection: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for individuals',
      price: { monthly: 29, annual: 23 },
      features: [
        '100 recordings/month',
        'Basic AI analysis',
        '10 team members',
        'Email support',
      ],
      excluded: ['Advanced integrations', 'Priority support'],
      cta: 'Get Started',
      featured: false,
    },
    {
      name: 'Pro',
      description: 'For growing teams',
      price: { monthly: 99, annual: 79 },
      features: [
        'Unlimited recordings',
        'Advanced AI analysis',
        'Unlimited team members',
        'Advanced integrations',
        'Priority support',
        'Custom workflows',
      ],
      excluded: [],
      cta: 'Start Free Trial',
      featured: true,
    },
    {
      name: 'Enterprise',
      description: 'Custom solution',
      price: null,
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom AI training',
        'SLA guarantees',
        'On-premise deployment',
      ],
      excluded: [],
      cta: 'Contact Sales',
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-32 relative">
      <div className="max-w-[1200px] mx-auto px-8 lg:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-5xl font-headline font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            className="text-xl text-white/70 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Choose the plan that fits your needs
          </motion.p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-2 bg-white/5 rounded-full backdrop-blur-xl border border-white/10">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                'px-6 py-2 rounded-full transition-all duration-300',
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                  : 'text-white/60 hover:text-white'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={cn(
                'px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2',
                billingPeriod === 'annual'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                  : 'text-white/60 hover:text-white'
              )}
            >
              Annual
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={cn(
                'relative rounded-3xl overflow-hidden transition-all duration-500',
                plan.featured
                  ? 'md:scale-105 border-2'
                  : 'border border-white/8'
              )}
              style={
                plan.featured
                  ? {
                      background: 'linear-gradient(#141B34, #141B34) padding-box, linear-gradient(135deg, #8B5CF6, #00D9FF) border-box',
                      borderColor: 'transparent',
                      boxShadow: '0 40px 80px rgba(139, 92, 246, 0.3), 0 0 100px rgba(139, 92, 246, 0.2)',
                    }
                  : {
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                    }
              }
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: plan.featured ? 0 : -8 }}
            >
              {plan.featured && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="p-8 backdrop-blur-xl">
                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/60">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  {plan.price ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl text-white/80">$</span>
                        <span className="text-6xl font-bold text-white">
                          {plan.price[billingPeriod]}
                        </span>
                        <span className="text-white/60">/month</span>
                      </div>
                      {billingPeriod === 'annual' && (
                        <p className="text-sm text-green-400 mt-2">
                          Save ${(plan.price.monthly - plan.price.annual) * 12}/year
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-4xl font-bold text-white">Custom</div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-white/80">
                      <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.excluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-white/30">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.featured ? 'gradient' : 'outline'}
                  size="lg"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Signals */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 mt-16 text-white/60 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {['14-day free trial', 'No credit card required', 'Cancel anytime'].map((signal) => (
            <div key={signal} className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              {signal}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
