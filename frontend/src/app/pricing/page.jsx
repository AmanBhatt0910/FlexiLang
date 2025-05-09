"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Sparkles, Rocket, Cloud, Server, CreditCard, Globe, Lock, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [activeTier, setActiveTier] = useState("pro");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const pricingTiers = [
    {
      name: "Starter",
      price: billingCycle === "monthly" ? "₹1000" : "₹9000",
      description: "Perfect for individual developers & small projects",
      features: [
        "5 projects/month",
        "10,000 code lines/month",
        "3 target languages",
        "Basic optimizations",
        "Email support",
        "Community access"
      ],
      recommended: false
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? "₹4000" : "₹35000",
      description: "For professional developers & growing teams",
      features: [
        "20 projects/month",
        "50,000 code lines/month",
        "10 target languages",
        "Advanced optimizations",
        "Priority support",
        "CI/CD integration",
        "Team management"
      ],
      recommended: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for large organizations",
      features: [
        "Unlimited projects",
        "Unlimited code lines",
        "All languages",
        "Dedicated support",
        "SLA guarantees",
        "On-premise options",
        "Custom integrations",
        "Security audit"
      ],
      recommended: false
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
      <div className="relative pt-24 pb-32 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-5"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-5"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.span 
              variants={itemVariants}
              className="inline-block bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-1 rounded-full text-sm font-semibold tracking-wide mb-4"
            >
              SIMPLE PRICING
            </motion.span>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              Pricing Built for <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
                Every Team Size
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-slate-300 max-w-2xl mx-auto mb-12"
            >
              Choose the perfect plan for your development needs. Scale seamlessly as your team grows.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-center gap-4 mb-16"
            >
              <span className={`font-medium ${billingCycle === "monthly" ? "text-blue-400" : "text-slate-400"}`}>
                Monthly
              </span>
              <button 
                onClick={() => setBillingCycle(prev => prev === "monthly" ? "annual" : "monthly")}
                className="w-14 h-8 bg-slate-800 rounded-full p-1"
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-transform ${
                  billingCycle === "annual" ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
              <span className={`font-medium ${billingCycle === "annual" ? "text-blue-400" : "text-slate-400"}`}>
                Annual (2 months free)
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {pricingTiers.map((tier, index) => (
              <motion.div 
                key={tier.name}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border p-8 transition-all ${
                  tier.recommended 
                    ? "border-blue-500/30 shadow-xl shadow-blue-500/10" 
                    : "border-slate-700/50 hover:border-slate-600/50"
                }`}
              >
                {tier.recommended && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-1 rounded-full text-sm">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg ${
                      tier.recommended 
                        ? "bg-gradient-to-r from-blue-500 to-violet-500" 
                        : "bg-slate-700"
                    }`}>
                      {index === 0 ? <Zap className="w-6 h-6" /> :
                       index === 1 ? <Sparkles className="w-6 h-6" /> :
                       <Rocket className="w-6 h-6" />}
                    </div>
                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                  </div>
                  <p className="text-slate-300 mb-6">{tier.description}</p>
                  
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-4xl font-bold">
                      {typeof tier.price === "string" ? tier.price : `$${tier.price}`}
                    </span>
                    {typeof tier.price !== "string" && (
                      <span className="text-slate-400">/month</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setActiveTier(tier.name.toLowerCase())}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    tier.recommended
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {tier.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Full Feature <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Comparison</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Detailed breakdown of what's included in each plan to help you choose the right one
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left pb-8">Feature</th>
                  <th className="text-center pb-8">Starter</th>
                  <th className="text-center pb-8">Pro</th>
                  <th className="text-center pb-8">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Code Translation", "✓", "✓", "✓"],
                  ["AI Optimizations", "Basic", "Advanced", "Premium"],
                  ["Support", "Email", "24/7 Priority", "Dedicated"],
                  ["Languages", "3", "10", "Unlimited"],
                  ["Team Members", "1", "10", "Unlimited"],
                  ["CI/CD Integration", "✗", "✓", "✓"],
                  ["SLA Guarantee", "✗", "✗", "✓"],
                  ["Security Audit", "✗", "✗", "✓"],
                ].map(([feature, ...plans], index) => (
                  <tr key={feature} className={index % 2 === 0 ? "bg-slate-800/20" : ""}>
                    <td className="p-4">{feature}</td>
                    {plans.map((plan, i) => (
                      <td key={i} className="text-center p-4">
                        {plan === "✓" ? <Check className="w-5 h-5 text-green-400 mx-auto" /> :
                         plan === "✗" ? <span className="text-red-400">✗</span> : plan}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Questions</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "Can I change plans later?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. We'll prorate the difference."
              },
              {
                question: "Do you offer team discounts?",
                answer: "Yes! Contact our sales team for custom pricing for teams larger than 10 members."
              },
              {
                question: "What payment methods do you accept?",
                answer: "All major credit cards (Visa, Mastercard, Amex) and PayPal."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes! All plans come with a 14-day free trial. No credit card required."
              }
            ].map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"
              >
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-slate-300">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-24 px-4 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Code?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of developers already using our multi-language compiler
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/signup"
                className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-500 hover:to-violet-500 transition-all flex items-center justify-center"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="/contact"
                className="border border-slate-700 text-slate-300 px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-800 transition-all"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}