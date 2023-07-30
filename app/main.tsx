import "./main.css";
import "@fontsource/inter/latin.css";
import "@fontsource/jetbrains-mono/latin.css";

import { createRoot } from "react-dom/client";

import { App } from "./ui/App";

const root = document.getElementById("app-root")!;

createRoot(root).render(<App />);
