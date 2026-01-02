import { ChatInterface } from "@/components/ChatInterface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-white">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm flex flex-col space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif font-light tracking-tight text-black">
            Traceable AI
          </h1>
          <p className="text-black/40 font-light">
            Next.js 14.2.2 + Zustand + PostgreSQL + OpenAI
          </p>
        </div>
        
        <ChatInterface />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
          <div className="embossed p-4 text-center space-y-1">
            <h3 className="text-xs font-medium uppercase tracking-wider text-black/40">Database</h3>
            <p className="text-sm font-light text-black/70">Native PG Client</p>
          </div>
          <div className="embossed p-4 text-center space-y-1">
            <h3 className="text-xs font-medium uppercase tracking-wider text-black/40">State</h3>
            <p className="text-sm font-light text-black/70">Zustand Store</p>
          </div>
          <div className="embossed p-4 text-center space-y-1">
            <h3 className="text-xs font-medium uppercase tracking-wider text-black/40">UI</h3>
            <p className="text-sm font-light text-black/70">Embossed Minimalism</p>
          </div>
        </div>
      </div>
    </main>
  );
}
