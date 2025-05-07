import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'FlexiLang | Code Translation Platform',
  description: 'Seamlessly translate code across programming languages with AI-powered accuracy',
  keywords: 'code translation, programming languages, AI, developer tools',
  openGraph: {
    title: 'FlexiLang | Code Translation Platform',
    description: 'Seamlessly translate code across programming languages with AI-powered accuracy',
    images: ['/og-image.png'],
    url: 'https://flexilang.dev',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlexiLang | Code Translation Platform',
    description: 'Seamlessly translate code across programming languages with AI-powered accuracy',
    creator: '@flexilang',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const dynamicParams = true;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="bg-slate-900 text-slate-100 antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow pt-32">
            {children}
          </main>
          <Footer />
        </AuthProvider>
        
        <div id="cookie-consent"></div>
        <div id="notification-outlet"></div>
      </body>
    </html>
  );
}