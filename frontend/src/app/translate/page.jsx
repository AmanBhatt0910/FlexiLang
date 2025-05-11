'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CodeEditor from '@/components/CodeEditor';
import axios from '@/utils/axiosInstance';
import { 
  ArrowRightLeft, 
  Copy, 
  Download, 
  Share2, 
  Check, 
  Code, 
  Cpu,
  BookOpen,
  History,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

const languages = [
  { id: 'javascript', name: 'JavaScript', icon: 'devicon-javascript-plain colored', description: 'ES6+ syntax' },
  { id: 'python', name: 'Python', icon: 'devicon-python-plain colored', description: 'Python 3.x' },
  { id: 'java', name: 'Java', icon: 'devicon-java-plain colored', description: 'Java 11+' },
  { id: 'cpp', name: 'C++', icon: 'devicon-cplusplus-plain colored', description: 'C++17' },
  { id: 'typescript', name: 'TypeScript', icon: 'devicon-typescript-plain colored', description: 'TS 4.x' },
  { id: 'go', name: 'Go', icon: 'devicon-go-plain colored', description: 'Go 1.16+' },
  { id: 'rust', name: 'Rust', icon: 'devicon-rust-plain colored', description: 'Rust 2021' },
  { id: 'csharp', name: 'C#', icon: 'devicon-csharp-plain colored', description: '.NET 6+' },
];

export default function TranslatePage() {
  const [sourceLang, setSourceLang] = useState('javascript');
  const [targetLang, setTargetLang] = useState('python');
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recentTranslations, setRecentTranslations] = useState([]);
  const [copyStatus, setCopyStatus] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [activeTab, setActiveTab] = useState('translate');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 15;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      }, 300);
    } else if (progress > 0 && progress < 100) {
      setProgress(100);
    }

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputCode(outputCode);
    setOutputCode(inputCode);
  };

  const handleTranslate = async () => {
    if (!inputCode.trim()) {
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const token = localStorage.getItem('token');
      if(!token) {
        setError('Please log in.');
        return;
      }

      const res = await axios.post('/translate', { 
        sourceCode: inputCode, 
        fromLanguage: sourceLang, 
        toLanguage: targetLang 
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setOutputCode(res.data.translatedCode);
      
      const newTranslation = {
        id: Date.now(),
        sourceLang,
        targetLang,
        snippet: inputCode.substring(0, 30) + (inputCode.length > 30 ? '...' : '')
      };
      
      setRecentTranslations(prev => [newTranslation, ...prev.slice(0, 4)]);
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
    } catch (err) {
      console.error("Translation error:", err);
      let errorMessage = "An error occurred during translation";
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = "Authentication failed. Please check your API credentials.";
            break;
          case 404:
            errorMessage = "API endpoint not found. Please check the service URL.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      setOutputCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(outputCode);
    setCopyStatus('copied');
    
    setTimeout(() => {
      setCopyStatus('');
    }, 2000);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleDownload = () => {
    const extension = targetLang === 'javascript' ? 'js' : 
                     targetLang === 'python' ? 'py' :
                     targetLang === 'java' ? 'java' :
                     targetLang === 'cpp' ? 'cpp' :
                     targetLang === 'typescript' ? 'ts' :
                     targetLang === 'go' ? 'go' :
                     targetLang === 'rust' ? 'rs' :
                     targetLang === 'csharp' ? 'cs' : 'txt';
                     
    const fileName = `translated-code.${extension}`;
    const blob = new Blob([outputCode], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const codeExamples = {
    javascript: `// Calculate factorial recursively
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5)); // 120`,
    
    python: `# Calculate factorial recursively
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5)) # 120`,
    
    java: `// Calculate factorial recursively
public class Factorial {
    public static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
    
    public static void main(String[] args) {
        System.out.println(factorial(5)); // 120
    }
}`
  };

  const applyExample = (language) => {
    setSourceLang(language);
    setInputCode(codeExamples[language] || '');
    setShowExamples(false);
  };

  const getLanguageDetails = (id) => languages.find(lang => lang.id === id) || languages[0];
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-16">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 opacity-10"></div>
        <svg className="absolute bottom-0 w-full text-slate-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="currentColor" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        
        <div className="container mx-auto px-4 pt-16 pb-32 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Code Translator
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6">
              Seamlessly translate code between programming languages with AI-powered accuracy and context awareness
            </p>
          </motion.div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 -mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg max-w-2xl flex items-center justify-between z-50"
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <div>
                  <span className="font-medium block">Error: {error}</span>
                  <span className="text-xs mt-1 opacity-80">
                    {error.includes('API') && 'Please check your API configuration'}
                    {error.includes('Network') && 'Check your internet connection'}
                  </span>
                </div>
              </div>
              <button 
                onClick={handleDismissError} 
                className="text-white hover:text-red-200 ml-4"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}

          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-slate-800/50 backdrop-blur-sm rounded-xl p-1">
              <button
                onClick={() => setActiveTab('translate')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'translate' 
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Translate
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'history' 
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'examples' 
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Examples
              </button>
            </div>
          </div>
          
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible" 
            className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700"
          >
            {activeTab === 'translate' && (
              <div>
                <div className="flex flex-col md:flex-row items-center justify-between bg-slate-800 p-4 border-b border-slate-700">
                  <div className="flex flex-1 items-center space-x-3 mb-4 md:mb-0">
                    <div className="relative w-full max-w-xs">
                      <select
                        className="w-full appearance-none bg-slate-700 border border-slate-600 text-white py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={sourceLang}
                        onChange={(e) => setSourceLang(e.target.value)}
                      >
                        {languages.map((lang) => (
                          <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      {getLanguageDetails(sourceLang).description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center mb-4 md:mb-0">
                    <button 
                      onClick={handleSwapLanguages}
                      className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                      aria-label="Swap languages"
                    >
                      <ArrowRightLeft className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-1 items-center space-x-3 justify-end">
                    <p className="text-xs text-slate-400 text-right">
                      {getLanguageDetails(targetLang).description}
                    </p>
                    <div className="relative w-full max-w-xs">
                      <select
                        className="w-full appearance-none bg-slate-700 border border-slate-600 text-white py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                      >
                        {languages.map((lang) => (
                          <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700">
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Code className="h-4 w-4 text-slate-400" />
                        <h3 className="text-sm font-medium text-slate-300">Source Code</h3>
                      </div>
                      <div className="flex items-center space-x-2 relative">
                        <button 
                          onClick={() => setShowExamples(!showExamples)}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          Examples
                        </button>
                        
                        {showExamples && (
                          <div className="absolute top-full mt-1 right-0 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                            <div className="p-2">
                              {Object.keys(codeExamples).map(lang => (
                                <button
                                  key={lang}
                                  onClick={() => applyExample(lang)}
                                  className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-700 text-slate-300 hover:text-white"
                                >
                                  {lang.charAt(0).toUpperCase() + lang.slice(1)} example
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900 text-black">
                    <CodeEditor
                        code={inputCode}
                        setCode={setInputCode}
                        language={sourceLang}
                        placeholder="Write or paste your code here..."
                        className="min-h-[400px] font-mono text-sm"
                        style={{
                          caretColor: '#ffffff',
                          lineHeight: '1.5',
                          padding: '1rem'
                        }}
                        showLineNumbers={true}
                        lineNumberStyle={{
                          color: '#64748b',
                          padding: '0 1rem 0 0',
                          minWidth: '3em',
                          textAlign: 'right',
                          userSelect: 'none'
                        }}
                        theme={{
                          background: '#0f172a',
                          text: '#ffffff',
                          selection: '#334155',
                          cursor: '#ffffff',
                          gutterBackground: '#0f172a',
                          gutterBorderRight: '1px solid #1e293b'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-slate-400" />
                        <h3 className="text-sm font-medium text-slate-300">Translated Code</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleCopyCode}
                          className={`p-1 rounded hover:bg-slate-700 ${copyStatus === 'copied' ? 'text-green-400' : 'text-slate-400'}`}
                          disabled={!outputCode}
                          aria-label="Copy code"
                        >
                          {copyStatus === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                        
                        <button
                          onClick={handleDownload}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400"
                          disabled={!outputCode}
                          aria-label="Download code"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        
                        <button
                          className="p-1 rounded hover:bg-slate-700 text-slate-400"
                          disabled={!outputCode}
                          aria-label="Share code"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900 relative text-black">
                    <CodeEditor
                        code={outputCode}
                        setCode={() => {}}
                        language={targetLang}
                        placeholder="Translated code will appear here..."
                        readOnly={true}
                        className="min-h-[400px] font-mono text-sm"
                        showLineNumbers={true}
                        lineNumberStyle={{
                          color: '#64748b',
                          padding: '0 1rem 0 0',
                          minWidth: '3em',
                          textAlign: 'right',
                          userSelect: 'none'
                        }}
                        theme={{
                          background: '#0f172a',
                          text: '#ffffff',
                          selection: '#334155',
                          gutterBackground: '#0f172a',
                          gutterBorderRight: '1px solid #1e293b'
                        }}
                      />
                      
                      {loading && (
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                          <div className="w-full max-w-xs px-4">
                            <div className="flex items-center mb-2">
                              <Sparkles className="text-blue-400 h-5 w-5 mr-2 animate-pulse" />
                              <p className="text-sm font-medium text-slate-300">Translating your code...</p>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-slate-400">Analyzing syntax and context patterns</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center p-4 border-t border-slate-700 bg-slate-800">
                  <button
                    onClick={handleTranslate}
                    disabled={loading || !inputCode.trim()}
                    className={`
                      px-6 py-3 rounded-xl text-white font-semibold shadow-lg
                      flex items-center space-x-2
                      ${
                        loading || !inputCode.trim()
                          ? 'bg-slate-700 cursor-not-allowed opacity-70'
                          : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transform hover:scale-105 transition-all duration-200'
                      }
                    `}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Translating...</span>
                      </>
                    ) : (
                      <>
                        <span>Translate Code</span>
                        <ArrowRightLeft className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Recent Translations
                </h3>
                
                {recentTranslations.length > 0 ? (
                  <div className="space-y-3">
                    {recentTranslations.map(item => (
                      <div key={item.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 hover:border-blue-500/30 transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm font-medium text-slate-300">
                            <span>{item.sourceLang}</span>
                            <ArrowRightLeft className="mx-2 h-4 w-4 text-slate-400" />
                            <span>{item.targetLang}</span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(item.id).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-400 truncate">{item.snippet}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No translation history yet</p>
                    <p className="text-sm text-slate-500 mt-1">Your recent translations will appear here</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'examples' && (
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Code Examples
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(codeExamples).map(([lang, code]) => (
                    <div key={lang} className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
                      <div className="bg-slate-700 px-4 py-2 flex items-center justify-between">
                        <span className="font-medium text-slate-200 capitalize">{lang}</span>
                        <button 
                          onClick={() => applyExample(lang)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Use Example
                        </button>
                      </div>
                      <div className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{code}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
          
          {showSuccessMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white px-4 py-2 rounded-full flex items-center shadow-lg backdrop-blur-sm z-50"
            >
              <Check className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Translation completed successfully!</span>
            </motion.div>
          )}
        </motion.div>
        
        <div className="mt-16 px-4">
          <h2 className="text-2xl font-bold text-center text-white mb-8">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="bg-blue-500/20 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-all">
                <Code className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">1. Input Your Code</h3>
              <p className="text-slate-300">Write or paste your code in the source language editor and select your target language.</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="bg-purple-500/20 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-all">
                <Cpu className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">2. AI Processing</h3>
              <p className="text-slate-300">Our AI analyzes your code's structure, logic, and patterns to ensure accurate translation.</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 hover:border-pink-500/30 transition-all duration-300 group">
              <div className="bg-pink-500/20 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition-all">
                <Sparkles className="text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">3. Get Idiomatic Code</h3>
              <p className="text-slate-300">Receive translated code that follows best practices and idioms of the target language.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}