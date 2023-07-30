import { css } from "@emotion/react";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";

import { Shades } from "../theme/shades";

export interface HVHandleProps {
  type?: "H" | "V";
  dir?: 1 | -1;
  get: () => number;
  set: (value: number) => void;
  reset?: (() => void) | null | undefined | false;
  min?: number;
  max?: number;
}

export interface HVHandle {
  (e: React.MouseEvent | React.TouchEvent): void;
  dragging: boolean;
}

export const useHVHandle = (inputProps: HVHandleProps): HVHandle => {
  const [isDraggingState, setIsDraggingState] = useState<boolean>(false);

  interface RefState {
    props: HVHandleProps;
    start: HVHandle;
    handleMove(e: TouchEvent | MouseEvent): void;
    handleEnd(): void;
    handleKeyDown(e: KeyboardEvent): void;
    update(x: number): void;
    registered: number;
    setIsDragging: (value: boolean) => void;
    v: number;
    p: number;
  }

  const ref = useRef<RefState>(null as unknown as RefState);

  let { current: state } = ref;

  if (!state) {
    state = {
      props: inputProps,
      registered: 0,

      update(p: number) {
        const { min = 10, max = 8000 } = state.props;
        p = Math.round(p) || 0;
        if (state.start.dragging) {
          p = state.v + (p - state.p) * (state.props.dir || 1);
        }
        state.props.set(p < min ? min : p > max ? max : Math.round(p));
      },

      handleMove(e: MouseEvent | TouchEvent) {
        if (state.start.dragging) {
          if (e.type === "touchmove") {
            e.preventDefault();
            const touch = (e as TouchEvent).touches?.[0];
            if (touch) {
              state.update(state.props.type === "V" ? touch.clientY : touch.clientX);
            }
          } else {
            state.update(state.props.type === "V" ? (e as MouseEvent).clientY : (e as MouseEvent).clientX);
          }
        }
      },

      handleEnd() {
        state.setIsDragging(false);
      },

      handleKeyDown(e: KeyboardEvent) {
        if (state.start.dragging) {
          if (e.key === "Escape" || e.key === "Tab") {
            state.props.set(state.v);
            state.handleEnd();
            e.preventDefault();
          } else if (e.key === "Enter" || e.key === " ") {
            state.handleEnd();
            e.preventDefault();
          } else if ((e.key === "r" || e.key === "R") && state.props.reset) {
            state.props.reset();
            state.handleEnd();
            e.preventDefault();
          }
        }
      },
    } as RefState;

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (e.type === "touchstart") {
        const touch = (e as React.TouchEvent).touches[0];
        if (!touch) {
          return;
        }
        state.p = state.props.type === "V" ? touch.clientY : touch.clientX;
      } else {
        state.p = state.props.type === "V" ? (e as React.MouseEvent).clientY : (e as React.MouseEvent).clientX;
      }
      state.v = state.props.get();
      state.setIsDragging(true);
    };

    handleStart.dragging = false;

    state.start = handleStart;

    ref.current = state;

    state.update(state.props.get());
  }

  state.props = inputProps;
  state.setIsDragging = setIsDraggingState;
  state.start.dragging = isDraggingState;

  useEffect(() => {
    const { current } = ref;

    if (!current || current.registered > 0 || !isDraggingState) {
      return undefined;
    }

    ++current.registered;

    window.addEventListener("mousemove", current.handleMove);
    window.addEventListener("touchmove", current.handleMove);
    window.addEventListener("mouseup", current.handleEnd);
    window.addEventListener("touchend", current.handleEnd);
    window.addEventListener("touchcancel", current.handleEnd);
    window.addEventListener("resize", current.handleEnd);
    window.addEventListener("blur", current.handleEnd);
    window.addEventListener("keydown", current.handleKeyDown);

    return () => {
      --current.registered;
      window.removeEventListener("mousemove", current.handleMove);
      window.removeEventListener("touchmove", current.handleMove);
      window.removeEventListener("mouseup", current.handleEnd);
      window.removeEventListener("touchend", current.handleEnd);
      window.removeEventListener("touchcancel", current.handleEnd);
      window.removeEventListener("resize", current.handleEnd);
      window.removeEventListener("blur", current.handleEnd);
      window.removeEventListener("keydown", current.handleKeyDown);
    };
  }, [isDraggingState]);

  return state.start;
};

export const HVHandleCss = css`
  position: relative;

  > div {
    position: absolute;
    border: 1px solid ${Shades.neutral.x999};
    background-color: ${Shades.neutral.x800};
    transition: background-color 0.2s ease-in-out;

    &::before {
      content: "";
      display: block;
      position: relative;
      transition: border-color 0.15s ease-in-out;
    }

    &:hover::before {
      border-color: ${Shades.neutral.x600};
    }

    &:hover {
      background-color: ${Shades.neutral.x700};
    }
  }

  &::before {
    content: "";
    display: block;
    position: absolute;
    background-color: rgb(0 0 0 0%);
    border: 2px solid rgb(0 0 0 / 0%);
  }

  &.dragging {
    &::before {
      background-color: rgb(0 0 25 / 8%);
      border-color: rgb(0 50 150 / 10%);
    }

    > div {
      background-color: ${Shades.neutral.x600};

      &::before {
        border-color: ${Shades.primary.x600};
      }
    }
  }
`;

export const HorizontalHandleCss = css`
  ${HVHandleCss}

  cursor: col-resize;

  > div {
    border-top: none;
    border-bottom: none;
    height: 100%;
    left: 0;
    width: 6px;

    &::before {
      height: 100%;
      left: 50%;
      margin-left: -1px;
      border-left: 2px solid ${Shades.neutral.x600};
    }
  }

  &::before {
    margin-left: -1px;
    width: 8px;
    height: 100%;
    transition:
      width 0.3s ease-in-out,
      margin-left 0.3s ease-in-out,
      border-color 0.2s ease-in-out,
      background-color 0.2s ease-in-out;
  }

  &.dragging {
    &::before {
      margin-left: -17px;
      width: 40px;
    }
  }
`;

export const VerticalHandleCss = css`
  ${HVHandleCss}

  cursor: row-resize;

  > div {
    border-left: none;
    border-right: none;
    width: 100%;
    top: 0;
    height: 6px;

    &::before {
      width: 100%;
      top: 50%;
      margin-top: -1px;
      border-top: 2px solid ${Shades.neutral.x600};
    }
  }

  &::before {
    margin-top: -1px;
    height: 8px;
    width: 100%;
    transition:
      height 0.3s ease-in-out,
      margin-top 0.3s ease-in-out,
      border-color 0.2s ease-in-out,
      background-color 0.2s ease-in-out;
  }

  &.dragging {
    &::before {
      margin-top: -17px;
      height: 40px;
    }
  }
`;

/** This is an handle, when dragged with the mouse or touching it changes size */
export const HVHandle: FC<HVHandleProps> = (props) => {
  const handleStart = useHVHandle(props);
  return (
    <div
      css={props.type === "V" ? VerticalHandleCss : HorizontalHandleCss}
      className={handleStart.dragging ? "dragging" : ""}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div />
    </div>
  );
};
