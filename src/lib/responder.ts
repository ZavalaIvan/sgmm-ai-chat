import type { ClassificationResult } from "../types/chat";

export function formatAssistantResponse(args: {
  summary: string;
  detail: string;
  nextQuestion: string;
  cta?: string;
  handoff: boolean;
}) {
  return [
    "RESUMEN:",
    args.summary.trim() || "No aplica",
    "",
    "DETALLE:",
    args.detail.trim() || "No aplica",
    "",
    "SIGUIENTE:",
    args.nextQuestion.trim() || "Que parte de tu SGMM quieres revisar?",
    "",
    "CTA:",
    args.cta?.trim() || "No aplica",
    "",
    "HANDOFF:",
    String(args.handoff),
  ].join("\n");
}

export function buildFallbackResponse(
  classification: ClassificationResult,
): string {
  if (classification.risk_flags.medical_emergency) {
    return formatAssistantResponse({
      summary:
        "Esto suena a una posible emergencia medica. Busca atencion inmediata o llama a emergencias ahora mismo si el riesgo es actual.",
      detail:
        "No puedo dar diagnostico. Si ya vas en camino o estas en el hospital, despues puedes revisar tu poliza SGMM, red hospitalaria, autorizacion y reembolso segun el caso. Si necesitas tramite urgente, un asesor humano puede ayudarte a ubicar el proceso correcto.",
      nextQuestion: "Ya pediste ayuda medica inmediata o estas en un hospital?",
      cta: "Puedo ayudarte a escalar el tramite SGMM con un asesor.",
      handoff: true,
    });
  }

  if (!classification.topic_allowed) {
    return formatAssistantResponse({
      summary:
        "Solo puedo ayudarte con Seguros de Gastos Medicos Mayores. Si quieres, te oriento en cotizacion, coberturas, deducible, coaseguro o uso de poliza.",
      detail:
        "No voy a responder temas fuera de SGMM. Si me dices tu duda sobre gastos medicos mayores, puedo encauzarte rapido y sin inventar informacion.",
      nextQuestion:
        "Quieres ayuda con cotizacion, coberturas o usar una poliza?",
      cta: "No aplica",
      handoff: false,
    });
  }

  if (classification.intent === "quote") {
    const cta =
      classification.sales_stage === "hot"
        ? "Puedo cotizar en 2 minutos. Comparte edad, ciudad y si es individual o familia."
        : "Si quieres, te armo 2 opciones: economica vs completa.";

    return formatAssistantResponse({
      summary:
        "Puedo orientarte para cotizar SGMM y aterrizar opciones segun precio, red hospitalaria y nivel de cobertura.",
      detail:
        "Para cotizar bien normalmente importan edad, ciudad, tipo de asegurado y prioridades como hospitales, maternidad, deducible o preexistencias. Si aun no quieres compartir datos, tambien puedo explicarte como comparar planes.",
      nextQuestion:
        classification.sales_stage === "hot"
          ? "Que edades tienen, en que ciudad estan y es individual o familia?"
          : "Que priorizas mas: precio, hospitales o cobertura amplia?",
      cta,
      handoff: classification.sales_stage === "hot",
    });
  }

  if (classification.intent === "claims") {
    return formatAssistantResponse({
      summary:
        "Puedo darte una guia general para usar tu poliza SGMM sin inventar procesos especificos de una aseguradora.",
      detail:
        "El flujo exacto depende de tu aseguradora y tipo de atencion: programada, emergencia o reembolso. Normalmente necesitas validar red, autorizacion previa cuando aplique, documentos medicos y datos de la poliza.",
      nextQuestion:
        "Fue atencion programada, emergencia o quieres pedir reembolso?",
      cta: "Si quieres, te conecto con un asesor para revisar el tramite.",
      handoff: true,
    });
  }

  if (classification.intent === "compare") {
    return formatAssistantResponse({
      summary:
        "Puedo ayudarte a comparar SGMM por deducible, coaseguro, red hospitalaria, topes y extras relevantes.",
      detail:
        "La comparacion util no se basa solo en precio. Conviene revisar tabuladores, conversion a vitalicio, maternidad, preexistencias, renovacion y la red de hospitales que realmente te interesa usar.",
      nextQuestion: "Quieres comparar por precio o por nivel de cobertura?",
      cta:
        classification.sales_stage === "warm"
          ? "Si quieres, te armo 2 opciones: economica vs completa."
          : "No aplica",
      handoff: false,
    });
  }

  return formatAssistantResponse({
    summary:
      "Puedo explicarte SGMM de forma clara: deducible, coaseguro, coberturas, exclusiones y uso de poliza.",
    detail:
      "Si me dices tu objetivo, adapto la respuesta a compra, comparacion o uso de una poliza existente. Voy a mantenerme dentro de SGMM para darte informacion mas util y segura.",
    nextQuestion: "Que parte de tu SGMM quieres entender mejor?",
    cta: "No aplica",
    handoff: false,
  });
}
