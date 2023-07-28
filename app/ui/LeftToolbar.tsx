import { useAtom } from "@gravitas/atom-react";
import { atom_leftToolbarWidth } from "../state/ui-atoms";
import "./LeftToolbar.css";
import { HorizontalHandle } from "./HorizontalHandle";
import type { FC } from "react";

export const LeftToolbar: FC = () => {
  const leftToolbarWidth = useAtom(atom_leftToolbarWidth);

  return (
    <div className="left-toolbar" style={{ width: leftToolbarWidth }}>
      <div className="left-toolbar__body">
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
