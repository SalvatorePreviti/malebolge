import { css, Global } from "@emotion/react";
import type { FC } from "react";

import { themeCssVars } from "../theme/css";
import { AppMain } from "./AppMain";
import { LeftToolbar } from "./LeftToolbar";
import { MainToolbar } from "./MainToolbar";

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

const appMainCss = css`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
`;

export const App: FC = () => {
  return (
    <>
      <Global styles={appGlobalCss} />
      <LeftToolbar />
      <div css={appMainCss}>
        <AppMain />
        <MainToolbar />
      </div>
    </>
  );
};
