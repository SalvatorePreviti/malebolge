/* eslint-disable prefer-template */
import { css } from "@emotion/react";
import { max, min } from "@gravitas/math";
import type { FC } from "react";
import { useEffect, useRef } from "react";

import { ThemeTypo } from "../../theme/fonts";

const round = Math.round;

const _requestAnimationFrame = requestAnimationFrame;

const FpsGraphCss = css`
  overflow: hidden;
  display: flex;
  justify-content: center;
  background-color: #001;
  padding-top: 6px;
  padding-bottom: 6px;
  margin-bottom: 8px;

  &.toosmall {
    justify-content: end;
  }
`;

const FPS_GRAPH_WIDTH = 145;

export const FpsGraph: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const parent = canvas.parentElement!;
    let wasTooSmall: boolean | undefined;

    const updateParentSize = () => {
      const { clientWidth } = parent;
      const tooSmall = clientWidth < FPS_GRAPH_WIDTH;
      if (wasTooSmall !== tooSmall) {
        wasTooSmall = tooSmall;
        parent.classList.toggle("toosmall", tooSmall);
      }
    };

    const observer = new ResizeObserver(updateParentSize);

    observer.observe(canvas.parentElement!);

    let lastTime = performance.now();
    let fpsFrames = 0;
    let fpsTime = lastTime;
    let msDisplayTime = lastTime;
    let maxFps = 70;
    let durationMs = 0;
    let timer: ReturnType<typeof _requestAnimationFrame>;

    const { createGraph } = createGraphs(context);

    const fpsGraph = createGraph(0, "#6df", "#012");
    const msGraph = createGraph(1, "#4fb", "#012");

    const animationFrame = () => {
      ++fpsFrames;

      const time = performance.now();
      if (time >= fpsTime + 250) {
        const fps = (fpsFrames * 1000) / (time - fpsTime) || 0;

        if (maxFps < 125 && fps >= 70) {
          maxFps = 125;
          fpsGraph.clearGraph();
        }

        fpsGraph.drawText("FPS:" + fps.toFixed(2).padStart(7));
        fpsGraph.updateGraph(fps, maxFps);
        fpsTime = time;
        fpsFrames = 0;
      }

      if (time >= msDisplayTime + 250) {
        msDisplayTime = time;
        msGraph.updateGraph(durationMs, 40);
        msGraph.drawText("frame:" + durationMs.toFixed(2).padStart(7) + "ms");
        durationMs = 0;
      }

      durationMs = max(durationMs, time - lastTime);
      lastTime = time;

      timer = _requestAnimationFrame(animationFrame);
    };

    timer = _requestAnimationFrame(animationFrame);

    return () => {
      cancelAnimationFrame(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div css={FpsGraphCss}>
      <canvas width={FPS_GRAPH_WIDTH} height="126" ref={canvasRef} />
    </div>
  );
};

function createGraphs(context: CanvasRenderingContext2D) {
  let width: number;
  let GRAPH_WIDTH: number;
  let UPDATE_WIDTH: number;

  const { canvas } = context;

  const updateSize = () => {
    width = canvas.clientWidth;
    GRAPH_WIDTH = width - 1;
    UPDATE_WIDTH = GRAPH_WIDTH - 1;
  };

  const createGraph = (graphIndex: number, fg: string, bg: string) => {
    const TEXT_HEIGHT = 14;
    const GRAPH_HEIGHT = 45;
    const Y = graphIndex * (GRAPH_HEIGHT + TEXT_HEIGHT + 5);
    const GRAPH_Y = TEXT_HEIGHT + 2 + Y;
    const TEXT_X = 3;
    const TEXT_Y = Y + 2;

    const initGraph = () => {
      updateSize();
      context.font = "bold 13px " + ThemeTypo.mono;
      context.textBaseline = "top";

      context.fillStyle = bg;
      context.fillRect(0, Y, GRAPH_WIDTH, GRAPH_HEIGHT);

      context.fillStyle = "#07f";
      context.fillRect(0, GRAPH_Y - 1, GRAPH_WIDTH, 1);
      context.fillRect(0, GRAPH_Y + GRAPH_HEIGHT, GRAPH_WIDTH, 1);
    };

    const drawText = (value: string) => {
      context.fillStyle = bg;
      context.fillRect(0, Y, width, TEXT_HEIGHT);
      context.fillStyle = fg;
      context.fillText(value, TEXT_X, TEXT_Y);
    };

    const clearGraph = () => {
      context.fillStyle = bg;
      context.fillRect(0, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
    };

    const updateGraph = (value: number, maxValue: number) => {
      context.drawImage(canvas, 1, GRAPH_Y, UPDATE_WIDTH, GRAPH_HEIGHT, 0, GRAPH_Y, UPDATE_WIDTH, GRAPH_HEIGHT);

      context.fillStyle = fg;
      context.fillRect(UPDATE_WIDTH, GRAPH_Y, 1, GRAPH_HEIGHT);

      context.fillStyle = bg;
      context.fillRect(UPDATE_WIDTH, GRAPH_Y, 1, min(maxValue, round((1 - value / maxValue) * GRAPH_HEIGHT)));
    };

    initGraph();
    clearGraph();

    return {
      updateSize,
      drawText,
      clearGraph,
      updateGraph,
    };
  };

  updateSize();

  return {
    createGraph,
    updateSize,
  };
}
