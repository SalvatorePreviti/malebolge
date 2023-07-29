import "./main.css";

import { createRoot } from "react-dom/client";

import { App } from "./ui/App";
import { themeCssVariables } from "./theme/css";

const root = document.getElementById("app-root")!;

root.classList.add(themeCssVariables);

createRoot(root).render(<App />);
