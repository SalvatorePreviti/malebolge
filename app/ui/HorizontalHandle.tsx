import { css } from "@emotion/react";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";

import { Shades } from "../theme/shades";

export interface HorizontalHandleProps {
  get: () => number;
  set: (value: number) => void;
  reset?: (() => void) | null | undefined | false;
  min?: number;
  max?: number;
}

export interface UseHorizontalHandle {
  (e: React.MouseEvent | React.TouchEvent): void;
  dragging: boolean;
}

export const useHorizontalHandle = (props: HorizontalHandleProps): UseHorizontalHandle => {
  const [isDraggingState, setIsDraggingState] = useState<boolean>(false);

  interface RefState {
    props: HorizontalHandleProps;
    start: UseHorizontalHandle;
    handleMouseMove(e: MouseEvent): void;
    handleTouchMove(e: TouchEvent): void;
    handleEnd(): void;
    handleKeyDown(e: KeyboardEvent): void;
    update(x: number): void;
    registered: number;
    setIsDragging: (value: boolean) => void;
    v: number;
    x: number;
  }

  const ref = useRef<RefState>(null as unknown as RefState);

  let { current: state } = ref;

  if (!state) {
    state = {
      props,
      registered: 0,

      update(x: number) {
        const { min = 10, max = 8000 } = state.props;
        x = Math.round(x) || 0;
        if (state.start.dragging) {
          x = state.v + x - state.x;
        }
        state.props.set(x < min ? min : x > max ? max : Math.round(x));
      },

      handleMouseMove(e: MouseEvent) {
        if (state.start.dragging) {
          state.update(e.clientX);
        }
      },

      handleTouchMove(e: TouchEvent) {
        if (state.start.dragging) {
          e.preventDefault();
          const touch = e.touches[0];
          if (touch) {
            state.props.set(touch.clientX);
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
        state.x = touch.clientX;
      } else {
        state.x = (e as React.MouseEvent).clientX;
      }
      state.v = state.props.get();
      state.setIsDragging(true);
    };

    handleStart.dragging = false;

    state.start = handleStart;

    ref.current = state;

    state.update(props.get());
  }

  state.props = props;
  state.setIsDragging = setIsDraggingState;
  state.start.dragging = isDraggingState;

  useEffect(() => {
    const { current } = ref;

    if (!current || current.registered > 0 || !isDraggingState) {
      return undefined;
    }

    ++current.registered;

    window.addEventListener("mousemove", current.handleMouseMove);
    window.addEventListener("touchmove", current.handleTouchMove);
    window.addEventListener("mouseup", current.handleEnd);
    window.addEventListener("touchend", current.handleEnd);
    window.addEventListener("touchcancel", current.handleEnd);
    window.addEventListener("resize", current.handleEnd);
    window.addEventListener("blur", current.handleEnd);
    window.addEventListener("keydown", current.handleKeyDown);

    return () => {
      --current.registered;
      window.removeEventListener("mousemove", current.handleMouseMove);
      window.removeEventListener("touchmove", current.handleTouchMove);
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

export const HorizontalHandleCss = css`
  flex-shrink: 0;
  width: 6px;
  position: relative;
  cursor: col-resize;

  > div {
    height: 100%;
    left: 0;
    position: absolute;
    width: 6px;
    border: 1px solid ${Shades.neutral.x999};
    background-color: ${Shades.neutral.x800};
    transition: background-color 0.2s ease-in-out;

    &::before {
      content: "";
      display: block;
      height: 100%;
      left: 50%;
      position: relative;
      margin-left: -1px;
      border-left: 2px dashed ${Shades.neutral.x600};
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
    margin-left: -1px;
    width: 8px;
    height: 100%;
    transition:
      width 0.3s ease-in-out,
      margin-left 0.3s ease-in-out,
      border-color 0.2s ease-in-out,
      background-color 0.2s ease-in-out;
    background-color: rgb(0 0 0 0%);
    border: 2px dashed rgb(0 0 0 / 0%);
  }

  &.dragging {
    &::before {
      margin-left: -17px;
      width: 40px;
      background-color: rgb(0 0 25 / 8%);
      border-color: rgb(0 50 150 / 10%);
    }

    > div {
      background-color: ${Shades.neutral.x600};

      &::before {
        border-color: ${Shades.indigo.x600};
      }
    }
  }
`;

/** This is an handle, when dragged with the mouse or touching it changes size */
export const HorizontalHandle: FC<HorizontalHandleProps> = (props) => {
  const handleStart = useHorizontalHandle(props);
  return (
    <div
      css={HorizontalHandleCss}
      className={handleStart.dragging ? "dragging" : ""}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div />
    </div>
  );
};
