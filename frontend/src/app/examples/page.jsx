"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Code, ChevronRight, Copy, Terminal, Zap, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Prism } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function ExamplePage() {
  const [activeLanguage, setActiveLanguage] = useState("python");
  const [copied, setCopied] = useState(false);

  const codeExamples = {
    javascript: {
      source: `function calculateFibonacci(n) {
  let a = 0, b = 1, temp;
  const sequence = [a];
  
  while (n-- > 1) {
    temp = a;
    a = b;
    b = temp + b;
    sequence.push(a);
  }
  return sequence;
}`,
      translated: `def calculate_fibonacci(n):
    a, b = 0, 1
    sequence = [a]
    
    for _ in range(n - 1):
        a, b = b, a + b
        sequence.append(a)
    return sequence`
    },
    python: {
      source: `def process_data(data):
    return [item ** 2 for item in data if item % 2 == 0]`,
      translated: `function processData(data) {
  return data
    .filter(item => item % 2 === 0)
    .map(item => item ** 2);
}`
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Instant Translation",
      description: "Convert code between languages in milliseconds"
    },
    {
      icon: CheckCircle,
      title: "Accuracy Guarantee",
      description: "95% accuracy rate across all supported languages"
    },
    {
      icon: Clock,
      title: "Performance Optimized",
      description: "40% faster execution in translated code"
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
          <div className="text-center">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-1 rounded-full text-sm font-semibold tracking-wide mb-4"
            >
              LIVE EXAMPLES
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              See Our Compiler <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
                In Action
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-300 max-w-2xl mx-auto mb-12"
            >
              Explore real-world code translation examples across different programming languages
            </motion.p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="flex flex-wrap gap-4 justify-center">
          {Object.keys(codeExamples).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLanguage(lang)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeLanguage === lang
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {lang === "javascript" ? "JavaScript → Python" : "Python → JavaScript"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                <span className="font-mono text-sm">Source ({activeLanguage.toUpperCase()})</span>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(codeExamples[activeLanguage].source);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm">{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <Prism
              language={activeLanguage}
              style={vscDarkPlus}
              className="rounded-none p-6 text-sm"
            >
              {codeExamples[activeLanguage].source}
            </Prism>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-blue-500/30 shadow-xl shadow-blue-500/10 overflow-hidden">
            <div className="p-4 border-b border-blue-500/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-green-400" />
                <span className="font-mono text-sm">
                  Translated ({activeLanguage === "javascript" ? "Python" : "JavaScript"})
                </span>
              </div>
              <span className="text-sm text-green-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Verified
              </span>
            </div>
            <Prism
              language={activeLanguage === "javascript" ? "python" : "javascript"}
              style={vscDarkPlus}
              className="rounded-none p-6 text-sm"
            >
              {codeExamples[activeLanguage].translated}
            </Prism>
          </div>
        </motion.div>
      </div>

      <div className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2
                }
              }
            }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8"
              >
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-12 shadow-xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Code?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Start converting code between languages instantly with our AI-powered compiler
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
                href="/examples"
                className="border border-slate-700 text-slate-300 px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-800 transition-all"
              >
                View More Examples
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}