"use client";

export default function ExportCsvButton({
  rows, filename,
}: { rows: Record<string, string | number>[]; filename: string }) {
  function exportCsv() {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const escape = (v: string | number) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <button className="btn btn-ghost btn-sm" onClick={exportCsv} disabled={!rows.length}>
      Export Training Records
    </button>
  );
}
