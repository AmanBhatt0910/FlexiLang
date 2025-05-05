import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
                <span className="text-white font-bold text-lg">F</span>
              </span>
              <span className="font-bold text-xl">
                <span className="text-blue-400">Flexi</span>
                <span className="text-violet-400">Lang</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm">
              Revolutionizing how developers translate code across programming languages with AI-powered precision.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/translate" className="text-slate-400 hover:text-white transition text-sm">
                  Code Translator
                </Link>
              </li>
              <li>
                <Link href="/analyzer" className="text-slate-400 hover:text-white transition text-sm">
                  Code Analyzer
                </Link>
              </li>
              <li>
                <Link href="/formatter" className="text-slate-400 hover:text-white transition text-sm">
                  Code Formatter
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-400 hover:text-white transition text-sm">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-slate-400 hover:text-white transition text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/examples" className="text-slate-400 hover:text-white transition text-sm">
                  Examples
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-white transition text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-slate-400 hover:text-white transition text-sm">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white transition text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-slate-400 hover:text-white transition text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white transition text-sm">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white transition text-sm">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} FlexiLang. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-slate-500 hover:text-white transition text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-500 hover:text-white transition text-sm">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-slate-500 hover:text-white transition text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}