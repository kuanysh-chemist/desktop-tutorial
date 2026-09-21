/**
 * Вторая сборка проекта — автономный сайт одним HTML-файлом.
 *
 * Next.js-версия нужна хостингу и Claude API. Но учителю в школе часто
 * проще другое: файл на флешке, который открывается двойным щелчком без
 * интернета, без установки и без чьей-либо учётной записи. Эта сборка
 * кладёт всё приложение — разметку, стили, шрифт, базу знаний, генератор
 * docx и pdfmake — внутрь одного .html.
 *
 * Запуск: npm run build:standalone
 */
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  root: "standalone",
  base: "./",
  // Tailwind подключён через postcss.config.mjs — тот же конвейер,
  // что и у сборки Next.js, чтобы стили не разъезжались между ними.
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    // Всё, включая шрифты, должно оказаться внутри html — иначе файл
    // перестанет работать, стоит его переложить в другую папку.
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 16_000,
    rollupOptions: {
      onwarn(warning, warn) {
        // «use client» — директива Next.js, для этой сборки она безвредна.
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
    },
  },
});
