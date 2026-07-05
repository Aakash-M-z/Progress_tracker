import { useMemo } from 'react';

export function useWebGL(): boolean {
    return useMemo(() => {
        try {
            const canvas = document.createElement('canvas');
            const ctx =
                canvas.getContext('webgl2') ||
                canvas.getContext('webgl') ||
                canvas.getContext('experimental-webgl');
            if (!ctx) return false;
            const gl = ctx as WebGLRenderingContext;
            const supported = gl.getParameter(gl.VERSION) !== undefined;
            // Clean up
            const ext = gl.getExtension('WEBGL_lose_context');
            ext?.loseContext();
            return supported;
        } catch {
            return false;
        }
    }, []);
}
