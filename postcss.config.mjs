/**
 * Один конвейер стилей на две сборки: Next.js и автономную через Vite.
 * Форма записи — объектом, а не массивом строк: массив понимает только
 * Next.js, а Vite требует объект или готовый плагин.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
