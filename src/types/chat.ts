export type ChatRole = "user" | "assistant";

export type Intent = "info" | "compare" | "quote" | "claims" | "emergency";

export type Emotion = "calm" | "anxious" | "angry" | "confused" | "urgent";

export type SalesStage = "cold" | "warm" | "hot";

export type NextBestAction =
  | "educate"
  | "ask_questions"
  | "offer_quote"
  | "handoff_human"
  | "safety_redirect";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  isStreaming?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  messages: ApiChatMessage[];
}

export interface RiskFlags {
  medical_emergency: boolean;
  needs_professional: boolean;
  personal_data_sensitive: boolean;
}

export interface ClassificationResult {
  topic_allowed: boolean;
  intent: Intent;
  emotion: Emotion;
  sales_stage: SalesStage;
  next_best_action: NextBestAction;
  risk_flags: RiskFlags;
  suggested_questions: string[];
  sales_angle: string;
}

export interface ParsedAssistantMessage {
  summary: string;
  detail: string;
  nextQuestion: string;
  cta: string;
  handoff: boolean;
}
