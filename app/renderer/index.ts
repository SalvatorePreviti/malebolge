import redFragWGSL from "./shaders/red.frag.wgsl";
import triangleVertWGSL from "./shaders/triangle.vert.wgsl";

export class WgslManager {
  public adapter: GPUAdapter | null = null;
  public device: GPUDevice | null = null;
  public canvas: HTMLCanvasElement;
  public context: GPUCanvasContext | null = null;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  public destroy() {
    if (this.device) {
      this.device.destroy();
    }
  }

  public async init() {
    if (!navigator.gpu) {
      throw Error("WebGPU not supported.");
    }

    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance",
    });

    if (!adapter) {
      throw Error("Couldn't request WebGPU adapter.");
    }

    this.adapter = adapter;

    const device = await adapter.requestDevice();
    if (!device) {
      throw Error("Couldn't create WebGPU device.");
    }

    this.device = device;

    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: device.createShaderModule({
          code: triangleVertWGSL,
        }),
        entryPoint: "main",
      },
      fragment: {
        module: device.createShaderModule({
          code: redFragWGSL,
        }),
        entryPoint: "main",
        targets: [
          {
            format: presentationFormat,
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
      },
    });

    try {
      // Init canvas

      const context = this.canvas.getContext("webgpu")!;
      if (!context) {
        throw Error("Couldn't get WebGPU context.");
      }

      this.context = context;

      context.configure({
        device,
        format: presentationFormat,
        alphaMode: "premultiplied",
      });
    } catch (e) {
      device.destroy();
      throw e;
    }
  }
}
