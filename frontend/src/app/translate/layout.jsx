export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Code Translator',
  description: 'AI-powered code translation between programming languages',
};

export default function Layout({ children }) {
  return <>{children}</>;
}