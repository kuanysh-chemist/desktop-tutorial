/** Точка входа автономной сборки: то же приложение, но без сервера. */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./fonts.css";
import "../app/globals.css";
import KspApp from "../components/KspApp";

const root = document.getElementById("root");
if (!root) throw new Error("Нет корневого элемента");

createRoot(root).render(
  <StrictMode>
    <KspApp offline />
  </StrictMode>,
);
