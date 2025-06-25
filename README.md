# RAG Personal AI Assistant

A full-stack Retrieval-Augmented Generation (RAG) web application that acts as your personal AI assistant. Upload your documents (PDF, TXT, DOCX) and chat with an AI that can reference your files to answer questions about you.

## Features
- **Chat UI:** Clean, responsive chat interface (Next.js, React, Tailwind CSS)
- **File Upload:** UploadThing-powered file upload for PDF, TXT, DOCX
- **Text Extraction:** Extracts and semantically chunks text from uploaded files
- **Embeddings:** Uses Google Gemini's `text-embedding-004` for vectorization
- **Vector DB:** Stores embeddings and chunks in **DataStax Astra DB** (cloud, managed)
- **RAG Flow:** Retrieves relevant context and generates answers with Gemini (Google Generative AI)
- **Personalization:** All answers are strictly about the user (Naeem Dadi, by default)

## Tech Stack
- **Frontend:** Next.js (App Router, React 19, Tailwind CSS)
- **Backend:** Next.js API routes (Node.js)
- **LLM & Embeddings:** Google Generative AI (Gemini)
- **Vector DB:** [DataStax Astra DB](https://docs.datastax.com/en/astra/astra-db-vector/vector-intro.html)
- **File Parsing:** pdf-parse (PDF), mammoth (DOCX), Node.js fs (TXT)
- **File Upload:** UploadThing
- **Chunking:** langchain (semantic chunking)
- **UI Icons:** react-icons

## Getting Started

### 1. Clone & Install
```bash
pnpm install
```

### 2. Environment Variables
Create a `.env.local` file:

```env
GOOGLE_API_KEY='your-google-generative-ai-key'

# DataStax Astra DB
ASTRA_DB_API_ENDPOINT=https://<your-db-id>-<region>.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN=your-app-token
ASTRA_DB_KEYSPACE=your_keyspace
ASTRA_DB_COLLECTION=personal-assistant

# UploadThing API Key
UPLOADTHING_TOKEN='your-uploadthing-token'
```

### 3. Start the App
```bash
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## How It Works
1. **Upload:** Add your PDF, TXT, or DOCX files via the Upload page.
2. **Parsing & Chunking:** The backend extracts and semantically chunks your document content.
3. **Embedding:** Each chunk is embedded using Gemini's embedding model.
4. **Storage:** Chunks and embeddings are stored in Astra DB (vector collection).
5. **Chat:** When you chat, your question is embedded, relevant chunks are retrieved from Astra DB, and Gemini (LLM) generates a context-aware answer.

## Security & Production
- Never expose your Google API or Astra DB tokens in the browser or client-side code.
- For production or multi-user scenarios, add authentication and user isolation.
- For large files or production, use persistent Astra DB collections and consider rate limiting.
- Uploaded files are processed in-memory and not stored on disk by default.

## Extending & Customization
- To support more file types, add new parsers in the upload API route.
- To change the LLM or embedding model, update the Google Generative AI integration.
- To support other vector DBs, replace Astra DB logic in the API routes.

## License
MIT

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Generative AI (Gemini) Docs](https://ai.google.dev/)
- [DataStax Astra DB Docs](https://docs.datastax.com/en/astra/astra-db-vector/vector-intro.html)
- [UploadThing Docs](https://docs.uploadthing.com/)
- [LangChain Docs](https://js.langchain.com/docs/)

## Deploy on Vercel
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
