import { convertToModelMessages, streamText, UIMessage } from "ai";
import { registry } from "./models";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: registry.languageModel("openai:fast"),
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("Error straming chat completion: ", err);
    return new Response("Failed to stram chat completion", { status: 500 });
  }
}
