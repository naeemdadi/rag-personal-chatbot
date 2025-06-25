import Chat from "@/components/Chat";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen p-8 gap-8 bg-background text-foreground">
      <header className="w-full max-w-2xl flex flex-col items-center gap-4 mb-4 animate-fade-in">
        <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-300 drop-shadow">Welcome to Your AI Assistant</h1>
        <p className="text-lg text-gray-500 dark:text-gray-300">Chat with your AI or upload documents to enhance its knowledge about you.</p>
        <div className="flex gap-6 mt-4">
          <button
            className="px-8 py-3 rounded-xl text-lg font-bold shadow-lg transition-all duration-200 border-2 border-blue-500 bg-gradient-to-r from-blue-500 to-blue-700 text-white scale-105 ring-2 ring-blue-400 cursor-default"
            disabled
          >
            Chat
          </button>
          <Link href="/upload">
            <button
              className="px-8 py-3 rounded-xl text-lg font-bold shadow-lg transition-all duration-200 border-2 border-green-500 bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              Upload
            </button>
          </Link>
        </div>
      </header>
      <main className="w-full max-w-2xl flex flex-col gap-6 bg-white/80 dark:bg-black/30 rounded-xl shadow-lg p-8 border border-gray-200 animate-fade-in">
        <Chat />
      </main>
    </div>
  );
} 