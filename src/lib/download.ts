/** Saves a file on phones, tablets and computers. Call synchronously from a click so iOS keeps the tap. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.rel = "noopener"; a.style.display = "none";
  document.body.appendChild(a); a.click(); a.remove();
  // Revoking immediately cancels the download on Safari/iPad, so wait.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
export const download = (name: string, text: string, type = "text/csv") => downloadBlob(new Blob(["\ufeff" + text], { type: `${type};charset=utf-8` }), name);

/** Opens a file straight away: phones/tablets get the system sheet (Open in Excel/Numbers/Sheets), computers save and open it. */
export async function openFile(blob: Blob, filename: string): Promise<"shared" | "saved"> {
  const file = new File([blob], filename, { type: blob.type });
  const touch = typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return "shared"; } catch (e) { if ((e as Error).name === "AbortError") return "shared"; }
  }
  downloadBlob(blob, filename);
  // Also open a viewer tab; browsers hand the workbook to Excel/the default spreadsheet app.
  const url = URL.createObjectURL(blob); window.open(url, "_blank"); setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return "saved";
}
