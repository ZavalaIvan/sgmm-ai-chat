import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  buildGeneratorUserPrompt,
  generatorSystemPrompt,
} from "../../../lib/prompts";
import { classifyConversation } from "../../../lib/classifier";
import { buildFallbackResponse } from "../../../lib/responder";
import {
  DEFAULT_OPENAI_MODEL,
  getOpenAIClient,
  hasOpenAIKey,
} from "../../../lib/openai";

export const runtime = "nodejs";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

function createSseResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

function encodeSse(event: string, data: string) {
  return `event: ${event}\ndata:${data.replace(/\n/g, "\\n")}\n\n`;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Payload invalido. Envia { messages: [{ role, content }] }.",
      },
      { status: 400 },
    );
  }

  const messages = parsed.data.messages.slice(-8);
  const classification = await classifyConversation(messages);
  const fallbackReply = buildFallbackResponse(classification);

  if (!hasOpenAIKey()) {
    return NextResponse.json({ reply: fallbackReply });
  }

  const client = getOpenAIClient();
  if (!client) {
    return NextResponse.json({ reply: fallbackReply });
  }

  try {
    const completion = await client.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      temperature: classification.risk_flags.medical_emergency ? 0.1 : 0.45,
      stream: true,
      messages: [
        {
          role: "system",
          content: generatorSystemPrompt,
        },
        {
          role: "user",
          content: buildGeneratorUserPrompt({
            messages,
            classification,
          }),
        },
      ],
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(
              encodeSse(
                "meta",
                JSON.stringify({
                  classification,
                }),
              ),
            ),
          );

          let received = "";

          for await (const chunk of completion) {
            const token = chunk.choices[0]?.delta?.content ?? "";
            if (!token) {
              continue;
            }

            received += token;
            controller.enqueue(encoder.encode(encodeSse("token", token)));
          }

          if (!received.trim()) {
            controller.enqueue(encoder.encode(encodeSse("token", fallbackReply)));
          }

          controller.enqueue(encoder.encode(encodeSse("done", "ok")));
          controller.close();
        } catch {
          controller.enqueue(encoder.encode(encodeSse("token", fallbackReply)));
          controller.enqueue(encoder.encode(encodeSse("done", "fallback")));
          controller.close();
        }
      },
    });

    return createSseResponse(stream);
  } catch {
    return NextResponse.json({ reply: fallbackReply });
  }
}
