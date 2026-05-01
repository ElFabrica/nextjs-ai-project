import { streamText, UIMessage, convertToModelMessages } from "ai";

import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: openai("gpt-5-nano"), //Só funciona com gpt-5-nano pra frente
      providerOptions: {
        openai: {
          reasoningSummary: "auto",
          reasoningEffort: "low",
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You are a helpful coding assistant. Keep resposnes under 3 sentences and focuson on pratical examples.",
        },
        ...(await convertToModelMessages(messages)),
      ],
    });

    result.usage.then((usage) => {
      console.log({
        MessageCount: messages.length,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
    });
  } catch (error) {
    console.error("Error streaming chat completion: ", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
