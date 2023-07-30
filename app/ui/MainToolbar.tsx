import { css } from "@emotion/react";
import { useAtom } from "@gravitas/atom-react";
import type { FC } from "react";

import { atom_mainToolbarHeight } from "../state/ui-atoms";
import { Shades } from "../theme/shades";
import { HVHandle } from "./HVHandle";

const MainToolbarCss = css`
  display: flex;
  justify-content: stretch;
  flex-direction: column;
  background-color: ${Shades.neutral.x900};
`;

export const MainToolbar: FC = () => {
  const mainToolbarHeight = useAtom(atom_mainToolbarHeight);

  return (
    <div
      css={MainToolbarCss}
      style={{
        height: mainToolbarHeight,
      }}
    >
      <HVHandle
        type="V"
        dir={-1}
        get={atom_mainToolbarHeight.get}
        set={atom_mainToolbarHeight.set}
        reset={atom_mainToolbarHeight.reset}
        min={20}
      />
      <div css={MainToolbarCss} />
    </div>
  );
};
