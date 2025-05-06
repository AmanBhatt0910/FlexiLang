"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, ChevronDown, Github, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Examples', href: '/examples' },
    { name: 'Docs', href: '/docs' },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || isOpen
          ? 'bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 py-3'
          : 'bg-transparent py-5'
      }`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center space-x-2 hover:scale-105 transition-transform"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg">
              <span className="text-white font-bold text-lg">F</span>
            </span>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              FlexiLang
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? 'text-white bg-slate-800/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="relative group">
              <button className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/30 transition-all">
                <span>Products</span>
                <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute left-0 mt-2 w-48 origin-top-left rounded-xl bg-slate-900/95 backdrop-blur-lg shadow-2xl ring-1 ring-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1 divide-y divide-slate-800">
                  <Link 
                    href="/translate" 
                    className="block px-4 py-3 text-sm text-slate-200 hover:bg-slate-800/50 rounded-t-xl transition-colors"
                  >
                    Code Translator
                  </Link>
                  <Link 
                    href="/analyzer" 
                    className="block px-4 py-3 text-sm text-slate-200 hover:bg-slate-800/50 transition-colors"
                  >
                    Code Analyzer
                  </Link>
                  <Link 
                    href="/formatter" 
                    className="block px-4 py-3 text-sm text-slate-200 hover:bg-slate-800/50 rounded-b-xl transition-colors"
                  >
                    Code Formatter
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/30 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            <a
              href="https://github.com/AmanBhatt0910/FlexiLang.git"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/30 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800/50 text-white hover:bg-slate-800/70 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-red-600/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/30 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg hover:shadow-blue-500/30"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/30 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      <div 
        className={`md:hidden fixed inset-0 h-screen w-full z-[999] bg-slate-900/95 backdrop-blur-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="relative h-full">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/30 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex flex-col h-full pt-20 pb-6 px-4 overflow-y-auto">
            <div className="flex-1 space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-white bg-slate-800/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="py-2">
                <div className="border-t border-slate-800 my-3"></div>
                <p className="px-4 py-2 text-sm text-slate-500 font-medium">Products</p>
              </div>
              
              {['translate', 'analyzer', 'formatter'].map((product) => (
                <Link
                  key={product}
                  href={`/${product}`}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/30 transition-colors"
                >
                  Code {product.charAt(0).toUpperCase() + product.slice(1)}
                </Link>
              ))}
            </div>
            
            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/30 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="h-5 w-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
                
                <a
                  href="https://github.com/AmanBhatt0910/FlexiLang.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/30 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
              
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    className="block w-full px-4 py-3 text-center rounded-lg text-base font-medium bg-slate-800/50 text-white hover:bg-slate-800/70 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full px-4 py-3 text-center rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-red-600/20 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/signup"
                    className="block w-full px-4 py-3 text-center rounded-lg text-base font-medium bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg"
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full px-4 py-3 text-center rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/30 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}