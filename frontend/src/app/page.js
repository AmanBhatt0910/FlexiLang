"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Languages, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(0);
  const languages = ["JavaScript", "Python", "Rust", "Go", "TypeScript"];

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentLanguage((prev) => (prev + 1) % languages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden px-4 relative py-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-pink-500 rounded-full filter blur-3xl opacity-5"></div>
      </div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isLoaded && (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 100, x: '10vw' }} 
              animate={{ opacity: 0.1, y: -100, x: '15vw' }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
              className="absolute text-2xl"
            >
              {"{"}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: -50, x: '70vw' }} 
              animate={{ opacity: 0.1, y: 150, x: '65vw' }}
              transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
              className="absolute text-3xl"
            >
              {"</>"}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 200, x: '30vw' }} 
              animate={{ opacity: 0.1, y: 0, x: '25vw' }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
              className="absolute text-4xl"
            >
              {"#"}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 100, x: '80vw' }} 
              animate={{ opacity: 0.1, y: -200, x: '85vw' }}
              transition={{ duration: 17, repeat: Infinity, repeatType: "reverse" }}
              className="absolute text-3xl"
            >
              {"()"}
            </motion.div>
          </>
        )}
      </div>

      <motion.div 
        className="max-w-4xl text-center space-y-8 z-10 relative"
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex items-center justify-center space-x-2 mb-2">
          <span className="px-3 py-1 bg-blue-600 text-xs rounded-full font-semibold tracking-wide">BETA</span>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
          <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Flexi</span>
          <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">Lang</span>
        </motion.h1>
        
        <motion.div variants={itemVariants} className="h-12">
          <div className="text-xl md:text-2xl font-medium text-slate-300 flex items-center justify-center">
            Translate 
            <motion.span
              key={currentLanguage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mx-2 text-white font-bold relative"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                {languages[currentLanguage]}
              </span>
            </motion.span>
            to any language instantly
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 group">
            <div className="bg-blue-500/20 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-all">
              <Code className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Translation</h3>
            <p className="text-slate-300">Context-aware code translation preserving logic and patterns</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 group">
            <div className="bg-purple-500/20 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-all">
              <Languages className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">20+ Languages</h3>
            <p className="text-slate-300">From JavaScript to Python, Rust, Go and many more</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-pink-500/30 transition-all duration-300 group">
            <div className="bg-pink-500/20 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition-all">
              <Sparkles className="text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Optimized</h3>
            <p className="text-slate-300">Get not just translations, but idiomatic code improvements</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
          <a
            href="/translate"
            className="group w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-500 hover:to-violet-500 transition shadow-xl hover:shadow-blue-500/20 hover:scale-105 transform transition-all duration-200"
          >
            <span>Get Started Free</span>
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
          
          <a
            href="/examples"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-700/50 hover:border-slate-600 transition-all"
          >
            <span>See Examples</span>
            <ChevronRight className="ml-1 h-5 w-5" />
          </a>
        </motion.div>
        
        {/* <motion.div variants={itemVariants} className="mt-16 pt-4 opacity-80">
          <p className="text-sm text-slate-400">Trusted by engineers at</p>
          <div className="flex flex-wrap justify-center items-center gap-6 mt-4">
            <span className="text-slate-400 font-semibold">Google</span>
            <span className="text-slate-400 font-semibold">Microsoft</span>
            <span className="text-slate-400 font-semibold">Amazon</span>
            <span className="text-slate-400 font-semibold">Meta</span>
            <span className="text-slate-400 font-semibold">Netflix</span>
          </div>
        </motion.div> */}
      </motion.div>
    </div>
  );
}