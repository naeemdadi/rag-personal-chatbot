'use client'
import { useState, useRef } from "react";
import { useUploadThing } from "@/utils/uploadthing";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("uploader", {
    onClientUploadComplete: async (res) => {
      if (!res || res.length === 0) return;
      setResult(null);
      setError(null);
      try {
        const file = res[0];
        const apiRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl: file.ufsUrl, fileType: file.type }),
        });
        const data = await apiRes.json();
        if (!apiRes.ok) throw new Error(data.error || "Failed to process file");
        setResult("Upload complete! Your file has been processed and added to your knowledge base.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process file");
      }
      setFiles([]);
    },
    onUploadError: (err) => {
      setError(err.message);
    },
    onUploadBegin: () => {
      setResult(null);
      setError(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = () => {
    if (files.length > 0) {
      startUpload(files);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl shadow-xl bg-white/60 dark:bg-black/30 backdrop-blur border border-gray-200 transition-all duration-300 hover:shadow-2xl min-h-[260px]"
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <div className="flex flex-col items-center gap-2 mb-2">
        <FaCloudUploadAlt className="text-5xl text-blue-500 drop-shadow-md animate-bounce-slow" />
        <span className="text-lg font-semibold text-blue-700">Upload a File</span>
        <span className="text-xs text-gray-500">PDF, TXT, DOCX supported</span>
      </div>
      <div
        className={`w-full flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${files.length > 0 ? 'border-blue-500 bg-blue-50/60' : 'border-blue-200 bg-white/40 hover:bg-blue-50/40'}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          className="hidden"
          onChange={handleFileChange}
          multiple={false}
          disabled={isUploading}
        />
        {files.length === 0 ? (
          <span className="text-blue-400 text-sm">Click or drag & drop a file here</span>
        ) : (
          <span className="text-blue-700 font-medium text-sm">{files[0].name}</span>
        )}
      </div>
      <button
        className="mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold shadow hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 disabled:opacity-50"
        onClick={handleUpload}
        disabled={isUploading || files.length === 0}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      {isUploading && <p className="text-blue-600 text-xs animate-pulse mt-2">Processing file...</p>}
      {result && (
        <div className="mt-4 flex flex-col items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl shadow-inner animate-fade-in">
          <span className="text-green-700 font-semibold">{result}</span>
        </div>
      )}
      {error && <p className="text-red-600 text-xs mt-2 animate-shake">{error}</p>}
    </div>
  );
} 