import { css, Global } from "@emotion/react";
import type { FC } from "react";

import { themeCssVars } from "../theme/css";
import { LeftToolbar } from "./LeftToolbar";

const AppMainStyle = css`
  background-color: #666;
  flex-grow: 1;
`;

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
      <div css={AppMainStyle}>APP MAIN</div>
    </>
  );
};
