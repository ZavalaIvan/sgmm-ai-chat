"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import { ArrowUp, RotateCcw, ShieldPlus } from "lucide-react";

interface ChatInputProps {
  disabled: boolean;
  onClear: () => void;
  onSend: (message: string) => Promise<void>;
  showAdvisor: boolean;
}

export function ChatInput({
  disabled,
  onClear,
  onSend,
  showAdvisor,
}: ChatInputProps) {
  const [value, setValue] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }

    setValue("");
    await onSend(trimmed);
  }

  async function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }

    setValue("");
    await onSend(trimmed);
  }

  return (
    <div className="sticky bottom-0 z-20 bg-[linear-gradient(180deg,rgba(52,53,65,0)_0%,rgba(52,53,65,0.88)_24%,rgba(52,53,65,1)_100%)] px-4 pb-4 pt-6">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 pb-3">
        <button
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#202123] px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-[#2a2b32]"
          onClick={onClear}
          type="button"
        >
          <RotateCcw className="h-4 w-4" />
          Nueva conversacion
        </button>
        {showAdvisor ? (
          <a
            className="inline-flex items-center gap-2 rounded-md border border-emerald-400/20 bg-[#202123] px-3 py-2 text-xs font-medium text-emerald-100 transition hover:bg-[#2a2b32]"
            href={
              process.env.NEXT_PUBLIC_ADVISOR_URL?.trim() ||
              "https://wa.me/5219990000000?text=Necesito%20ayuda%20con%20mi%20SGMM"
            }
            rel="noreferrer"
            target="_blank"
          >
            <ShieldPlus className="h-4 w-4" />
            Hablar con asesor
          </a>
        ) : (
          <div />
        )}
      </div>
      <form
        className="mx-auto flex w-full max-w-3xl items-end gap-3 rounded-2xl border border-white/10 bg-[#40414f] px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
        onSubmit={handleSubmit}
      >
        <textarea
          className="min-h-[28px] max-h-40 flex-1 resize-none bg-transparent py-1 text-[15px] leading-6 text-white outline-none placeholder:text-slate-300/60"
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          rows={1}
          value={value}
        />
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-200 text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"
          disabled={disabled || !value.trim()}
          type="submit"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>
      <p className="mx-auto mt-3 max-w-3xl px-2 text-center text-[11px] leading-5 text-slate-400">
        SGMM AI puede cometer errores. Verifica coberturas, condiciones y tramites
        directamente con tu poliza o aseguradora.
      </p>
    </div>
  );
}
