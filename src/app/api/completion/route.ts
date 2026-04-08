import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxOutputTokens: 500,
    });

    return NextResponse.json({ text });
  } catch (error) {
    console.log("Error generating text:", error);

    return NextResponse.json(
      { error: "Failed to generate a text" },
      { status: 500 },
    );
  }
}
