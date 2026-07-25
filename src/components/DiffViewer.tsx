import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface DiffViewerProps {
  oldValue: string;
  newValue: string;
  className?: string;
}

type Row =
  | { type: "same"; oldNo: number; newNo: number; text: string }
  | { type: "add"; newNo: number; text: string }
  | { type: "del"; oldNo: number; text: string };

// Simple LCS-based line diff (no external deps).
function diffLines(a: string[], b: string[]): Row[] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const rows: Row[] = [];
  let i = 0;
  let j = 0;
  let oldNo = 1;
  let newNo = 1;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      rows.push({ type: "same", oldNo: oldNo++, newNo: newNo++, text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: "del", oldNo: oldNo++, text: a[i++] });
    } else {
      rows.push({ type: "add", newNo: newNo++, text: b[j++] });
    }
  }
  while (i < n) rows.push({ type: "del", oldNo: oldNo++, text: a[i++] });
  while (j < m) rows.push({ type: "add", newNo: newNo++, text: b[j++] });
  return rows;
}

export function DiffViewer({ oldValue, newValue, className }: DiffViewerProps) {
  const rows = useMemo(
    () => diffLines(oldValue.split("\n"), newValue.split("\n")),
    [oldValue, newValue],
  );

  return (
    <div className={cn("h-full overflow-auto font-mono text-xs leading-relaxed", className)} style={{ background: "var(--lp-bg)" }}>
      <table className="w-full border-collapse">
        <tbody>
          {rows.map((row, idx) => {
            const bg =
              row.type === "add"
                ? "rgba(69,196,184,0.09)"
                : row.type === "del"
                  ? "rgba(255,90,46,0.09)"
                  : "transparent";
            const marker = row.type === "add" ? "+" : row.type === "del" ? "-" : " ";
            const markerColor =
              row.type === "add"
                ? "var(--lp-teal)"
                : row.type === "del"
                  ? "var(--lp-ember)"
                  : "var(--lp-ink-faint)";
            return (
              <tr key={idx} style={{ background: bg }}>
                <td className="w-10 select-none px-2 text-right" style={{ borderRight: "1px solid var(--lp-border-soft)", color: "var(--lp-ink-faint)" }}>
                  {row.type !== "add" ? (row as { oldNo: number }).oldNo : ""}
                </td>
                <td className="w-10 select-none px-2 text-right" style={{ borderRight: "1px solid var(--lp-border-soft)", color: "var(--lp-ink-faint)" }}>
                  {row.type !== "del" ? (row as { newNo: number }).newNo : ""}
                </td>
                <td className="w-5 select-none px-1 text-center" style={{ color: markerColor }}>{marker}</td>
                <td className="whitespace-pre-wrap px-2" style={{ color: "var(--lp-ink-dim)" }}>{row.text || " "}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
