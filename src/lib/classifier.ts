import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { buildClassifierUserPrompt, classifierSystemPrompt } from "./prompts";
import { DEFAULT_OPENAI_MODEL, getOpenAIClient, hasOpenAIKey } from "./openai";
import type { ApiChatMessage, ClassificationResult } from "../types/chat";

export const classificationSchema = z.object({
  topic_allowed: z.boolean(),
  intent: z.enum(["info", "compare", "quote", "claims", "emergency"]),
  emotion: z.enum(["calm", "anxious", "angry", "confused", "urgent"]),
  sales_stage: z.enum(["cold", "warm", "hot"]),
  next_best_action: z.enum([
    "educate",
    "ask_questions",
    "offer_quote",
    "handoff_human",
    "safety_redirect",
  ]),
  risk_flags: z.object({
    medical_emergency: z.boolean(),
    needs_professional: z.boolean(),
    personal_data_sensitive: z.boolean(),
  }),
  suggested_questions: z.array(z.string()).max(3),
  sales_angle: z.string(),
});

const sgmmKeywords = [
  "sgmm",
  "seguro",
  "gastos medicos",
  "gastos médicos",
  "poliza",
  "póliza",
  "deducible",
  "coaseguro",
  "hospital",
  "reembolso",
  "siniestro",
  "aseguradora",
  "cobertura",
  "preexistencia",
  "tabulador",
  "maternidad",
  "red medica",
  "red médica",
  "ambulancia",
  "cotizar",
  "cotizacion",
  "cotización",
];

const emergencyPatterns = [
  /no puedo respirar/i,
  /me estoy muriendo/i,
  /dolor en el pecho/i,
  /accidente/i,
  /sangrado/i,
  /desmayo/i,
  /urgencia/i,
  /emergencia/i,
  /hospital/i,
  /convulsion/i,
  /convulsión/i,
];

const anxiousPatterns = [/tengo miedo/i, /urgente/i, /preocup/i, /ayuda/i];
const angryPatterns = [/enojad/i, /molest/i, /pesimo/i, /p[eé]simo/i];
const confusedPatterns = [/no entiendo/i, /confund/i, /como funciona/i];
const quotePatterns = [/cotiz/i, /precio/i, /costo/i, /plan/i, /familia/i];
const comparePatterns = [/compar/i, /mejor/i, /vs\b/i, /opciones/i];
const claimsPatterns = [/reembolso/i, /siniestro/i, /usar mi poliza/i, /autoriz/i];

function inferEmotion(message: string): ClassificationResult["emotion"] {
  if (emergencyPatterns.some((pattern) => pattern.test(message))) {
    return "urgent";
  }
  if (anxiousPatterns.some((pattern) => pattern.test(message))) {
    return "anxious";
  }
  if (angryPatterns.some((pattern) => pattern.test(message))) {
    return "angry";
  }
  if (confusedPatterns.some((pattern) => pattern.test(message))) {
    return "confused";
  }

  return "calm";
}

export function heuristicClassify(
  messages: ApiChatMessage[],
): ClassificationResult {
  const lastUserMessage =
    [...messages].reverse().find((message) => message.role === "user")
      ?.content ?? "";
  const normalized = lastUserMessage.toLowerCase();
  const medical_emergency = emergencyPatterns.some((pattern) =>
    pattern.test(lastUserMessage),
  );
  const topic_allowed =
    medical_emergency ||
    sgmmKeywords.some((keyword) => normalized.includes(keyword));
  const personal_data_sensitive =
    /\b\d{8,}\b/.test(lastUserMessage) ||
    /@/.test(lastUserMessage) ||
    /mi poliza|mi p[oó]liza|telefono|tel[eé]fono/i.test(lastUserMessage);

  const intent = medical_emergency
    ? "emergency"
    : quotePatterns.some((pattern) => pattern.test(lastUserMessage))
      ? "quote"
      : claimsPatterns.some((pattern) => pattern.test(lastUserMessage))
        ? "claims"
        : comparePatterns.some((pattern) => pattern.test(lastUserMessage))
          ? "compare"
          : "info";

  const sales_stage = medical_emergency
    ? "hot"
    : intent === "quote"
      ? "hot"
      : intent === "compare"
        ? "warm"
        : "cold";

  const next_best_action = medical_emergency
    ? "safety_redirect"
    : !topic_allowed
      ? "educate"
      : intent === "quote"
        ? "offer_quote"
        : intent === "claims"
          ? "handoff_human"
          : "ask_questions";

  return {
    topic_allowed,
    intent,
    emotion: inferEmotion(lastUserMessage),
    sales_stage,
    next_best_action,
    risk_flags: {
      medical_emergency,
      needs_professional: medical_emergency || intent === "claims",
      personal_data_sensitive,
    },
    suggested_questions: medical_emergency
      ? ["Ya pediste ayuda inmediata o estas en un hospital?"]
      : intent === "quote"
        ? ["Que edades tienen, en que ciudad estan y es individual o familia?"]
        : !topic_allowed
          ? [
              "Quieres ayuda con cotizacion, coberturas o uso de poliza SGMM?",
            ]
          : ["Que es lo que mas te importa: precio, hospitales o cobertura?"],
    sales_angle:
      sales_stage === "hot"
        ? "Cotizacion inmediata solicitando edad, ciudad y si es individual o familia."
        : sales_stage === "warm"
          ? "Comparar opcion economica vs completa."
          : "",
  };
}

export async function classifyConversation(
  messages: ApiChatMessage[],
): Promise<ClassificationResult> {
  if (!hasOpenAIKey()) {
    return heuristicClassify(messages);
  }

  const client = getOpenAIClient();
  if (!client) {
    return heuristicClassify(messages);
  }

  try {
    const completion = await client.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      temperature: 0.1,
      response_format: zodResponseFormat(
        classificationSchema,
        "sgmm_classifier",
      ),
      messages: [
        {
          role: "system",
          content: classifierSystemPrompt,
        },
        {
          role: "user",
          content: buildClassifierUserPrompt(messages),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return heuristicClassify(messages);
    }

    return classificationSchema.parse(JSON.parse(raw));
  } catch {
    return heuristicClassify(messages);
  }
}
