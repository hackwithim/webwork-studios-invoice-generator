"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, AlertCircle, CheckCircle2, User, ChevronDown, Trash2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
  isDispatchSuccess?: boolean;
  intent?: any;
};

export default function EmailAIAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your Email AI Assistant. You can ask me questions about your clients and leads, or ask me to dispatch an Email or WhatsApp message for you. How can I help today?"
    }
  ]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedModel, setSelectedModel] = useState("meta/llama-3.1-70b-instruct");
  const scrollRef = useRef<HTMLDivElement>(null);

  const MODELS = [
    { id: "meta/llama-3.1-70b-instruct", name: "Llama 3.1 70B (Default)" },
    { id: "z-ai/glm-5.2", name: "GLM-5.2" },
    { id: "minimaxai/minimax-m3", name: "MiniMax-M3" },
    { id: "google/diffusiongemma-26b-a4b-it", name: "DiffusionGemma 26B" },
    { id: "moonshotai/kimi-k2.6", name: "Kimi K2.6" },
    { id: "deepseek-ai/deepseek-v4-pro", name: "DeepSeek V4 Pro" },
    { id: "deepseek-ai/deepseek-v4-flash", name: "DeepSeek V4 Flash" },
    { id: "google/gemma-4-31b-it", name: "Gemma 4 31B" },
  ];

  // Load history on mount
  useEffect(() => {
    setIsMounted(true);
    const savedHistory = localStorage.getItem("email_ai_chat_history");
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("email_ai_chat_history", JSON.stringify(messages));
    }
  }, [messages, isMounted]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + Math.random().toString(),
      role: "user",
      content: prompt.trim(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setPrompt("");
    setIsLoading(true);

    try {
      // Send the conversation history (excluding the welcome message id)
      const apiMessages = currentMessages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, model: selectedModel }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.is_chat) {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + Math.random().toString(),
            role: "assistant",
            content: data.message,
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + Math.random().toString(),
            role: "assistant",
            content: data.message,
            isDispatchSuccess: true,
            intent: data.ai_intent,
          }]);
        }
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + Math.random().toString(),
          role: "assistant",
          content: data.error || "An unknown error occurred.",
          isError: true,
        }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + Math.random().toString(),
        role: "assistant",
        content: "Failed to connect to AI Agent.",
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    const defaultMessages = [{
      id: "welcome",
      role: "assistant" as const,
      content: "Hello! I am your Email AI Assistant. You can ask me questions about your clients and leads, or ask me to dispatch an Email or WhatsApp message for you. How can I help today?"
    }];
    setMessages(defaultMessages);
    localStorage.removeItem("email_ai_chat_history");
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100dvh-130px)] lg:h-[calc(100dvh-150px)]">
      <div className="flex flex-col gap-2 shrink-0 mb-4 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2" style={{ fontFamily: "var(--font-poppins)" }}>
            <Bot className="text-violet-600" /> AI Assistant
          </h1>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="appearance-none w-full sm:w-56 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 cursor-pointer shadow-sm"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button 
              onClick={handleClearHistory}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm group whitespace-nowrap"
            >
              <Trash2 size={16} className="text-slate-400 group-hover:text-red-500 transition-colors" />
              Clear
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Chat with the AI, ask about your CRM data, or tell it to send a message.
        </p>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 rounded-3xl border border-slate-200 shadow-inner">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                  msg.role === "user" 
                    ? "bg-violet-600 text-white border-violet-600" 
                    : "bg-white text-primary border-slate-200"
                }`}>
                  {msg.role === "user" ? <User size={18} /> : <Bot size={18} className="text-violet-600" />}
                </div>
                
                <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {msg.isDispatchSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl rounded-tl-sm p-5 space-y-4">
                      <div className="flex items-center gap-2 text-emerald-800 font-medium">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        {msg.content}
                      </div>
                      {msg.intent && (
                        <div className="bg-white/60 p-4 rounded-xl border border-emerald-200/50">
                          <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">Execution Details</h4>
                          <ul className="text-sm space-y-1 text-emerald-700">
                            <li><strong>Channel:</strong> {msg.intent.channel}</li>
                            {msg.intent.subject && <li><strong>Subject:</strong> {msg.intent.subject}</li>}
                            <li><strong>Draft:</strong><br/> <span className="whitespace-pre-wrap">{msg.intent.content}</span></li>
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : msg.isError ? (
                    <div className="bg-red-50 border border-red-100 rounded-2xl rounded-tl-sm p-4 text-red-800 flex items-start gap-3">
                      <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{msg.content}</span>
                    </div>
                  ) : (
                    <div className={`px-5 py-3 shadow-sm text-sm inline-block ${
                      msg.role === "user" 
                        ? "bg-violet-600 text-white rounded-3xl rounded-tr-sm" 
                        : "bg-white border border-slate-200 rounded-3xl rounded-tl-sm text-slate-700 whitespace-pre-wrap leading-relaxed"
                    }`}>
                      {msg.content}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-9 h-9 rounded-2xl bg-white shadow-sm border border-slate-200 text-primary flex items-center justify-center shrink-0">
                  <Bot size={18} className="text-violet-600 animate-pulse" />
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-3xl rounded-tl-sm flex items-center gap-2 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-white z-10">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <textarea
              rows={1}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question or request a message dispatch..."
              className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none transition-all resize-none text-sm min-h-[56px] max-h-32 bg-slate-50 hover:bg-white focus:bg-white shadow-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !prompt.trim()}
              className="shrink-0 mb-1 w-12 h-12 flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send size={18} className="translate-x-[1px]" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs font-medium text-slate-400">
            <Sparkles size={14} className="text-violet-600 animate-pulse" />
            <span>Powered by state-of-the-art AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
