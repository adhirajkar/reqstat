'use client'
import { Button } from "@/components/ui/button";
import { Boxes } from "@/components/ui/background-boxes";
import { cn } from "@/lib/utils";
import { ArrowRight, Zap, Eye, Wrench, Github } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="h-screen relative w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center">
      <div className="absolute inset-0 w-full h-full bg-white/30 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      
      <Boxes />
      
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 border border-slate-200 backdrop-blur-sm mb-8 shadow-sm">
          <span className="text-emerald-600 text-sm font-medium">API Testing Made Simple 🚀</span>
        </div>
        
        <h1 className={cn("md:text-7xl text-4xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent mb-6")} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
          REQStat
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-700 mb-4 leading-relaxed max-w-3xl">
          Send requests, inspect responses, and debug APIs without the clutter.
        </p>
        <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
          Built for speed, clarity, and control - the developer's choice for API testing
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 border border-slate-200 backdrop-blur-sm shadow-sm">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span className="text-slate-700 text-sm">Lightning Fast</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 border border-slate-200 backdrop-blur-sm shadow-sm">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-slate-700 text-sm">Crystal Clear</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 border border-slate-200 backdrop-blur-sm shadow-sm">
            <Wrench className="w-4 h-4 text-green-600" />
            <span className="text-slate-700 text-sm">Full Control</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={() => router.push("/dashboard")}
            variant="gradient"
            size="lg" 
            className="px-8 py-3 text-md  shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.open("https://github.com/adhirajkar/reqstat", "_blank")}
            className="border-slate-300 cursor-pointer text-slate-700 hover:bg-slate-100 hover:border-slate-400 px-8 py-3 text-sm backdrop-blur-sm transition-all duration-200"
          >
            <Github className="w-5 h-5" />adhirajkar/reqstat
          </Button>
        </div>        
      </div>
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none z-10"></div>
    </div>
  );
}