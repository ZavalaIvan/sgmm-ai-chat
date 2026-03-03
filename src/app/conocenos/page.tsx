import Link from "next/link";

export default function ConocenosPage() {
  return (
    <main className="min-h-screen bg-[#343541] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-[#40414f] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">
          Conocenos
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          SGMM AI Chat
        </h1>
        <p className="mt-6 text-base leading-8 text-slate-200">
          SGMM AI Chat es un asistente digital enfocado en orientar a usuarios
          sobre seguros de gastos medicos mayores. Su objetivo es explicar mejor
          conceptos clave, ayudar a comparar opciones, acompañar tramites de
          manera general y detectar cuando conviene escalar a un asesor humano.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <section className="rounded-2xl border border-white/8 bg-[#343541] p-5">
            <h2 className="text-lg font-semibold">Especializacion</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Se mantiene dentro del tema SGMM y evita responder fuera de ese
              dominio.
            </p>
          </section>
          <section className="rounded-2xl border border-white/8 bg-[#343541] p-5">
            <h2 className="text-lg font-semibold">Seguridad</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              No da diagnosticos medicos ni reemplaza la revision de una poliza o
              el criterio de una aseguradora.
            </p>
          </section>
          <section className="rounded-2xl border border-white/8 bg-[#343541] p-5">
            <h2 className="text-lg font-semibold">Acompanamiento</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Cuando detecta casos complejos o sensibles, sugiere hablar con un
              asesor para seguimiento.
            </p>
          </section>
        </div>
        <div className="mt-8">
          <Link
            className="inline-flex rounded-md border border-white/10 bg-[#202123] px-4 py-3 text-sm text-slate-100 transition hover:bg-[#2a2b32]"
            href="/"
          >
            Volver al chat
          </Link>
        </div>
      </div>
    </main>
  );
}
