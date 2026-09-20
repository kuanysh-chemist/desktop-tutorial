import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Генератор КСП по химии | Химиядан ҚМЖ генераторы",
  description:
    "Краткосрочные планы уроков химии по форме приказа № 130 Министерства просвещения РК. Русский и казахский языки, экспорт в DOCX и PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
