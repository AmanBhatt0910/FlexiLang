"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Mail, Lock, User, Github } from "lucide-react";

export default function AuthComponent() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(isLogin ? "Logging in" : "Registering", { email, password, username });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white overflow-hidden px-4 py-10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-64 h-64 bg-fuchsia-600 rounded-full filter blur-3xl opacity-5 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

      {/* Auth Container */}
      <div className={`max-w-md w-full mx-auto z-10 relative transition-all duration-700 ease-out transform ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Logo & Branding */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight mb-2">
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Flexi</span>
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">Lang</span>
            </h1>
            <p className="text-slate-400 text-sm">The intelligent coding assistant</p>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/60 shadow-2xl shadow-blue-900/20">
          {/* Tab Selection */}
          <div className="flex mb-8 border-b border-slate-700/60 relative">
            <button 
              onClick={() => setIsLogin(true)}
              className={`pb-3 px-6 text-sm font-medium transition-all relative ${
                isLogin 
                  ? 'text-white font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
              {isLogin && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-violet-500"></div>
              )}
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`pb-3 px-6 text-sm font-medium transition-all relative ${
                !isLogin 
                  ? 'text-white font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
              {!isLogin && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-violet-500"></div>
              )}
            </button>

            {/* Animated Highlight */}
            <div className="absolute bottom-0 h-full w-2/3 pointer-events-none overflow-hidden">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400/20 to-violet-400/20 absolute left-10 bottom-0 filter blur-md transform-gpu animate-bounce opacity-70" style={{ animationDuration: '3s' }}></div>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2 transition-all duration-300">
                <label className="text-sm font-medium text-slate-300 block">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <input 
                    type="text" 
                    className="bg-slate-800/50 border border-slate-600/50 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 block w-full pl-10 p-3 outline-none transition-all"
                    placeholder="johndoe" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input 
                  type="email" 
                  className="bg-slate-800/50 border border-slate-600/50 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 block w-full pl-10 p-3 outline-none transition-all"
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300 block">Password</label>
                {isLogin && (
                  <a href="#" className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-all">Forgot Password?</a>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input 
                  type="password" 
                  className="bg-slate-800/50 border border-slate-600/50 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 block w-full pl-10 p-3 outline-none transition-all"
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2 transition-all duration-300">
                <label className="text-sm font-medium text-slate-300 block">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input 
                    type="password" 
                    className="bg-slate-800/50 border border-slate-600/50 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 block w-full pl-10 p-3 outline-none transition-all"
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="group w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-violet-600 text-white px-5 py-3 rounded-lg text-sm font-medium hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-700/20 hover:shadow-blue-600/30 hover:scale-[1.02] transform transition-all duration-200 mt-2"
            >
              <span className="relative">
                {isLogin ? "Sign In" : "Create Account"}
                <span className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-white/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-slate-700/60"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400">or continue with</span>
            <div className="flex-grow border-t border-slate-700/60"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="inline-flex items-center justify-center bg-slate-800/60 border border-slate-700/60 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-700/60 hover:border-slate-600/60 transition-all group"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
                  fill="#4285F4" 
                />
                <path 
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
                  fill="#34A853" 
                />
                <path 
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
                  fill="#FBBC05" 
                />
                <path 
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
                  fill="#EA4335" 
                />
              </svg>
              <span className="group-hover:translate-x-0.5 transition-transform">Google</span>
            </button>
            
            <button
              type="button"
              className="inline-flex items-center justify-center bg-slate-800/60 border border-slate-700/60 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-700/60 hover:border-slate-600/60 transition-all group"
            >
              <Github className="mr-2 h-5 w-5" />
              <span className="group-hover:translate-x-0.5 transition-transform">GitHub</span>
            </button>
          </div>

          <div className="text-center mt-6 text-sm text-slate-400">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-all"
                >
                  Register
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-all"
                >
                  Login
                </button>
              </p>
            )}
          </div>

          <div className="flex items-center justify-center mt-6">
            <div className="px-3 py-1 bg-gradient-to-r from-blue-900/30 to-violet-900/30 text-xs rounded-full font-semibold tracking-wide text-blue-400 border border-blue-500/30 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
              <span>BETA</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          <p>© 2025 FlexiLang • <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a> • <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a></p>
        </div>
      </div>
    </div>
  );
}