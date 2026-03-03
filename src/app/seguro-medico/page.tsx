import Link from "next/link";

export default function SeguroMedicoPage() {
  return (
    <main className="min-h-screen bg-[#343541] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-[#40414f] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/80">
          Seguro Medico
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Que es un Seguro de Gastos Medicos Mayores
        </h1>
        <p className="mt-6 text-base leading-8 text-slate-200">
          Un SGMM ayuda a cubrir gastos medicos de eventos mayores como
          hospitalizaciones, cirugias, tratamientos o emergencias, segun lo que
          marque tu poliza. Su utilidad real depende de revisar deducible,
          coaseguro, suma asegurada, red hospitalaria, exclusiones y condiciones
          de preexistencias.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-white/8 bg-[#343541] p-5">
            <h2 className="text-lg font-semibold">Que conviene revisar</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <li>Deducible y coaseguro</li>
              <li>Red de hospitales y medicos</li>
              <li>Tabuladores y suma asegurada</li>
              <li>Preexistencias y periodos de espera</li>
            </ul>
          </section>
          <section className="rounded-2xl border border-white/8 bg-[#343541] p-5">
            <h2 className="text-lg font-semibold">Cuando pedir asesoria</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <li>Si quieres comparar planes</li>
              <li>Si ya tienes poliza y vas a usarla</li>
              <li>Si necesitas cotizar para familia</li>
              <li>Si tienes dudas de cobertura real</li>
            </ul>
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
