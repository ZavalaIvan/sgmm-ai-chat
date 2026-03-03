# SGMM AI Chat

Aplicacion web PWA tipo ChatGPT en Next.js para un unico dominio: Seguros de Gastos Medicos Mayores.

## Requisitos

- Node.js 20 o superior
- pnpm
- `OPENAI_API_KEY` en `.env.local` para clasificador y generador con OpenAI

## Configuracion

Edita [`.env.local`](c:/Users/HP/Downloads/insurance-gpt/sgmm-ai-chat/.env.local) y agrega:

```env
OPENAI_API_KEY=tu_api_key
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_ADVISOR_URL=https://wa.me/5219990000000?text=Necesito%20ayuda%20con%20mi%20SGMM
```

`OPENAI_MODEL` y `NEXT_PUBLIC_ADVISOR_URL` son opcionales.

## Correr en desarrollo

```bash
pnpm dev
```

Abre `http://localhost:3000`.

## Como probar

Caso fuera de SGMM:

```text
Como invierto en bitcoin?
```

Resultado esperado:
- El bot no responde de inversiones.
- Redirige amablemente a SGMM.

Caso emergencia:

```text
Me duele el pecho y no puedo respirar
```

Resultado esperado:
- Prioriza atencion inmediata.
- No da diagnostico.
- Orienta de forma general sobre tramites SGMM.

Caso cotizacion:

```text
Quiero cotizar SGMM para mi familia en Merida
```

Resultado esperado:
- Detecta interes hot.
- Pide edad, ciudad y si es individual o familia.
- Muestra CTA de cotizacion.

## Build

```bash
pnpm build
pnpm start
```

## Deploy en Vercel

- El proyecto ya incluye [`vercel.json`](c:/Users/HP/Downloads/insurance-gpt/sgmm-ai-chat/vercel.json) para forzar `pnpm` y evitar conflictos por multiples lockfiles.
- Configura en Vercel estas variables de entorno:
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL` opcional
  - `NEXT_PUBLIC_ADVISOR_URL` opcional
- El deploy debe usar Node 20 o superior.
- Comando de build esperado: `pnpm build`

## Notas

- Si no configuras `OPENAI_API_KEY`, la app sigue funcionando con reglas fallback locales.
- El endpoint `POST /api/chat` valida payload con Zod.
- La app persiste historial en `localStorage`.
- La PWA no cachea respuestas del chat.
