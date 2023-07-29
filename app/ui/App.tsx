import { css, Global } from "@emotion/react";
import "./App.css";

import type { FC } from "react";
import { LeftToolbar } from "./LeftToolbar";
import { ThemeColors } from "../theme/colors";

const AppMainStyle = css`
  background-color: ${ThemeColors.secondary.dark};
`;

export const App: FC = () => {
  return (
    <Global
      styles={{
        ".some-class": {
          fontSize: 50,
          textAlign: "center",
        },
      }}
    >
      <LeftToolbar />
      <div css={AppMainStyle}>APP MAIN</div>
    </Global>
  );
};
