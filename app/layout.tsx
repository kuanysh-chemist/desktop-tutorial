import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Генератор КСП по химии | Химиядан ҚМЖ генераторы",
  description:
    "Краткосрочные планы уроков химии по форме приказа № 130 Министерства просвещения РК. Русский и казахский языки, экспорт в DOCX и PDF.",
};

/**
 * Выбранная тема применяется до первой отрисовки. Без этого страница при
 * тёмной теме успевает мигнуть белым, пока грузится JavaScript.
 */
const THEME_INIT = `try{var t=localStorage.getItem("ksp-theme");if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
