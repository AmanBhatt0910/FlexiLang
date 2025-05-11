import { Suspense } from 'react';
import AuthComponent from '@/components/AuthComponent';

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
    </div>
  );
}

function AuthPageContent() {
  return (
    <div className="pt-16 min-h-screen">
      <AuthComponent />
    </div>
  );
}