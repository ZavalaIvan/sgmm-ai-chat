"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChatConversation, ChatMessage } from "../types/chat";

const STORAGE_KEY = "sgmm-ai-chat:v1";
const DEFAULT_TITLE = "Nueva conversacion";

function createConversation(title = DEFAULT_TITLE): ChatConversation {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

function buildConversationTitle(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return DEFAULT_TITLE;
  }

  return normalized.length > 42 ? `${normalized.slice(0, 42)}...` : normalized;
}

interface ChatState {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  hydrated: boolean;
  pending: boolean;
  addMessage: (message: ChatMessage) => void;
  createConversation: () => void;
  replaceLastAssistantMessage: (content: string, isStreaming: boolean) => void;
  selectConversation: (conversationId: string) => void;
  setPending: (value: boolean) => void;
  setHydrated: (value: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      activeConversationId: null,
      hydrated: false,
      pending: false,
      addMessage: (message) =>
        set((state) => {
          const currentConversation =
            state.conversations.find(
              (conversation) => conversation.id === state.activeConversationId,
            ) ?? createConversation();

          const currentMessages = [...currentConversation.messages, message];
          const nextConversation: ChatConversation = {
            ...currentConversation,
            title:
              currentConversation.messages.length === 0 && message.role === "user"
                ? buildConversationTitle(message.content)
                : currentConversation.title,
            messages: currentMessages,
            updatedAt: new Date().toISOString(),
          };

          const otherConversations = state.conversations.filter(
            (conversation) => conversation.id !== currentConversation.id,
          );

          return {
            activeConversationId: currentConversation.id,
            conversations: [nextConversation, ...otherConversations].sort(
              (a, b) => b.updatedAt.localeCompare(a.updatedAt),
            ),
          };
        }),
      createConversation: () =>
        set((state) => {
          const conversation = createConversation();
          return {
            activeConversationId: conversation.id,
            pending: false,
            conversations: [conversation, ...state.conversations],
          };
        }),
      replaceLastAssistantMessage: (content, isStreaming) =>
        set((state) => {
          const activeConversation = state.conversations.find(
            (conversation) => conversation.id === state.activeConversationId,
          );

          if (!activeConversation) {
            return state;
          }

          const messages = [...activeConversation.messages];
          const index = [...messages]
            .reverse()
            .findIndex((message) => message.role === "assistant");

          if (index === -1) {
            messages.push({
              id: crypto.randomUUID(),
              role: "assistant",
              content,
              createdAt: new Date().toISOString(),
              isStreaming,
            });
          } else {
            const actualIndex = messages.length - 1 - index;
            const target = messages[actualIndex];

            messages[actualIndex] = {
              ...target,
              content,
              isStreaming,
            };
          }

          const updatedConversation: ChatConversation = {
            ...activeConversation,
            messages,
            updatedAt: new Date().toISOString(),
          };

          return {
            conversations: state.conversations
              .map((conversation) =>
                conversation.id === updatedConversation.id
                  ? updatedConversation
                  : conversation,
              )
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
          };
        }),
      selectConversation: (conversationId) =>
        set({
          activeConversationId: conversationId,
          pending: false,
        }),
      setPending: (value) => set({ pending: value }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
      onRehydrateStorage: () => (state) => {
        if (
          state &&
          !state.activeConversationId &&
          state.conversations.length > 0
        ) {
          state.selectConversation(state.conversations[0].id);
        }

        state?.setHydrated(true);
      },
    },
  ),
);
