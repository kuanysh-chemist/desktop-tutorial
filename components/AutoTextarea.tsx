"use client";

import { useEffect, useRef } from "react";

/**
 * Поле, которое выглядит как обычный текст и растёт по содержимому.
 * Используется для ручного редактирования любой ячейки КСП.
 */
export default function AutoTextarea({
  value,
  onChange,
  className = "",
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Подстраховка для браузеров без field-sizing: content.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      aria-label={ariaLabel}
      value={value}
      rows={1}
      onChange={(event) => onChange(event.target.value)}
      className={`cell-input ${className}`}
    />
  );
}
