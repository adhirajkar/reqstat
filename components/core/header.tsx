
'use client'
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  User, 
  Plus
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLoadingStore } from "@/store/useLoadingStore";

const Header = () => {
  const router = useRouter();
  const { isLoading } = useLoadingStore();

  return (
    <header className="w-full h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 relative z-50">
      {/* Left Section - Logo & New Button */}
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push("/")}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent">REQStat</h1>
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="flex items-center gap-4">
          {/* <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button> */}

        {/* Login Button */}
      
      <Button 
          variant="gradient"
          size="sm" 
          className="font-medium"
        >
          <User className="w-4 h-4 mr-2" />
          Login
        </Button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-50"></div>
      
      {isLoading && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-500 via-slate-700 to-slate-900 animate-pulse">
          <div className="h-full bg-gradient-to-r from-slate-500 to-slate-900 animate-pulse"></div>
        </div>
      )}
    </header>
  );
};

export default Header;