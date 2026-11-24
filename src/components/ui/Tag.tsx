import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-full border border-line bg-raised px-3 py-1 font-display text-sm text-fg">{children}</li>
  );
}
