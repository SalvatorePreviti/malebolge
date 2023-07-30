import { css } from "@emotion/react";
import { useAtom } from "@gravitas/atom-react";
import type { FC } from "react";

import { atom_leftToolbarWidth } from "../state/ui-atoms";
import { Shades } from "../theme/shades";
import { HorizontalHandle } from "./HorizontalHandle";

const LeftToolbarCss = css`
  display: flex;
  justify-content: stretch;
`;

const LeftToolbarBodyCss = css`
  background-color: ${Shades.neutral.x800};
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
`;

export const LeftToolbar: FC = () => {
  const leftToolbarWidth = useAtom(atom_leftToolbarWidth);

  return (
    <div
      className="left-toolbar"
      css={LeftToolbarCss}
      style={{
        width: leftToolbarWidth,
      }}
    >
      <div css={LeftToolbarBodyCss}>
        <div>hello1</div>
        <div>hello2</div>
        <div>hello3</div>
      </div>
      <HorizontalHandle
        get={atom_leftToolbarWidth.get}
        set={atom_leftToolbarWidth.set}
        reset={atom_leftToolbarWidth.reset}
      />
    </div>
  );
};
