import "./theme/css";

import { createRoot } from "react-dom/client";

import { App } from "./ui/App";

const root = document.getElementById("app-root")!;

createRoot(root).render(<App />);
