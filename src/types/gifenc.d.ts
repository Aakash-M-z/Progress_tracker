declare module 'gifenc' {
  export interface EncoderOptions {
    auto?: boolean;
    initialCapacity?: number;
  }

  export interface WriteFrameOptions {
    palette?: number[][];
    delay?: number;
    transparent?: boolean;
    transparentIndex?: number;
    dispose?: number;
  }

  export interface GIFEncoderInstance {
    writeFrame: (index: Uint8Array, width: number, height: number, opts?: WriteFrameOptions) => void;
    finish: () => void;
    bytes: () => Uint8Array;
    reset: () => void;
    bytesView: () => Uint8Array;
  }

  export function GIFEncoder(opts?: EncoderOptions): GIFEncoderInstance;
  export function quantize(rgba: Uint8ClampedArray | Uint8Array, maxColors?: number, opts?: any): number[][];
  export function applyPalette(rgba: Uint8ClampedArray | Uint8Array, palette: number[][], format?: string): Uint8Array;
}
