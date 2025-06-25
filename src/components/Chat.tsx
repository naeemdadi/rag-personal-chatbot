'use client'
import { useState } from "react";
import { FaUserCircle, FaRobot } from "react-icons/fa";

const SUGGESTIONS = [
  "What is Naeem's work experience?",
  "Tell me about Naeem's technical skills",
  "What projects have Naeem worked on?",
  "What are Naeem's educational qualifications?"
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (msgOverride?: string) => {
    const content = msgOverride ?? input;
    if (!content.trim() || loading) return;
    const newMessage: Message = { id: crypto.randomUUID(),role: "user", content };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, newMessage] }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
        
        // Optionally, update the UI with the partial result here
        setMessages(prev => [
          ...prev.filter(m => m.id !== "streaming"), // Remove previous partial
          { id: "streaming", role: "assistant", content: result }
        ]);
      }
  
      setMessages(prev => [
        ...prev.filter(m => m.id !== "streaming"),
        { id: crypto.randomUUID(), role: "assistant", content: result }
      ]);
    } catch (err: unknown) {
      let message = "Chat failed";
      if (err instanceof Error) message = err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-[600px] w-full max-w-2xl rounded-3xl shadow-2xl bg-gradient-to-br from-white/90 via-blue-50/80 to-blue-100/60 dark:from-black/60 dark:via-black/40 dark:to-blue-950/60 border border-blue-100 dark:border-blue-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-900 dark:to-blue-800 shadow text-white">
        <FaRobot className="text-3xl bg-white/20 rounded-full p-1" />
        <div>
          <div className="font-bold text-lg">Hi, I am Naeem's AI Assistant</div>
        </div>
      </div>
      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 px-6 py-3 bg-white/70 dark:bg-black/30 border-b border-blue-100 dark:border-blue-900 animate-fade-in">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            className="px-3 py-1 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-200 text-xs font-medium shadow transition-all duration-150 border border-blue-200 dark:border-blue-900"
            onClick={() => handleSend(s)}
            disabled={loading}
          >
            {s}
          </button>
        ))}
      </div>
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-transparent">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center mt-20 animate-fade-in">No messages yet. Start the conversation!</div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <span className="flex-shrink-0"><FaRobot className="text-2xl text-blue-600 bg-white/80 rounded-full shadow" /></span>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[75%] shadow-md text-base transition-all ${msg.role === "user" ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white self-end" : "bg-white/90 dark:bg-black/40 text-gray-900 dark:text-gray-100 self-start border border-blue-100 dark:border-blue-900"} whitespace-pre-wrap`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <span className="flex-shrink-0"><FaUserCircle className="text-2xl text-blue-600 bg-white/80 rounded-full shadow" /></span>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 animate-pulse">
            <FaRobot className="text-2xl text-blue-600" />
            <div className="p-3 rounded-2xl bg-white/90 dark:bg-black/40 text-gray-400 max-w-[75%] shadow-md border border-blue-100 dark:border-blue-900">Assistant is typing...</div>
          </div>
        )}
        {error && <div className="text-red-600 text-xs mt-2 animate-shake">{error}</div>}
      </div>
      {/* Input Bar */}
      <form
        className="flex gap-2 items-center bg-white/80 dark:bg-black/30 rounded-xl shadow-inner px-4 py-3 border-t border-blue-100 dark:border-blue-900"
        style={{ position: "sticky", bottom: 0 }}
        onSubmit={e => { e.preventDefault(); handleSend(); }}
      >
        <input
          className="flex-1 border-none bg-transparent outline-none px-2 py-2 text-base"
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 disabled:opacity-50"
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Send message"
        >
          Send
          <FaRobot className="text-lg" />
        </button>
      </form>
    </div>
  );
} 