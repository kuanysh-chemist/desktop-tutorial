/** Отдаёт blob браузеру на скачивание без внешних зависимостей. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Отзываем с задержкой: иначе часть браузеров не успевает начать загрузку.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
