export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-primary drop-shadow-lg">
          Welcome to <span className="text-primary">FlexiLang</span>
        </h1>
        <p className="text-lg md:text-xl font-medium text-muted">
          Seamlessly translate code across programming languages in one click.
        </p>
        <a
          href="/translate"
          className="inline-block bg-gradient-primary text-white px-6 py-3 rounded-2xl text-lg font-semibold hover:bg-primary-hover transition"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
