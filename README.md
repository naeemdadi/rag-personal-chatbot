# RAG Personal AI Assistant

A full-stack Retrieval-Augmented Generation (RAG) web application that acts as your personal AI assistant. Upload documents (PDF, TXT, DOCX) and chat with an AI that can reference your files.

## Features
- **Chat UI:** Clean, responsive chat interface (Next.js, React, Tailwind CSS)
- **File Upload:** UploadThing-style file upload for PDF, TXT, DOCX
- **Text Extraction:** Extracts and chunks text from uploaded files
- **Embeddings:** Uses OpenAI's `text-embedding-3-small` for vectorization
- **Vector DB:** Stores embeddings and chunks in **DataStax Astra DB** (cloud, managed)
- **RAG Flow:** Retrieves relevant context and generates answers with GPT-4

## Tech Stack
- **Frontend:** Next.js (React, App Router, Tailwind CSS)
- **Backend:** Next.js API routes (Node.js)
- **Embeddings & LLM:** OpenAI API
- **Vector DB:** [DataStax Astra DB](https://docs.datastax.com/en/astra/astra-db-vector/vector-intro.html) (cloud, managed)
- **File Parsing:** pdf-parse, mammoth, Node.js fs

## Getting Started

### 1. Clone & Install
```bash
pnpm install
```

### 2. Environment Variables
Create a `.env.local` file:

```env
GOOGLE_API_KEY='your-token'

# DataStax Astra DB
ASTRA_DB_API_ENDPOINT=https://<your-db-id>-<region>.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN=your-app-token
ASTRA_DB_KEYSPACE=your_keyspace
ASTRA_DB_COLLECTION=personal-assistant
```

# UploadThing API Key
UPLOADTHING_TOKEN='your-token'

### 3. Start the App
```bash
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Switching to Pinecone
This boilerplate uses **DataStax Astra DB** for simplicity and local development. To use [Pinecone](https://www.pinecone.io/):
- Replace DataStax Astra DB logic in `src/app/api/upload/route.ts` and `src/app/api/chat/route.ts` with Pinecone SDK calls.
- Add your Pinecone API key and environment to `.env.local`.
- See [Pinecone docs](https://docs.pinecone.io/docs/quickstart) for integration details.

## Security & Production
- Never expose your OpenAI or Astra DB tokens in the browser.
- Add authentication for multi-user scenarios.
- For large files or production, use persistent DataStax Astra DB collections.

## License
MIT

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
