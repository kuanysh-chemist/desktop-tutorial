/**
 * Библиотека планов в браузере.
 *
 * Хранится в localStorage: данные не покидают устройство учителя и переживают
 * перезагрузку страницы. Каждое обращение обёрнуто в try/catch — в приватном
 * окне и при заблокированных данных сайта localStorage бросает исключение,
 * и приложение обязано продолжить работать без сохранения.
 */
import type { ExtraKey, KspPlan, Lang, LessonInput } from "./types";

const LIBRARY_KEY = "ksp-library-v1";
const DRAFT_KEY = "ksp-draft-v1";
const LIBRARY_LIMIT = 100;

export interface SavedPlan {
  id: string;
  savedAt: string;
  lang: Lang;
  input: LessonInput;
  plan: KspPlan;
  enabled: Record<ExtraKey, boolean>;
}

export interface Draft {
  lang: Lang;
  input: LessonInput;
  plan: KspPlan | null;
  enabled: Record<ExtraKey, boolean>;
}

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `ksp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export function loadLibrary(): SavedPlan[] {
  const items = read<SavedPlan[]>(LIBRARY_KEY);
  if (!Array.isArray(items)) return [];
  // Отбрасываем записи, повреждённые ручной правкой хранилища или прошлой версией.
  return items.filter(
    (item) => item && typeof item.id === "string" && item.plan?.stages?.length === 3,
  );
}

/** Добавляет или обновляет запись; свежие идут первыми. */
export function savePlan(entry: SavedPlan): SavedPlan[] {
  const rest = loadLibrary().filter((item) => item.id !== entry.id);
  const next = [entry, ...rest].slice(0, LIBRARY_LIMIT);
  write(LIBRARY_KEY, next);
  return next;
}

export function deletePlan(id: string): SavedPlan[] {
  const next = loadLibrary().filter((item) => item.id !== id);
  write(LIBRARY_KEY, next);
  return next;
}

export function duplicatePlan(id: string): SavedPlan[] {
  const source = loadLibrary().find((item) => item.id === id);
  if (!source) return loadLibrary();
  return savePlan({ ...source, id: newId(), savedAt: new Date().toISOString() });
}

export function loadDraft(): Draft | null {
  return read<Draft>(DRAFT_KEY);
}

export function saveDraft(draft: Draft): void {
  write(DRAFT_KEY, draft);
}

/** Доступно ли хранилище вообще — чтобы честно сказать об этом в интерфейсе. */
export function storageAvailable(): boolean {
  try {
    const probe = "__ksp_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
