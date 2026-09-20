import type { KspPlan, Lang } from "../types";

/** Безопасное имя файла: КСП_Тема_2026-09-20.docx */
export function buildFileName(
  plan: KspPlan,
  lang: Lang,
  extension: "docx" | "pdf",
): string {
  const prefix = lang === "ru" ? "КСП" : "ҚМЖ";
  const topic = (plan.header.topic || "urok")
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 60);
  const date = plan.header.date || new Date().toISOString().slice(0, 10);
  return `${prefix}_${topic}_${date}.${extension}`;
}
