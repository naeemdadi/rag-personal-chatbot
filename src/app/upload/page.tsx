import FileUpload from "../../components/FileUpload";

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center min-h-screen p-8 gap-8 bg-background text-foreground">
      <header className="w-full max-w-2xl flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">Upload Documents</h1>
        <p className="text-base text-gray-500">Add files to enhance your personal AI assistant's knowledge about you.</p>
      </header>
      <main className="w-full max-w-md flex flex-col gap-6 bg-white/80 dark:bg-black/30 rounded-xl shadow-lg p-8 border border-gray-200">
        <FileUpload />
      </main>
    </div>
  );
} 