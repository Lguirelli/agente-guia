import { Renderer, Program, Mesh, Triangle, Vec2 } from "https://cdn.skypack.dev/ogl";

const vertex = `
attribute vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}
`;

const fragment = `
#ifdef GL_ES
precision lowp float;
#endif
uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uNoise;
uniform float uScan;
uniform float uScanFreq;
uniform float uWarp;
#define iTime uTime
#define iResolution uResolution

// === (shader completo do usuário aqui) ===
// IMPORTANTE: Substituir este comentário pelo fragment shader completo enviado anteriormente
`;

const config = {
    hueShift: 0,
    noiseIntensity: 0,
    scanlineIntensity: 0,
    speed: 0.5,
    scanlineFrequency: 0,
    warpAmount: 0,
    resolutionScale: 1
};

export function initDarkVeil(customConfig = {}) {
    const settings = { ...config, ...customConfig };
    const canvas = document.getElementById("dark-veil");
    if (!canvas) {
        console.error("Canvas #dark-veil não encontrado.");
        return;
    }
    const parent = canvas.parentElement;

    const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        canvas,
    });

    const gl = renderer.gl;
    const geometry = new Triangle(gl);

    const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
            uTime: { value: 0 },
            uResolution: { value: new Vec2() },
            uHueShift: { value: settings.hueShift },
            uNoise: { value: settings.noiseIntensity },
            uScan: { value: settings.scanlineIntensity },
            uScanFreq: { value: settings.scanlineFrequency },
            uWarp: { value: settings.warpAmount },
        },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        renderer.setSize(w * settings.resolutionScale, h * settings.resolutionScale);
        program.uniforms.uResolution.value.set(w, h);
    };

    window.addEventListener("resize", resize);
    resize();

    const start = performance.now();
    let frame = 0;

    const loop = () => {
        program.uniforms.uTime.value =
            ((performance.now() - start) / 1000) * settings.speed;
        renderer.render({ scene: mesh });
        frame = requestAnimationFrame(loop);
    };

    loop();
}
