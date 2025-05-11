"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Zap, Search, ChevronDown, Copy, Check, MessageCircle, Languages, Sparkles, Monitor, Shield, Menu, X } from "lucide-react";
import { Prism } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [openSections, setOpenSections] = useState({
    gettingStarted: true,
    features: false,
    languages: true
  });
  const [copiedCode, setCopiedCode] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const webExample = `// Example JavaScript input
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Translated to Python
def greet(name):
    return f"Hello, {name}!"`;

  const supportedLanguages = [
    { name: "JavaScript", icon: "JS", versions: ["ES6+"] },
    { name: "Python", icon: "PY", versions: ["3.9+"] },
    { name: "TypeScript", icon: "TS", versions: ["4.0+"] },
    { name: "Rust", icon: "RS", versions: ["2021 Edition"] },
    { name: "Go", icon: "GO", versions: ["1.18+"] },
    { name: "Java", icon: "JV", versions: ["17+"] },
    { name: "C++", icon: "C++", versions: ["C++20"] },
  ];

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (isMobile) setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden h-full flex flex-col">
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-700">
        <h2 className="font-medium text-white">Documentation</h2>
        <p className="text-xs text-slate-400">Web Compiler v2.4.0</p>
      </div>
      
      <div className="p-2 flex-1 overflow-y-auto">
        <div className="mb-1">
          <button
            onClick={() => toggleSection('gettingStarted')}
            className="w-full flex items-center justify-between p-2 rounded text-left hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="font-medium">Getting Started</span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-slate-400 transition-transform ${openSections.gettingStarted ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {openSections.gettingStarted && (
            <div className="ml-6 mt-1 space-y-1">
              <button
                onClick={() => handleSectionChange('quick-start')}
                className={`w-full text-left p-2 text-sm rounded ${
                  activeSection === 'quick-start' 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'hover:bg-slate-700/50 text-slate-300'
                }`}
              >
                Web Interface Guide
              </button>
              <button
                onClick={() => handleSectionChange('security')}
                className={`w-full text-left p-2 text-sm rounded ${
                  activeSection === 'security' 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'hover:bg-slate-700/50 text-slate-300'
                }`}
              >
                Security & Privacy
              </button>
            </div>
          )}
        </div>
        
        <div className="mb-1">
          <button
            onClick={() => toggleSection('features')}
            className="w-full flex items-center justify-between p-2 rounded text-left hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="font-medium">Features</span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-slate-400 transition-transform ${openSections.features ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {openSections.features && (
            <div className="ml-6 mt-1 space-y-1">
              <button
                onClick={() => handleSectionChange('realtime')}
                className={`w-full text-left p-2 text-sm rounded ${
                  activeSection === 'realtime' 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'hover:bg-slate-700/50 text-slate-300'
                }`}
              >
                Real-time Translation
              </button>
              <button
                onClick={() => handleSectionChange('batch')}
                className={`w-full text-left p-2 text-sm rounded ${
                  activeSection === 'batch' 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'hover:bg-slate-700/50 text-slate-300'
                }`}
              >
                Batch Processing
              </button>
            </div>
          )}
        </div>
        
        <div className="mb-1">
          <button
            onClick={() => toggleSection('languages')}
            className="w-full flex items-center justify-between p-2 rounded text-left hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-green-400" />
              <span className="font-medium">Languages</span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-slate-400 transition-transform ${openSections.languages ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {openSections.languages && (
            <div className="ml-6 mt-1 space-y-1">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.name}
                  onClick={() => handleSectionChange(lang.name.toLowerCase())}
                  className={`w-full text-left p-2 text-sm rounded ${
                    activeSection === lang.name.toLowerCase() 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'hover:bg-slate-700/50 text-slate-300'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-700 mt-2">
        <h3 className="text-sm font-medium mb-2">Need Help?</h3>
        <div className="space-y-2">
          <a 
            href="/live-support" 
            className="flex items-center gap-2 text-sm hover:text-blue-300 text-slate-300"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Live Chat Support</span>
          </a>
          <a 
            href="/video-tutorials" 
            className="flex items-center gap-2 text-sm hover:text-blue-300 text-slate-300"
          >
            <Monitor className="w-4 h-4" />
            <span>Video Tutorials</span>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen text-white">
      <header className="border-b border-slate-700/50 sticky top-0 bg-slate-900/80 backdrop-blur z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className="md:hidden p-1.5 hover:bg-slate-800 rounded-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Code className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold">Web Compiler Documentation</h1>
            </div>
            <div className="relative w-96 hidden md:block">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full bg-slate-800/50 backdrop-blur-sm rounded-xl py-2 pl-10 pr-4 border border-slate-700/50 focus:border-blue-500/30 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8 relative">
        <AnimatePresence>
          {isMobileMenuOpen && isMobile && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.nav
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween' }}
                className="fixed top-0 left-0 h-full w-64 z-50 bg-slate-800 shadow-xl md:hidden"
              >
                <div className="p-2 border-b border-slate-700">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="ml-2 p-1 hover:bg-slate-700 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <SidebarContent />
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <motion.nav 
          className="w-64 shrink-0 hidden md:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <SidebarContent />
        </motion.nav>

        <motion.main 
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
            {activeSection === 'quick-start' && (
              <div>
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-blue-400" />
                  Web Interface Guide
                </h1>
                
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold mb-4">1. Code Input</h2>
                    <div className="bg-slate-900 rounded-xl p-4 relative">
                      <Prism
                        language="javascript"
                        style={vscDarkPlus}
                        className="rounded-lg"
                      >
                        {`// Paste your source code here
function example() {
  console.log("Hello World");
}`}
                      </Prism>
                    </div>
                    <p className="text-slate-300 mt-2">
                      Use our web editor or paste your code directly into the input area
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold mb-4">2. Language Selection</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Code className="w-5 h-5 text-blue-400" />
                          <h3 className="font-semibold">Source Language</h3>
                        </div>
                        <select className="w-full bg-slate-800 rounded-lg p-2">
                          {supportedLanguages.map(lang => (
                            <option key={lang.name} value={lang.name}>{lang.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="bg-slate-900 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                          <h3 className="font-semibold">Target Language</h3>
                        </div>
                        <select className="w-full bg-slate-800 rounded-lg p-2">
                          {supportedLanguages.map(lang => (
                            <option key={lang.name} value={lang.name}>{lang.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold mb-4">3. Translation Results</h2>
                    <div className="bg-slate-900 rounded-xl p-4 relative">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(webExample);
                            setCopiedCode('example');
                          }}
                          className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
                        >
                          {copiedCode === 'example' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <Prism
                        language="python"
                        style={vscDarkPlus}
                        className="rounded-lg"
                      >
                        {webExample}
                      </Prism>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'javascript' && (
              <div>
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Languages className="w-6 h-6 text-blue-400" />
                  JavaScript Support
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-bold mb-4">Features</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        ES6+ syntax support
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        JSX/React translation
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        Node.js runtime features
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-bold mb-4">Optimization</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Idiomatic code conversion
                      </li>
                      <li className="flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-blue-400" />
                        Browser compatibility checks
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        Security linting
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div>
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-400" />
                  Security & Privacy
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-bold mb-4">Data Protection</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        End-to-end encryption
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        Automatic data deletion after 1 hour
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        No persistent storage
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-bold mb-4">Browser Security</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        Sandboxed execution environment
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        CSP-protected interface
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        Regular security audits
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-16 pt-8 border-t border-slate-700/50">
              <h2 className="text-xl font-bold mb-6">Need Assistance?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a
                  href="/live-support"
                  className="bg-slate-700/20 rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <MessageCircle className="w-8 h-8 text-green-400" />
                    <div>
                      <h3 className="font-semibold mb-1">Live Chat Support</h3>
                      <p className="text-slate-300 text-sm">
                        Get instant help from our support team
                      </p>
                    </div>
                  </div>
                </a>
                <a
                  href="/video-tutorials"
                  className="bg-slate-700/20 rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Monitor className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="font-semibold mb-1">Video Tutorials</h3>
                      <p className="text-slate-300 text-sm">
                        Step-by-step usage guides
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}