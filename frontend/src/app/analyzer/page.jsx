'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CodeEditor from '@/components/CodeEditor';
import axios from '@/utils/axiosInstance';
import { 
  Activity,
  AlertCircle,
  BarChart,
  Copy,
  Download,
  Check,
  Code,
  BookOpen,
  Sparkles
} from 'lucide-react';

const languages = [
  { id: 'javascript', name: 'JavaScript', icon: 'devicon-javascript-plain colored', description: 'ES6+ syntax' },
  { id: 'python', name: 'Python', icon: 'devicon-python-plain colored', description: 'Python 3.x' },
  { id: 'java', name: 'Java', icon: 'devicon-java-plain colored', description: 'Java 11+' },
  { id: 'cpp', name: 'C++', icon: 'devicon-cplusplus-plain colored', description: 'C++17' },
];

export default function AnalyzerPage() {
  const [sourceLang, setSourceLang] = useState('javascript');
  const [inputCode, setInputCode] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const metrics = [
    { title: "Cyclomatic Complexity", value: analysisResults?.complexity || "--", icon: <Activity className="w-4 h-4" /> },
    { title: "Lines of Code", value: analysisResults?.loc || "--", icon: <Code className="w-4 h-4" /> },
    { title: "Potential Issues", value: analysisResults?.issues?.length || 0, icon: <AlertCircle className="w-4 h-4" /> },
    { title: "Performance Score", value: analysisResults?.performance ? `${analysisResults.performance}/100` : "--", icon: <BarChart className="w-4 h-4" /> },
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 15, 95));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async () => {
    if (!inputCode.trim()) return;

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockResults = {
        complexity: Math.floor(Math.random() * 20) + 5,
        loc: inputCode.split('\n').length,
        issues: [
          { message: "Unused variable declaration", line: 3, context: "let unusedVar = 10;" },
          { message: "Possible memory leak", line: 15, context: "openConnection()" }
        ],
        performance: Math.floor(Math.random() * 40) + 60
      };
      
      setAnalysisResults(mockResults);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inputCode);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  const codeExamples = {
    javascript: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`,
    python: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`
  };

  const applyExample = (language) => {
    setSourceLang(language);
    setInputCode(codeExamples[language]);
    setShowExamples(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-16">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 opacity-10"></div>
        <svg className="absolute bottom-0 w-full text-slate-900" viewBox="0 0 1440 320">
          <path fill="currentColor" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        
        <div className="container mx-auto px-4 pt-16 pb-32 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center">
              Code Analyzer
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6 text-center">
              Deep code analysis with complexity metrics, vulnerability detection, and performance insights
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
            <div className="bg-slate-800 p-4 border-b border-slate-700">
              <div className="max-w-xs mx-auto">
                <div className="relative">
                  <select
                    className="w-full bg-slate-700 border border-slate-600 text-white py-2 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-700">
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4 text-slate-400" />
                    <h3 className="text-sm font-medium text-slate-300">Source Code</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setShowExamples(!showExamples)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      Examples
                    </button>
                    <button
                      onClick={handleCopyCode}
                      className={`p-1 rounded hover:bg-slate-700 ${copyStatus === 'copied' ? 'text-green-400' : 'text-slate-400'}`}
                    >
                      {copyStatus === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {showExamples && (
                  <div className="absolute z-10 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
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

                <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900 text-black">
                  <CodeEditor
                    code={inputCode}
                    setCode={setInputCode}
                    language={sourceLang}
                    placeholder="Enter code to analyze..."
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
                <div className="mb-4 flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-slate-400" />
                  <h3 className="text-sm font-medium text-slate-300">Analysis Results</h3>
                </div>

                {loading && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-full max-w-xs px-4">
                      <div className="flex items-center mb-2">
                        <Sparkles className="text-blue-400 h-5 w-5 mr-2 animate-pulse" />
                        <p className="text-sm font-medium text-slate-300">Analyzing your code...</p>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {metrics.map((metric, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900 p-4 rounded-lg border border-slate-700 hover:border-blue-500/30 transition-colors"
                    >
                      <div className="flex items-center space-x-2 text-slate-400">
                        {metric.icon}
                        <span className="text-sm">{metric.title}</span>
                      </div>
                      <div className="text-xl font-semibold mt-2 text-blue-400">
                        {metric.value}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {analysisResults?.issues?.length > 0 && (
                  <div className="border border-slate-700 rounded-lg overflow-hidden">
                    <div className="bg-slate-900 p-4 border-b border-slate-700">
                      <h4 className="text-sm font-medium text-slate-300 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                        Potential Issues ({analysisResults.issues.length})
                      </h4>
                    </div>
                    <div className="divide-y divide-slate-800">
                      {analysisResults.issues.map((issue, index) => (
                        <div key={index} className="p-4 text-sm hover:bg-slate-900/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">{issue.message}</span>
                            <span className="text-slate-500 text-xs">Line {issue.line}</span>
                          </div>
                          <code className="mt-1 text-slate-400 font-mono block text-xs">
                            {issue.context}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-800">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${
                  loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500'
                }`}
              >
                {loading ? 'Analyzing...' : 'Analyze Code'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}