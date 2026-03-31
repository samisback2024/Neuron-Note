import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Send, Sparkles, Copy, Check } from "lucide-react";
import { useStore } from "../lib/store";
import { format } from "date-fns";
import toast from "react-hot-toast";

const QUICK_PROMPTS = [
  "Summarize my notes about productivity",
  "Find notes related to project management",
  "What are my most important tasks?",
  "Show me recent meeting notes",
  "How are my knowledge notes connected?",
];

export function AIAssistant() {
  const { chatMessages, chatLoading, sendChatMessage } = useStore();
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || chatLoading) return;
    const msg = input;
    setInput("");
    await sendChatMessage(msg);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 md:px-10 py-4 border-b border-surface-200/60 dark:border-surface-700/30 bg-white dark:bg-surface-900 flex-shrink-0">
        <img src="/favicon.svg" alt="Neuron AI" className="w-10 h-10" />
        <div>
          <h1 className="text-[17px] font-semibold text-surface-900 dark:text-white/95">
            AI Assistant
          </h1>
          <p className="text-[12.5px] text-surface-500 dark:text-surface-400">
            Your intelligent knowledge companion
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 md:px-10 py-6"
      >
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="max-w-lg w-full">
              {/* Welcome message */}
              <div className="flex gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="bg-surface-50 dark:bg-surface-800 rounded-2xl rounded-tl-md px-4 py-3 max-w-md">
                  <p className="text-sm text-surface-700 dark:text-surface-300">
                    Hello! I&apos;m your AI assistant. I can help you search
                    your notes, summarize content, and answer questions about
                    your knowledge base.
                  </p>
                  <p className="text-xs text-surface-400 mt-2">
                    {format(new Date(), "h:mm a")}
                  </p>
                </div>
              </div>

              {/* Quick prompts */}
              <div className="mt-auto">
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-3">
                  Try asking:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setInput(prompt);
                      }}
                      className="text-left text-[13px] px-4 py-3 rounded-xl border border-surface-200/60 dark:border-surface-700/30 bg-white dark:bg-surface-800/80 text-surface-700 dark:text-surface-300 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 shadow-sm transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-md ${
                    msg.role === "user"
                      ? "bg-primary-500 text-white rounded-tr-md"
                      : "bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-tl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs ${msg.role === "user" ? "text-white/60" : "text-surface-400"}`}
                    >
                      {format(new Date(msg.created_at), "h:mm a")}
                    </span>
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="text-surface-400 hover:text-surface-600 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <Check size={12} />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {chatLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="bg-surface-50 dark:bg-surface-800 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 rounded-full bg-surface-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-surface-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-surface-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-surface-200/60 dark:border-surface-700/30 bg-white dark:bg-surface-900 px-6 md:px-10 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything about your notes..."
              rows={1}
              className="w-full px-4 py-3 rounded-xl border border-surface-200/60 dark:border-surface-700/30 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
              style={{ maxHeight: 120 }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={chatLoading || !input.trim()}
            className="p-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-surface-400 text-center mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
