import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'FlexiLang',
  description: 'Multi-language code translator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-base">
        <AuthProvider>
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
