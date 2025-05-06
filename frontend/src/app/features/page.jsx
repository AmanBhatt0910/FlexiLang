"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Code, 
  Languages, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  Zap, 
  BarChart3, 
  GitBranch, 
  Network, 
  Lock, 
  Lightbulb, 
  Cpu, 
  Cloud, 
  RefreshCw,
  Terminal,
  GraduationCap,
  BookOpen,
  Check
} from "lucide-react";

export default function FeaturesPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("translate");
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
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

  const tabContent = {
    translate: {
      title: "Intelligent Translation",
      description: "Our translation engine goes beyond simple syntax conversion, providing context-aware transformations that preserve the intent and logic of your code.",
      image: "/api/placeholder/680/400",
      features: [
        "Preserves variable naming conventions",
        "Maintains code structure and organization",
        "Handles complex logic patterns",
        "Converts language-specific idioms appropriately"
      ]
    },
    optimize: {
      title: "Performance Optimization",
      description: "Get more than just translations - our engine analyzes your code to suggest performance improvements specific to the target language.",
      image: "/api/placeholder/680/400",
      features: [
        "Language-specific optimizations",
        "Identifies performance bottlenecks",
        "Suggests memory usage improvements",
        "Recommends idiomatic patterns"
      ]
    },
    integrate: {
      title: "Seamless Integration",
      description: "Integrate our compiler into your existing development workflow with support for all major version control systems and CI/CD pipelines.",
      image: "/api/placeholder/680/400",
      features: [
        "GitHub and GitLab integration",
        "CI/CD pipeline compatibility",
        "Webhooks for automated translation",
        "IDE plugins for Visual Studio Code and JetBrains"
      ]
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
      <div className="relative pt-24 pb-32 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-5"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-5"></div>
        </div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {isLoaded && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 50, x: '5vw' }} 
                animate={{ opacity: 0.1, y: -50, x: '10vw' }}
                transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
                className="absolute text-5xl"
              >
                {"{ }"}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: -30, x: '80vw' }} 
                animate={{ opacity: 0.1, y: 80, x: '70vw' }}
                transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
                className="absolute text-6xl"
              >
                {"</>"}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 100, x: '50vw' }} 
                animate={{ opacity: 0.05, y: -100, x: '40vw' }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                className="absolute text-7xl"
              >
                {"=>"}
              </motion.div>
            </>
          )}
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            className="text-center"
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.span 
              variants={itemVariants} 
              className="inline-block bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-1 rounded-full text-sm font-semibold tracking-wide mb-4"
            >
              POWERFUL FEATURES
            </motion.span>
            
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              Transform Your Code<br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
                Between Any Languages
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants} 
              className="text-xl text-slate-300 max-w-2xl mx-auto mb-12"
            >
              Discover all the powerful capabilities of our multi-language cross compiler
              that make code translation fast, accurate, and intelligent.
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="py-20 px-4 bg-slate-900/50 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Key Features That Make Us <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Different</span>
            </h2>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 transition-all hover:border-blue-500/30"
            >
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                <Languages className="text-blue-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">20+ Languages</h3>
              <p className="text-slate-300">
                Support for all major programming languages including JavaScript, Python, 
                Rust, Go, Java, C++, TypeScript, and many more.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 transition-all hover:border-purple-500/30"
            >
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                <Sparkles className="text-purple-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Powered</h3>
              <p className="text-slate-300">
                Advanced machine learning models that understand code context, 
                semantics, and idiomatic patterns specific to each language.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 transition-all hover:border-pink-500/30"
            >
              <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                <Zap className="text-pink-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-slate-300">
                Process thousands of lines of code in seconds with our parallel 
                processing engine and optimized translation algorithms.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Explore</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-12">
              How Our Compiler <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Works</span>
            </h2>
            
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <button 
                onClick={() => setActiveTab("translate")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "translate" 
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white" 
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Translation Engine
              </button>
              <button 
                onClick={() => setActiveTab("optimize")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "optimize" 
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white" 
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Optimization
              </button>
              <button 
                onClick={() => setActiveTab("integrate")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "integrate" 
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white" 
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Integration
              </button>
            </div>
          </div>
          
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {tabContent[activeTab].title}
              </h3>
              <p className="text-lg text-slate-300 mb-8">
                {tabContent[activeTab].description}
              </p>
              <ul className="space-y-4">
                {tabContent[activeTab].features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-gradient-to-r from-blue-500 to-violet-500 rounded-full p-1 mr-3 mt-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-200">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <a
                  href="/docs"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium"
                >
                  Learn more about this feature
                  <ChevronRight className="ml-1 h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="order-1 lg:order-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
              <img 
                src={tabContent[activeTab].image} 
                alt={tabContent[activeTab].title}
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Comprehensive Features</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Everything You Need For <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Code Translation</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto mt-4">
              Our compiler goes beyond simple translation, providing a complete suite of tools 
              to make cross-language development seamless and efficient.
            </p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div 
              variants={itemVariants}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/30 transition-all"
            >
              <div className="bg-blue-500/10 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                <GitBranch className="text-blue-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Version Control</h3>
              <p className="text-slate-300">
                Seamlessly integrate with Git and other version control systems, with support for 
                branch-specific translations and conflict resolution.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-purple-500/30 transition-all"
            >
              <div className="bg-purple-500/10 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Network className="text-purple-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">API Access</h3>
              <p className="text-slate-300">
                Full-featured REST API for programmatic access to our translation engine, 
                with comprehensive documentation and client libraries.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-pink-500/30 transition-all"
            >
              <div className="bg-pink-500/10 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Lock className="text-pink-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Processing</h3>
              <p className="text-slate-300">
                End-to-end encryption for all code submissions, with optional private instances 
                for enterprise customers with sensitive intellectual property.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-green-500/30 transition-all"
            >
              <div className="bg-green-500/10 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="text-green-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Performance Metrics</h3>
              <p className="text-slate-300">
                Detailed analytics on code performance before and after translation, with 
                suggestions for optimization in the target language.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-yellow-500/30 transition-all"
            >
              <div className="bg-yellow-500/10 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Lightbulb className="text-yellow-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Recommendations</h3>
              <p className="text-slate-300">
                Intelligent suggestions for language-specific patterns and libraries that 
                better match your code's functionality and intent.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-indigo-500/30 transition-all"
            >
              <div className="bg-indigo-500/10 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Cpu className="text-indigo-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Batch Processing</h3>
              <p className="text-slate-300">
                Convert entire projects or repositories at once with our powerful batch 
                processing engine, which maintains project structure and dependencies.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-red-500/30 transition-all"
            >
              <div className="bg-red-500/10 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Terminal className="text-red-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">CLI Tool</h3>
              <p className="text-slate-300">
                Powerful command-line interface for integration with existing build systems 
                and automation workflows, with comprehensive scripting support.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/30 transition-all"
            >
              <div className="bg-blue-500/10 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Cloud className="text-blue-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cloud Deployment</h3>
              <p className="text-slate-300">
                Deploy your translated code directly to cloud platforms with our built-in 
                integration with AWS, Azure, GCP, and more.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-purple-500/30 transition-all"
            >
              <div className="bg-purple-500/10 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                <RefreshCw className="text-purple-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Continuous Updates</h3>
              <p className="text-slate-300">
                Our models are continuously trained on the latest language features and 
                frameworks, ensuring cutting-edge translation capabilities.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Comprehensive Coverage</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Supported <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Languages</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto mt-4">
              Our compiler supports all major programming languages and continues to expand with new additions.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "JavaScript", icon: "JS", color: "bg-yellow-400" },
              { name: "Python", icon: "PY", color: "bg-blue-400" },
              { name: "TypeScript", icon: "TS", color: "bg-blue-600" },
              { name: "Ruby", icon: "RB", color: "bg-red-500" },
              { name: "Go", icon: "GO", color: "bg-cyan-500" },
              { name: "Rust", icon: "RS", color: "bg-orange-600" },
              { name: "Java", icon: "JV", color: "bg-red-600" },
              { name: "C++", icon: "C++", color: "bg-blue-800" },
              { name: "C#", icon: "C#", color: "bg-green-600" },
              { name: "PHP", icon: "PHP", color: "bg-indigo-600" },
              { name: "Swift", icon: "SW", color: "bg-orange-500" },
              { name: "Kotlin", icon: "KT", color: "bg-purple-600" }
            ].map((lang, i) => (
              <motion.div
                key={lang.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 flex items-center hover:border-blue-500/30 transition-all"
              >
                <div className={`${lang.color} w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-white mr-3`}>
                  {lang.icon}
                </div>
                <span className="font-medium">{lang.name}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <a
              href="/languages"
              className="inline-flex items-center justify-center bg-slate-800 border border-slate-700 px-6 py-3 rounded-xl text-base font-medium hover:bg-slate-700 transition-all"
            >
              <span>View All Supported Languages</span>
              <ChevronRight className="ml-1 h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Resources</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Learn How To <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Get Started</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto mt-4">
              Comprehensive resources to help you make the most of our multi-language cross compiler.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/30 transition-all"
            >
              <div className="bg-blue-500/10 rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                <BookOpen className="text-blue-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Documentation</h3>
              <p className="text-slate-300 mb-6">
                Comprehensive guides, API references, and examples to help you get started quickly.
              </p>
              <a
                href="/docs"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium"
              >
                Browse Documentation
                <ChevronRight className="ml-1 h-5 w-5" />
              </a>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-purple-500/30 transition-all"
            >
              <div className="bg-purple-500/10 rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                <GraduationCap className="text-purple-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Tutorials</h3>
              <p className="text-slate-300 mb-6">
                Step-by-step tutorials for common use cases and advanced features of our compiler.
              </p>
              <a
                href="/tutorials"
                className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium"
              >
                View Tutorials
                <ChevronRight className="ml-1 h-5 w-5" />
              </a>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-pink-500/30 transition-all"
            >
              <div className="bg-pink-500/10 rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                <Code className="text-pink-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Code Samples</h3>
              <p className="text-slate-300 mb-6">
                Explore example translations across different language pairs and complexity levels.
              </p>
              <a
                href="/examples"
                className="inline-flex items-center text-pink-400 hover:text-pink-300 font-medium"
              >
                Explore Examples
                <ChevronRight className="ml-1 h-5 w-5" />
              </a>
              </motion.div>
          </div>
        </div>
      </div>

      <div className="py-24 px-4 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Development Workflow?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Start using the most powerful multi-language compiler today. Convert code between 
              languages in seconds while maintaining quality and performance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/signup"
                className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-500 hover:to-violet-500 transition-all flex items-center justify-center"
              >
                <span>Get Started Free</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="/demo"
                className="border border-slate-700 text-slate-300 px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-800 transition-all"
              >
                Watch Demo Video
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}