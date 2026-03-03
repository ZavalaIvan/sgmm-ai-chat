"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  ClipboardList,
  HeartPulse,
  Info,
  Plus,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { QuickChips } from "./QuickChips";
import { useChatStore } from "../store/chatStore";
import type { ApiChatMessage } from "../types/chat";

function createMessage(role: "user" | "assistant", content: string) {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

async function readStreamingResponse(
  response: Response,
  onToken: (token: string) => void,
) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No streaming body available");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const lines = event.split("\n");
      const eventName =
        lines.find((line) => line.startsWith("event:"))?.slice(6).trim() ||
        "message";
      const data = lines
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5))
        .join("\n")
        .replace(/\\n/g, "\n");

      if (eventName === "token") {
        onToken(data);
      }
    }
  }
}

export function ChatShell() {
  const pathname = usePathname();
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  const hydrated = useChatStore((state) => state.hydrated);
  const pending = useChatStore((state) => state.pending);
  const addMessage = useChatStore((state) => state.addMessage);
  const createConversation = useChatStore((state) => state.createConversation);
  const replaceLastAssistantMessage = useChatStore(
    (state) => state.replaceLastAssistantMessage,
  );
  const selectConversation = useChatStore((state) => state.selectConversation);
  const setPending = useChatStore((state) => state.setPending);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeConversation =
    conversations.find(
      (conversation) => conversation.id === activeConversationId,
    ) ?? null;
  const messages = activeConversation?.messages ?? [];
  const showAdvisor = /HANDOFF:\s*true/i.test(
    [...messages]
      .reverse()
      .find((message) => message.role === "assistant")
      ?.content ?? "",
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversationId, messages.length]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || pending) {
      return;
    }

    const userMessage = createMessage("user", trimmed);

    addMessage(userMessage);
    addMessage({
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "RESUMEN:\nPensando...\n\nDETALLE:\nNo aplica\n\nSIGUIENTE:\n\nCTA:\nNo aplica\n\nHANDOFF:\nfalse",
      createdAt: new Date().toISOString(),
      isStreaming: true,
    });
    setPending(true);

    try {
      const payload: { messages: ApiChatMessage[] } = {
        messages: [...messages, userMessage].map((message) => ({
          role: message.role,
          content: message.content,
        })),
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener respuesta del asistente.");
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream")) {
        let fullText = "";
        await readStreamingResponse(response, (token) => {
          fullText += token;
          replaceLastAssistantMessage(fullText, true);
        });
        replaceLastAssistantMessage(fullText, false);
      } else {
        const data = (await response.json()) as { reply?: string; error?: string };
        if (!data.reply) {
          throw new Error(data.error || "Respuesta invalida del servidor.");
        }
        replaceLastAssistantMessage(data.reply, false);
      }
    } catch (error) {
      replaceLastAssistantMessage(
        "RESUMEN:\nNo pude completar la respuesta en este momento.\n\nDETALLE:\nIntenta de nuevo con una pregunta sobre SGMM, cotizacion, cobertura o uso de poliza.\n\nSIGUIENTE:\nQuieres intentar de nuevo tu pregunta SGMM?\n\nCTA:\nNo aplica\n\nHANDOFF:\nfalse",
        false,
      );
      toast.error(
        error instanceof Error ? error.message : "Ocurrio un error inesperado.",
      );
    } finally {
      setPending(false);
    }
  }

  const hasMessages = messages.length > 0;

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#343541] text-white">
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
          Cargando conversacion...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#343541] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-[260px] flex-col border-r border-white/5 bg-[#202123] p-3 md:flex">
          <div className="mb-4 rounded-xl border border-white/8 bg-[#26272d] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19c37d] text-[#202123] shadow-[0_8px_24px_rgba(25,195,125,0.18)]">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-white">
                  SGMM AI Chat
                </p>
                <p className="text-xs text-slate-400">
                  Seguros de Gastos Medicos
                </p>
              </div>
            </div>
          </div>
          <nav className="mb-3 space-y-1">
            <Link
              className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm transition ${
                pathname === "/seguro-medico"
                  ? "bg-[#343541] text-slate-100"
                  : "text-slate-300 hover:bg-[#2a2b32]"
              }`}
              href="/seguro-medico"
            >
              <HeartPulse className="h-4 w-4" />
              Seguro Medico
            </Link>
            <Link
              className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm transition ${
                pathname === "/conocenos"
                  ? "bg-[#343541] text-slate-100"
                  : "text-slate-300 hover:bg-[#2a2b32]"
              }`}
              href="/conocenos"
            >
              <Info className="h-4 w-4" />
              Conocenos
            </Link>
          </nav>
          <button
            className="flex items-center gap-3 rounded-md border border-white/10 px-4 py-3 text-sm text-slate-100 transition hover:bg-[#2a2b32]"
            onClick={createConversation}
            type="button"
          >
            <Plus className="h-4 w-4" />
            New Thread
          </button>

          <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="rounded-md px-3 py-3 text-sm text-slate-400">
                Aun no hay conversaciones guardadas.
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className={`block w-full rounded-md px-3 py-3 text-left text-sm transition ${
                    conversation.id === activeConversationId
                      ? "bg-[#343541] text-slate-100"
                      : "bg-transparent text-slate-300 hover:bg-[#2a2b32]"
                  }`}
                  onClick={() => selectConversation(conversation.id)}
                  type="button"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <ClipboardList className="h-3.5 w-3.5" />
                    Chat
                  </div>
                  <p className="mt-2 line-clamp-2 leading-6">
                    {conversation.title}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="space-y-2 border-t border-white/8 pt-3 text-sm text-slate-300">
            <a
              className="flex items-center gap-3 rounded-md px-3 py-2 transition hover:bg-[#2a2b32]"
              href={
                process.env.NEXT_PUBLIC_ADVISOR_URL?.trim() ||
                "https://wa.me/5219990000000?text=Necesito%20ayuda%20con%20mi%20SGMM"
              }
              rel="noreferrer"
              target="_blank"
            >
              <Stethoscope className="h-4 w-4" />
              Hablar con asesor
            </a>
            <div className="rounded-md px-3 py-2 text-slate-400">
              SGMM AI Chat
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-[#343541]">
          <header className="border-b border-white/5 px-4 py-3 md:hidden">
            <div className="mx-auto flex max-w-3xl items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#19c37d] text-[#202123]">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">SGMM AI</h1>
                <p className="text-xs text-slate-400">Asistente de SGMM</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            {!hasMessages ? (
              <section className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 pb-6 pt-4 md:min-h-[calc(100vh-96px)] md:overflow-hidden">
                <div className="w-full max-w-3xl">
                  <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#19c37d] text-[#202123] shadow-[0_8px_30px_rgba(25,195,125,0.18)]">
                      <Bot className="h-5 w-5" />
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                      SGMM AI
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-[15px]">
                      Chat especializado en Seguros de Gastos Medicos Mayores.
                      Explica coberturas, compara opciones, orienta tramites y
                      prioriza seguridad en emergencias.
                    </p>
                    <div className="mt-5 w-full max-w-xl">
                      <QuickChips onSelect={sendMessage} />
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="pb-28 pt-2">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={
                      message.role === "assistant"
                        ? "border-b border-white/5"
                        : index === messages.length - 1
                          ? "border-b border-white/5"
                          : ""
                    }
                  >
                    <ChatMessage message={message} />
                  </div>
                ))}
                <div ref={scrollRef} />
              </section>
            )}
          </main>

          <ChatInput
            disabled={pending}
            onClear={createConversation}
            onSend={sendMessage}
            showAdvisor={showAdvisor}
          />
        </div>
      </div>
    </div>
  );
}
