"use client";

import type {
  ChatMessage as ChatMessageType,
  ParsedAssistantMessage,
} from "../types/chat";

function parseAssistantContent(content: string): ParsedAssistantMessage {
  const sections = {
    summary: "",
    detail: "",
    nextQuestion: "",
    cta: "",
    handoff: false,
  };

  const normalized = content.replace(/\r\n/g, "\n");
  const matchSection = (label: string, next: string[]) => {
    const pattern = new RegExp(
      `${label}:\\n([\\s\\S]*?)(?=\\n(?:${next.join("|")}):|$)`,
      "i",
    );
    return normalized.match(pattern)?.[1]?.trim() ?? "";
  };

  sections.summary = matchSection("RESUMEN", [
    "DETALLE",
    "SIGUIENTE",
    "CTA",
    "HANDOFF",
  ]);
  sections.detail = matchSection("DETALLE", ["SIGUIENTE", "CTA", "HANDOFF"]);
  sections.nextQuestion = matchSection("SIGUIENTE", ["CTA", "HANDOFF"]);
  sections.cta = matchSection("CTA", ["HANDOFF"]);
  sections.handoff = /HANDOFF:\s*true/i.test(normalized);

  if (!sections.summary && !sections.detail && !sections.nextQuestion) {
    sections.summary = normalized.trim();
  }

  return sections;
}

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";
  const parsed = isAssistant ? parseAssistantContent(message.content) : null;
  const detail =
    parsed?.detail && parsed.detail.toLowerCase() !== "no aplica"
      ? parsed.detail
      : "";
  const nextQuestion = parsed?.nextQuestion?.trim() ?? "";
  const cta =
    parsed?.cta && parsed.cta.toLowerCase() !== "no aplica" ? parsed.cta : "";

  return (
    <article
      className={`w-full px-4 py-6 sm:px-6 ${
        isAssistant
          ? "bg-transparent text-slate-100"
          : "rounded-2xl border border-white/8 bg-[#444654] text-slate-100"
      }`}
    >
      {isAssistant ? (
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="space-y-4 text-[15px] leading-7 text-slate-100">
            <p className="whitespace-pre-wrap">
              {parsed?.summary}
              {message.isStreaming ? (
                <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded bg-slate-300/80 align-middle" />
              ) : null}
            </p>
            {detail ? <p className="whitespace-pre-wrap text-slate-200">{detail}</p> : null}
            {cta ? <p className="whitespace-pre-wrap text-slate-100">{cta}</p> : null}
            {nextQuestion ? (
              <p className="whitespace-pre-wrap text-slate-100">{nextQuestion}</p>
            ) : null}
          </div>
          {parsed?.handoff ? (
            <a
              className="inline-flex items-center rounded-md border border-emerald-400/25 bg-emerald-400/12 px-4 py-2 text-sm font-medium text-emerald-50 transition hover:bg-emerald-400/18"
              href={
                process.env.NEXT_PUBLIC_ADVISOR_URL?.trim() ||
                "https://wa.me/5219990000000?text=Necesito%20ayuda%20con%20mi%20SGMM"
              }
              rel="noreferrer"
              target="_blank"
            >
              Hablar con asesor
            </a>
          ) : null}
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">
          <p className="whitespace-pre-wrap text-[15px] leading-7">{message.content}</p>
        </div>
      )}
    </article>
  );
}
