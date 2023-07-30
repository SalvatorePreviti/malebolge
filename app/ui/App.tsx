import { css, Global } from "@emotion/react";
import type { FC } from "react";

import { themeCssVars } from "../theme/css";
import { AppMain } from "./AppMain";
import { LeftToolbar } from "./LeftToolbar";

const appGlobalCss = css`
  :root {
    ${themeCssVars}
  }

  .app-root {
    display: flex;
    flex-direction: row;
    height: 100vh;
    width: 100vw;
  }
`;

export const App: FC = () => {
  return (
    <>
      <Global styles={appGlobalCss} />
      <LeftToolbar />
      <AppMain />
    </>
  );
};
