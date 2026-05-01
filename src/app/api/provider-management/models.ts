import { openai as originalOpenAi } from "@ai-sdk/openai";
import {
  customProvider,
  defaultSettingsMiddleware,
  wrapLanguageModel,
  createProviderRegistry,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const customOpenAi = customProvider({
  languageModels: {
    fast: originalOpenAi("gpt-5-nano"),
    smart: originalOpenAi("gpt-5-mini"),
    reasoning: wrapLanguageModel({
      model: originalOpenAi("gpt-5-nano"),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            openai: {
              reasoningEffort: "high",
            },
          },
        },
      }),
    }),
  },
  fallbackProvider: originalOpenAi,
});

//Precisa de apiKey
const customAnthropic = customProvider({
  languageModels: {
    fast: anthropic("claude-3-haiku-20240307"),
    smart: anthropic("claude-sonnet-4-20250514"),
  },
});

export const registry = createProviderRegistry({
  openai: customOpenAi,
  anthropic: customAnthropic,
});
