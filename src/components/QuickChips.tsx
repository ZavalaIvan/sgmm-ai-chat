"use client";

const chips = [
  "Quiero cotizar",
  "Deducible / Coaseguro",
  "Ya tengo poliza y quiero usarla",
  "Emergencia / Hospital",
];

interface QuickChipsProps {
  onSelect: (value: string) => void;
}

export function QuickChips({ onSelect }: QuickChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip}
          className="rounded-full border border-white/10 bg-[#40414f] px-3 py-2 text-[12px] font-medium text-slate-100 transition hover:bg-[#4d5060] sm:px-4 sm:text-sm"
          onClick={() => onSelect(chip)}
          type="button"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
