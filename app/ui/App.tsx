import "./App.css";

import type { FC } from "react";
import { LeftToolbar } from "./LeftToolbar";

export const App: FC = () => {
  return (
    <>
      <LeftToolbar />
      <div className="app-main">APP MAIN</div>
    </>
  );
};
