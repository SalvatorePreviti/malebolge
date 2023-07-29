import { css } from "@linaria/core";
import "./App.css";

import type { FC } from "react";
import { LeftToolbar } from "./LeftToolbar";
import { ThemeColors } from "../theme/colors";

const AppMainStyle = css``;

//  background-color: ${ThemeColors.secondary.dark};

export const App: FC = () => {
  return (
    <>
      <LeftToolbar />
      <div className={AppMainStyle}>APP MAIN</div>
    </>
  );
};
