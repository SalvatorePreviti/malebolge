import { css } from "@emotion/react";
import { useAtom } from "@gravitas/atom-react";
import type { FC } from "react";

import { atom_leftToolbarWidth } from "../state/ui-atoms";
import { Shades } from "../theme/shades";
import { FpsGraph } from "./FpsGraph";
import { HVHandle } from "./HVHandle";

const LeftToolbarCss = css`
  display: flex;
  justify-content: stretch;
  border-right: 6px solid transparent;
`;

const LeftToolbarBodyCss = css`
  background-color: ${Shades.neutral.x900};
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
`;

const LeftToolbarHeader = css`
  height: 22px;
  background-color: ${Shades.neutral.x800};
  text-align: center;
  user-select: none;

  > img {
    left: 3px;
    top: 1px;
    position: absolute;
    margin: 3px 5px;
    pointer-events: none;
  }

  > b {
    display: block;
    flex-grow: 1;
    color: ${Shades.neutral.x400};
    white-space: nowrap;
    transition: color 0.2s ease-in-out;
    font-family: var(--font-mono);
    padding-left: 28px;
    padding-right: 28px;

    &:hover {
      color: ${Shades.blue.x50};
    }
  }
`;

export const LeftToolbar: FC = () => {
  const leftToolbarWidth = useAtom(atom_leftToolbarWidth);

  return (
    <div
      css={LeftToolbarCss}
      style={{
        width: leftToolbarWidth,
      }}
    >
      <div css={LeftToolbarBodyCss}>
        <div css={LeftToolbarHeader}>
          <img src="/favico.svg" alt="gravitas logo" width={16} height={16} />
          <b>gravitas</b>
        </div>
        <FpsGraph />
      </div>
      <HVHandle get={atom_leftToolbarWidth.get} set={atom_leftToolbarWidth.set} reset={atom_leftToolbarWidth.reset} />
    </div>
  );
};
