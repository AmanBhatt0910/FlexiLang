"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4 bg-muted text-foreground border-b border-color-border">
      <Link href="/" className="text-2xl font-extrabold text-primary hover:text-primary-hover transition">
        FlexiLang
      </Link>
      <div className="flex gap-6">
        {user ? (
          <>
            <Link href="/translate" className="text-lg font-medium text-primary hover:text-primary-hover transition">
              Translate
            </Link>
            <button
              onClick={logout}
              className="text-lg font-medium text-accent hover:text-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-lg font-medium text-primary hover:text-primary-hover transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-lg font-medium text-primary hover:text-primary-hover transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
