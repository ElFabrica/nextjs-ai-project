import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const body = await req.json();

  if (Array.isArray(body.texts)) {
    const { values, embeddings, usage } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: body.texts,
      maxParallelCalls: 5,
    });

    return Response.json({
      values,
      embeddings,
      usage,
      count: embeddings.length,
      dimensions: embeddings[0].length,
    });
  }

  const { value, embedding, usage } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: body.text,
  });

  return Response.json({
    value,
    embedding,
    usage,
    dimensions: embedding.length,
  });
}
