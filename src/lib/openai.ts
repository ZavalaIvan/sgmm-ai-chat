import OpenAI from "openai";

export const DEFAULT_OPENAI_MODEL =
  process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getOpenAIClient() {
  if (!hasOpenAIKey()) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}
