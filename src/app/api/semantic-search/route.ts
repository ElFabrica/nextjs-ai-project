import { embed, embedMany, cosineSimilarity } from "ai";
import { openai } from "@ai-sdk/openai";
import { movies } from "./data";

export async function POST(req: Request) {
  const { query } = await req.json();

  const { embeddings: moviesEmbeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: movies.map((movies) => movies.description),
  });

  const { embedding: queryEmbedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  });

  const moviesWithScores = movies.map((movie, index) => {
    const similarity = cosineSimilarity(
      queryEmbedding,
      moviesEmbeddings[index],
    );

    return {
      ...movie,
      similarity,
    };
  });
  moviesWithScores.sort((a, b) => b.similarity - a.similarity);

  const threshold = 0.4;
  const relevantResults = moviesWithScores.filter(
    (movies) => movies.similarity > threshold,
  );

  const topResults = relevantResults.slice(0.3);

  return Response.json({ query, results: topResults });
}
