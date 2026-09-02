// Цвет-акцент для каждого раздела приложения — приглушённая палитра,
// чтобы вкладки визуально различались, но не выбивались из общего стиля.
// Значения — CSS-переменные (см. index.css): так цвета сами подстраиваются
// под светлую/тёмную тему без лишней логики в компонентах.
export const SECTION = {
  journal: { accent: 'var(--accent-journal)', tint: 'var(--tint-journal)' }, // тёмно-бирюзовый
  classes: { accent: 'var(--accent-classes)', tint: 'var(--tint-classes)' }, // приглушённый синий
  report: { accent: 'var(--accent-report)', tint: 'var(--tint-report)' }, // приглушённый сливовый
}

// Тултип recharts рисует свою карточку с захардкоженным фоном — приводим её к теме.
export const TOOLTIP_STYLE = {
  contentStyle: { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink)' },
  labelStyle: { color: 'var(--ink)' },
}
