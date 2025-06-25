import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function parseTxtBuffer(buffer: Buffer) {
  return buffer.toString("utf-8");
}

async function parsePdfBuffer(buffer: Buffer) {
  try {
    // @ts-expect-error: No types for pdf-parse
    // eslint-disable-next-line
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (err) {
    console.log({err});
    throw new Error("pdf parse error");
  }
}

async function parseDocxBuffer(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function embedChunksGenAI(chunks: string[], genAI: GoogleGenerativeAI): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const chunk of chunks) {
    const model = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });
    const result = await model.embedContent(chunk);
    const vector = result.embedding.values;
    embeddings.push(vector as number[]);
  }
  return embeddings;
}

// Utility to clean up parsed text
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')                // Normalize newlines
    .replace(/\n{2,}/g, '\n')              // Collapse multiple newlines
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)         // Remove empty lines
    .join('\n');
}

// Utility to remove personal info (emails, phones, usernames)
function removePersonalInfo(text: string): string {
  return text
    .replace(/\S+@\S+\.\S+/g, '') // emails
    .replace(/\+?\d[\d\s\-]{7,}\d/g, '') // phone numbers
    .replace(/\bnaeemdadi\b/gi, '') // username (customize as needed)
    .replace(/\n{2,}/g, '\n') // collapse newlines
    .replace(/\s{2,}/g, ' '); // collapse spaces
}

// Utility to split by common section headers
function splitBySections(text: string): string[] {
  return text.split(/(?=Skills|Professional Experience|Projects|Education)/g);
}

// Utility to split by bullet points or paragraphs
function splitByBullets(section: string): string[] {
  return section.split(/\n[•\-]\s?/g).map(s => s.trim()).filter(Boolean);
}

export async function POST(req: NextRequest) {
  const {
    GOOGLE_API_KEY,
    ASTRA_DB_KEYSPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
  } = process.env;

  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: "GOOGLE_API_KEY is not set in the environment." }, { status: 500 });
  }
  if (!ASTRA_DB_API_ENDPOINT || !ASTRA_DB_APPLICATION_TOKEN || !ASTRA_DB_KEYSPACE || !ASTRA_DB_COLLECTION) {
    return NextResponse.json({ error: "Astra DB environment variables are not set." }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  const { fileUrl, fileType } = body ?? {};
  if (!fileUrl || !fileType) {
    return NextResponse.json({ error: "Missing fileUrl or fileType" }, { status: 400 });
  }

  // Download the file from UploadThing
  let fileBuffer: Buffer;
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Failed to download file from UploadThing");
    const arrayBuffer = await response.arrayBuffer();
    fileBuffer = Buffer.from(arrayBuffer);
    console.log("fileBuffer type:", typeof fileBuffer, "isBuffer:", Buffer.isBuffer(fileBuffer), "length:", fileBuffer.length);
    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json({ error: "Downloaded file is empty" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to download file from UploadThing" }, { status: 500 });
  }

  // Parse the file
  let text = "";
  try {
    if (fileType === "application/pdf") {
      text = await parsePdfBuffer(fileBuffer);
    } else if (fileType === "text/plain") {
      text = await parseTxtBuffer(fileBuffer);
    } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      text = await parseDocxBuffer(fileBuffer);
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
    text = cleanText(text); // Clean up the parsed text
    text = removePersonalInfo(text); // Remove personal info
  } catch (err) {
    return NextResponse.json({ error: "Failed to parse file" }, { status: 500 });
  }

  // --- Improved semantic chunking ---
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
  });

  let chunks: string[] = [];
  try {
    // Split by sections
    const sections = splitBySections(text);
    // Split each section by bullets/paragraphs, then flatten
    let semanticChunks = sections.flatMap(splitByBullets);
    // Optionally, further chunk long sections using langchain splitter
    for (const chunk of semanticChunks) {
      if (chunk.length > 600) {
        chunks.push(...(await splitter.splitText(chunk)));
      } else if (chunk.length > 0) {
        chunks.push(chunk);
      }
    }
    // Remove empty or very short chunks
    chunks = chunks.map(c => c.trim()).filter(c => c.length > 30);
    console.log({chunks});
  } catch (err) {
    console.log({err});
    return NextResponse.json({ error: "Failed to create semantic chunks" }, { status: 500 });
  }

  // --- RAG logic ---
  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY!);
  const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
  const db = client.db(ASTRA_DB_API_ENDPOINT, {
    keyspace: ASTRA_DB_KEYSPACE
  });

  let embeddings: number[][] = [];
  try {
    const collections = await db.listCollections();
    const collectionExists = collections.some(
      (col) => col.name === ASTRA_DB_COLLECTION
    );

    if (!collectionExists) {
      const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
          dimension: 768,
          metric: "cosine"
        }
      });
      console.log(`Collection created: ${res}`);
    } else {
      console.log("Collection already exists, skipping creation.");
    }
    embeddings = await embedChunksGenAI(chunks, genAI);
    console.log({embeddings});
  } catch (err) {
    console.log({err});
    return NextResponse.json({ error: "Failed to create embeddings" }, { status: 500 });
  }

  // Store chunks and embeddings in Astra DB
  try {
    const collection = db.collection(ASTRA_DB_COLLECTION!);
    for (let i = 0; i < chunks.length; i++) {
      await collection.insertOne({
        chunk: chunks[i],
        $vector: embeddings[i],
        uploaded: new Date().toISOString(),
      });
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to store embeddings in database" }, { status: 500 });
  }

  return NextResponse.json({ message: "File processed and stored", chunkCount: chunks.length, chunks });
} 