"use client";

import { useState } from "react";

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        aria-label="Mais informações"
        className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-300 text-[10px] font-bold leading-none text-gray-700 hover:bg-gray-400"
      >
        ?
      </button>

      {open && (
        <span className="absolute left-1/2 top-6 z-10 w-56 -translate-x-1/2 rounded-md bg-gray-800 p-2 text-xs leading-snug text-white shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}
