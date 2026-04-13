import { openai } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { recipeSchema } from "./schema";

export async function POST(req: Request) {
  try {
    const { dish } = await req.json();

    const result = streamText({
      model: openai("gpt-4.1-nano"),
      prompt: `Me gere instruções para preparar o prato: ${dish}`,
      output: Output.object({ schema: recipeSchema }),
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("Error generating recipe: ", err);
    return new Response("Failed to generate recipe", { status: 500 });
  }
}
