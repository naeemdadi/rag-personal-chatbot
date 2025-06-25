import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DataAPIClient } from "@datastax/astra-db-ts";

export async function POST(req: NextRequest) {
  const {
    GOOGLE_API_KEY,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_KEYSPACE,
    ASTRA_DB_APPLICATION_TOKEN,
  } = process.env;

  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: "GOOGLE_API_KEY is not set in the environment." }, { status: 500 });
  }

  const { messages } = await req.json();

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

  const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
  const db = client.db(ASTRA_DB_API_ENDPOINT!, {
    keyspace: ASTRA_DB_KEYSPACE
  });

  const latestMessage = messages?.length > 0 ? messages[messages.length - 1].content : "";

  let docContext = "";
  const model1 = genAI.getGenerativeModel({ model: "text-embedding-004" });
  console.log(model1);
  
  const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model1.embedContent(latestMessage);

  try {
    const collection = db.collection(ASTRA_DB_COLLECTION!);

    const documents = await collection
      .find({})
      .sort({ $vector: result.embedding.values })
      .limit(10)
      .toArray();

    const docsMap = documents?.map((doc) => doc.chunk);
    docContext = JSON.stringify(docsMap);
  } catch (err) {
    console.log(err)
  }

  // Compose prompt
  const prompt = `You are a helpful personal AI assistant with detailed knowledge of Naeem Dadi. If user asks anything other than information about Naeem, simply and politely decline. Anything else other than about Naeem should not be answered. Please add bullet points wherever necessary and format answer wherever applicable. Use the following context to answer the user's question.\n\nContext:\n${docContext}\n\nUser: ${latestMessage}\nAssistant:`;

  const stream = new ReadableStream({
    async start(controller) {
      const streamResponse = await model2.generateContentStream(prompt);
      for await (const chunk of streamResponse.stream) {
        controller.enqueue(new TextEncoder().encode(chunk.text()));
      }
      controller.close();
    }
  });

  return new Response(stream,
    { 
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked"
      }
    }
  );
} 