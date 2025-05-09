"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Twitter, Linkedin } from 'lucide-react';
import { 
  Code, 
  Languages, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle, 
  Terminal, 
  Share2, 
  Star, 
  Award, 
  Search, 
  Cpu, 
  Database, 
  Lock, 
  Heart,
  Github,
  Zap,
  BookOpen,
  Cloud,
  Globe,
  MessageSquare,
  Clock,
  FileCode,
  Settings,
  Users,
  Plus,
  MinusCircle
} from 'lucide-react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(0);
  const languages = ["JavaScript", "Python", "Rust", "Go", "TypeScript"];
  const [activeTab, setActiveTab] = useState('python');
  const [openFaq, setOpenFaq] = useState(null);

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

  const codeExamples = {
    javascript: `// JavaScript implementation
function calculateFibonacci(n) {
  if (n <= 1) return n;
  
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    let temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}`,
    python: `# Python implementation
def calculate_fibonacci(n):
    if n <= 1:
        return n
        
    a, b = 0, 1
    for i in range(2, n + 1):
        a, b = b, a + b
    return b`,
    rust: `// Rust implementation
fn calculate_fibonacci(n: u32) -> u32 {
    if n <= 1 {
        return n;
    }
    
    let (mut a, mut b) = (0, 1);
    for _ in 2..=n {
        let temp = a + b;
        a = b;
        b = temp;
    }
    b
}`
  };

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Developer at Company A",
      content: "FlexiLang saved our team weeks of work when migrating our codebase from JavaScript to TypeScript. The translations were so accurate we only had to make minor adjustments.",
      avatar: "/api/placeholder/40/40"
    },
    {
      name: "Michael Rodriguez",
      role: "Lead Engineer at Company B",
      content: "As someone who primarily codes in Python, being able to understand and convert JavaScript libraries instantly has been game-changing for my productivity.",
      avatar: "/api/placeholder/40/40"
    },
    {
      name: "Jamie Taylor",
      role: "Freelance Developer",
      content: "I use FlexiLang daily to learn new languages. The way it preserves the logic while teaching me idiomatic patterns is incredibly effective for expanding my skills.",
      avatar: "/api/placeholder/40/40"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      features: [
        "5 translations per day",
        "Up to 500 lines of code",
        "Access to 10 languages",
        "Basic optimization"
      ],
      cta: "Start Free",
      highlighted: false
    },
    {
      name: "Pro",
      price: "₹1000",
      period: "per month",
      features: [
        "Unlimited translations",
        "Up to 10,000 lines of code",
        "Access to all 20+ languages",
        "Advanced optimization",
        "API access",
        "Priority support"
      ],
      cta: "Get Pro",
      highlighted: true
    },
    {
      name: "Team",
      price: "₹4000",
      period: "per month",
      features: [
        "Everything in Pro",
        "Unlimited code length",
        "Collaborate with team members",
        "Version control integration",
        "Customized optimizations",
        "Dedicated support"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  const features = [
    {
      icon: <Terminal className="text-blue-400" />,
      bgColor: "bg-blue-500/20",
      title: "CLI Support",
      description: "Integrate FlexiLang directly into your workflow with our powerful command-line tool."
    },
    {
      icon: <Github className="text-green-400" />,
      bgColor: "bg-green-500/20",
      title: "GitHub Integration",
      description: "Connect your repositories and translate code files with a single click."
    },
    {
      icon: <Zap className="text-yellow-400" />,
      bgColor: "bg-yellow-500/20",
      title: "Instant Translation",
      description: "Get results in milliseconds, even for large codebases and complex logic."
    },
    {
      icon: <BookOpen className="text-purple-400" />,
      bgColor: "bg-purple-500/20",
      title: "Learning Mode",
      description: "See explanations alongside translations to understand language differences."
    },
    {
      icon: <Cloud className="text-sky-400" />,
      bgColor: "bg-sky-500/20",
      title: "Cloud Sync",
      description: "Access your translations history from any device with secure cloud storage."
    },
    {
      icon: <Globe className="text-indigo-400" />,
      bgColor: "bg-indigo-500/20",
      title: "Framework Support",
      description: "Translate between frameworks like React, Vue, Angular, Flask, Django and more."
    },
    {
      icon: <MessageSquare className="text-pink-400" />,
      bgColor: "bg-pink-500/20",
      title: "Code Assistance",
      description: "Get suggestions and explanations about code patterns in your target language."
    },
    {
      icon: <Clock className="text-amber-400" />,
      bgColor: "bg-amber-500/20",
      title: "Version History",
      description: "Track changes and compare different versions of your translations over time."
    },
    {
      icon: <FileCode className="text-emerald-400" />,
      bgColor: "bg-emerald-500/20",
      title: "Batch Processing",
      description: "Translate entire projects and directories with consistent naming conventions."
    }
  ];

  const faqs = [
    {
      question: "How accurate are the code translations?",
      answer: "FlexiLang achieves over 98% accuracy for most common programming patterns. Our AI model has been trained on millions of code samples across all supported languages to ensure idiomatic translations that preserve functionality. For edge cases or complex language-specific features, the system provides notes and alternative implementations."
    },
    {
      question: "Can FlexiLang translate entire projects?",
      answer: "Yes! With our Pro and Team plans, you can translate entire projects, maintaining folder structures, dependencies, and imports. The system intelligently handles cross-file references and adapts import statements to the target language's conventions. For large projects, we recommend our batch processing feature."
    },
    {
      question: "Which languages are supported in the free tier?",
      answer: "The free tier includes translation between JavaScript, Python, TypeScript, Java, C#, PHP, Ruby, Go, Rust, and Swift. Additional languages and frameworks are available on our paid plans. We're constantly adding support for more languages based on user feedback."
    },
    {
      question: "How does the optimization feature work?",
      answer: "When enabled, FlexiLang not only translates your code but also suggests optimizations based on the target language's best practices and performance characteristics. This includes refactoring loops, using language-specific data structures, and applying idiomatic patterns to make your code not just functional but efficient in the new language."
    },
    {
      question: "Can I integrate FlexiLang into my CI/CD pipeline?",
      answer: "Absolutely! Our API and CLI tools are designed for seamless integration into development workflows. Team plan users get access to our GitHub Action, CircleCI Orb, and Jenkins plugin for automated translations during your build process. Custom integration support is available for enterprise customers."
    },
    {
      question: "Is my code secure when using FlexiLang?",
      answer: "We take security seriously. Your code is encrypted in transit and at rest, processed in isolated environments, and automatically purged after processing unless you explicitly save it to your account. We never use your code to train our models without explicit permission, and our enterprise plan offers private cloud deployment options."
    }
  ];

  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
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

      <div className="flex flex-col items-center justify-center px-4 py-20 z-10 relative">
        <motion.div 
          className="max-w-4xl text-center space-y-8"
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
          
          <motion.div variants={itemVariants} className="mt-16 pt-4 opacity-80">
            <p className="text-sm text-slate-400">Trusted by engineers at</p>
            <div className="flex flex-wrap justify-center items-center gap-6 mt-4">
              <span className="text-slate-400 font-semibold">Company A</span>
              <span className="text-slate-400 font-semibold">Company B</span>
              <span className="text-slate-400 font-semibold">Company C</span>
              <span className="text-slate-400 font-semibold">Company D</span>
              <span className="text-slate-400 font-semibold">Company E</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <section id="examples" className="py-20 px-4 md:px-8 lg:px-16 relative z-10 bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See The Magic In Action</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              FlexiLang preserves logic and functionality while translating to idiomatic code in your target language.
            </p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="flex border-b border-slate-700/50">
              <button 
                onClick={() => setActiveTab('javascript')}
                className={`px-6 py-4 font-medium text-sm flex-1 sm:flex-none ${activeTab === 'javascript' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500' : 'text-slate-300 hover:bg-slate-700/30'}`}
              >
                JavaScript
              </button>
              <button 
                onClick={() => setActiveTab('python')}
                className={`px-6 py-4 font-medium text-sm flex-1 sm:flex-none ${activeTab === 'python' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500' : 'text-slate-300 hover:bg-slate-700/30'}`}
              >
                Python
              </button>
              <button 
                onClick={() => setActiveTab('rust')}
                className={`px-6 py-4 font-medium text-sm flex-1 sm:flex-none ${activeTab === 'rust' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500' : 'text-slate-300 hover:bg-slate-700/30'}`}
              >
                Rust
              </button>
            </div>
            <div className="p-6 font-mono text-sm md:text-base overflow-x-auto">
              <pre className="text-slate-300">
                {codeExamples[activeTab]}
              </pre>
            </div>
          </div>

          <div className="mt-10 text-center">
            <a href="/translate" className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium">
              Try more examples in our playground
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 md:px-8, lg:px-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              FlexiLang is more than just a translator. It's an intelligent assistant for cross-language development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300">
                <div className={`${feature.bgColor} p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8 lg:px-16 relative z-10 bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Developers Say</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Join thousands of developers who are boosting their productivity with FlexiLang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-800/40 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/20 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full mr-4" />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-300">{testimonial.content}</p>
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8 lg:px-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              FlexiLang makes it incredibly simple to translate code between languages in just three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
            <div className="bg-slate-800/40 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 relative">
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl">1</div>
              <div className="mb-4">
                <FileCode className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Input Your Code</h3>
              <p className="text-slate-300">Paste your code or upload files directly from your computer or GitHub repository.</p>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 relative">
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xl">2</div>
              <div className="mb-4">
                <Settings className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Select Options</h3>
              <p className="text-slate-300">Choose your target language and customize optimization settings to fit your needs.</p>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 relative">
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center font-bold text-xl">3</div>
              <div className="mb-4">
                <Code className="w-10 h-10 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Get Translated Code</h3>
              <p className="text-slate-300">Instantly receive your translated code with explanations and optimization notes.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 md:px-8 lg:px-16 relative z-10 bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Choose the plan that fits your needs. All plans include core translation features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-slate-800/40 backdrop-blur-sm p-8 rounded-2xl border transition-all duration-300 relative 
                  ${plan.highlighted 
                    ? 'border-blue-500/50 hover:border-blue-500 shadow-lg shadow-blue-500/10' 
                    : 'border-slate-700/50 hover:border-slate-600'}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                
                <div className="flex items-baseline mt-4 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-slate-400 ml-2">{plan.period}</span>}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                    plan.highlighted 
                      ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white' 
                      : 'bg-slate-700/50 hover:bg-slate-700 text-white border border-slate-600'
                  }`}
                >
                  {plan.cta}
                </button>
                </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-2">Need a custom solution?</h3>
            <p className="text-slate-300 mb-4">Get in touch with our team for enterprise pricing and custom integrations.</p>
            <a href="/enterprise" className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium">
              Learn about Enterprise solutions
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-4 md:px-8 lg:px-16 relative z-10 bg-slate-900/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Get answers to common questions about FlexiLang.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-6 hover:bg-slate-700/10 transition-all"
                >
                  <h3 className="text-lg font-semibold text-left">{faq.question}</h3>
                  {openFaq === index ? (
                    <MinusCircle className="h-6 w-6 text-blue-400" />
                  ) : (
                    <Plus className="h-6 w-6 text-blue-400" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="p-6 pt-0 border-t border-slate-700/50">
                    <p className="text-slate-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}