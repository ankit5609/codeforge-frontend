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
    <div className={cn("h-full overflow-auto bg-background font-mono text-xs leading-relaxed", className)}>
      <table className="w-full border-collapse">
        <tbody>
          {rows.map((row, idx) => {
            const bg =
              row.type === "add"
                ? "bg-primary/10"
                : row.type === "del"
                  ? "bg-destructive/10"
                  : "";
            const marker = row.type === "add" ? "+" : row.type === "del" ? "-" : " ";
            const markerColor =
              row.type === "add"
                ? "text-primary"
                : row.type === "del"
                  ? "text-destructive"
                  : "text-muted-foreground/40";
            return (
              <tr key={idx} className={bg}>
                <td className="w-10 select-none border-r border-border/40 px-2 text-right text-muted-foreground/50">
                  {row.type !== "add" ? (row as { oldNo: number }).oldNo : ""}
                </td>
                <td className="w-10 select-none border-r border-border/40 px-2 text-right text-muted-foreground/50">
                  {row.type !== "del" ? (row as { newNo: number }).newNo : ""}
                </td>
                <td className={cn("w-5 select-none px-1 text-center", markerColor)}>{marker}</td>
                <td className="whitespace-pre-wrap px-2 text-foreground/90">{row.text || " "}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
