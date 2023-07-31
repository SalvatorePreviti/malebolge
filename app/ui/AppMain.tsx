import { css } from "@emotion/react";
import type { FC } from "react";
import { useEffect, useRef } from "react";

import { WgslManager } from "../renderer";
import { Shades } from "../theme/shades";

const MAX_CANVAS_WIDTH = 800;
const MAX_CANVAS_HEIGHT = 800;

const AppMainStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;

  > canvas {
    background: #000;
    border: 1px solid ${Shades.tuna};
  }
`;

export const AppMain: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const container = canvas?.parentElement;

    const wgslManager = new WgslManager(canvas);

    const updateCanvasSize = () => {
      if (canvas && container) {
        const containerWidth = container.clientWidth - 8;
        const containerHeight = container.clientHeight - 8;
        const aspectRatio = MAX_CANVAS_WIDTH / MAX_CANVAS_HEIGHT;

        // Calculate new dimensions while maintaining aspect ratio
        if (containerWidth > containerHeight * aspectRatio) {
          canvas.width = Math.min(containerHeight * aspectRatio, MAX_CANVAS_WIDTH);
          canvas.height = Math.min(containerHeight, MAX_CANVAS_HEIGHT);
        } else {
          canvas.width = Math.min(containerWidth, MAX_CANVAS_WIDTH);
          canvas.height = Math.min(containerWidth / aspectRatio, MAX_CANVAS_HEIGHT);
        }
      }
    };

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (container) {
      resizeObserver.observe(container);
      resizeObserver.observe(canvas);
      wgslManager.destroy();
    }

    updateCanvasSize();

    wgslManager
      .init()
      .then(async () => {
        const info = await wgslManager.adapter?.requestAdapterInfo();
        console.log("WGPU initialized", info);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div css={AppMainStyle}>
      <canvas ref={canvasRef} />
    </div>
  );
};
