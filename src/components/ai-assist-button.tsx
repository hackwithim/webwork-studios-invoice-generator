"use client";

import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { generateAIText } from "@/actions/ai";
import toast from "react-hot-toast";

interface AiAssistButtonProps {
  onGenerate: (text: string) => void;
  context?: string;
  placeholder?: string;
  className?: string;
}

export default function AiAssistButton({ onGenerate, context, placeholder = "e.g. Write a short professional description for website maintenance", className = "" }: AiAssistButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    const result = await generateAIText(prompt, context);
    setIsLoading(false);

    if (result.success && result.text) {
      onGenerate(result.text);
      setIsOpen(false);
      setPrompt("");
      toast.success("Text generated successfully!");
    } else {
      toast.error(result.error || "Failed to generate text.");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors bg-accent/5 hover:bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20"
      >
        <Sparkles size={12} />
        AI Assist
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Sparkles size={12} className="text-accent" />
              Generate with AI
            </h4>
            <button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            className="w-full h-24 p-3 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none mb-3"
            autoFocus
          />
          
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full h-9 rounded-lg bg-accent text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent/90 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Text"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
