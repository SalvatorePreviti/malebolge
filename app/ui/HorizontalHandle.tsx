import type { FC } from "react";
import { useState, useEffect, useRef } from "react";

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
  const [isDragging, setIsDragging] = useState<boolean>(false);

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
      registered: 0,

      update(x: number) {
        x = state.v + x - state.x;
        const { min = 0, max = 8000 } = state.props;
        state.props.set(x < min ? min : x > max ? max : Math.round(x));
      },

      handleMouseMove(e: MouseEvent) {
        e.preventDefault();
        state.update(e.clientX);
      },

      handleTouchMove(e: TouchEvent) {
        e.preventDefault();
        const touch = e.touches[0];
        if (touch) {
          state.props.set(touch.clientX);
        }
      },

      handleEnd() {
        state.setIsDragging(false);
      },

      handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape" || e.key === "Tab") {
          state.props.set(state.v);
          state.handleEnd();
        } else if (e.key === "Enter" || e.key === " ") {
          state.handleEnd();
        } else if ((e.key === "r" || e.key === "R") && state.props.reset) {
          state.props.reset();
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
  }

  state.props = props;
  state.setIsDragging = setIsDragging;
  state.start.dragging = isDragging;

  useEffect(() => {
    const { current } = ref;

    if (!current || current.registered > 0 || !isDragging) {
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
  }, [isDragging]);

  return state.start;
};

/** This is an handle, when dragged with the mouse or touching it changes size */
export const HorizontalHandle: FC<HorizontalHandleProps> = (props) => {
  const handleStart = useHorizontalHandle(props);
  return (
    <div className="left-toolbar__handle" onMouseDown={handleStart} onTouchStart={handleStart}>
      <div className="left-toolbar__handle__inner" />
    </div>
  );
};
