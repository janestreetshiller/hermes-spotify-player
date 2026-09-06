/**
 * Compact native Spotify controller for Hermes Desktop.
 *
 * Playback is delegated to the installed, signed-in Spotify macOS app through
 * this plugin's scoped Hermes REST backend. No Spotify webpage or webview is
 * mounted.
 */

import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, GlyphSpinner, Input, PALETTE_AREA, SearchField, StatusDot, Tip, atom, host, icons, useValue, useQuery, queryClient } from '@hermes/plugin-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'

// BEGIN VENDORED METAL-FX
/*! metal-fx@1.0.4 — Alloy artifact.
MIT License

Copyright (c) 2026 Jakub Antalik

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
let metalFxLibrary
function getMetalFxLibrary() {
  if (metalFxLibrary) return metalFxLibrary
  // Local scheduling only: never replace the host's animation APIs.
  const requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 1000 / 12)
  const cancelAnimationFrame = handle => clearTimeout(handle)
function xt(e) {
  let t = e.replace("#", "");
  return t.length === 3 && (t = t[0] + t[0] + t[1] + t[1] + t[2] + t[2]), [parseInt(t.slice(0, 2), 16) / 255, parseInt(t.slice(2, 4), 16) / 255, parseInt(t.slice(4, 6), 16) / 255];
}
function vt(e, t, n) {
  e /= 255, t /= 255, n /= 255;
  const o = Math.max(e, t, n), r = Math.min(e, t, n), a = o - r;
  let s = 0;
  const d = o === 0 ? 0 : a / o;
  return a !== 0 && (o === e ? s = ((t - n) / a + 6) % 6 : o === t ? s = (n - e) / a + 2 : s = (e - t) / a + 4, s /= 6), [s, d, o];
}
function bt(e, t, n) {
  const o = Math.floor(e * 6), r = e * 6 - o, a = n * (1 - t), s = n * (1 - r * t), d = n * (1 - (1 - r) * t);
  let l = 0, c = 0, u = 0;
  switch (o % 6) {
    case 0:
      l = n, c = d, u = a;
      break;
    case 1:
      l = s, c = n, u = a;
      break;
    case 2:
      l = a, c = n, u = d;
      break;
    case 3:
      l = a, c = s, u = n;
      break;
    case 4:
      l = d, c = a, u = n;
      break;
    case 5:
      l = n, c = a, u = s;
      break;
  }
  return [Math.round(l * 255), Math.round(c * 255), Math.round(u * 255)];
}
const wt = 66, yt = 66, _t = 1500, Mt = 1, Te = 16, Rt = 16, At = 8, St = 96, Tt = 1, Ct = {
  name: "chromatic",
  modes: {
    dark: {
      colors: ["#000000", "#aae8ff", "#c5fe9e", "#f7888d", "#0d0d0d", "#fffdc3", "#007cff"],
      alphas: [1, 1, 1, 1, 1, 1, 1],
      direction: 80,
      speed: 1.2,
      intensity: 2,
      scale: 1.6,
      softness: 0.18,
      distortion: 0.3,
      complexity: 0.68,
      shape: 1,
      blur: 1,
      vignette: 0.26,
      vigOpacity: 0.6,
      shaderOpacity: 1
    },
    light: {
      colors: ["#ffffff", "#ffffff", "#ffffff", "#ffb3b3", "#adadad", "#f5ff70", "#007cff"],
      alphas: [1, 1, 1, 1, 1, 1, 1],
      direction: 80,
      speed: 1.2,
      intensity: 2,
      scale: 2.5,
      softness: 0.18,
      distortion: 0.3,
      complexity: 0.68,
      shape: 1,
      blur: 1,
      vignette: 0.24,
      vigOpacity: 0.16,
      shaderOpacity: 1
    }
  }
}, kt = {
  name: "silver",
  modes: {
    dark: {
      colors: ["#000000", "#dedede", "#747270", "#e5e5e5", "#0d0d0d", "#ffffff", "#e6e6e6"],
      alphas: [1, 1, 1, 1, 1, 1, 1],
      direction: 80,
      speed: 1.2,
      intensity: 2,
      scale: 2.5,
      softness: 0.18,
      distortion: 0.3,
      complexity: 0.68,
      shape: 1,
      blur: 1,
      vignette: 0.26,
      vigOpacity: 0.6,
      shaderOpacity: 0.88
    },
    light: {
      colors: ["#f6f6f6", "#ffffff", "#ffffff", "#f7f7f7", "#c9c9c9", "#d0d0d0", "#d1d1d1"],
      alphas: [1, 1, 1, 1, 1, 1, 1],
      direction: 80,
      speed: 1.2,
      intensity: 2,
      scale: 2.5,
      softness: 0.18,
      distortion: 0.3,
      complexity: 0.68,
      shape: 1,
      blur: 1,
      vignette: 0.2,
      vigOpacity: 0.26,
      shaderOpacity: 1
    }
  }
}, Et = {
  name: "gold",
  modes: {
    dark: {
      colors: ["#000000", "#ffffff", "#ffffff", "#f7d488", "#0d0d0d", "#fffdc3", "#ffffff"],
      alphas: [1, 1, 1, 1, 1, 1, 1],
      direction: 80,
      speed: 1,
      intensity: 2,
      scale: 2.5,
      softness: 0.18,
      distortion: 0.3,
      complexity: 0.68,
      shape: 1,
      blur: 1,
      vignette: 0.26,
      vigOpacity: 0.6,
      shaderOpacity: 0.92
    },
    light: {
      colors: ["#fff8e1", "#fffbe0", "#ffffff", "#fff6d6", "#d2c7a7", "#dcd2bc", "#f9f7e5"],
      alphas: [1, 1, 1, 1, 1, 1, 1],
      direction: 80,
      speed: 1.2,
      intensity: 2,
      scale: 2.5,
      softness: 0.18,
      distortion: 0.3,
      complexity: 0.68,
      shape: 1,
      blur: 1,
      vignette: 0.22,
      vigOpacity: 0.24,
      shaderOpacity: 1
    }
  }
}, je = {
  chromatic: Ct,
  silver: kt,
  gold: Et
}, Lt = (
  /* glsl */
  `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`
), It = (
  /* glsl */
  `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color1, u_color2, u_color3, u_color4, u_color5, u_color6, u_color7;
  uniform float u_alpha1, u_alpha2, u_alpha3, u_alpha4, u_alpha5, u_alpha6, u_alpha7;
  uniform float u_intensity, u_scale, u_direction;
  uniform float u_softness, u_distortion, u_complexity, u_shape;
  uniform float u_vignette, u_vigOpacity, u_blur, u_shaderOpacity;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289((x * 34.0 + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289v2(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x_) - 0.5;
    vec3 ox = floor(x_ + 0.5);
    vec3 a0 = x_ - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p, float oct) {
    float val = 0.0, amp = 0.5;
    int n = int(oct);
    for (int i = 0; i < 7; i++) {
      if (i >= n) break;
      val += amp * snoise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return val;
  }

  float nfbm(vec2 p) { return fbm(p, 3.0 + u_complexity * 4.0); }

  /* 5-stop palette used by effect 1 (Plasma) — direct port of \`palette\` from
   * the canonical engine. Stops at t = 0, 0.25, 0.5, 0.75, 1.0. */
  vec3 palette(float t) {
    t = clamp(t, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    float k = 64.0;
    float w1 = u_alpha1 * exp(-k * t * t);
    float w2 = u_alpha2 * exp(-k * (t - 0.25) * (t - 0.25));
    float w3 = u_alpha3 * exp(-k * (t - 0.5)  * (t - 0.5));
    float w4 = u_alpha4 * exp(-k * (t - 0.75) * (t - 0.75));
    float w5 = u_alpha5 * exp(-k * (t - 1.0)  * (t - 1.0));
    float total = w1 + w2 + w3 + w4 + w5 + 0.0001;
    return (u_color1 * w1 + u_color2 * w2 + u_color3 * w3 +
            u_color4 * w4 + u_color5 * w5) / total;
  }

  /* Per-pixel alpha that re-introduces transparency when the user dials any
   * palette stop's alpha below 1. Same \`paletteAlpha\` from the canonical
   * engine. With every preset shipping all-1 alphas, this returns ~1 for every
   * pixel — but mirroring it keeps custom-preset behaviour identical. */
  float paletteAlpha(float t) {
    t = clamp(t, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    float k = 64.0;
    float w1 = u_alpha1 * exp(-k * t * t);
    float w2 = u_alpha2 * exp(-k * (t - 0.25) * (t - 0.25));
    float w3 = u_alpha3 * exp(-k * (t - 0.5)  * (t - 0.5));
    float w4 = u_alpha4 * exp(-k * (t - 0.75) * (t - 0.75));
    float w5 = u_alpha5 * exp(-k * (t - 1.0)  * (t - 1.0));
    float totalW = w1 + w2 + w3 + w4 + w5 + 0.0001;
    float rawW = exp(-k * t * t)
               + exp(-k * (t - 0.25) * (t - 0.25))
               + exp(-k * (t - 0.5)  * (t - 0.5))
               + exp(-k * (t - 0.75) * (t - 0.75))
               + exp(-k * (t - 1.0)  * (t - 1.0))
               + 0.0001;
    return totalW / rawW;
  }

  vec2 warp(vec2 p, float t) {
    float str = u_distortion * 2.0;
    return vec2(
      nfbm(p + vec2(t * 0.1, 0.0)),
      nfbm(p + vec2(0.0, t * 0.12) + 5.0)
    ) * str;
  }

  /* Plasma: four sine bands warped by an FBM field, mapped through the
   * 5-stop palette. Identical to effect 1 in the canonical engine. */
  vec3 computeEffect(vec2 uv, float aspect, float t, float dist, float cpx) {
    vec2 p = (uv - 0.5) * u_scale;
    p.x *= aspect;
    p += vec2(cos(u_direction), sin(u_direction)) * t * 0.15;

    float freq = 3.0 + cpx * 8.0;
    float val = 0.0;
    val += sin(p.x * freq + t);
    val += sin(p.y * freq + t * 1.3);
    val += sin((p.x + p.y) * freq * 0.7 + t * 0.7);
    val += sin(length(p) * freq * 0.8 - t * 1.5);
    vec2 w = warp(p, t);
    val += (w.x + w.y) * dist;
    val = val * 0.2 * u_intensity + 0.5;

    return palette(clamp(val, 0.0, 1.0));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    float t = u_time;          // JS already multiplied u_time by preset.speed.
    float dist = u_distortion;
    float cpx = u_complexity;

    /* 5-tap cross blur (center + cardinal offsets). The chromatic/silver/gold
     * presets all ship with blur=1 so this path is always active. 5 taps
     * instead of the canonical engine's 9 saves ~44% fragment work; the
     * perceptual difference is nil because the output is already soft from
     * the plasma's low spatial frequency and CSS blur on reflections. */
    vec3 col;
    if (u_blur < 0.01) {
      col = computeEffect(uv, aspect, t, dist, cpx);
    } else {
      float r = u_blur * 0.02;
      col  = computeEffect(uv,                  aspect, t, dist, cpx) * 0.4;
      col += computeEffect(uv + vec2( r, 0.0),  aspect, t, dist, cpx) * 0.15;
      col += computeEffect(uv + vec2(-r, 0.0),  aspect, t, dist, cpx) * 0.15;
      col += computeEffect(uv + vec2(0.0,  r),  aspect, t, dist, cpx) * 0.15;
      col += computeEffect(uv + vec2(0.0, -r),  aspect, t, dist, cpx) * 0.15;
    }

    /* Gamma punch — adds the contrast pop that defines the chromatic
     * highlights. From the canonical engine: \`col = pow(col, vec3(1.3))\`. */
    col = pow(col, vec3(1.3));

    /* Vignette — soft edge darkening so corners read as recessed. The 40-px
     * scale at the bottom of the formula is hard-coded in the canonical
     * engine; we keep it for visual parity. */
    float edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    float vigPx = 40.0 / min(u_resolution.x, u_resolution.y);
    float vigRange = vigPx * (1.0 + u_vignette * 3.0);
    float vig = edgeDist * edgeDist / (vigRange * vigRange);
    vig = smoothstep(0.0, 1.0, vig);
    col *= mix(1.0, vig, u_vignette * u_vigOpacity);

    /* Per-pixel alpha. With all-1 alphas the formula collapses to ~1 but the
     * computation matches the canonical engine so custom presets behave the
     * same. */
    float colorAlpha = (u_alpha1 + u_alpha2 + u_alpha3 + u_alpha4 + u_alpha5) / 5.0;
    if (colorAlpha < 0.999) {
      vec3 c1d = col - u_color1, c2d = col - u_color2, c3d = col - u_color3,
           c4d = col - u_color4, c5d = col - u_color5;
      float prox1 = exp(-8.0 * dot(c1d, c1d));
      float prox2 = exp(-8.0 * dot(c2d, c2d));
      float prox3 = exp(-8.0 * dot(c3d, c3d));
      float prox4 = exp(-8.0 * dot(c4d, c4d));
      float prox5 = exp(-8.0 * dot(c5d, c5d));
      float pTotal = prox1 + prox2 + prox3 + prox4 + prox5 + 0.0001;
      colorAlpha = (prox1 * u_alpha1 + prox2 * u_alpha2 + prox3 * u_alpha3 +
                    prox4 * u_alpha4 + prox5 * u_alpha5) / pTotal;
    }
    float alpha = colorAlpha;

    /* Touch the unused-at-effect-1 uniforms so GL drivers that complain about
     * declared-but-unread uniforms (some Mali / Adreno builds do) keep them
     * live. The contribution is provably zero. */
    alpha += 0.0 * (u_softness + u_shape +
                    u_alpha6 + u_alpha7 +
                    u_color6.x + u_color7.x);

    gl_FragColor = vec4(col, alpha * u_shaderOpacity);
  }
`
);
function Ce(e, t, n) {
  const o = e.createShader(t);
  if (!o) throw new Error("metal-fx: gl.createShader returned null");
  if (e.shaderSource(o, n), e.compileShader(o), !e.getShaderParameter(o, e.COMPILE_STATUS)) {
    const r = e.getShaderInfoLog(o);
    throw e.deleteShader(o), new Error(`metal-fx: shader compile failed: ${r ?? "(no info log)"}`);
  }
  return o;
}
function Ot(e, t, n) {
  const o = e.createProgram();
  if (!o) throw new Error("metal-fx: gl.createProgram returned null");
  if (e.attachShader(o, t), e.attachShader(o, n), e.linkProgram(o), !e.getProgramParameter(o, e.LINK_STATUS)) {
    const r = e.getProgramInfoLog(o);
    throw e.deleteProgram(o), new Error(`metal-fx: program link failed: ${r ?? "(no info log)"}`);
  }
  return o;
}
const Ke = 140, Qe = 40, Je = 1.6, Ze = 1.3;
let i = null, le = null;
function Ft(e) {
  le = e;
}
const Pt = [
  "u_resolution",
  "u_time",
  "u_color1",
  "u_color2",
  "u_color3",
  "u_color4",
  "u_color5",
  "u_color6",
  "u_color7",
  "u_alpha1",
  "u_alpha2",
  "u_alpha3",
  "u_alpha4",
  "u_alpha5",
  "u_alpha6",
  "u_alpha7",
  "u_intensity",
  "u_scale",
  "u_direction",
  "u_softness",
  "u_distortion",
  "u_complexity",
  "u_shape",
  "u_vignette",
  "u_vigOpacity",
  "u_blur",
  "u_shaderOpacity"
];
function ke(e) {
  e.enable(e.BLEND), e.blendFunc(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA);
  const t = Ce(e, e.VERTEX_SHADER, Lt), n = Ce(e, e.FRAGMENT_SHADER, It), o = Ot(e, t, n);
  e.useProgram(o);
  const r = e.createBuffer();
  if (!r) throw new Error("metal-fx: gl.createBuffer returned null");
  e.bindBuffer(e.ARRAY_BUFFER, r), e.bufferData(e.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), e.STATIC_DRAW);
  const a = e.getAttribLocation(o, "a_position");
  e.enableVertexAttribArray(a), e.vertexAttribPointer(a, 2, e.FLOAT, !1, 0, 0);
  const s = {};
  for (const d of Pt) s[d] = e.getUniformLocation(o, d);
  return { program: o, buffer: r, uniforms: s };
}
function et() {
  if (i) return i;
  const e = Math.min(Tt, 1), t = Math.round(St * e), n = typeof OffscreenCanvas < "u";
  let o, r;
  if (n)
    o = new OffscreenCanvas(t, t), r = o.getContext("webgl", {
      alpha: !0,
      premultipliedAlpha: !1,
      antialias: !1
    });
  else {
    const u = document.createElement("canvas");
    u.width = t, u.height = t, r = u.getContext("webgl", {
      alpha: !0,
      premultipliedAlpha: !1,
      antialias: !1,
      preserveDrawingBuffer: !0
    }) ?? u.getContext("experimental-webgl"), o = u;
  }
  if (!r) throw new Error("metal-fx: WebGL not supported");
  const { program: a, buffer: s, uniforms: d } = ke(r), l = (u) => {
    u.preventDefault(), i && (i.contextLost = !0);
  }, c = () => {
    if (!i) return;
    const u = ke(i.gl);
    i.program = u.program, i.buffer = u.buffer, i.uniforms = u.uniforms, i.presetDirty = !0, i.contextLost = !1, le == null || le();
  };
  return o.addEventListener("webglcontextlost", l, !1), o.addEventListener("webglcontextrestored", c, !1), i = {
    glCanvas: o,
    gl: r,
    program: a,
    buffer: s,
    uniforms: d,
    preset: je.chromatic.modes.dark,
    presetDirty: !0,
    contextLost: !1,
    useOffscreen: n,
    frameBitmap: null,
    startMs: performance.now(),
    pausedMs: 0,
    pausedAtMs: null,
    rafId: 0,
    dpr: e,
    instances: /* @__PURE__ */ new Set(),
    frameCount: 0,
    glowQueue: [],
    glowIdx: 0,
    glowSkip: 0,
    glowPixels: new Uint8Array(t * t * 4),
    glowPixelsW: t,
    glowPixelsH: t
  }, i;
}
function $t() {
  var r;
  if (!i) return;
  const { gl: e, program: t, buffer: n, frameBitmap: o } = i;
  try {
    o == null || o.close(), e.deleteBuffer(n), e.deleteProgram(t), (r = e.getExtension("WEBGL_lose_context")) == null || r.loseContext();
  } catch {
  }
  i = null;
}
let Ee = 0;
function fe() {
  if (!i) return;
  const e = performance.now();
  if (e - Ee < _t) return;
  Ee = e;
  const { gl: t, glCanvas: n } = i, o = n.width, r = n.height;
  (i.glowPixelsW !== o || i.glowPixelsH !== r) && (i.glowPixelsW = o, i.glowPixelsH = r, i.glowPixels = new Uint8Array(o * r * 4)), t.readPixels(0, 0, o, r, t.RGBA, t.UNSIGNED_BYTE, i.glowPixels);
}
const Q = { bx: 0, by: 0 };
function _e(e, t, n) {
  if (!i)
    return Q.bx = 0, Q.by = 0, Q;
  const { glCanvas: o } = i, r = o.width, a = o.height, s = e.dpr, d = e.cssWidth * s, l = e.cssHeight * s, c = Ke * s, u = Qe * s;
  let x = d * (r / c) / e.shaderScale, f = l * (a / u) / e.shaderScale;
  x > r && (x = r), f > a && (f = a);
  const p = (r - x) / 2, h = (a - f) / 2, m = p + t / e.cssWidth * x, S = h + n / e.cssHeight * f;
  return Q.bx = Math.round(m), Q.by = Math.round(a - 1 - S), Q;
}
const z = { r: 0, g: 0, b: 0, lum: 0, count: 0 };
function tt(e, t, n, o, r, a) {
  const s = Math.max(1, a | 0), d = Math.max(0, o - s), l = Math.min(t, o + s + 1), c = Math.max(0, r - s), u = Math.min(n, r + s + 1);
  z.r = 0, z.g = 0, z.b = 0, z.lum = 0, z.count = 0;
  for (let x = c; x < u; x++) {
    const f = x * t;
    for (let p = d; p < l; p++) {
      const h = (f + p) * 4;
      z.r += e[h], z.g += e[h + 1], z.b += e[h + 2], z.lum += (0.2126 * e[h] + 0.7152 * e[h + 1] + 0.0722 * e[h + 2]) / 255, z.count++;
    }
  }
  return z;
}
const A = { r: 255, g: 255, b: 255 };
function Le(e, t, n, o) {
  if (!i) return 0;
  fe();
  const r = _e(e, t, n), a = tt(i.glowPixels, i.glowPixelsW, i.glowPixelsH, r.bx, r.by, o);
  return a.count > 0 ? a.lum / a.count : 0;
}
function Ht(e, t, n, o) {
  if (!i)
    return A.r = 255, A.g = 255, A.b = 255, A;
  fe();
  const r = _e(e, t, n), a = tt(i.glowPixels, i.glowPixelsW, i.glowPixelsH, r.bx, r.by, o);
  return a.count === 0 ? (A.r = 255, A.g = 255, A.b = 255, A) : (A.r = a.r / a.count, A.g = a.g / a.count, A.b = a.b / a.count, A);
}
function Nt(e, t, n, o) {
  if (!i)
    return A.r = 255, A.g = 255, A.b = 255, A;
  fe();
  const r = _e(e, t, n), { glowPixels: a, glowPixelsW: s, glowPixelsH: d } = i, l = Math.max(1, o | 0), c = Math.max(0, r.bx - l), u = Math.min(s, r.bx + l + 1), x = Math.max(0, r.by - l), f = Math.min(d, r.by + l + 1);
  let p = -1;
  A.r = 255, A.g = 255, A.b = 255;
  for (let h = x; h < f; h++) {
    const m = h * s;
    for (let S = c; S < u; S++) {
      const w = (m + S) * 4, T = a[w], F = a[w + 1], P = a[w + 2], $ = Math.max(T, F, P), k = Math.min(T, F, P), D = ($ > 0 ? ($ - k) / $ : 0) * (0.35 + 0.65 * ($ / 255));
      D > p && (p = D, A.r = T, A.g = F, A.b = P);
    }
  }
  return A;
}
Ft(() => {
  i && i.instances.size > 0 && i.pausedAtMs === null && te();
});
typeof document < "u" && document.addEventListener("visibilitychange", () => {
  !i || i.pausedAtMs !== null || i.contextLost || (document.hidden ? Me() : i.instances.size > 0 && te());
});
function Wt(e) {
  const t = et(), n = e.hostCanvas.getContext("2d", { alpha: !0 });
  if (!n) throw new Error("metal-fx: canvas 2D context unavailable");
  const o = e.scale ?? 1, r = {
    canvas: e.hostCanvas,
    ctx: n,
    cssWidth: e.cssWidth,
    cssHeight: e.cssHeight,
    cornerRadius: e.cornerRadius,
    kind: e.kind,
    ringCssPx: e.ringCssPx ?? (e.kind === "circle" ? 2 : 1) * o,
    shaderScale: e.shaderScale ?? (e.kind === "circle" ? Ze : Je) * o,
    opacityMul: e.opacityMul ?? 1,
    visible: !0,
    paused: e.paused ?? !1,
    everCopied: !1,
    dpr: 1,
    scale: o,
    onAfterFrame: e.onAfterFrame,
    onFirstCopy: e.onFirstCopy
  };
  return nt(r), t.instances.add(r), t.rafId === 0 && t.pausedAtMs === null && te(), r;
}
function Gt(e) {
  if (!i) return;
  i.instances.delete(e);
  const t = i.glowQueue.indexOf(e);
  t !== -1 && i.glowQueue.splice(t, 1), i.instances.size === 0 && (Me(), $t());
}
function zt(e) {
  i && (i.glowQueue.includes(e) || i.glowQueue.push(e));
}
function Dt(e) {
  if (!i) return;
  const t = i.glowQueue.indexOf(e);
  t !== -1 && i.glowQueue.splice(t, 1);
}
function oe(e, t) {
  let n = !1;
  t.cssWidth !== void 0 && t.cssWidth !== e.cssWidth && (e.cssWidth = t.cssWidth, n = !0), t.cssHeight !== void 0 && t.cssHeight !== e.cssHeight && (e.cssHeight = t.cssHeight, n = !0), t.cornerRadius !== void 0 && (e.cornerRadius = t.cornerRadius), t.scale !== void 0 && (e.scale = t.scale), t.kind !== void 0 && t.kind !== e.kind && (e.kind = t.kind, t.shaderScale === void 0 && (e.shaderScale = (t.kind === "circle" ? Ze : Je) * e.scale), t.ringCssPx === void 0 && (e.ringCssPx = (t.kind === "circle" ? 2 : 1) * e.scale)), t.shaderScale !== void 0 && (e.shaderScale = t.shaderScale), t.ringCssPx !== void 0 && (e.ringCssPx = t.ringCssPx), t.opacityMul !== void 0 && (e.opacityMul = t.opacityMul), t.paused !== void 0 && t.paused !== e.paused && (e.paused = t.paused, !t.paused && i && i.rafId === 0 && i.pausedAtMs === null && !i.contextLost && te()), n && nt(e);
}
function Bt(e, t) {
  e.visible = t, t && i && i.rafId === 0 && i.pausedAtMs === null && !i.contextLost && te();
}
function Ut(e, t) {
  const n = et();
  n.preset = je[e].modes[t], n.presetDirty = !0;
}
function lo() {
  !i || i.pausedAtMs !== null || (i.pausedAtMs = performance.now(), Me());
}
function co() {
  !i || i.pausedAtMs === null || (i.pausedMs += performance.now() - i.pausedAtMs, i.pausedAtMs = null, i.instances.size > 0 && te());
}
let we = null;
function Xt(e) {
  we = e;
}
function nt(e) {
  e.dpr = 1;
  const t = Math.max(1, Math.round(e.cssWidth * e.dpr)), n = Math.max(1, Math.round(e.cssHeight * e.dpr));
  e.canvas.width !== t && (e.canvas.width = t), e.canvas.height !== n && (e.canvas.height = n);
}
function qt(e) {
  const { ctx: t, dpr: n, canvas: o } = e, r = e.ringCssPx * n, a = o.width, s = o.height, d = Math.max(0, (e.cornerRadius - e.ringCssPx) * n);
  t.save(), t.globalCompositeOperation = "destination-out", t.fillStyle = "#000", t.beginPath(), t.roundRect(r, r, a - 2 * r, s - 2 * r, d), t.fill(), t.restore();
}
function Vt(e) {
  var p;
  if (!i) return;
  const t = i.frameBitmap ?? i.glCanvas, n = e.dpr, o = e.canvas.width, r = e.canvas.height;
  if (o < 1 || r < 1) return;
  const a = i.glCanvas.width, s = i.glCanvas.height, d = Ke * n, l = Qe * n;
  let c = o * (a / d) / e.shaderScale, u = r * (s / l) / e.shaderScale;
  c > a && (c = a), u > s && (u = s);
  const x = Math.max(0, (a - c) / 2), f = Math.max(0, (s - u) / 2);
  if (e.ctx.clearRect(0, 0, o, r), e.opacityMul < 1 && (e.ctx.globalAlpha = e.opacityMul), e.ctx.drawImage(t, x, f, c, u, 0, 0, o, r), e.opacityMul < 1 && (e.ctx.globalAlpha = 1), qt(e), e.onFirstCopy) {
    const h = e.onFirstCopy;
    e.onFirstCopy = void 0, h();
  }
  (p = e.onAfterFrame) == null || p.call(e);
}
function Yt() {
  if (!i) return;
  const { gl: e, uniforms: t, preset: n, glCanvas: o } = i;
  t.u_resolution && e.uniform2f(t.u_resolution, o.width, o.height);
  for (let r = 0; r < 7; r++) {
    const a = t[`u_color${r + 1}`];
    if (a) {
      const [d, l, c] = xt(n.colors[r]);
      e.uniform3f(a, d, l, c);
    }
    const s = t[`u_alpha${r + 1}`];
    s && e.uniform1f(s, n.alphas[r]);
  }
  t.u_intensity && e.uniform1f(t.u_intensity, n.intensity), t.u_scale && e.uniform1f(t.u_scale, n.scale), t.u_direction && e.uniform1f(t.u_direction, n.direction * Math.PI / 180), t.u_softness && e.uniform1f(t.u_softness, n.softness), t.u_distortion && e.uniform1f(t.u_distortion, n.distortion), t.u_complexity && e.uniform1f(t.u_complexity, n.complexity), t.u_shape && e.uniform1f(t.u_shape, n.shape), t.u_vignette && e.uniform1f(t.u_vignette, n.vignette), t.u_vigOpacity && e.uniform1f(t.u_vigOpacity, n.vigOpacity), t.u_blur && e.uniform1f(t.u_blur, n.blur), t.u_shaderOpacity && e.uniform1f(t.u_shaderOpacity, n.shaderOpacity), i.presetDirty = !1;
}
function jt(e) {
  if (!i) return;
  const { gl: t, uniforms: n, preset: o, glCanvas: r } = i, a = (e - i.startMs - i.pausedMs) / 1e3 * o.speed;
  t.viewport(0, 0, r.width, r.height), t.clearColor(0, 0, 0, 0), t.clear(t.COLOR_BUFFER_BIT), i.presetDirty && Yt(), n.u_time && t.uniform1f(n.u_time, a), t.drawArrays(t.TRIANGLES, 0, 6), i.frameCount++;
}
let Ie = 0;
function ot(e) {
  var n;
  if (!i) return;
  if (i.contextLost) {
    i.rafId = 0;
    return;
  }
  let t = !1;
  for (const o of i.instances)
    if (o.visible && (!o.paused || !o.everCopied)) {
      t = !0;
      break;
    }
  if (!t) {
    i.rafId = 0;
    return;
  }
  if (i.rafId = requestAnimationFrame(ot), !(e - Ie < wt)) {
    Ie = e, jt(e), i.useOffscreen && (i.glowQueue.length > 0 && fe(), (n = i.frameBitmap) == null || n.close(), i.frameBitmap = i.glCanvas.transferToImageBitmap());
    for (const o of i.instances)
      o.visible && (o.paused && o.everCopied || (Vt(o), o.everCopied = !0));
    if (we && i.glowQueue.length > 0 && ++i.glowSkip % Mt === 0) {
      const o = i.glowQueue;
      i.glowIdx >= o.length && (i.glowIdx = 0);
      const r = o[i.glowIdx];
      r.visible && !r.paused && we(r, e), i.glowIdx++;
    }
  }
}
function te() {
  !i || i.rafId !== 0 || (i.rafId = requestAnimationFrame(ot));
}
function Me() {
  i && (i.rafId !== 0 && cancelAnimationFrame(i.rafId), i.rafId = 0);
}
  return metalFxLibrary = { createInstance: Wt, destroyInstance: Gt, updateInstance: oe, setSharedPreset: Ut, dispose: $t }
}
// END VENDORED METAL-FX

const PLUGIN_ID = 'spotify-player'
const POLL_MS = 4000
const STATUS_KEY = ['spotify-player', 'native-status']
const $commandBusy = atom(false)
const $panePolling = atom(false)
const $searchOpen = atom(false)
const $authOpen = atom(false)
const $libraryRevision = atom(0)
let pluginRest = null
let pluginStorage = null
// Optional standalone-host preference seam; Hermes otherwise follows the OS.
let hostPreferences = null
let restControl = null
let openExternal = null
let registerPlayerPane = null
let registeredPaneMode = null
const renderPlayerPane = () => jsx(SpotifyRightRail, {})

const PLAYER_STYLES = [
  {id:'silver',label:'Silver reference'},
  {id:'quicktime',label:'QuickTime reference'},
  {id:'wmp-curved',label:'WMP curved frame'},
  {id:'handheld',label:'Blue/green handheld reference'},
  {id:'droplet',label:'Blue droplet reference'},
  {id:'wmp-classic',label:'WMP classic application'},
  {id:'wmp-glass',label:'WMP glass tabs'},
  {id:'jetaudio',label:'jetAudio deck'},
  {id:'organic',label:'Green organic reference'},
  {id:'dark-playlist',label:'Dark playlist window'},
  {id:'wmp-library',label:'WMP library reference'}
]
const WIDE_PLAYER_STYLES = ['wmp-classic','wmp-glass','organic','dark-playlist','wmp-library']

function playerFrameWidth(style, scale = 1, availableWidth = 320) {
  if (WIDE_PLAYER_STYLES.includes(style)) return Math.min(720, Math.max(1, availableWidth))
  return style === 'handheld' ? Math.min(240, 320 * scale) : 320 * scale
}

function playerFrameHeight(mode, scale = 1, style = 'silver', availableWidth = 320) {
  // The QuickTime reference is a rectangular movie window, not a recolored
  // silver object. Its controls retain logical-pixel size as the movie resizes.
  if (WIDE_PLAYER_STYLES.includes(style)) return mode === 'on' ? Math.round(playerFrameWidth(style,scale,availableWidth) * .55) + 102 : mode === 'mini' ? 76 : 92
  if (style === 'handheld') return mode === 'on' ? Math.round(playerFrameWidth(style,scale) * .65) + 168 : mode === 'mini' ? 142 : 158
  if (style === 'jetaudio') return mode === 'on' ? Math.round((320 * scale - 8) * .75) + 112 : mode === 'mini' ? 86 : 102
  if (style === 'droplet') return mode === 'on' ? Math.round(320 * scale * .7) + 152 : mode === 'mini' ? 96 : 112
  if (style !== 'silver') return mode === 'on' ? Math.round((320 * scale - 8) * .75) + 102 : mode === 'mini' ? 76 : 92
  return mode === 'mini' ? Math.max(70,88*scale) : (mode === 'off' ? 112 : 280) * scale
}

function updatePlayerPane(mode, scale = 1, chromeHeight = 0, style = 'silver', availableWidth = 320) {
  const height = `${Math.ceil(playerFrameHeight(mode, scale, style, availableWidth) + chromeHeight)}px`
  const signature = `${mode}:${height}`
  if (!registerPlayerPane || registeredPaneMode === signature) return
  registeredPaneMode = signature
  // Update the existing contribution, never remove/re-dock it. A max clamp
  // also releases a tall height override left by an earlier sash drag.
  registerPlayerPane({
    id: 'native-side-pocket', area: 'panes', title: 'Spotify',
    data: { placement: 'left', collapsible: true,
      dock: { pane: 'sessions', pos: 'bottom' },
      height, minHeight: height, maxHeight: height
    },
    render: renderPlayerPane
  })
}

async function runNativeSpotify(action = 'status', argument = '') {
  if (!restControl) throw new Error('Spotify plugin backend is not ready.')

  const nativeMutation = ['open', 'playpause', 'play', 'pause', 'next', 'previous', 'volume', 'seek', 'play-uri'].includes(action)
  if (nativeMutation && $commandBusy.get()) throw new Error('A Spotify command is already running.')
  if (nativeMutation) {
    $commandBusy.set(true)
    await queryClient.cancelQueries({ queryKey: STATUS_KEY })
  }
  try {
    const snapshot = await restControl(action, argument)
    if (!snapshot?.ok) throw new Error(snapshot?.error || 'Spotify command failed.')
    if (nativeMutation) queryClient.setQueryData(STATUS_KEY, snapshot)
    return snapshot
  } finally {
    if (nativeMutation) $commandBusy.set(false)
  }
}

function statusInterval(player, visible, error = false) {
  if (!visible) return false
  if (error || (player?.state !== 'playing' && player?.state !== 'paused')) return 30000
  return player?.state === 'playing' ? POLL_MS : 15000
}

function useDocumentVisible() {
  const [visible, setVisible] = useState(() => !document.hidden)
  useEffect(() => {
    const update = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  return visible
}

function useSurfaceVisible(ref) {
  const documentVisible = useDocumentVisible()
  const [intersecting, setIntersecting] = useState(true)
  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const observer = new IntersectionObserver(entries => setIntersecting(entries[0]?.isIntersecting === true))
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return documentVisible && intersecting
}

function useSpotifyAuth(open = false) {
  const visible = useDocumentVisible()
  return useQuery({queryKey:['spotify-player','auth-status'],queryFn:()=>pluginRest('/auth/status',{method:'GET'}),enabled:visible,staleTime:30000,retry:false,refetchInterval:open&&visible?3000:false,refetchIntervalInBackground:false})
}

function useNativeStatus(poll = false) {
  const visible = useDocumentVisible()
  return useQuery({
    queryKey: STATUS_KEY,
    queryFn: () => runNativeSpotify('status'),
    staleTime: POLL_MS,
    gcTime: 60000,
    retry: false,
    enabled: visible,
    // The persistent status contribution owns the only polling observer.
    refetchInterval: query => poll ? statusInterval(query.state.data, visible, !!query.state.error) : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: poll,
    refetchOnReconnect: poll
  })
}

// Embedded host chrome with finite focus feedback; no nested card surface.
const PLAYER_CSS = `
/* Reference-driven silver/blue/green hardware skin; intentionally not theme-tinted. */
.spotify-surface{position:relative;isolation:isolate;box-sizing:border-box;width:100%;min-width:0;color:#163e53;background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20320%20280%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22metal%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23f8ffff%22%2F%3E%3Cstop%20offset%3D%22.13%22%20stop-color%3D%22%238d9da6%22%2F%3E%3Cstop%20offset%3D%22.3%22%20stop-color%3D%22%23e1ebed%22%2F%3E%3Cstop%20offset%3D%22.54%22%20stop-color%3D%22%23fbffff%22%2F%3E%3Cstop%20offset%3D%22.7%22%20stop-color%3D%22%23a6b5bb%22%2F%3E%3Cstop%20offset%3D%22.87%22%20stop-color%3D%22%23dbe4e5%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2355666e%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22edge%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23dce7e9%22%2F%3E%3Cstop%20offset%3D%22.35%22%20stop-color%3D%22%2352616b%22%2F%3E%3Cstop%20offset%3D%22.72%22%20stop-color%3D%22%23d9e4e7%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23253741%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M50%209%20Q160%20-1%20270%209%20Q289%2011%20291%2032%20L307%20157%20Q319%20172%20312%20207%20L303%20232%20Q296%20252%20275%20252%20L139%20253%20Q121%20253%20109%20265%20Q94%20279%2065%20277%20Q30%20276%2024%20243%20L10%20192%20Q4%20172%2015%20155%20L29%2033%20Q32%2012%2050%209Z%22%20fill%3D%22url%28%23metal%29%22%20stroke%3D%22%2325343e%22%20stroke-width%3D%223%22%2F%3E%3Cpath%20d%3D%22M50%2012%20Q160%202%20269%2012%20Q285%2014%20288%2033%20L304%20158%20Q315%20172%20309%20206%20L300%20231%20Q293%20249%20275%20249%20L139%20250%20Q120%20250%20106%20263%20Q91%20276%2065%20274%20Q33%20273%2027%20242%20L13%20191%20Q8%20172%2018%20156%20L32%2034%20Q35%2015%2050%2012Z%22%20fill%3D%22none%22%20stroke%3D%22url%28%23edge%29%22%20stroke-width%3D%223%22%2F%3E%3C%2Fsvg%3E") center/100% 100% no-repeat;border:0;box-shadow:none;overflow:hidden;font-family:inherit}
.spotify-retro-viewport{display:flex;flex-direction:column;width:100%;height:100%;min-width:0;overflow:auto}
.spotify-retro-stage{position:relative;margin:auto auto 0;flex-shrink:0;overflow:hidden}
.spotify-surface[data-skin=retro-chrome]{position:absolute;left:0;top:0;width:320px;height:280px;aspect-ratio:8/7;transform-origin:top left;display:grid;grid-template-rows:minmax(0,1fr) 60px;gap:7px;padding:17px 10px 23px}
.spotify-surface button{box-sizing:border-box;min-height:28px;height:28px;min-width:28px;width:28px;padding:0;flex-shrink:0;border:1px solid #738995;border-radius:50%;color:#285d7a;background:radial-gradient(ellipse at 35% 17%,#fff 0%,#e9f8ff 28%,#acc4d2 58%,#6f8fa2 82%,#c4d1d5 100%);box-shadow:inset 0 1px 1px #fff,0 0 0 2px #bac7ca,0 2px 2px #62747c;font-size:10px;line-height:1;transition:filter .12s}
.spotify-surface button:hover:not(:disabled){filter:brightness(1.12)}
.spotify-surface button:active:not(:disabled){box-shadow:inset 0 2px 3px #58768a,0 0 0 2px #cad5d8}
.spotify-surface button:focus-visible,.spotify-range:focus-visible{outline:2px solid #0879b9;outline-offset:2px}
.spotify-surface button:disabled{opacity:.45}
.spotify-surface button svg{width:14px;height:14px}
.spotify-surface button[aria-pressed=true],.spotify-surface button[aria-selected=true]{color:#064571;background:radial-gradient(ellipse at 35% 17%,#fff,#a7e5ff 48%,#3995cf 83%,#c9f0ff)}
.spotify-surface.spotify-surface button[aria-label="Play Spotify"],.spotify-surface.spotify-surface button[aria-label="Pause Spotify"]{border:1px solid #4d829e;color:#07619b;background:radial-gradient(ellipse at 34% 19%,#fff 0%,#eaf9ff 23%,#9ddcff 45%,#22a2ef 69%,#0968aa 88%,#5ebbe6 100%);box-shadow:inset 0 1px 2px #fff,0 0 0 3px #ecf6f8,0 0 0 4px #79939f,0 2px 4px #425b6a;border-radius:50%}
.spotify-upper{display:grid;grid-template-columns:28px minmax(0,1fr) 28px;gap:5px;min-height:0}
.spotify-side-controls{display:flex;flex-direction:column;justify-content:flex-end;gap:7px;padding-bottom:8px;min-height:0}
.spotify-display{display:flex;flex-direction:column;min-width:0;min-height:0;border:2px solid #627d8b;border-radius:24px 24px 13px 13px;overflow:hidden;background:#183b45;box-shadow:0 1px 1px #f8ffff,inset 0 2px 5px #112c39}
.spotify-screen{min-height:0;flex:1;position:relative;overflow:hidden;display:flex;background:linear-gradient(145deg,#183f54,#081c2c)}
.spotify-screen::after{content:'';pointer-events:none;position:absolute;inset:0;background:linear-gradient(135deg,#ffffff25,transparent 45%);box-shadow:inset 0 0 9px #05192780;border-radius:20px 20px 0 0}
.spotify-artwork{display:block;min-height:0;max-height:none;width:100%;height:100%;object-fit:cover;border:0;border-radius:0;box-shadow:none}
.spotify-lcd{box-sizing:border-box;min-width:0;flex-shrink:0;padding:4px 6px;background:linear-gradient(100deg,#94ba87,#c7d9b3 58%,#a4c496);color:#194c1a;box-shadow:inset 0 1px 3px #385b4660;text-shadow:0 1px #e0efbd70;font-family:'Lucida Console',Monaco,monospace}
.spotify-title{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:16px;font-weight:600}
.spotify-meta{display:flex;min-width:0;align-items:baseline;gap:4px;font-size:9px;line-height:13px}
.spotify-artist{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.spotify-time{flex-shrink:0;font-variant-numeric:tabular-nums;font-size:9px;white-space:nowrap}
.spotify-standard-copy{min-width:0;flex:1}
.spotify-transport{display:grid;grid-template-columns:50px minmax(0,1fr);grid-template-rows:19px minmax(0,1fr);column-gap:9px;min-height:0;align-items:center;padding:0 6px}
.spotify-metal-control{position:relative;display:inline-flex;flex-shrink:0;grid-row:1/3;align-self:center;justify-self:center}
.spotify-transport .spotify-metal-control::before{content:'';position:absolute;inset:-6px;border:1px solid #748b96;border-radius:50%;background:conic-gradient(#faffff,#8a9fa9,#e8f7fc,#fff,#93a9b5,#faffff);box-shadow:inset 0 1px 2px #fff,0 2px 2px #506b7d;z-index:-1}
.spotify-transport .spotify-metal-control button{width:42px;height:42px;min-width:42px}
.spotify-transport .spotify-metal-control button svg{width:20px;height:20px}
.spotify-metal{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:50%}
.spotify-metal canvas{display:block;width:100%;height:100%}
.spotify-seek{min-width:0;display:flex;align-items:center}
.spotify-controls{display:flex;align-items:center;gap:7px;min-width:0}
.spotify-controls>button{height:22px;min-height:22px;width:36px;min-width:36px;border-radius:11px}
.spotify-volume{max-width:106px;margin-left:auto;display:flex;align-items:center;gap:5px;min-width:0;flex:1;height:24px;border:1px solid #a0afb4;border-radius:9px;padding:0 6px;background:#dfe7e7;box-shadow:inset 0 1px 2px #839ba4;color:#3b7493}
.spotify-volume>span{font-size:10px;flex-shrink:0}
.spotify-volume .spotify-range{flex:1;width:0;min-width:0;height:22px}
.spotify-range{appearance:none;-webkit-appearance:none;width:100%;min-width:0;height:19px;margin:0;background:transparent;cursor:pointer}
.spotify-range::-webkit-slider-runnable-track{height:7px;border:1px solid #527857;border-radius:8px;background:linear-gradient(to right,#268331 0 var(--range-fill),#b7dec5 var(--range-fill) 100%);box-shadow:inset 0 1px 2px #ffffffba,0 1px #fff}
.spotify-range::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;margin-top:-3px;border-radius:50%;border:1px solid #57735c;background:radial-gradient(circle at 35% 25%,#efffe9,#71b989 65%,#26743d);box-shadow:0 1px 2px #395b42}
.spotify-volume .spotify-range::-webkit-slider-runnable-track{height:4px;border:1px solid #8b9b9f;background:#a5b4b5;box-shadow:inset 0 1px #60787d,0 1px #fff}
.spotify-volume .spotify-range::-webkit-slider-thumb{width:13px;height:13px;margin-top:-5px;border:1px solid #668495;background:radial-gradient(circle at 30% 25%,#fff,#d6edf8 25%,#7294aa 65%,#2d536d);box-shadow:0 1px 2px #3c505c}
.spotify-range::-moz-range-track{height:6px;border-radius:8px;background:#b7dec5}
.spotify-range::-moz-range-progress{height:6px;background:#268331}
.spotify-range::-moz-range-thumb{width:10px;height:10px;border-radius:50%;border:1px solid #57735c;background:#d4eee1}
.spotify-range:disabled{opacity:.4;cursor:default}
.spotify-screen .spotify-loader{margin:auto}
.spotify-empty-screen{display:flex;align-items:center;justify-content:center;flex:1;color:#b6d6e3}
.spotify-lyrics-message{padding:6px;overflow-y:auto;min-height:0;color:#dcf5db;font-size:11px;text-align:center;white-space:pre-line;flex:1}
.spotify-loader{display:inline-flex;gap:3px;align-items:center;height:18px;color:#c8e9df}
.spotify-loader i{display:block;width:3px;height:12px;background:currentColor;border-radius:2px;animation:spotify-loader-step .9s ease-in-out infinite alternate}
.spotify-loader i:nth-child(2){animation-delay:.15s}.spotify-loader i:nth-child(3){animation-delay:.3s}
@keyframes spotify-loader-step{from{transform:scaleY(.35);opacity:.4}to{transform:scaleY(1);opacity:1}}
.spotify-surface[data-visible=false],.spotify-surface[data-visible=false] *{animation:none!important}
.spotify-surface[data-reduced-motion=true],.spotify-surface[data-reduced-motion=true] *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
@media(prefers-reduced-motion:reduce){.spotify-surface,.spotify-loader i{animation:none!important}.spotify-surface *{scroll-behavior:auto!important;transition:none!important}}
/* Two physical shells; all fixtures are inset from the drawn silhouette. */
.spotify-surface[data-skin=retro-chrome]{display:block;padding:0}
.spotify-surface{--lcd-a:#94ba87;--lcd-b:#c7d9b3;--lcd-ink:#194c1a;--glass:#091e2f;--lyric:#dcf5db;--lyric-active:#f7ffe5}
.spotify-surface[data-finish=ice]{--lcd-a:#95c5d6;--lcd-b:#d5edf3;--lcd-ink:#174566;--glass:#0a263f;--lyric:#c9eaff;--lyric-active:#fff}
.spotify-surface[data-finish=graphite]{--lcd-a:#657976;--lcd-b:#a9b7a6;--lcd-ink:#102d28;--glass:#111c24;--lyric:#b9cec0;--lyric-active:#fff}
.spotify-surface[data-finish=ice] .spotify-display{border-color:#6188aa}
.spotify-surface[data-finish=graphite] button{background:radial-gradient(ellipse at 35% 17%,#f4fbff,#b1c1cb 40%,#667782 75%,#c6d5dc)}
.spotify-upper{position:absolute;left:19px;right:19px;top:40px;height:155px;grid-template-columns:40px minmax(0,1fr) 40px;gap:10px}
.spotify-side-controls{justify-content:flex-end;align-items:center;padding:0;gap:8px;transform:translateX(10px)}
.spotify-display+.spotify-side-controls{transform:translateX(-10px)}
.spotify-display{border-radius:21px 21px 10px 10px;position:relative}
.spotify-screen{background:var(--glass)}
.spotify-lcd{background:linear-gradient(100deg,var(--lcd-a),var(--lcd-b) 58%,var(--lcd-a));color:var(--lcd-ink)}
.spotify-view-tabs{position:absolute;left:33px;right:33px;top:-27px;display:flex;justify-content:center;gap:8px;height:22px;align-items:center;background:transparent;box-shadow:none}
.spotify-view-tabs button{display:inline-flex;align-items:center;justify-content:center;gap:3px;width:52px;min-width:52px;height:22px;min-height:22px;border-radius:8px;font-size:9px;font-weight:600;letter-spacing:.1px;color:#173c51;box-shadow:inset 0 1px #fff,0 1px 1px #4e6577}
.spotify-tab-label{display:inline-flex;align-items:center;gap:3px}
.spotify-view-tabs button svg{width:11px;height:11px}
.spotify-side-controls button{color:#173c51;width:24px;min-width:24px;height:24px;min-height:24px}
.spotify-side-controls button svg{width:18px;height:18px}
.spotify-side-controls>button:nth-child(2) svg{width:20px;height:20px}
.spotify-off-actions button svg{width:18px;height:18px}
.spotify-side-controls button:disabled{opacity:.65}
.spotify-view-tabs button[aria-selected=true]{box-shadow:inset 0 1px 2px #fff,inset 0 -2px 3px #1c83af66,0 1px 1px #4e6577}
.spotify-transport{position:absolute;left:34px;right:24px;top:200px;height:48px;padding:0;grid-template-rows:18px 30px;column-gap:9px}
.spotify-surface button{border:2px solid #69818f;box-shadow:inset 0 1px 1px #fff,inset 0 -2px 2px #43627880,0 0 0 2px #ecf6f8,0 0 0 3px #79939f,0 2px 3px #354c5e;transition:filter .1s}
.spotify-surface button:focus-visible,.spotify-range:focus-visible{outline-offset:-3px}
.spotify-surface button[aria-busy=true]{filter:saturate(.25);cursor:progress}
.spotify-taste{width:100%;min-width:0;height:100%;box-sizing:border-box;overflow:auto;display:flex;flex-direction:column;gap:3px;padding:6px;color:#c9e5aa;background:linear-gradient(#111916,#192b24);font:10px Tahoma,sans-serif}
.spotify-taste strong{font-size:11px}.spotify-taste input,.spotify-taste textarea{box-sizing:border-box;min-height:20px;width:100%;border:1px solid #809590;border-radius:3px;background:#111e19;color:#e1f2c9;padding:3px;font:10px Tahoma,sans-serif}.spotify-taste textarea{min-height:40px;resize:none;flex:1}.spotify-taste-actions{display:flex;gap:3px}.spotify-taste button{flex:1;min-height:22px;border:1px solid #89979e;border-radius:4px;background:linear-gradient(#fafcfc,#9aa8b0 48%,#607785 52%,#dbe5e9);box-shadow:inset 0 0 0 1px #d9e6eb;color:#14212b;font:9px Tahoma,sans-serif;padding:2px}.spotify-taste button:disabled{opacity:.5}.spotify-taste p{margin:0;line-height:1.25;overflow-wrap:anywhere}.spotify-taste a{color:#a6d5ff}.spotify-taste :focus-visible{outline:2px solid #86c7ed;outline-offset:-2px}
.spotify-settings{box-sizing:border-box;position:relative;z-index:1;flex:1;min-width:0;min-height:0;overflow:hidden;padding:4px 8px;color:var(--lyric);font:10px/1.2 Tahoma,sans-serif;display:flex;flex-direction:column;gap:2px}
.spotify-settings header{font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;line-height:11px}
.spotify-settings fieldset{border:0;min-width:0;padding:0;margin:0}
.spotify-settings legend{padding:0;font-size:9px;opacity:.65;line-height:10px}
.spotify-settings-account{display:flex;justify-content:space-between;gap:6px;align-items:center;min-height:15px;color:inherit;text-decoration:none;white-space:nowrap}
.spotify-settings-account:hover{text-decoration:underline;text-underline-offset:3px}
.spotify-settings-account:focus-visible{outline:1px solid currentColor;outline-offset:1px}
.spotify-heart-view{position:relative;display:inline-flex}
.spotify-heart-view [data-like-indicator]{position:absolute;z-index:2;right:-3px;bottom:-2px;min-width:9px;height:10px;line-height:10px;text-align:center;border-radius:2px;background:#173c51;color:#fff;font:700 9px/10px Tahoma,sans-serif}
.spotify-surface button[data-liked-state=liked] svg{color:#a31b50}

.spotify-surface[data-screen=off]{height:112px;aspect-ratio:20/7;background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20320%20112%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22m%22%20x2%3D%22.15%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%22.16%22%20stop-color%3D%22%23bbc7ce%22%2F%3E%3Cstop%20offset%3D%22.46%22%20stop-color%3D%22%23f9ffff%22%2F%3E%3Cstop%20offset%3D%22.65%22%20stop-color%3D%22%23dce4e7%22%2F%3E%3Cstop%20offset%3D%22.87%22%20stop-color%3D%22%23a0afb8%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23eff7fb%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M52%204C73%204%2076%2012%2096%2012H287Q314%2012%20314%2037V74Q314%20101%20287%20101H99C76%20101%2076%20109%2052%20109A52%2052%200%200%201%2052%204Z%22%20fill%3D%22url%28%23m%29%22%20stroke%3D%22%23516776%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M52%207C73%207%2076%2015%2096%2015H287Q311%2015%20311%2037V74Q311%2098%20287%2098H99C76%2098%2076%20106%2052%20106A49%2049%200%200%201%2052%207Z%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%221.5%22%2F%3E%3C%2Fsvg%3E")}
.spotify-off-header>.spotify-lcd{position:absolute;left:85px;top:20px;width:181px;height:36px;border:1px solid #688879;border-radius:10px;padding:2px 6px}
.spotify-off-header .spotify-title{font-size:11px;line-height:16px}
.spotify-off-actions{position:absolute;top:25px;left:278px;display:flex;flex-direction:column;gap:12px}
.spotify-off-actions button{width:24px;height:24px;min-width:24px;min-height:24px}
.spotify-surface[data-screen=off] .spotify-transport{position:static;display:contents}
.spotify-surface[data-screen=off] .spotify-metal-control{position:absolute;left:30px;top:38px}
.spotify-surface[data-screen=off] .spotify-seek{position:absolute;left:90px;top:57px;width:174px;height:17px}
.spotify-surface[data-screen=off] .spotify-controls{position:absolute;left:91px;top:76px;width:173px;gap:7px;height:22px}
.spotify-surface[data-screen=off] .spotify-controls>button{width:25px;min-width:25px;height:22px;min-height:22px}
.spotify-surface[data-screen=off] .spotify-volume{max-width:101px}
/* Detachable mini transport (screen=mini) — a compact floating bar, separate from the display. */
.spotify-surface[data-screen=mini]{height:88px;aspect-ratio:320/88;background:linear-gradient(145deg,#f8ffff,#8d9da6 30%,#e1ebed 50%,#a6b5bb 70%,#dbe4e5 88%,#55666e);border:2px solid #25343e;border-radius:14px;box-shadow:inset 0 1px 2px #fff,0 2px 6px #0006;overflow:hidden}
.spotify-surface[data-screen=mini] .spotify-transport{position:absolute;left:8px;right:8px;top:38px;height:44px;display:grid;grid-template-columns:46px minmax(0,1fr);grid-template-rows:20px 24px;column-gap:8px;align-items:center}
.spotify-surface[data-screen=mini] .spotify-metal-control{position:relative;grid-row:1/3;align-self:center;justify-self:center}
.spotify-surface[data-screen=mini] .spotify-metal-control button{width:40px;height:40px;min-width:40px}
.spotify-surface[data-screen=mini] .spotify-metal-control button svg{width:18px;height:18px}
.spotify-surface[data-screen=mini] .spotify-seek{position:static;grid-row:1;align-self:center}
.spotify-surface[data-screen=mini] .spotify-controls{position:static;grid-row:2;align-self:center;height:24px}
.spotify-surface[data-screen=mini] .spotify-controls>button{width:24px;min-width:24px;height:24px;min-height:24px}
.spotify-surface[data-screen=mini] .spotify-volume{max-width:110px;height:22px}
.spotify-mini{position:absolute;inset:0}
.spotify-mini-lcd{box-sizing:border-box;position:absolute;left:10px;top:4px;right:64px;height:32px;border:1px solid #688879;border-radius:8px;padding:2px 6px;background:linear-gradient(100deg,var(--lcd-a),var(--lcd-b) 58%,var(--lcd-a));color:var(--lcd-ink);overflow:hidden}
.spotify-mini-lcd .spotify-title{font-size:10px;line-height:14px}
.spotify-mini-lcd .spotify-meta{font-size:8px;line-height:11px}
.spotify-mini-lcd .spotify-time{font-size:8px}
.spotify-compact-error{display:block;font:10px/12px Tahoma,sans-serif;color:#721b15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.spotify-mini-actions{position:absolute;top:6px;right:7px;display:flex;gap:6px}
.spotify-mini-actions button{width:22px;min-width:22px;height:22px;min-height:22px}
.spotify-mini-actions button svg{width:13px;height:13px}
.spotify-lyrics,.spotify-lyrics-message{color:var(--lyric);background:var(--glass);font:11px/1.6 Tahoma,sans-serif;overscroll-behavior:contain;scrollbar-width:thin}
.spotify-lyrics-shell{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;position:relative}
.spotify-lyrics{box-sizing:border-box;position:relative;min-height:0;min-width:0;flex:1;overflow-y:auto;overflow-wrap:anywhere;padding:12px 7px;text-align:center}
.spotify-lyrics-message{min-width:0;overflow-wrap:anywhere}
.spotify-surface .spotify-follow{width:auto;height:20px;min-height:20px;flex-shrink:0;border-radius:4px;font-size:9px;line-height:1.3;margin:2px 7px}
.spotify-lyrics:focus-visible{outline:2px solid #7dd9ff;outline-offset:-2px}
.spotify-visualizer{position:relative;flex:1;min-height:0;overflow:hidden;background:#020916}.spotify-visualizer canvas{display:block;width:100%;height:100%}.spotify-audio-prompt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:6px 8px;background:#02101fee;color:#c9e2f3;text-align:center;font:10px/1.3 Tahoma,sans-serif;overflow:auto}.spotify-audio-prompt p{margin:0;font-size:9px;overflow-wrap:anywhere}.spotify-audio-prompt button,.spotify-audio-status button{flex-shrink:0;width:auto;min-width:0;height:20px;min-height:20px;white-space:nowrap;box-shadow:none;border:1px solid #5289ad;border-radius:3px;background:#123451;color:#d9f3ff;padding:3px 7px;font:9px Tahoma,sans-serif;cursor:pointer}.spotify-audio-prompt button:disabled{opacity:.5;cursor:default}.spotify-audio-status{position:absolute;bottom:3px;left:5px;right:5px;display:flex;align-items:center;justify-content:space-between;color:#bdd8f0;font:7px Tahoma,sans-serif;letter-spacing:1px}.spotify-audio-status button{height:16px;min-height:16px;padding:1px 4px;font-size:8px;letter-spacing:0}.spotify-audio-prompt button:focus-visible,.spotify-audio-status button:focus-visible{outline:2px solid #b7eaff;outline-offset:1px}
.spotify-lyrics [data-active=true]{color:var(--lyric-active);font-weight:bold;text-shadow:0 0 8px #ace5ba66}

/* Shared hardware finish: no FX mode, no perpetual CSS animation. */
.spotify-surface button{position:relative;overflow:hidden;transition:filter 120ms ease,transform 120ms ease,box-shadow 120ms ease;cursor:pointer}
.spotify-surface button::before{content:'';position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:linear-gradient(115deg,transparent 20%,#ffffff70 45%,transparent 65%);opacity:.2;transform:translateX(-40%);transition:transform 180ms ease,opacity 180ms ease}
.spotify-surface button:hover:not(:disabled)::before,.spotify-surface button:focus-visible::before{transform:translateX(30%);opacity:.8}
.spotify-surface button:active:not(:disabled){transform:translateY(1px);filter:brightness(.94)}
.spotify-surface button:disabled{cursor:not-allowed}
.spotify-surface button:disabled::before{opacity:0}
.spotify-surface button svg{position:relative;z-index:1}
.spotify-surface button[aria-pressed=true],.spotify-surface button[aria-selected=true]{box-shadow:inset 0 1px 2px #fff,inset 0 -2px 4px #1c83af99,0 0 0 1px #e6ffff,0 0 5px #61cef080}
.spotify-screen::after{z-index:2;border-radius:0;background:linear-gradient(125deg,#b9e5ff12,transparent 42%),repeating-linear-gradient(0deg,transparent 0 3px,#020e1610 3px 4px);box-shadow:inset 0 0 8px #0008}
.spotify-settings .spotify-skins{display:flex;justify-content:space-between;gap:8px;white-space:nowrap}
.spotify-settings .spotify-skins label{position:relative;display:inline-flex;align-items:center;height:13px;cursor:pointer;font-size:10px}
.spotify-settings .spotify-skins input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}
.spotify-settings .spotify-skins input:checked+span{font-weight:700;text-decoration:underline;text-underline-offset:4px}
.spotify-settings .spotify-skins label:hover span{color:#fff}
.spotify-settings .spotify-skins input:focus-visible+span{outline:1px solid currentColor;outline-offset:2px}

.spotify-panel{position:relative;min-width:0;min-height:0;flex:1;overflow:auto;overscroll-behavior:contain;padding:5px;color:var(--lyric);font:10px/1.4 Tahoma,sans-serif;scrollbar-width:thin}
.spotify-panel>div{max-width:100%;overflow:visible;padding:0;display:block}
.spotify-panel header{padding:0 22px 4px 0;border:0}.spotify-panel h2{font:600 11px/1.4 Tahoma,sans-serif;margin:0}.spotify-panel p{font-size:10px;margin:3px 0;padding:0;overflow-wrap:anywhere}
.spotify-panel div,.spotify-panel span{min-width:0}
.spotify-panel .spotify-panel-close{position:sticky;float:right;top:0;z-index:3;width:20px;min-width:20px;height:20px;min-height:20px;font-size:12px;border:1px solid #477998;border-radius:3px;background:#123951;color:var(--lyric);box-shadow:none}
.spotify-panel button:not(.spotify-panel-close){width:100%;height:auto;min-height:25px;border-radius:5px;padding:4px;white-space:normal;text-align:left;font:10px/1.35 Tahoma,sans-serif;color:var(--lyric);background:#123951;border:1px solid #477998;box-shadow:none}
.spotify-panel input{box-sizing:border-box;width:100%;min-width:0;background:#e7f4f6;color:#133646;border:1px solid #829cab;border-radius:4px;padding:4px;font:11px Tahoma,sans-serif}
.spotify-panel form>div,.spotify-panel header+div{padding:4px 0}
.spotify-panel img{width:28px;height:28px;object-fit:cover}
.spotify-panel code{font-size:9px;white-space:normal;overflow-wrap:anywhere}
.spotify-panel a{color:#bae9ff}
.spotify-panel button span{white-space:normal;overflow-wrap:anywhere}
.spotify-panel button:active:not(:disabled){box-shadow:inset 0 1px 3px #0008}
.spotify-panel :focus-visible{outline:2px solid #70d5ff;outline-offset:-2px}
.spotify-panel.spotify-playlist-host{overflow:hidden;display:flex}.spotify-playlist-host .spotify-panel-close{position:absolute;right:3px;top:3px;float:none}
.spotify-panel>.spotify-playlist-panel{display:flex;flex:1;flex-direction:column;gap:3px;min-height:0;overflow:hidden}.spotify-playlist-panel header{padding:0 20px 0 0;flex-shrink:0}
.spotify-panel .spotify-playlist-track{margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:9px;line-height:12px;flex-shrink:0}
.spotify-playlist-panel>input{height:20px;padding:2px 4px;flex-shrink:0;font-size:10px}.spotify-playlist-panel .spotify-playlist-rows{min-height:28px;flex:1;overflow-y:auto;overscroll-behavior:contain;padding:0;scrollbar-width:thin}
.spotify-playlist-error{flex:1;min-height:0;overflow:auto}
.spotify-playlist-rows button{display:block;margin:1px 0;background:#17466933;border:1px solid #81bfe522}.spotify-panel .spotify-playlist-rows button span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.spotify-taste button{width:auto;height:auto;white-space:normal;overflow-wrap:anywhere;line-height:1.35}
/* Bounded rims: painted geometry stays within the actual SVG inner frame. */
.spotify-surface .spotify-view-tabs button{border-width:1px;box-shadow:inset 0 1px #fff,inset 0 -1px #56788a,0 0 0 2px #ecf6f8,0 0 0 3px #79939f}
.spotify-surface .spotify-view-tabs button[aria-selected=true]{box-shadow:inset 0 1px #fff,inset 0 -2px #3684aa,0 0 0 2px #e6ffff,0 0 0 3px #729cb0}
.spotify-surface .spotify-side-controls button{box-shadow:inset 0 1px 1px #fff,inset 0 -2px 2px #43627880,0 0 0 2px #ecf6f8,0 0 0 3px #79939f}
.spotify-surface .spotify-side-controls button[aria-pressed=true]{box-shadow:inset 0 1px #fff,inset 0 -2px 3px #1c83af99,0 0 0 2px #e6ffff,0 0 0 4px #729cb0,0 0 5px #61cef080}

/* Reference layout selector: finishes remain a separate setting. */
.spotify-settings .spotify-style-heading{display:flex;align-items:center;gap:5px;min-height:16px;letter-spacing:0;text-transform:none}
.spotify-style-heading select{flex:1;min-width:0;height:16px;padding:0 2px;border:1px solid #62818e;border-radius:2px;color:var(--lyric);background:#133247;font:10px Tahoma,sans-serif}
.spotify-mode-legend{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
/* Curved WMP reference 4ab0…: raised utility shoulder, rectangular aperture,
   full-width scrub, left transport bank and right volume. */
.spotify-surface.spotify-surface.spotify-reference-wmp-curved{border-radius:22px 5px 17px 23px;background:linear-gradient(135deg,#f5f7fe,#8d9dcc 14%,#d4ddf8 32%,#8799c7 75%,#e1e7ff);box-shadow:inset 0 0 0 2px #e9edff,inset 0 0 0 4px #8995b6}
.spotify-surface.spotify-reference-wmp-curved .qt-titlebar{margin-left:28%;border-radius:12px 3px 0 0;background:linear-gradient(#eff4ff,#a3b4dc)}
.spotify-reference-wmp-curved .qt-title-studs{display:none}
.spotify-reference-wmp-curved .qt-tools{border:0;background:transparent}
.spotify-surface.spotify-reference-wmp-curved .qt-movie{margin:0 7px;border:2px solid #d8e1ff;box-shadow:0 0 0 2px #667799}
.spotify-reference-wmp-curved .qt-bottom{grid-template-columns:auto minmax(24px,1fr) 24px;border-radius:0;background:linear-gradient(#f6f7ff,#a3b5e0)}
.spotify-reference-wmp-curved .qt-transport{order:-1}
.spotify-reference-wmp-curved .qt-main-play{order:-1}
.spotify-reference-wmp-curved .qt-volume{justify-self:end}
.spotify-reference-wmp-curved .qt-scrub{background:linear-gradient(#f8fbff,#c4ceeb);margin:0 5px}
/* Handheld reference 4c917…: narrow blue body, upper screen and an actual
   concentric directional control bank in its green lower housing. */
.spotify-surface.spotify-surface.spotify-reference-handheld{grid-template-rows:20px 28px minmax(0,1fr) 16px 100px;border:2px solid #667d93;border-radius:25px 25px 42% 42%/28px 28px 36px 36px;background:linear-gradient(110deg,#8da9bd,#203d88 17%,#314c9a 75%,#7997ac);box-shadow:inset 0 0 0 3px #c0d0da,inset 0 0 0 6px #26395e}
.spotify-surface.spotify-reference-handheld .qt-titlebar{margin:0 25px;border-radius:12px;background:linear-gradient(#d9e2e8,#8c9cae)}
.spotify-reference-handheld .qt-title-studs{display:none}
.spotify-reference-handheld .qt-tools{gap:1px;border:0;background:transparent}
.spotify-surface.spotify-reference-handheld .qt-movie{margin:0 14px;border:4px solid #1b294a;box-shadow:0 0 0 2px #687cab}
.spotify-reference-handheld .qt-scrub{margin:0 16px;border:0;background:#77a63f}
.spotify-reference-handheld .qt-bottom{grid-template-columns:minmax(24px,1fr) 104px minmax(24px,1fr);padding:0 14px 8px;border:0;border-radius:0 0 42% 42%;background:radial-gradient(ellipse at 50% 0%,#9cc660,#689e34 52%,#35601f 70%,#adb4af 72%,#626f77 77%,#253765 80%)}
.spotify-reference-handheld .qt-transport{height:82px;display:grid;grid-template-columns:28px 34px 28px;grid-template-rows:34px 28px;gap:2px;align-content:center;justify-content:center;border:3px solid #6f796b;border-radius:50%;background:radial-gradient(#e4e7dc,#a0aaa0 65%,#e7e9de 68%,#858d84);box-shadow:0 0 0 3px #b5c6a0,0 0 0 5px #487323}
.spotify-reference-handheld .qt-transport>button:nth-child(1){grid-area:1/1}
.spotify-reference-handheld .qt-transport>button:nth-child(2){grid-area:2/1;justify-self:end}
.spotify-reference-handheld .qt-transport>button:nth-child(3){grid-area:1/2}
.spotify-reference-handheld .qt-transport>button:nth-child(4){grid-area:2/3}
.spotify-reference-handheld .qt-transport>button:nth-child(5){grid-area:1/3}
.spotify-surface.spotify-reference-handheld[data-screen=off]{grid-template-rows:20px 18px 16px 100px}
.spotify-surface.spotify-reference-handheld[data-screen=mini]{grid-template-rows:20px 18px 100px}
.spotify-reference-handheld .qt-compact-copy{color:#e9f2ff;margin:0 10px}
/* Blue droplet reference 9c878…: asymmetric shell and inset LCD, a lower
   left transport strip and independent green-ring utility at lower right. */
.spotify-surface.spotify-surface.spotify-reference-droplet{padding:26px 20px 24px;border:2px solid #83c7ed;border-radius:55% 45% 46% 40%/33% 58% 42% 60%;background:radial-gradient(ellipse at 40% 25%,#a5e5ff,#378dcc 50%,#13559d 75%,#c0edff 78%,#568fae 81%,#e0f9ff 85%);box-shadow:inset 0 0 0 3px #e3faff,inset 0 0 0 8px #7bc1e8}
.spotify-reference-droplet .qt-title-studs{display:none}
.spotify-surface.spotify-reference-droplet .qt-titlebar{margin:0 18px;background:transparent;color:#eefaff}
.spotify-reference-droplet .qt-tools{gap:1px;border:0;background:transparent}
.spotify-surface.spotify-reference-droplet .qt-movie{border:2px solid #5aaddd;border-radius:22px 10px 16px 12px;background:#124579;box-shadow:0 0 0 2px #135690}
.spotify-reference-droplet .qt-scrub{margin:0 6px;background:#c1e5f4;border:0;border-radius:8px}
.spotify-reference-droplet .qt-bottom{grid-template-columns:auto minmax(16px,1fr) 28px;gap:2px;border:0;padding:0;background:transparent;box-shadow:none}
.spotify-reference-droplet .qt-transport{order:-1;gap:0}
.spotify-reference-droplet .qt-main-play{order:-1}
.spotify-reference-droplet .qt-bottom>button{box-shadow:0 0 0 3px #c2f6fd,0 0 0 5px #90d84b,inset 0 1px #fff}
.spotify-surface.spotify-reference-droplet[data-screen=off],.spotify-surface.spotify-reference-droplet[data-screen=mini]{padding:8px 10px;border-radius:30px}
.spotify-reference-droplet .qt-compact-copy{color:#e7f7ff}
/* QuickTime reference: straight movie aperture, brushed lower bezel,
   centered five-disc transport and a separate narrow scrub strip. */
.spotify-surface.spotify-quicktime{position:relative;display:grid;grid-template-rows:20px 28px minmax(0,1fr) 16px 36px;gap:0;padding:0;border:1px solid #737679;border-radius:5px;aspect-ratio:auto;transform:none;color:#303235;--lyric:#dcebf0;background:repeating-linear-gradient(0deg,#ffffff18 0 1px,#55555508 1px 2px),linear-gradient(110deg,#aaaeb0,#e0e1e2 43%,#b0b3b5);box-shadow:inset 0 1px #f2f2f2,inset 0 -2px #85888b;font-family:Tahoma,sans-serif}
.spotify-quicktime[data-screen=off]{grid-template-rows:20px 18px 16px 36px}
.spotify-quicktime[data-screen=mini]{grid-template-rows:20px 18px 36px}
.spotify-quicktime .qt-titlebar{display:flex;align-items:center;gap:5px;padding:0 4px;border:0;min-width:0;background:linear-gradient(#d5d6d7,#b4b7b9);box-shadow:inset 0 1px #eee}
.qt-title-studs{flex-shrink:0;color:#7e807f;font:10px/1 Tahoma,sans-serif;text-shadow:0 1px #eee}
.qt-titlebar strong{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;font:10px/16px Tahoma,sans-serif}
.spotify-quicktime button{width:24px;min-width:24px;height:24px;min-height:24px;border:1px solid #8b8e90;color:#404449;background:radial-gradient(ellipse at 40% 20%,#f1f2f2,#d1d3d5 55%,#a8adb0);box-shadow:inset 0 1px #fff,0 1px 1px #74797b;border-radius:50%}
.spotify-quicktime button svg{width:12px;height:12px}
.spotify-quicktime button[aria-pressed=true],.spotify-quicktime button[aria-selected=true]{color:#17252c;background:linear-gradient(#a4adb3,#dce1e4);box-shadow:inset 0 1px 2px #59626a}
.spotify-quicktime .qt-titlebar button{width:18px;min-width:18px;height:18px;min-height:18px;box-shadow:inset 0 1px #eee}
.qt-tools{display:flex;justify-content:center;align-items:center;gap:4px;min-width:0;border-top:1px solid #eef0f1;border-bottom:1px solid #81868a}
.qt-tools [role=tablist]{display:flex;gap:2px;border-left:1px solid #92979a;padding-left:4px}
.spotify-quicktime .qt-tools button{border-radius:3px;box-shadow:inset 0 1px #eee}
.spotify-quicktime .qt-movie{margin:0 3px;border:1px solid #55595c;border-radius:0;background:#000;box-shadow:inset 0 0 0 1px #000}
.spotify-quicktime .qt-movie::after{display:none}
.spotify-quicktime .spotify-artwork{object-fit:contain}
.qt-scrub{display:grid;grid-template-columns:30px minmax(0,1fr);align-items:center;gap:4px;padding:0 5px;color:#545b60;font:10px Tahoma,sans-serif;background:linear-gradient(#dedfe0,#c2c6c8);border-top:1px solid #f2f3f3}
.qt-bottom{display:grid;grid-template-columns:minmax(32px,1fr) auto minmax(24px,1fr);gap:4px;align-items:center;padding:0 5px 3px;border-top:1px solid #a8adaf;border-radius:0 0 35% 35%/0 0 7px 7px;box-shadow:inset 0 1px #f0f1f1}
.qt-bottom>button{justify-self:end}
.qt-volume{width:100%;max-width:60px;min-width:0}
.qt-transport{display:flex;align-items:center;gap:2px}
.spotify-surface.spotify-quicktime button.qt-main-play{width:30px;min-width:30px;height:30px;min-height:30px;color:#343a40;border:1px solid #858b8f;background:radial-gradient(ellipse at 38% 15%,#f4f5f5,#c2c7ca 65%,#969da2);box-shadow:inset 0 1px #fff,0 1px 2px #73797d}
.spotify-quicktime .spotify-range{min-width:0;width:100%;height:12px;margin:0;accent-color:#7b858c}
.qt-compact-copy{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:1px 5px;font:10px/16px Tahoma,sans-serif}
.spotify-quicktime .spotify-panel button:not(.spotify-panel-close){width:100%;height:auto;min-height:25px;border-radius:4px;background:#123951;color:var(--lyric);box-shadow:none}
.spotify-quicktime .spotify-panel .spotify-panel-close{width:20px;min-width:20px;height:20px;min-height:20px;border-radius:3px;color:var(--lyric);background:#123951;box-shadow:none}
.spotify-quicktime .spotify-audio-prompt button,.spotify-quicktime .spotify-audio-status button{width:auto;min-width:0;border-radius:3px;color:#d9f3ff;background:#123451;box-shadow:none}
/* Window/deck structure: all children use the same controller and display. */
.qt-titlebar,.qt-tools,.qt-scrub,.qt-bottom,.qt-compact-copy{grid-column:1/-1}
.qt-movie{grid-row:3}
.reference-tab-label{display:flex;align-items:center;gap:4px}
.qt-tools .reference-tab-label>span{display:none}
.reference-navigation{grid-row:3;grid-column:1;min-height:0;overflow:auto;background:linear-gradient(#4a5e95,#91a5d0);padding:3px 1px}
.reference-navigation [role=tablist]{display:flex;flex-direction:column;gap:3px}
.spotify-surface .reference-navigation button{width:100%;height:28px;min-width:24px;border-radius:0;box-shadow:none;background:transparent;color:#f4f8ff;text-align:left}
.spotify-surface .reference-navigation button[aria-selected=true]{background:#233e81;color:#fff;box-shadow:inset 0 1px #a5b9ed,inset 0 -1px #1a2e5b}
.spotify-surface[data-wide=false] .reference-navigation .reference-tab-label>span{display:none}
.reference-playlist-side{grid-row:3;min-height:0;overflow:hidden;position:relative;background:#0b1727;border-left:2px solid #899cb1;color:#dcebf0}
.reference-playlist-side .spotify-panel{height:100%;box-sizing:border-box}
.reference-side-message{padding:10px;font:11px/1.4 Tahoma,sans-serif}
.reference-deck-info{grid-row:3;grid-column:2;min-height:0;display:flex;flex-direction:column;justify-content:space-evenly;gap:2px;margin:2px 4px 2px 0;padding:5px;border:2px ridge #9296b1;border-radius:6px;background:#07162c;color:#54c5ff;font:10px/1.2 Tahoma,sans-serif;overflow:auto}
.reference-deck-info strong{color:#76d0ff;font:14px/1.2 monospace}
/* Classic desktop application: blue titlebar, left navigation, media center,
   independent real playlist-target column at desktop widths. */
.spotify-surface.spotify-reference-wmp-classic{border:3px solid #245bd3;border-radius:4px;background:#c3cee8;box-shadow:inset 0 0 0 1px #fff}
.spotify-reference-wmp-classic .qt-titlebar{background:linear-gradient(#4b96fc,#1455cc 50%,#2467d5);color:white}
.spotify-reference-wmp-classic .qt-title-studs,.spotify-reference-wmp-glass .qt-title-studs,.spotify-reference-wmp-library .qt-title-studs,.spotify-reference-dark-playlist .qt-title-studs{display:none}
.spotify-reference-wmp-classic .qt-tools{justify-content:flex-start;padding-left:5px;background:linear-gradient(#d5deed,#a3b3d3)}
.spotify-reference-wmp-classic .qt-movie{margin:0;border:2px inset #aec0df}
.spotify-reference-wmp-classic .qt-bottom{grid-template-columns:auto minmax(24px,1fr) 24px;background:linear-gradient(#bbc9ec,#738bbf);border-radius:0}
.spotify-reference-wmp-classic .qt-transport,.spotify-reference-wmp-classic .qt-main-play{order:-1}
.spotify-reference-wmp-classic .qt-volume{justify-self:end}
/* Pale/glassy tabs: broad top navigation, full rectangular display, continuous
   bottom rail. No fake Rip/Burn/Sync operations are exposed. */
.spotify-surface.spotify-reference-wmp-glass{border:2px solid #87a5bd;border-radius:7px;background:linear-gradient(#d8e9f6,#9cb6d5);box-shadow:inset 0 1px #fff}
.spotify-reference-wmp-glass .qt-titlebar{background:linear-gradient(#e5f2fc,#b9d1e8);color:#2d506d}
.spotify-reference-wmp-glass .qt-tools{justify-content:flex-start;padding-left:5px;gap:5px;background:linear-gradient(#f5faff,#99b9dd);border-bottom:1px solid #658daf}
.spotify-reference-wmp-glass .qt-tools button{border-radius:4px 4px 0 0;background:linear-gradient(#e7f4ff,#a7cae8)}
.spotify-reference-wmp-glass[data-wide=true] .qt-tools [role=tab] {width:76px}
.spotify-reference-wmp-glass[data-wide=true] .qt-tools .reference-tab-label>span{display:inline}
.spotify-reference-wmp-glass .qt-movie{margin:0;border:1px solid #6b90b2}
.spotify-reference-wmp-glass .qt-bottom{grid-template-columns:auto minmax(24px,1fr) 24px;border-radius:0;background:linear-gradient(#e9f7ff,#b4cfeb)}
.spotify-reference-wmp-glass .qt-transport,.spotify-reference-wmp-glass .qt-main-play{order:-1}
.spotify-reference-wmp-glass .qt-volume{justify-self:end}
/* jetAudio: separate black display and blue numeric counter compartments,
   raised utility strip, long scrub and a lower circular transport bank. */
.spotify-surface.spotify-reference-jetaudio{padding:4px;border:2px outset #bfc0d1;border-radius:3px;background:linear-gradient(100deg,#a9aabf,#d1d2df 45%,#9798ae);box-shadow:inset 0 0 0 2px #c5c7d7}
.spotify-reference-jetaudio .qt-titlebar{background:#b8bacf;color:#36394e}
.spotify-reference-jetaudio .qt-title-studs{display:none}
.spotify-reference-jetaudio .qt-tools{margin:1px 3px;border:2px groove #dadce7;border-radius:5px;background:#575a6d;gap:2px}
.spotify-reference-jetaudio .qt-tools button{height:22px;min-height:22px;border-radius:2px;background:linear-gradient(#82899b,#484e63);color:#eef4ff;box-shadow:none}
.spotify-reference-jetaudio .qt-movie{margin:2px 3px;border:3px ridge #9296b1;border-radius:6px;background:#030d1e}
.spotify-reference-jetaudio .qt-scrub{border:1px inset #dedee8;border-radius:6px;background:#777e95;margin:2px 4px}
.spotify-reference-jetaudio .qt-bottom{border:0;border-radius:0;box-shadow:none;background:transparent}
/* Organic source: three separately framed sections, speaker wells and a
   tapered central green housing. Original illustrated face art is NOT copied;
   analysis/view controls do not pretend to be a Spotify playback equalizer. */
.spotify-surface.spotify-reference-organic{border:2px solid #56642c;border-radius:28px 28px 18px 18px;background:linear-gradient(90deg,#4d7029,#99d13e 22%,#79bb26 78%,#4d7029);box-shadow:inset 0 0 0 3px #a4b585}
.spotify-reference-organic .qt-titlebar{margin:0 25%;background:#a4d448;border-radius:16px 16px 0 0;color:#243f13}
.spotify-reference-organic .qt-title-studs{display:none}
.spotify-reference-organic .qt-tools{background:transparent;border:0}
.spotify-reference-organic .qt-movie{border:4px ridge #72a523;border-radius:28px 28px 18px 18px;margin:0 5px}
.spotify-reference-organic .reference-navigation{padding-top:30px;background:radial-gradient(circle at 50% 14px,#152613 5px,#bac7ad 6px,#42512d 10px,#8cab5b 12px,transparent 13px),linear-gradient(#5d822b,#354f1e);border:3px ridge #9ab46c;border-radius:20px 3px 3px 20px}
.spotify-reference-organic .reference-navigation button[aria-selected=true]{background:#79a640}
.spotify-reference-organic .reference-playlist-side{border:3px ridge #9ab46c;border-radius:3px 20px 20px 3px;background:#31521c}
.spotify-reference-organic .qt-scrub{margin:0 12%;background:#89b837;border:0}
.spotify-reference-organic .qt-bottom{background:linear-gradient(#93c532,#497622);border-radius:0 0 45% 45%;border:0;box-shadow:inset 0 -4px #284d1d}
/* Dark visualization window: black media body, independently framed playlist
   targets at desktop width and a compact floating bottom transport. */
.spotify-surface.spotify-reference-dark-playlist{border:2px solid #627789;border-radius:6px;background:#020508;box-shadow:inset 0 0 0 1px #b5c4cd}
.spotify-reference-dark-playlist .qt-titlebar{background:linear-gradient(#a4b4bd,#627888);color:#172631}
.spotify-reference-dark-playlist .qt-tools{background:#0b1015;border:0}
.spotify-reference-dark-playlist .qt-tools button{background:#1c2b38;color:#b9cbd9;box-shadow:none;border-color:#435868;border-radius:2px}
.spotify-reference-dark-playlist .qt-movie{margin:0;border:0;background:#000}
.spotify-reference-dark-playlist .qt-scrub{background:#0b1119;color:#a5c5de;border:0}
.spotify-reference-dark-playlist .qt-bottom{margin:1px auto 4px;width:calc(100% - 12px);max-width:310px;border:1px solid #5b7089;border-radius:18px;background:linear-gradient(#344d65,#182838);box-shadow:none}
/* Library/navigation geometry: light navigation and a real current-track tile;
   real search results use a grid. This is not a fabricated saved-album library. */
.spotify-surface.spotify-reference-wmp-library{border:1px solid #6089aa;border-radius:2px;background:#e4eff9;box-shadow:none}
.spotify-reference-wmp-library .qt-titlebar{background:#0873c6;color:#fff}
.spotify-reference-wmp-library .qt-tools{justify-content:flex-start;padding-left:5px;background:#edf5fc;border-bottom:1px solid #a9c1d8}
.spotify-reference-wmp-library .qt-tools button{border:0;border-radius:2px;background:#dfebf6;box-shadow:none;color:#345877}
.spotify-reference-wmp-library .reference-navigation{background:#dbe9f6;border-right:1px solid #a7bfd6}
.spotify-reference-wmp-library .reference-navigation button{color:#35536e}
.spotify-reference-wmp-library .reference-navigation button[aria-selected=true]{background:#b7d6f0;color:#213c53;box-shadow:inset 0 0 0 1px #86b6d9}
.spotify-reference-wmp-library .qt-movie{margin:0;border:0;background:#0b263b}
.spotify-reference-wmp-library .qt-bottom{border-radius:0;background:#e4eff9;border-top:1px solid #a8bfd3}
.reference-current-grid{box-sizing:border-box;width:100%;overflow:auto;display:grid;align-content:start;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;padding:10px;background:#eaf3fb;color:#35506a;font:11px/1.4 Tahoma,sans-serif}
.reference-current-grid article{display:flex;flex-direction:column;gap:2px;min-width:0;max-width:180px}
.reference-current-grid article>strong,.reference-current-grid article>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.reference-current-grid p{grid-column:1/-1;margin:0;font-size:10px}
.reference-current-art{display:flex;height:90px;border:1px solid #a7bed3;background:#d0dfec;border-radius:2px;overflow:hidden}
.spotify-reference-wmp-library .spotify-search-results{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;background:#eaf3fb}
.spotify-surface.spotify-reference-wmp-library .spotify-search-results button{display:flex;flex-direction:column;min-height:100px;background:#eaf3fb;color:#35506a;border:1px solid #a7bed3}
.spotify-reference-wmp-library .spotify-search-results img{width:64px;height:64px;object-fit:contain}
.spotify-quicktime .spotify-settings legend{font-size:10px;line-height:11px}
.spotify-quicktime .spotify-panel .spotify-playlist-track{font-size:10px;line-height:12px}
/* Keep physical type readable inside the scaled silver shell. Compact text
   rows retain their accessible group names without wasting LCD height on
   repeated visible legends. Never mistake containment for legibility. */
.spotify-surface[data-style=silver] .spotify-settings{padding:calc(2px / var(--player-scale)) calc(4px / var(--player-scale));gap:calc(1px / var(--player-scale));font-size:calc(10px / var(--player-scale))}
.spotify-surface[data-style=silver] .spotify-settings :is(header,legend,label,span,a,select){font-size:calc(10px / var(--player-scale));line-height:calc(12px / var(--player-scale))}
.spotify-surface[data-style=silver] .spotify-settings legend{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.spotify-surface[data-style=silver] .spotify-settings fieldset{flex-shrink:0}
.spotify-surface[data-style=silver] .spotify-settings .spotify-skins{gap:calc(3px / var(--player-scale))}
.spotify-surface[data-style=silver] .spotify-settings .spotify-skins label{height:calc(12px / var(--player-scale))}
.spotify-surface[data-style=silver] .spotify-settings .spotify-style-heading,.spotify-surface[data-style=silver] .spotify-style-heading select{height:calc(16px / var(--player-scale));min-height:calc(16px / var(--player-scale))}
.spotify-surface[data-style=silver] .spotify-settings-account{min-height:calc(12px / var(--player-scale))}
.spotify-surface[data-style=silver] .spotify-title{font-size:max(12px,calc(10px / var(--player-scale)));line-height:max(16px,calc(11px / var(--player-scale)))}
.spotify-surface[data-style=silver] :is(.spotify-meta,.spotify-time){font-size:calc(10px / var(--player-scale));line-height:max(13px,calc(11px / var(--player-scale)))}
.spotify-surface[data-style=silver] .spotify-mini-lcd{height:max(34px,calc(27px / var(--player-scale)))}
.spotify-surface[data-style=silver] .spotify-mini-lcd .spotify-title{font-size:calc(10px / var(--player-scale));line-height:max(14px,calc(11px / var(--player-scale)))}
.spotify-surface[data-style=silver] .spotify-mini-lcd :is(.spotify-meta,.spotify-time){line-height:calc(11px / var(--player-scale))}
.spotify-surface[data-style=silver][data-screen=mini] .spotify-transport{top:max(38px,calc(32px / var(--player-scale)))}
.spotify-surface[data-style=silver] .spotify-panel :is(input,button,p,span,h2){font-size:max(10px,calc(10px / var(--player-scale)))}
`

function FactoryLoader({ label = 'Loading Spotify' }) {
  return jsx('span', { role: 'status', 'aria-label': label, className: 'spotify-loader', children: [0, 1, 2].map(i => jsx('i', { 'aria-hidden': true }, i)) })
}

function signalAllowed(enabled, visible, playing, reducedMotion) {
  return enabled && visible && playing && !reducedMotion
}

function motionReduced() {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true || hostPreferences?.get?.()?.reducedMotion === true
}

function useReducedMotion() {
  const [reduced,setReduced]=useState(motionReduced)
  useEffect(()=>{
    const media=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)'),change=()=>setReduced(motionReduced())
    media?.addEventListener('change',change)
    const unsubscribe=hostPreferences?.subscribe?.(change)
    change()
    return ()=>{media?.removeEventListener('change',change);if(typeof unsubscribe==='function')unsubscribe()}
  },[])
  return reduced
}

function MetalArtifact({ enabled, visible, playing }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const [available, setAvailable] = useState(true)
  const active = signalAllowed(enabled, visible, playing, reduced) && available
  useEffect(() => {
    if (!active) return undefined
    const canvas = ref.current
    const library = getMetalFxLibrary()
    let instance
    let observer
    try {
      const { width, height } = canvas.getBoundingClientRect()
      instance = library.createInstance({ hostCanvas: canvas, cssWidth: width, cssHeight: height,
        cornerRadius: Math.min(width, height) / 2, kind: 'circle', ringCssPx: 2, opacityMul: 0.88 })
      library.setSharedPreset('silver', 'dark')
      observer = new ResizeObserver(() => {
        const { width, height } = canvas.getBoundingClientRect()
        library.updateInstance(instance, { cssWidth: width, cssHeight: height, cornerRadius: Math.min(width, height) / 2 })
      })
      observer.observe(canvas)
    } catch {
      // Optional decoration must never take down the playback controls.
      if (instance) library.destroyInstance(instance)
      else library.dispose()
      setAvailable(false)
      return undefined
    }
    return () => { observer.disconnect(); library.destroyInstance(instance) }
  }, [active])
  return active ? jsx('span', { className: 'spotify-metal', 'aria-hidden': true,
    'data-artifact': 'metal-fx@1.0.4', children: jsx('canvas', { ref }) }) : null
}

function TastePalette({track}) {
  const [name,setName]=useState('My taste palette')
  const [brief,setBrief]=useState('')
  const [draft,setDraft]=useState(track.spotifyUrl || '')
  const [busy,setBusy]=useState(false)
  const [notice,setNotice]=useState('Private by default. One URI or Artist | Title per line.')
  const [result,setResult]=useState(null)
  const [prompt,setPrompt]=useState('')
  const [taste,setTaste]=useState([])
  const request=useRef(null)
  const lock=useRef(false)
  const parse=()=>{
    const lines=draft.split(/\r?\n/).filter(line=>line.trim())
    if(!lines.length)throw new Error('Add tracks first.')
    if(lines.every(line=>/^spotify:track:[A-Za-z0-9]{22}$/.test(line)))return {tracks:lines}
    if(lines.some(line=>line.startsWith('spotify:')))throw new Error('Use exact Spotify URIs, without spaces; do not mix URIs and named songs.')
    const songs=lines.map(line=>{const parts=line.split('|');if(parts.length!==2||!parts.every(p=>p.trim()))throw new Error('Use Artist | Title, one song per line.');return {artist:parts[0].trim(),title:parts[1].trim()}})
    return {songs}
  }
  const act=async(action,saved)=>{
    if(lock.current)return
    lock.current=true;setBusy(true);setNotice('Checking Spotify…')
    try{
      if(!pluginRest)throw new Error('Spotify backend is unavailable.')
      let body={action}
      if(action!=='taste')body={...body,...parse()}
      if(action==='create'){
        if(!name.trim())throw new Error('Enter a playlist name.')
        const key=JSON.stringify({name,brief,...body})
        if(request.current?.key!==key)request.current={key,id:globalThis.crypto.randomUUID()}
        body={...body,name,description:brief,public:false,requestId:request.current.id}
      }
      if(action==='set-liked'){
        if(!body.tracks)throw new Error('Bulk likes need exact track URIs. Create the named-song playlist first to resolve them.')
        body.saved=saved
      }
      const response=await pluginRest('/curate',{method:'POST',body,timeoutMs:120000})
      if(response.playlistId)setResult(response)
      if(!response.ok || (action!=='taste'&&!response.verified))throw new Error(response.error||'Spotify could not verify this operation. Do not create another copy.')
      if(action==='create'){
        setDraft(response.uris.join('\n'))
        // Preserve the creation key across the resolved-URI representation.
        request.current.key=JSON.stringify({name,brief,action:'create',tracks:response.uris})
        setNotice(`Verified · ${response.trackCount} track${response.trackCount===1?'':'s'} saved`)
      }else if(action==='set-liked'){
        $libraryRevision.set($libraryRevision.get()+1)
        setNotice(`Verified · ${response.trackCount} liked state${response.trackCount===1?'':'s'} updated`)
      }else{
        setTaste(response.tracks);setNotice(`Taste sample · ${response.sampleCount} recent liked songs`)
      }
    }catch(error){setNotice(error instanceof Error?error.message:'Curation failed.')}
    finally{lock.current=false;setBusy(false)}
  }
  const makePrompt=()=>setPrompt(`Curate a private Spotify playlist named ${JSON.stringify(name)}. Taste brief: ${brief || 'Use the seed tracks below'}. Seeds: ${draft}. Recent liked-song sample: ${JSON.stringify(taste)}. Choose up to 20 songs and call spotify_player_curate once with action=create, name, public=false, a new requestId, and songs=[{title,artist}]. Do not invent Spotify IDs. Report the verified playlist URL; if resolution fails, show the unmatched songs without substituting them. Do not update Liked Songs unless I ask.`)
  const field=(label,value,change,extra={})=>jsx('input',{'aria-label':label,placeholder:label,value,onChange:e=>change(e.target.value),disabled:busy,...extra})
  const button=(label,click,caption=label)=>jsx(Tip,{label,children:jsx('button',{'aria-label':label,type:'button',disabled:busy,'aria-busy':busy,onClick:click,children:caption})})
  return jsxs('section',{className:'spotify-taste','aria-label':'Taste palette',children:[
    jsx('strong',{children:'Taste palette'}),
    field('Playlist name',name,setName,{maxLength:100}),
    field('Taste brief',brief,setBrief,{maxLength:300}),
    jsx('textarea',{'aria-label':prompt?'Curation prompt':'Playlist tracks',value:prompt||draft,readOnly:!!prompt,disabled:busy,placeholder:'Artist | Title, one per line',onChange:e=>setDraft(e.target.value),onFocus:e=>{if(prompt)e.target.select()}}),
    jsxs('div',{className:'spotify-taste-actions',children:prompt?[button('Back to tracks',()=>setPrompt('')),button('Select prompt',()=>{const node=document.querySelector('.spotify-taste textarea');node?.focus();node?.select()})]:[button('Create private playlist',()=>void act('create'),'Create private'),button('LLM prompt',makePrompt)]}),
    !prompt?jsxs('div',{className:'spotify-taste-actions',children:[button('Like draft tracks',()=>void act('set-liked',true),'Like tracks'),button('Remove draft likes',()=>void act('set-liked',false),'Unlike tracks'),button('Read taste',()=>void act('taste'))]}):null,
    jsx('p',{role:'status','aria-live':'polite',children:notice}),
    result?.url?jsx('a',{href:result.url,target:'_blank',rel:'noopener noreferrer',onClick:e=>{e.preventDefault();void openExternal(result.url)},children:result.verified?'Open playlist':'Inspect partial playlist'}):null
  ]})
}

// Frame-driven renderers: no clock, random generator, fabricated FFT or beat.
// References and implementation boundaries are documented in docs/AUDIO-VISUALIZERS.md.
function drawAudioFrame(ctx, w, h, style, frame) {
  const active = frame?.state === 'streaming'
  const bands = active ? frame.bands : Array(32).fill(0)
  const wave = active ? frame.wave : Array(64).fill(0)
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#020916';ctx.fillRect(0,0,w,h)
  ctx.lineWidth=1;ctx.shadowBlur=0;ctx.globalAlpha=1
  if(style === 'alchemy') {
    ctx.fillStyle='#001600';ctx.fillRect(0,0,w,h)
    if(!active)return
    const radius=Math.min(w,h)*Math.min(.48,.08+frame.rms*2)
    const glow=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,radius*2)
    glow.addColorStop(0,'#caff99');glow.addColorStop(.2,'#71d42b99');glow.addColorStop(1,'#18490000')
    ctx.fillStyle=glow;ctx.fillRect(0,0,w,h)
    for(let ray=0;ray<24;ray++) {
      const energy=bands[ray], angle=ray/24*Math.PI*2
      ctx.beginPath()
      for(let step=0;step<=24;step++) {
        const distance=step/24*Math.max(w,h)*(.15+energy*.48)
        const bend=wave[(step*2+ray)%64]*.7
        const x=w/2+Math.cos(angle+bend)*distance,y=h/2+Math.sin(angle+bend)*distance
        if(step)ctx.lineTo(x,y);else ctx.moveTo(x,y)
      }
      ctx.strokeStyle=`rgba(181,255,116,${energy*.7})`;ctx.shadowColor='#92ff4c';ctx.shadowBlur=4;ctx.stroke()
    }
  } else {
    ctx.strokeStyle='#1e435644';ctx.beginPath()
    for(let row=1;row<5;row++){ctx.moveTo(0,h*row/5);ctx.lineTo(w,h*row/5)}ctx.stroke()
    if(style === 'scope') {
      ctx.beginPath()
      for(let i=0;i<64;i++){const x=i/63*w,y=h/2-wave[i]*h*.46;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y)}
      ctx.strokeStyle=active?'#91eaff':'#325269';ctx.shadowColor='#45c4ff';ctx.shadowBlur=active?5:0;ctx.lineWidth=1.3;ctx.stroke()
    } else {
      const gap=Math.max(1,w/160),bar=w/32
      for(let i=0;i<32;i++) {
        const segments=Math.round(bands[i]*18)
        for(let j=0;j<18;j++) {
          ctx.fillStyle=j<segments?(j>14?'#b8f8ff':j>9?'#59cefa':'#398bd2'):'#10283b'
          ctx.fillRect(i*bar+gap/2,h-8-(j+1)*(h-16)/18,bar-gap,Math.max(1,(h-16)/18-1))
        }
      }
    }
  }
  ctx.shadowBlur=0;ctx.globalAlpha=1
}

function XPVisualizer({playing, visible, style = 'spectrum'}) {
  const ref=useRef(null), frameRef=useRef(null), drawRef=useRef(()=>{})
  const [enabled,setEnabled]=useState(false), [retry,setRetry]=useState(0)
  const [frame,setFrame]=useState({state:'off'})
  const reduced=useReducedMotion()
  frameRef.current=frame
  useEffect(()=>{
    let cancelled=false, lease='',timer
    const stop=()=>{if(lease&&pluginRest)void pluginRest('/visualizer/stop',{method:'POST',body:{lease}}).catch(()=>{})}
    if(!signalAllowed(enabled,visible,playing,reduced)){setFrame({state:'off'});return undefined}
    setFrame({state:'starting'})
    const poll=async()=>{
      try {
        const next=await pluginRest('/visualizer/frame?lease='+encodeURIComponent(lease),{method:'GET',timeoutMs:4000})
        if(cancelled)return
        setFrame(previous=>next.sequence&&next.sequence===previous.sequence&&next.state===previous.state?previous:next)
        if(['error','permission-required','unavailable','off'].includes(next.state)){stop();return}
        // At most one in-flight request, 12Hz maximum. No RAF or hidden timers.
        timer=setTimeout(poll,1000/12)
      } catch {if(!cancelled){setFrame({state:'error',message:'Audio analysis disconnected. Retry to reconnect.'});stop()}}
    }
    void (async()=>{
      try {
        if(!pluginRest)throw new Error('Spotify audio backend is unavailable.')
        const response=await pluginRest('/visualizer/start',{method:'POST',body:{consent:true},timeoutMs:5000})
        lease=response.lease||''
        if(cancelled){stop();return}
        setFrame(response)
        if(lease)void poll()
      } catch(error){if(!cancelled)setFrame({state:'error',message:error.message||'Could not enable Spotify audio.'})}
    })()
    return ()=>{cancelled=true;clearTimeout(timer);stop()}
  },[enabled,visible,playing,reduced,retry])
  useEffect(()=>{
    const canvas=ref.current,ctx=canvas?.getContext('2d');if(!ctx)return undefined
    const draw=()=>drawAudioFrame(ctx,canvas.width,canvas.height,style,frameRef.current)
    drawRef.current=draw
    const resize=()=>{
      const box=canvas.getBoundingClientRect(),dpr=Math.min(2,globalThis.devicePixelRatio||1)
      canvas.width=Math.max(1,Math.min(640,Math.round(box.width*dpr)))
      canvas.height=Math.max(1,Math.min(400,Math.round(box.height*dpr)));draw()
    }
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize()
    return ()=>{observer.disconnect();drawRef.current=()=>{}}
  },[style])
  useEffect(()=>{drawRef.current()},[frame])
  const live=['streaming','silent'].includes(frame.state)
  const message=reduced?'Reduced motion is enabled.':!playing?'Play Spotify to enable sound analysis.':frame.message||'Analyze Spotify app audio. No microphone or recordings.'
  return jsxs('div',{className:'spotify-visualizer','aria-label':'Spotify audio visualizer','data-audio-state':frame.state,children:[
    jsx('canvas',{ref,'aria-hidden':true}),
    live?jsxs('div',{className:'spotify-audio-status',children:[jsx('span',{children:frame.state==='silent'?'NO AUDIO':'SPOTIFY AUDIO'}),jsx('button',{type:'button','aria-label':'Stop audio analysis',title:'Stop audio analysis',onClick:()=>setEnabled(false),children:'Stop'})]}):
    jsxs('div',{className:'spotify-audio-prompt',children:[
      jsx('strong',{children:frame.state==='starting'?'Starting audio…':'Sound visualizer'}),
      jsx('p',{role:'status',children:message}),
      jsx('button',{type:'button',disabled:!playing||reduced||frame.state==='starting','aria-label':'Enable Spotify audio analysis',title:'Enable Spotify audio analysis',onClick:()=>{setEnabled(true);setRetry(x=>x+1)},children:frame.state==='off'?'Enable audio':'Retry audio'})
    ]})
  ]})
}

function NativeRange({ label, value, max, disabled, onCommit }) {
  const [draft, setDraft] = useState(value)
  const editing = useRef(false)
  const sent = useRef(value)
  useEffect(() => { if (!editing.current) { setDraft(value); sent.current = value } }, [value])
  const confirmed = useRef(value)
  confirmed.current = value
  const commit = async event => {
    editing.current = false
    const next = Number(event.currentTarget.value)
    if (next === sent.current) return
    sent.current = next
    const accepted = await onCommit(String(next))
    if (accepted === false) { sent.current = confirmed.current; setDraft(confirmed.current) }
  }
  return jsx('input', { type: 'range', className: 'spotify-range', 'aria-label': label, title: label === 'Spotify volume' ? `Volume: ${Math.round(draft)}%` : `Seek: ${formatTime(draft)} of ${formatTime(max)}`, 'aria-valuetext': label === 'Spotify volume' ? `${Math.round(draft)} percent` : `${formatTime(draft)} of ${formatTime(max)}`,
    min: 0, max: Math.max(1, max), step: 1, value: Math.min(draft, max), disabled,
    style: { '--range-fill': `${Math.max(0, Math.min(100, draft / Math.max(1, max) * 100))}%` },
    onChange: event => { editing.current = true; setDraft(Number(event.target.value)) },
    onPointerUp: commit, onBlur: commit,
    onPointerCancel: () => { editing.current=false; setDraft(confirmed.current) },
    onKeyUp: event => { if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(event.key)) commit(event) }
  })
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0))
  const minutes = Math.floor(safeSeconds / 60)
  return `${minutes}:${String(safeSeconds % 60).padStart(2, '0')}`
}

function lrcTimestampSeconds(minutes, seconds, fraction = '') {
  const fractionSeconds = fraction ? Number(fraction.padEnd(3, '0').slice(0, 3)) / 1000 : 0
  return Number(minutes) * 60 + Number(seconds) + fractionSeconds
}

function parseSyncedLyrics(rawLyrics, durationSeconds) {
  const parsed = []
  const timestampPattern = /\[(\d{1,3}):([0-5]\d)(?:[.:](\d{1,3}))?\]/g

  String(rawLyrics || '').split(/\r?\n/).forEach(sourceLine => {
    const timestamps = [...sourceLine.matchAll(timestampPattern)]
    if (!timestamps.length) return
    const finalTimestamp = timestamps[timestamps.length - 1]
    const text = sourceLine.slice((finalTimestamp.index || 0) + finalTimestamp[0].length).trim()
    if (!text) return

    timestamps.forEach(timestamp => {
      parsed.push({
        startSeconds: lrcTimestampSeconds(timestamp[1], timestamp[2], timestamp[3]),
        text
      })
    })
  })

  parsed.sort((left, right) => left.startSeconds - right.startSeconds)
  return parsed
    .filter((line, index) => index === 0 || line.startSeconds !== parsed[index - 1].startSeconds || line.text !== parsed[index - 1].text)
    .map((line, index, lines) => ({
      ...line,
      endSeconds: lines[index + 1]?.startSeconds || Math.max(line.startSeconds + 4, Number(durationSeconds) || 0),
      words: line.text.match(/\S+\s*/g) || [line.text]
    }))
}

function activeLyricPosition(lines, playbackSeconds) {
  let lineIndex = -1
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].startSeconds > playbackSeconds) break
    lineIndex = index
  }
  if (lineIndex < 0) return { lineIndex: -1, wordIndex: -1 }

  const line = lines[lineIndex]
  const lineDuration = Math.max(0.25, line.endSeconds - line.startSeconds)
  const lineProgress = Math.max(0, Math.min(0.999, (playbackSeconds - line.startSeconds) / lineDuration))
  return {
    lineIndex,
    wordIndex: Math.min(line.words.length - 1, Math.floor(lineProgress * line.words.length))
  }
}

function SyncedLyrics({ durationSeconds, isPlaying, plainLyrics, positionSeconds, syncedLyrics }) {
  const lines = useMemo(() => parseSyncedLyrics(syncedLyrics, durationSeconds), [syncedLyrics, durationSeconds])
  const scrollerRef = useRef(null)
  const [following, setFollowing] = useState(true)
  const lineRefs = useRef([])
  const activeRef = useRef({ lineIndex: -1, wordIndex: -1 })
  const [active, setActive] = useState(activeRef.current)

  useEffect(() => {
    let timer = 0
    const anchoredPosition = Math.max(0, Number(positionSeconds) || 0)
    const anchoredAt = globalThis.performance?.now?.() || Date.now()

    const update = now => {
      const elapsed = isPlaying ? Math.max(0, now - anchoredAt) / 1000 : 0
      const playback = Math.min(Number(durationSeconds) || Infinity, anchoredPosition + elapsed)
      const next = activeLyricPosition(lines, playback)
      const current = activeRef.current
      if (next.lineIndex !== current.lineIndex || next.wordIndex !== current.wordIndex) {
        activeRef.current = next
        setActive(next)
      }
      if (isPlaying && lines.length) timer = globalThis.setTimeout(() => update(performance.now()), 250)
    }

    update(anchoredAt)
    return () => {
      globalThis.clearTimeout(timer)
    }
  }, [durationSeconds, isPlaying, lines, positionSeconds])

  useEffect(() => {
    const scroller = scrollerRef.current
    const activeLine = lineRefs.current[active.lineIndex]
    if (!scroller || !activeLine || !following) return
    const reduceMotion = motionReduced()
    const top = Math.max(0, activeLine.offsetTop - (scroller.clientHeight - activeLine.offsetHeight) / 2)
    scroller.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [active.lineIndex, following])

  if (!lines.length) {
    return jsx('div', {
      className: 'spotify-lyrics-message',
      children: plainLyrics
    })
  }

  return jsxs('div', {className:'spotify-lyrics-shell',children:[jsx('div', {
    'aria-label': 'Synced lyrics', tabIndex:0, onWheel:()=>setFollowing(false), onTouchStart:()=>setFollowing(false), onKeyDown:event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(event.key))setFollowing(false)},
    className: 'spotify-lyrics',
    ref: scrollerRef,
    children: lines.map((line, lineIndex) => {
      const isActiveLine = lineIndex === active.lineIndex
      return jsx('div', {
        className: 'py-1',
        'data-active': isActiveLine,
        'aria-current': isActiveLine ? 'true' : undefined,
        ref: element => { lineRefs.current[lineIndex] = element },
        style: {
          color: 'var(--lyric)',
          opacity: isActiveLine ? 1 : 0.38,
          transition: 'opacity 220ms ease'
        },
        children: line.words.map((word, wordIndex) => {
          const isActiveWord = isActiveLine && wordIndex === active.wordIndex
          return jsx('span', {
            style: {
              color: isActiveWord ? 'var(--lyric-active)' : 'var(--lyric)',
              fontWeight: isActiveWord ? 500 : 400,
              opacity: isActiveWord ? 1 : isActiveLine ? 0.62 : 1,
              transition: 'color 180ms ease, opacity 180ms ease, font-weight 180ms ease'
            },
            children: word
          }, `${lineIndex}-${wordIndex}`)
        })
      }, `${line.startSeconds}-${lineIndex}`)
    })
  }), !following && jsx('button',{className:'spotify-follow',type:'button','aria-label':'Follow current lyric',title:'Follow current lyric',onClick:()=>setFollowing(true),children:'Follow current lyric'})]})
}

function nextTimelinePosition(player) {
  const position = Math.max(0, Number(player?.positionSeconds) || 0)
  if (player?.state !== 'playing') return position
  const duration = Math.max(0, Number(player?.durationMs) || 0) / 1000
  return Math.min(duration || Infinity, Math.floor(position) + 1)
}

function mergePlayerSnapshot(current, snapshot) {
  if (
    current?.state !== 'playing' ||
    snapshot?.state !== 'playing' ||
    !current.spotifyUrl ||
    current.spotifyUrl !== snapshot.spotifyUrl
  ) return snapshot

  const currentPosition = Math.max(0, Number(current.positionSeconds) || 0)
  const snapshotPosition = Math.max(0, Number(snapshot.positionSeconds) || 0)
  const drift = snapshotPosition - currentPosition
  if (Math.abs(drift) > 2) return snapshot
  const nextPosition = drift < 0
    ? currentPosition
    : Math.min(snapshotPosition, Math.floor(currentPosition) + 1)
  return { ...snapshot, positionSeconds: nextPosition }
}

// Measure the content box, not the outer pane: borders and fractional host zoom
// must never push even a few pixels of the shell out of frame. 234px+ recommended.
function retroPlayerScale(viewportWidth) {
  const width = Number(viewportWidth)
  return Math.min(1, (Number.isFinite(width) && width > 0 ? width : 320) / 320)
}

function playerPreferences(value = {}) {
  value = value && typeof value === 'object' ? value : {}
  return {style: PLAYER_STYLES.some(style=>style.id===value.style) ? value.style : 'silver',
    mode: ['on', 'off', 'mini'].includes(value.mode) ? value.mode : 'on',
    skin: ['chrome', 'ice', 'graphite'].includes(value.skin) ? value.skin : 'chrome',
    view: ['artwork', 'visualizer', 'lyrics', 'curate'].includes(value.view) ? value.view : 'artwork',
    visualizer: ['spectrum', 'scope', 'alchemy'].includes(value.visualizer) ? value.visualizer : 'spectrum'}
}

// Consistent 24-unit vector marks: no font-dependent symbols on hardware controls.
function playerIcon(name, filled = false) {
  const paths = {
    previous: 'M5 5v14 M19 5L8 12l11 7Z',
    next: 'M19 5v14 M5 5l11 7-11 7Z',
    rewind: 'M11 5L2 12l9 7Z M22 5l-9 7 9 7Z',
    forward: 'M2 5l9 7-9 7Z M13 5l9 7-9 7Z',
    search: 'M10.5 3.5a7 7 0 1 0 0 14a7 7 0 0 0 0-14 M16 16l5 5',
    heart: 'M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z',
    playlist: 'M3 5h14 M3 10h14 M3 15h7 M17 13v8 M13 17h8',
    taste: 'M9 17V5l11-2v12 M9 9l11-2 M9 17a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3 M20 15a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3',
    screen: 'M5 3h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z M12 18v3 M8 21h8',
    settings: 'M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8 M10 2h4l.6 3 2 .9 2.7-1.1 2 3.4-2.2 2 .2 2.2 2.2 1.9-2 3.5-2.9-1-1.8 1-.8 3.2h-4l-.7-3.1-1.9-1-2.8 1.1-2-3.5 2.2-2-.1-2.2-2.2-2 2-3.4 2.8 1 1.9-1Z',
    artwork: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z M8.5 9.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3 M21 15l-4-4-7 7',
    visualizer: 'M4 9v6M8 4v16M12 7v10M16 3v18M20 9v6',
    lyrics: 'M4 6h16M4 12h16M4 18h10'
  }
  return jsx('svg', {viewBox:'0 0 24 24', 'aria-hidden':true, focusable:false, fill:filled?'currentColor':'none', stroke:'currentColor', strokeWidth:2.2, strokeLinecap:'round', strokeLinejoin:'round', children:jsx('path',{d:paths[name]})})
}

function NativePlayer() {
  const [player, setPlayer] = useState({ running: false, state: 'loading' })
  const [savedState, setSavedState] = useState({ uri: '', status: 'idle', saved: null })
  const [libraryBusy, setLibraryBusy] = useState(false)
  const authQuery = useSpotifyAuth()
  const accountDisconnected = authQuery.data?.loggedIn === false
  const libraryRevision = useValue($libraryRevision)
  const [localBusy, setBusy] = useState(false)
  const commandBusy = useValue($commandBusy)
  const busy = localBusy || commandBusy
  const [error, setError] = useState('')
  const [scale, setScale] = useState(1)
  const [availableWidth, setAvailableWidth] = useState(320)
  const [sideListOpen, setSideListOpen] = useState(true)
  const viewportRef = useRef(null)
  const [preferences, setPreferences] = useState(() => playerPreferences(pluginStorage?.get('playerPreferences')))
  const [panel, setPanel] = useState('')
  const settingsOpen = panel === 'settings'
  const setSettingsOpen = open => setPanel(open ? 'settings' : '')
  const closePanel = () => setPanel('')
  const showPanel = next => { updatePreferences({mode:'on'}); setPanel(current => preferences.mode === 'on' && current === next ? '' : next) }
  const screenOn = preferences.mode === 'on'
  const miniMode = preferences.mode === 'mini'
  const activeExpandedView = preferences.view
  const updatePreferences = change => setPreferences(current => {
    const next = playerPreferences({ ...current, ...change })
    pluginStorage?.set('playerPreferences', next)
    return next
  })
  const setActiveExpandedView = view => { closePanel(); updatePreferences({view}) }
  // Material feedback is standard; motion still respects visibility and OS preferences.
  const [lyrics, setLyrics] = useState('')
  const [syncedLyrics, setSyncedLyrics] = useState('')
  const [lyricsState, setLyricsState] = useState('idle')
  const [lyricsRetry, setLyricsRetry] = useState(0)
  const containerRef = useRef(null)
  const visible = useSurfaceVisible(containerRef)
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    if (!settingsOpen) return undefined
    const opener = document.activeElement, settings = containerRef.current?.querySelector('.spotify-settings')
    settings?.querySelector('select')?.focus()
    return () => {
      if (document.activeElement === document.body || settings?.contains(document.activeElement)) {
        const target = opener?.isConnected ? opener : containerRef.current?.querySelector('[aria-label="Player settings"]')
        target?.focus()
      }
    }
  }, [settingsOpen])
  useEffect(() => {
    if (settingsOpen) containerRef.current?.querySelector('[aria-label="Player style"]')?.focus()
  }, [preferences.style])
  useEffect(() => { $panePolling.set(true); return () => $panePolling.set(false) }, [])
  const statusQuery = useNativeStatus(true)
  useEffect(() => {
    if (statusQuery.data) setPlayer(current => mergePlayerSnapshot(current, statusQuery.data))
    setError(statusQuery.error?.message || '')
  }, [statusQuery.data, statusQuery.error])

  useEffect(() => {
    if (!visible || player.state !== 'playing') return undefined
    const interval = globalThis.setInterval(() => {
      setPlayer(current => {
        const nextPosition = nextTimelinePosition(current)
        if (nextPosition === Number(current.positionSeconds || 0)) return current
        return { ...current, positionSeconds: nextPosition }
      })
    }, 1000)
    return () => globalThis.clearInterval(interval)
  }, [player.state, player.spotifyUrl, visible])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || typeof ResizeObserver === 'undefined') return undefined
    const update = () => {
      const widthScale = retroPlayerScale(viewport.clientWidth)
      setScale(widthScale)
      setAvailableWidth(viewport.clientWidth)
      const group = viewport.closest('[data-tree-group]')
      const viewportBox = viewport.getBoundingClientRect()
      const zoom = viewport.clientHeight ? viewportBox.height / viewport.clientHeight : 1
      const chromeHeight = group ? Math.max(0, (group.getBoundingClientRect().height - viewportBox.height) / (zoom || 1)) : 0
      updatePlayerPane(preferences.mode, widthScale, Math.round(chromeHeight), preferences.style, viewport.clientWidth)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [preferences.mode, preferences.style])

  useEffect(() => {
    let cancelled = false
    const uri = player.spotifyUrl || ''
    if (!uri || accountDisconnected) {
      setSavedState({ uri: '', status: 'idle', saved: null })
      return undefined
    }
    setSavedState({ uri, status: 'loading', saved: null })
    void runNativeSpotify('saved-status', uri)
      .then(snapshot => {
        if (!cancelled && snapshot.uri === uri) {
          setSavedState({ uri, status: 'ready', saved: Boolean(snapshot.saved) })
        }
      })
      .catch(() => {
        if (!cancelled) setSavedState({ uri, status: 'error', saved: null })
      })
    return () => {
      cancelled = true
    }
  }, [player.spotifyUrl, libraryRevision, accountDisconnected])

  useEffect(() => {
    let cancelled = false
    setLyrics('')
    setSyncedLyrics('')
    setLyricsState('idle')
    if (!visible || !screenOn || panel || activeExpandedView !== 'lyrics' || !player.title || !player.artist || !player.durationMs) return undefined
    setLyricsState('loading')
    const signature = JSON.stringify({
      title: player.title,
      artist: player.artist,
      album: player.album || '',
      duration: Math.round(Number(player.durationMs) / 1000)
    })
    void runNativeSpotify('lyrics', signature)
      .then(snapshot => {
        if (cancelled) return
        setLyrics(snapshot.lyrics || '')
        setSyncedLyrics(snapshot.syncedLyrics || '')
        setLyricsState(snapshot.instrumental ? 'instrumental' : snapshot.lyrics || snapshot.syncedLyrics ? 'ready' : 'missing')
      })
      .catch(() => {
        if (!cancelled) setLyricsState('error')
      })
    return () => {
      cancelled = true
    }
  }, [visible, screenOn, panel, activeExpandedView, player.title, player.artist, player.album, player.durationMs, lyricsRetry])

  const toggleSaved = async () => {
    const uri = player.spotifyUrl || ''
    if (!uri || libraryBusy || !savedReady) return
    const desiredSaved = !savedState.saved
    setLibraryBusy(true)
    try {
      const snapshot = await runNativeSpotify('set-saved', JSON.stringify({ uri, saved: desiredSaved }))
      if (snapshot.uri !== uri) throw new Error('Spotify returned liked status for a different track.')
      setSavedState(current => current.uri === uri ? { uri, status: 'ready', saved: Boolean(snapshot.saved) } : current)
      host.notify({
        kind: 'success',
        message: snapshot.saved ? 'Added to Liked Songs.' : 'Removed from Liked Songs.'
      })
    } catch (libraryError) {
      host.notify({
        kind: 'error',
        message: libraryError instanceof Error ? libraryError.message : 'Spotify library update failed.'
      })
    } finally {
      setLibraryBusy(false)
    }
  }

  const act = async (action, argument = '') => {
    setBusy(true)
    try {
      const snapshot = await runNativeSpotify(action, argument)
      setPlayer(snapshot)
      setError('')
      return true
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'Spotify command failed.'
      setError(message)
      host.notify({ kind: 'error', message })
      return false
    } finally {
      setBusy(false)
    }
  }

  const isPlaying = player.state === 'playing'
  const durationSeconds = Number(player.durationMs || 0) / 1000
  const progress = durationSeconds > 0 ? Math.min(100, (Number(player.positionSeconds || 0) / durationSeconds) * 100) : 0
  const status = error
    ? { label: 'Unavailable', tone: 'bad' }
    : player.state === 'loading' ? {label:'Checking native playback',tone:'muted'} : player.running
      ? { label: isPlaying ? 'Playing' : 'Paused', tone: isPlaying ? 'good' : 'muted' }
      : { label: 'Spotify app closed', tone: 'warn' }
  const savedReady = Boolean(player.spotifyUrl) && savedState.uri === player.spotifyUrl && savedState.status === 'ready'
  const saved = savedReady && savedState.saved === true
  const savedControlLabel = !player.spotifyUrl ? 'Play a track to use Liked Songs' : savedReady
    ? saved ? 'Remove from Liked Songs' : 'Add to Liked Songs'
    : savedState.status === 'error' ? 'Retry Liked Songs status' : 'Checking Liked Songs status'
  const savedAriaLabel = accountDisconnected ? 'Connect Spotify to use Liked Songs' : savedReady
    ? saved ? 'Unlike current track' : 'Like current track'
    : savedControlLabel
  const button = (label, child, onClick, options = {}) => jsx(Tip, {
    label,
    children: jsx(Button, { 'aria-label': label, type: 'button', size: 'icon-sm', variant: 'ghost', onClick, ...options, children: child })
  })
  const searchButton = button('Search Spotify', playerIcon('search'), () => showPanel(accountDisconnected ? 'auth' : 'search'), { 'aria-pressed': panel === 'search' })
  const likeState = accountDisconnected ? 'disconnected' : !player.spotifyUrl ? 'no-track' : savedReady ? saved ? 'liked' : 'not-liked' : savedState.status === 'error' ? 'unavailable' : 'loading'
  const likeView = jsxs('span',{className:'spotify-heart-view',children:[playerIcon('heart', saved), !savedReady && jsx('span',{'aria-hidden':true,'data-like-indicator':true,children:likeState==='loading'?'…':likeState==='unavailable'?'!':'?'})]})
  const likeButton = button(savedAriaLabel, likeView, () => accountDisconnected ? showPanel('auth') : savedState.status === 'error' ? $libraryRevision.set($libraryRevision.get()+1) : void toggleSaved(), { disabled: libraryBusy || (!accountDisconnected && !savedReady && savedState.status !== 'error'), 'aria-pressed': savedReady ? saved : undefined, 'data-liked-state':likeState, 'aria-busy': libraryBusy || likeState==='loading' })
  const playlistButton = button('Add current track to playlist', playerIcon('playlist'), () => showPanel(accountDisconnected ? 'auth' : 'playlists'), { disabled: !player.spotifyUrl, 'aria-pressed': panel === 'playlists' })
  const tasteButton = button('Taste palette', playerIcon('taste'), () => setActiveExpandedView('curate'), { 'aria-pressed': !panel && activeExpandedView === 'curate' })
  const screenButton = button(screenOn ? 'Turn screen off' : 'Turn screen on', playerIcon('screen'), () => { setSettingsOpen(false); updatePreferences({mode: screenOn ? 'off' : 'on'}) }, { 'aria-pressed': screenOn })
  const settingsButton = button('Player settings', playerIcon('settings'), () => showPanel('settings'), { 'aria-pressed': settingsOpen })
  const settingsContent = jsxs('div', { className: 'spotify-settings', 'aria-label': 'Player settings panel', onKeyDown: event => { if(event.key === 'Escape') {setSettingsOpen(false);event.stopPropagation()} }, children: [
    jsxs('header', {className:'spotify-style-heading',children:[jsx('span',{children:'Style'}),jsx('select',{'aria-label':'Player style',value:preferences.style,onChange:event=>updatePreferences({style:event.target.value}),children:PLAYER_STYLES.map(style=>jsx('option',{value:style.id,children:style.label},style.id))})]}),
    jsxs('fieldset',{children:[jsx('legend',{className:'spotify-mode-legend',children:'Mode'}),jsx('div', {role:'radiogroup', 'aria-label':'Player mode', className:'spotify-skins', children:[['on','Full player','Full'],['mini','Compact mini','Mini'],['off','Transport only','Off']].map(([value,label,text])=>jsxs('label',{title:label,children:[jsx('input',{type:'radio','aria-label':label,name:'spotify-mode',value,checked:preferences.mode===value,onChange:()=>{updatePreferences({mode:value});if(value!=='on')closePanel()}}),jsx('span',{children:text})]},value))})]}),
    jsxs('fieldset',{children:[jsx('legend',{children:'Finish'}),jsx('div', {role:'radiogroup', 'aria-label':'Player skin', className:'spotify-skins', children:[['chrome','Classic chrome','Chrome'],['ice','Ice blue','Ice'],['graphite','Graphite','Graphite']].map(([value,label,text])=>jsxs('label',{title:label,children:[jsx('input',{type:'radio','aria-label':label,name:'spotify-skin',value,checked:preferences.skin===value,onChange:()=>updatePreferences({skin:value})}),jsx('span',{children:text})]},value))})]}),
    jsxs('fieldset',{children:[jsx('legend',{children:'Visualizer'}),jsx('div', {role:'radiogroup', 'aria-label':'Visualizer style', className:'spotify-skins', children:[['spectrum','Spectrum analyzer','Bands'],['scope','Oscilloscope waveform','Scope'],['alchemy','WMP-inspired Alchemy','Alchemy']].map(([value,label,text])=>jsxs('label',{title:label,children:[jsx('input',{type:'radio','aria-label':label,name:'spotify-visualizer',value,checked:preferences.visualizer===value,onChange:()=>updatePreferences({visualizer:value})}),jsx('span',{children:text})]},value))})]}),
    jsxs('a',{className:'spotify-settings-account',href:'#spotify-account','aria-label':'Spotify connection',title:'Spotify connection',onClick:event=>{event.preventDefault();setPanel('auth')},children:[jsx('span',{children:'Account'}),jsx('span',{children:authQuery.data?.loggedIn ? 'Connected ›' : accountDisconnected ? 'Connect ›' : 'Check status ›'})]})
  ] })
  const trackCopy = jsxs('div', {
    className: 'spotify-standard-copy',
    children: [
      jsx('div', { className: 'spotify-title', title: player.title || '', children: error ? 'Spotify unavailable' : player.state === 'loading' ? 'Connecting…' : player.title || (player.running ? 'Nothing selected' : 'Open Spotify') }),
      jsxs('div', { className: 'spotify-meta', children: [
        jsx('span', { className: 'spotify-artist', title: error || player.artist || status.label, children: player.artist || status.label }),
        jsx('span', { className: 'spotify-time', children: `${formatTime(player.positionSeconds)} / ${formatTime(durationSeconds)}` })
      ] })
    ]
  })
  const transport = jsxs('div', {
    className: 'spotify-transport',
    children: [
      jsxs('span', { className: 'spotify-metal-control', children: [
        button(isPlaying ? 'Pause Spotify' : 'Play Spotify', jsx(isPlaying ? icons.Pause : icons.Play, {}), () => void act(isPlaying ? 'pause' : 'play'), { disabled: busy, 'aria-busy': busy }),
        jsx(MetalArtifact, { enabled: true, visible, playing: isPlaying })
      ] }),
      jsx('div', { className: 'spotify-seek', children: jsx(NativeRange, { label: 'Seek Spotify', value: Number(player.positionSeconds || 0), max: durationSeconds, disabled: busy || !durationSeconds, onCommit: value => act('seek', value) }) }),
      jsxs('div', { className: 'spotify-controls', children: [
        button('Previous track', jsx(icons.ChevronLeft, {}), () => void act('previous'), { disabled: busy || !player.running }),
        button('Next track', jsx(icons.ChevronRight, {}), () => void act('next'), { disabled: busy || !player.running }),
        jsxs('div', { className: 'spotify-volume', children: [
          jsx('span', { 'aria-hidden': true, children: '♪' }),
          jsx(NativeRange, { label: 'Spotify volume', value: Number(player.volume || 0), max: 100, disabled: busy || !player.running, onCommit: value => act('volume', value) })
        ] })
      ] })
    ]
  })
  const lyricsMessage = !player.title || !player.artist ? 'Play a track to see lyrics.' : lyricsState === 'instrumental' ? 'This track is instrumental.' : lyricsState === 'missing' ? 'Lyrics are not available for this track.' : lyrics
  const screenContent = activeExpandedView === 'curate' ? jsx(TastePalette,{track:player}) : activeExpandedView === 'visualizer'
    ? jsx(XPVisualizer, {playing:isPlaying, visible, style: preferences.visualizer})
    : activeExpandedView === 'artwork'
    ? player.artworkUrl
      ? jsx('img', { className: 'spotify-artwork', alt: player.album ? `${player.album} cover` : 'Album cover', src: player.artworkUrl })
      : jsx('div', { className: 'spotify-empty-screen', children: jsx(icons.AudioLines, {}) })
    : lyricsState === 'error'
      ? jsxs('div',{className:'spotify-lyrics-message',role:'status',children:[jsx('p',{children:'Could not load lyrics.'}),button('Retry lyrics','Retry',()=>setLyricsRetry(v=>v+1))]})
    : lyricsState === 'loading'
      ? jsx(FactoryLoader, { label: 'Loading lyrics' })
      : lyricsState === 'ready' && syncedLyrics
        ? jsx(SyncedLyrics, { key:player.spotifyUrl, durationSeconds, isPlaying: isPlaying && visible, plainLyrics: lyrics, positionSeconds: player.positionSeconds, syncedLyrics })
        : jsx('div', { className: 'spotify-lyrics-message', children: lyricsMessage })
  const displayContent = error ? jsxs('div',{role:'alert',className:'spotify-lyrics-message',children:[jsx('p',{children:error}),button('Retry Spotify status','Retry',()=>void act('status'),{disabled:busy})]}) : settingsOpen ? settingsContent : panel === 'search' ? jsx(SpotifySearchDialog, {embedded:true,onClose:closePanel}) : panel === 'playlists' ? jsx(SpotifyPlaylistDialog,{embedded:true,open:true,onOpenChange:closePanel,track:player}) : panel === 'auth' ? jsx(SpotifyAuthDialog,{embedded:true,onClose:closePanel}) : screenContent
  // Reference: 13c185f4418ff0f1dde10194542be057-2316257832.png.
  // Original CSS/vector implementation; no screenshot, Apple logo or movie
  // payload is bundled. Titlebar studs are decoration, not fake OS controls.
  const referenceWidth = playerFrameWidth(preferences.style,scale,availableWidth)
  const referenceNavigation = screenOn && ['wmp-classic','wmp-library','organic'].includes(preferences.style)
  const referenceSidebar = screenOn && referenceWidth >= 480 && sideListOpen && ['wmp-classic','dark-playlist','organic'].includes(preferences.style)
  const deckInfo = screenOn && preferences.style === 'jetaudio' && !panel
  const referenceTabs = jsxs('div',{role:'tablist','aria-label':'Screen view','aria-orientation':referenceNavigation?'vertical':'horizontal',onKeyDown:event=>{
    const views=['artwork','visualizer','lyrics'],keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];if(!keys.includes(event.key))return
    event.preventDefault();const i=views.indexOf(activeExpandedView),n=event.key==='Home'?0:event.key==='End'?2:(i+(['ArrowRight','ArrowDown'].includes(event.key)?1:2))%3
    setActiveExpandedView(views[n]);event.currentTarget.querySelectorAll('[role=tab]')[n]?.focus()
  },children:['artwork','visualizer','lyrics'].map((view,i)=>button(['Artwork','Visualizer','Lyrics'][i],jsxs('span',{className:'reference-tab-label',children:[playerIcon(view),jsx('span',{children:['Playing','Visual','Lyrics'][i]})]}),()=>setActiveExpandedView(view),{role:'tab',tabIndex:activeExpandedView===view?0:-1,'aria-selected':!panel&&activeExpandedView===view}))})
  const referenceFaceplate = jsxs('section', {
    ref:containerRef,className:`spotify-surface spotify-quicktime spotify-reference-${preferences.style}`,'data-style':preferences.style,
    'data-skin':preferences.style,'data-screen':preferences.mode,'data-panel':panel,'data-wide':referenceWidth>=480,'data-navigation':referenceNavigation,'data-sidebar':referenceSidebar,'data-visible':visible,'data-reduced-motion':reducedMotion,
    style:{width:referenceWidth,height:playerFrameHeight(preferences.mode,scale,preferences.style,availableWidth),gridTemplateColumns:referenceNavigation?`${referenceWidth>=480?'78px':'28px'} minmax(0,1fr)${referenceSidebar?' 150px':''}`:referenceSidebar?'minmax(0,1fr) 150px':deckInfo?'minmax(0,1fr) 70px':undefined},
    children:[
      jsx('style',{children:PLAYER_CSS}),
      jsxs('header',{className:'qt-titlebar',children:[jsx('span',{className:'qt-title-studs','aria-hidden':true,children:'● ● ●'}),jsx('strong',{title:player.title||'Spotify',children:player.title||'Spotify'}),screenButton]}),
      screenOn ? jsxs('div',{className:'qt-tools',children:[searchButton,likeButton,playlistButton,tasteButton,referenceNavigation?null:referenceTabs]}) : null,
      screenOn ? jsx('div',{className:'spotify-screen qt-movie',style:{gridColumn:referenceNavigation?2:1},children:preferences.style==='wmp-library'&&!panel&&activeExpandedView==='artwork'?jsxs('div',{className:'reference-current-grid',children:[jsxs('article',{children:[jsx('div',{className:'reference-current-art',children:screenContent}),jsx('strong',{children:player.title||'No current track'}),jsx('span',{children:player.artist||'Spotify'})]}),jsx('p',{children:'Now playing · Search opens a track grid'})]}):displayContent}) : jsx('div',{className:'qt-compact-copy',children:error?jsx('span',{role:'alert',children:error}):`${player.artist||'Spotify'} · ${formatTime(player.positionSeconds)} / ${formatTime(durationSeconds)}`}),
      !miniMode ? jsxs('div',{className:'qt-scrub',children:[jsx('span',{children:formatTime(player.positionSeconds)}),jsx(NativeRange,{label:'Seek Spotify',value:Number(player.positionSeconds||0),max:durationSeconds,disabled:busy||!durationSeconds,onCommit:value=>act('seek',value)})]}) : null,
      jsxs('div',{className:'qt-bottom',children:[
        jsx('div',{className:'qt-volume',children:jsx(NativeRange,{label:'Spotify volume',value:Number(player.volume||0),max:100,disabled:busy||!player.running,onCommit:value=>act('volume',value)})}),
        jsxs('div',{className:'qt-transport',children:[
          button('Previous track',playerIcon('previous'),()=>void act('previous'),{disabled:busy||!player.running}),
          button('Seek backward 10 seconds',playerIcon('rewind'),()=>void act('seek',Math.max(0,Number(player.positionSeconds||0)-10)),{disabled:busy||!durationSeconds}),
          button(isPlaying?'Pause Spotify':'Play Spotify',jsx(isPlaying?icons.Pause:icons.Play,{}),()=>void act(isPlaying?'pause':'play'),{className:'qt-main-play',disabled:busy,'aria-busy':busy}),
          button('Seek forward 10 seconds',playerIcon('forward'),()=>void act('seek',Math.min(durationSeconds,Number(player.positionSeconds||0)+10)),{disabled:busy||!durationSeconds}),
          button('Next track',playerIcon('next'),()=>void act('next'),{disabled:busy||!player.running})
        ]}),settingsButton
      ]}),
      referenceNavigation?jsx('nav',{className:'reference-navigation','aria-label':'Music navigation',children:referenceTabs}):null,
      referenceSidebar?jsx('aside',{className:'reference-playlist-side','aria-label':'Playlist targets',style:{gridColumn:referenceNavigation?3:2},children:accountDisconnected?jsxs('div',{className:'reference-side-message',children:[jsx('p',{children:'Connect Spotify for playlist targets'}),button('Connect Spotify',playerIcon('settings'),()=>showPanel('auth'))]}):jsx(SpotifyPlaylistDialog,{embedded:true,open:true,autoFocus:false,onOpenChange:()=>{setSideListOpen(false);requestAnimationFrame(()=>containerRef.current?.querySelector('[aria-label="Add current track to playlist"]')?.focus())},track:player})}):null,
      deckInfo?jsxs('aside',{className:'reference-deck-info','aria-label':'Current track counters',children:[jsx('span',{children:'POSITION'}),jsx('strong',{children:formatTime(player.positionSeconds)}),jsx('span',{children:'DURATION'}),jsx('strong',{children:formatTime(durationSeconds)}),jsx('span',{children:'VOLUME'}),jsx('strong',{children:`${Number(player.volume||0)}%`}),jsx('span',{children:player.running?'SPOTIFY':'APP CLOSED'})]}):null
    ]
  })
  const faceplate = jsxs('section', {
    ref: containerRef,
    'data-visible': visible,
    'data-reduced-motion': reducedMotion,
    'data-skin': 'retro-chrome',
    'data-style': 'silver',
    'data-screen': preferences.mode,
    'data-finish': preferences.skin,
    className: 'spotify-surface',
    style: { transform: `scale(${scale})`, '--player-scale':scale, height:playerFrameHeight(preferences.mode,scale,'silver')/scale },
    children: [
      jsx('style', { children: PLAYER_CSS }),
      screenOn ? jsxs('div', { className: 'spotify-upper', children: [
        jsxs('div', { className: 'spotify-side-controls', children: [searchButton, likeButton, playlistButton] }),
        jsxs('div', {className:'spotify-view-tabs', role:'tablist', 'aria-label':'Screen view', onKeyDown:event=>{
              const views=['artwork','visualizer','lyrics'], keys=['ArrowLeft','ArrowRight','Home','End']
              if(!keys.includes(event.key))return
              event.preventDefault()
              const index=views.indexOf(activeExpandedView), next=event.key==='Home'?0:event.key==='End'?2:(index+(event.key==='ArrowRight'?1:2))%3
              setActiveExpandedView(views[next]);event.currentTarget.querySelectorAll('[role=tab]')[next]?.focus()
            }, children:[
            button('Artwork', jsxs('span',{className:'spotify-tab-label',children:[playerIcon('artwork'),jsx('span',{children:'Art'})]}), () => setActiveExpandedView('artwork'), { role: 'tab', tabIndex: activeExpandedView === 'artwork' ? 0 : -1, 'aria-selected': !panel && activeExpandedView === 'artwork' }),
            button('Visualizer', jsxs('span',{className:'spotify-tab-label',children:[playerIcon('visualizer'),jsx('span',{children:'Visual'})]}), () => setActiveExpandedView('visualizer'), { role: 'tab', tabIndex: activeExpandedView === 'visualizer' ? 0 : -1, 'aria-selected': !panel && activeExpandedView === 'visualizer' }),
            button('Lyrics', jsxs('span',{className:'spotify-tab-label',children:[playerIcon('lyrics'),jsx('span',{children:'Lyrics'})]}), () => setActiveExpandedView('lyrics'), { role: 'tab', tabIndex: activeExpandedView === 'lyrics' ? 0 : -1, 'aria-selected': !panel && activeExpandedView === 'lyrics' })
          ]}),
        jsxs('div', { className: 'spotify-display', children: [
          jsx('div', { className: 'spotify-screen', children: displayContent }),
          jsx('div', { className: 'spotify-lcd', children: trackCopy })
        ] }),
        jsxs('div', { className: 'spotify-side-controls', children: [tasteButton, screenButton, settingsButton] })
      ] }) : miniMode ? jsxs('div', {className:'spotify-mini',children:[
        jsx('div',{className:'spotify-mini-lcd',children:error ? jsx('span',{className:'spotify-compact-error',role:'alert',title:error,children:error}) : trackCopy}),
        jsxs('div',{className:'spotify-mini-actions',children:[settingsButton,screenButton]})
      ]}) : jsxs('div', {className:'spotify-off-header',children:[
        jsx('div',{className:'spotify-lcd',children:error ? jsx('span',{className:'spotify-compact-error',role:'alert',title:error,children:error}) : trackCopy}),
        jsxs('div',{className:'spotify-off-actions',children:[settingsButton,screenButton]})
      ]}),
      transport,
      null
    ]
  })
  return jsx('div', {
    ref: viewportRef,
    className: 'spotify-retro-viewport',
    children: jsx('div', {
      className: 'spotify-retro-stage',
      style: { width: referenceWidth, height: playerFrameHeight(preferences.mode, scale, preferences.style,availableWidth) },
      children: preferences.style !== 'silver' ? referenceFaceplate : faceplate
    })
  })
}


function ScreenPanel({open, onOpenChange, children, className = '', autoFocus = true}) {
  const ref = useRef(null)
  useEffect(() => {
    if(!open||!autoFocus)return undefined
    const opener=document.activeElement, panel=ref.current
    ;(panel?.querySelector('input:not(:disabled)')||panel?.querySelector('button:not(:disabled)'))?.focus()
    return ()=>{
      // Restore after Close/Escape/unmount, but do not steal focus from a
      // different shell tab/button the user deliberately selected.
      if(opener?.isConnected && (document.activeElement===document.body||panel?.contains(document.activeElement)))opener.focus?.()
    }
  }, [open, autoFocus])
  return open ? jsxs('section', {ref, className:'spotify-panel '+className, 'aria-label':'Spotify screen panel', onKeyDown:event=>{if(event.key==='Escape'){event.stopPropagation();onOpenChange(false)}}, children:[
    jsx('button',{type:'button',className:'spotify-panel-close','aria-label':'Close screen panel',title:'Close screen panel',onClick:()=>onOpenChange(false),children:'×'}),children
  ]}) : null
}

function SpotifyPlaylistDialog({ open, onOpenChange, track, embedded = false, autoFocus = true }) {
  // Pin the menu's target. A song change must not silently change the track added.
  const [selectedTrack, setSelectedTrack] = useState(track)
  const [reload, setReload] = useState(0)
  useEffect(() => { if(open)setSelectedTrack(track) }, [open])
  const [playlists, setPlaylists] = useState([])
  const [playlistQuery, setPlaylistQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [addingId, setAddingId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    let cancelled = false
    setPlaylistQuery('')
    setLoading(true)
    setError('')
    void runNativeSpotify('playlists')
      .then(snapshot => {
        if (!cancelled) setPlaylists(snapshot.playlists || [])
      })
      .catch(loadError => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Could not load playlists.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, reload])

  const addToPlaylist = async playlist => {
    if (!selectedTrack.spotifyUrl || addingId) return
    setAddingId(playlist.id)
    setError('')
    try {
      await runNativeSpotify('playlist-add', JSON.stringify({
        playlistId: playlist.id,
        uri: selectedTrack.spotifyUrl
      }))
      host.notify({ kind: 'success', message: `Added to ${playlist.name}.` })
      onOpenChange(false)
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Could not add track to playlist.')
    } finally {
      setAddingId('')
    }
  }

  const normalizedQuery = playlistQuery.trim().toLocaleLowerCase()
  const visiblePlaylists = normalizedQuery
    ? playlists.filter(playlist => playlist.name.toLocaleLowerCase().includes(normalizedQuery))
    : playlists

  if(embedded)return jsx(ScreenPanel,{open,onOpenChange,className:'spotify-playlist-host',children:
    jsxs('div',{className:'spotify-playlist-panel',children:[
      jsx('header',{children:jsx('h2',{children:'Add to playlist'})}),
      jsx('p',{className:'spotify-playlist-track',title:`${selectedTrack.title} — ${selectedTrack.artist||'Spotify'}`,children:selectedTrack.title||'Choose a playlist'}),
      playlists.length>5?jsx('input',{'aria-label':'Filter playlists',placeholder:'Filter playlists…',value:playlistQuery,onChange:event=>setPlaylistQuery(event.target.value)}):null,
      loading?jsx('p',{role:'status',children:'Loading playlists…'}):error?null:
      jsx('div',{className:'spotify-playlist-rows','aria-label':'Available playlists',children:visiblePlaylists.length?visiblePlaylists.map(playlist=>jsx('button',{
        type:'button',title:playlist.name,'aria-label':`Add to ${playlist.name}`,disabled:!!addingId,onClick:()=>void addToPlaylist(playlist),
        children:jsx('span',{children:addingId===playlist.id?'Adding…':playlist.name})
      },playlist.id)):jsx('p',{children:playlistQuery?'No matching playlists.':'No playlists found.'})}),
      error?jsxs('div',{role:'alert',className:'spotify-playlist-error',children:[jsx('p',{children:error}),!addingId?jsx('button',{type:'button',title:'Reload playlists',onClick:()=>setReload(x=>x+1),children:'Reload playlists'}):null]}):null
    ]})})

  return jsx(embedded ? ScreenPanel : Dialog, {
    open,
    onOpenChange,
    ...(embedded ? {autoFocus} : {}),
    children: jsx(embedded ? 'div' : DialogContent, {
      className: 'max-w-sm gap-0 overflow-hidden p-0',
      children: jsxs('div', {
        children: [
          jsxs(DialogHeader, {
            className: 'border-b border-(--ui-stroke-secondary) px-4 py-3 text-left',
            children: [
              jsx(embedded ? 'h2' : DialogTitle, { children: 'Add to playlist' }),
              jsx(embedded ? 'p' : DialogDescription, {
                children: selectedTrack.title ? `${selectedTrack.title} — ${selectedTrack.artist || 'Spotify'}` : 'Choose a playlist.'
              })
            ]
          }),
          loading
            ? jsx('div', {
                className: 'flex items-center justify-center px-4 py-6',
                children: jsx(GlyphSpinner, { ariaLabel: 'Loading playlists' })
              })
            : playlists.length
              ? jsxs('div', {
                  children: [
                    playlists.length > 5
                      ? jsx('div', {
                          className: 'border-b border-(--ui-stroke-secondary) px-3 py-2',
                          children: jsx(SearchField, {
                            containerClassName: 'w-full',
                            onChange: setPlaylistQuery,
                            placeholder: 'Filter playlists…',
                            value: playlistQuery
                          })
                        })
                      : null,
                    visiblePlaylists.length
                      ? jsx('div', {
                          className: 'max-h-80 overflow-y-auto p-1.5',
                          children: visiblePlaylists.map(playlist =>
                            jsxs('button', {
                              'aria-label': `Add to ${playlist.name}`,
                              title: `Add current track to ${playlist.name}`,
                              className: 'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-(--ui-bg-hover)',
                              disabled: Boolean(addingId),
                              onClick: () => void addToPlaylist(playlist),
                              type: 'button',
                              children: [
                                playlist.artworkUrl
                                  ? jsx('img', {
                                      alt: '',
                                      className: 'size-9 shrink-0 rounded object-cover',
                                      src: playlist.artworkUrl
                                    })
                                  : jsx('div', {
                                      className: 'flex size-9 shrink-0 items-center justify-center rounded bg-(--ui-bg-secondary) text-(--ui-text-quaternary)',
                                      children: jsx(icons.AudioLines, { className: 'size-4' })
                                    }),
                                jsxs('span', {
                                  className: 'min-w-0 flex-1',
                                  children: [
                                    jsx('span', { className: 'block truncate text-sm font-medium', children: playlist.name }),
                                    jsx('span', {
                                      className: 'block text-xs text-(--ui-text-secondary)',
                                      children: `${playlist.trackCount} ${playlist.trackCount === 1 ? 'track' : 'tracks'}`
                                    })
                                  ]
                                }),
                                addingId === playlist.id
                                  ? jsx(GlyphSpinner, { ariaLabel: `Adding to ${playlist.name}`, className: 'size-3.5' })
                                  : jsx(icons.Plus, { className: 'size-4 text-(--ui-text-tertiary)' })
                              ]
                            }, playlist.id)
                          )
                        })
                      : jsx('p', {
                          className: 'px-4 py-6 text-center text-sm text-(--ui-text-secondary)',
                          children: 'No matching playlists.'
                        })
                  ]
                })
              : !error ? jsx('p', {
                  className: 'px-4 py-6 text-center text-sm text-(--ui-text-secondary)',
                  children: 'No playlists found.'
                }) : null,
          error ? jsx('p', { className: 'px-4 pb-3 text-xs text-destructive', children: error }) : null
        ]
      })
    })
  })
}

function SpotifyAuthDialog({embedded = false, onClose} = {}) {
  const globalOpen = useValue($authOpen)
  const open = embedded || globalOpen
  const [auth, setAuth] = useState({
    loggedIn: false,
    clientConfigured: false,
    phase: 'idle',
    redirectUri: 'http://127.0.0.1:43827/spotify/callback'
  })
  const [clientId, setClientId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const authQuery = useSpotifyAuth(open)
  useEffect(() => {
    if (authQuery.data) {setAuth(authQuery.data);setError('')}
    if (authQuery.error) setError(authQuery.error.message)
  }, [authQuery.data,authQuery.error])

  const refreshAuth = async () => {
    if (!pluginRest) return
    try {
      const snapshot = await pluginRest('/auth/status', { method: 'GET' })
      setAuth(snapshot)
      queryClient.setQueryData(['spotify-player','auth-status'],snapshot)
      setError('')
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Could not read Spotify connection status.')
    }
  }

  useEffect(() => {
    if (!open) return undefined
    void refreshAuth()
    void queryClient.invalidateQueries({queryKey:['spotify-player','auth-status']})
  }, [open])

  const setOpen = next => {
    if (embedded) { if (!next) onClose() } else $authOpen.set(next)
    if (!next) {
      setClientId('')
      setError('')
    }
  }

  const connect = async () => {
    if (!pluginRest || busy) return
    setBusy(true)
    setError('')
    try {
      const snapshot = await pluginRest('/auth/start', {
        method: 'POST',
        body: { clientId: clientId.trim() }
      })
      setAuth(current => ({ ...current, ...snapshot }))
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : 'Could not start Spotify authorization.')
    } finally {
      setBusy(false)
    }
  }

  const waiting = auth.phase === 'waiting' || auth.phase === 'starting'
  const connected = Boolean(auth.loggedIn || auth.phase === 'connected')

  return jsx(embedded ? ScreenPanel : Dialog, {
    open,
    onOpenChange: setOpen,
    children: jsx(embedded ? 'div' : DialogContent, {
      className: 'max-w-md gap-0 overflow-hidden p-0',
      children: jsxs('div', {
        children: [
          jsx('div', { className: 'h-1 bg-[#1ed760]' }),
          jsxs(DialogHeader, {
            className: 'px-5 pb-4 pt-5 text-left',
            children: [
              jsxs('div', {
                className: 'mb-2 flex items-center gap-3',
                children: [
                  jsx('div', {
                    className: 'flex size-10 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-lg',
                    children: jsx(icons.AudioLines, { className: 'size-5' })
                  }),
                  jsxs('div', {
                    children: [
                      jsx(embedded ? 'h2' : DialogTitle, { children: connected ? 'Spotify connected' : 'Connect Spotify' }),
                      jsx('div', { className: 'mt-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-(--ui-text-tertiary)', children: 'Secure PKCE connection' })
                    ]
                  })
                ]
              }),
              jsx(embedded ? 'p' : DialogDescription, {
                children: connected
                  ? 'Hermes can search, save, and organize music through your Spotify account.'
                  : 'Authorize through Spotify in your browser. Your password is never shared with Hermes.'
              })
            ]
          }),
          connected
            ? jsxs('div', {
                className: 'mx-5 mb-5 flex items-start gap-3 rounded-lg border border-[#1ed760]/30 bg-[#1ed760]/[0.08] p-3',
                children: [
                  jsx(icons.CheckCircle2, { className: 'mt-0.5 size-5 shrink-0 text-[#1ed760]' }),
                  jsxs('div', {
                    children: [
                      jsx('div', { className: 'text-sm font-semibold', children: 'Connected securely' }),
                      jsx('div', { className: 'mt-0.5 text-xs text-(--ui-text-secondary)', children: 'OAuth tokens are stored by Hermes and refreshed automatically.' })
                    ]
                  })
                ]
              })
            : jsxs('div', {
                className: 'space-y-3 border-t border-(--ui-stroke-secondary) px-5 py-4',
                children: [
                  !auth.clientConfigured
                    ? jsxs('div', {
                        className: 'rounded-lg bg-(--ui-bg-secondary) p-3',
                        children: [
                          jsxs('div', {
                            className: 'flex items-center justify-between gap-3',
                            children: [
                              jsxs('div', {
                                children: [
                                  jsx('div', { className: 'text-sm font-semibold', children: '1. Create a Spotify app' }),
                                  jsx('div', { className: 'mt-0.5 text-xs text-(--ui-text-secondary)', children: 'Select Web API. No client secret is needed.' })
                                ]
                              }),
                              jsx(Button, {
                                asChild: true,
                                size: 'xs',
                                variant: 'outline',
                                children: jsx('a', {
                                  href: 'https://developer.spotify.com/dashboard',
                                  rel: 'noreferrer',
                                  target: '_blank',
                                  title: 'Open Spotify developer dashboard',
                                  children: 'Open dashboard'
                                })
                              })
                            ]
                          }),
                          jsx('div', { className: 'mt-3 text-xs font-semibold', children: '2. Add this redirect URI' }),
                          jsx('code', {
                            className: 'mt-1 block select-all overflow-x-auto rounded bg-black/20 px-2 py-1.5 text-[0.6875rem] text-(--ui-text-secondary)',
                            children: auth.redirectUri || 'http://127.0.0.1:43827/spotify/callback'
                          }),
                          jsx('div', { className: 'mt-3 text-xs font-semibold', children: '3. Paste the Client ID' }),
                          jsx(Input, {
                            'aria-label': 'Spotify Client ID',
                            autoComplete: 'off',
                            className: 'mt-1 font-mono text-xs',
                            disabled: busy || waiting,
                            maxLength: 128,
                            onChange: event => setClientId(event.target.value),
                            placeholder: 'Spotify Client ID',
                            value: clientId
                          })
                        ]
                      })
                    : jsx('div', {
                        className: 'rounded-lg bg-(--ui-bg-secondary) p-3 text-sm text-(--ui-text-secondary)',
                        children: 'Your Spotify app is configured. Continue to approve access in Spotify.'
                      }),
                  waiting
                    ? jsxs('div', {
                        className: 'flex items-center gap-2 rounded-lg border border-(--ui-stroke-secondary) px-3 py-2 text-sm',
                        children: [
                          jsx(GlyphSpinner, { ariaLabel: 'Waiting for Spotify authorization', size: 'sm' }),
                          jsx('span', { children: 'Finish connecting in your browser…' })
                        ]
                      })
                    : null,
                  error || auth.phase === 'error'
                    ? jsx('p', { className: 'text-xs text-destructive', children: error || auth.message || 'Spotify authorization did not complete.' })
                    : null,
                  jsx(Button, {
                    className: 'w-full bg-[#1ed760] font-semibold text-black hover:bg-[#1fdf64]',
                    disabled: busy || waiting || (!auth.clientConfigured && clientId.trim().length < 20),
                    onClick: () => void connect(),
                    type: 'button',
                    title: 'Authorize your Spotify account in your browser',
                    children: 'Connect Spotify'
                  })
                ]
              }),
          jsxs('div', {
            className: 'flex items-center gap-2 border-t border-(--ui-stroke-secondary) px-5 py-3 text-[0.6875rem] text-(--ui-text-quaternary)',
            children: [
              jsx(icons.Lock, { className: 'size-3.5 shrink-0' }),
              jsx('span', { children: 'Authorization uses Spotify Web API, PKCE, state verification, and a localhost callback.' })
            ]
          })
        ]
      })
    })
  })
}

function SpotifyStatusBar() {
  const panePolling = useValue($panePolling)
  const statusQuery = useNativeStatus(!panePolling)
  const player = statusQuery.data || { running: false, state: 'loading' }
  const error = statusQuery.error?.message || ''
  const commandBusy = useValue($commandBusy)

  const toggle = async () => {
    try {
      await runNativeSpotify(player.state === 'playing' ? 'pause' : 'play')
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'Spotify command failed.'
      host.notify({ kind: 'error', message })
    }
  }

  const isPlaying = player.state === 'playing'
  const primaryLabel = error ? 'Spotify unavailable' : player.title || (player.running ? 'Spotify' : 'Open Spotify')
  const secondaryLabel = error ? primaryLabel : player.artist || primaryLabel
  const label = primaryLabel

  return jsxs('div', {
    className: 'flex min-w-0 items-center gap-1.5',
    title: error || `${player.artist || 'Spotify'}${player.title ? ` — ${player.title}` : ''}`,
    children: [
      jsx(StatusDot, { tone: error ? 'bad' : isPlaying ? 'good' : player.running ? 'muted' : 'warn' }),
      jsx('span', {
        className: 'max-w-36 truncate text-[0.6875rem] text-(--ui-text-secondary)',
        children: label
      }),
      jsx(Tip, {
        label: 'Spotify connection',
        children: jsx(Button, {
          'aria-label': 'Spotify connection',
          onClick: () => $authOpen.set(true),
          size: 'icon-sm',
          type: 'button',
          variant: 'ghost',
          children: jsx(icons.Lock, {})
        })
      }),
      jsx(Tip, {
        label: 'Search Spotify',
        children: jsx(Button, {
          'aria-label': 'Search Spotify',
          onClick: () => $searchOpen.set(true),
          size: 'icon-sm',
          type: 'button',
          variant: 'ghost',
          children: jsx(icons.Search, {})
        })
      }),
      jsx(Tip, {
        label: isPlaying ? 'Pause Spotify' : 'Play Spotify',
        children: jsx(Button, {
          'aria-label': isPlaying ? 'Pause Spotify' : 'Play Spotify',
          onClick: () => void toggle(),
          disabled: commandBusy,
          size: 'icon-sm',
          type: 'button',
          variant: 'ghost',
          children: jsx(isPlaying ? icons.Pause : icons.Play, {})
        })
      }),
      jsx(SpotifySearchDialog, {}),
      jsx(SpotifyAuthDialog, {})
    ]
  })
}

function SpotifySearchDialog({embedded = false, onClose} = {}) {
  const globalOpen = useValue($searchOpen)
  const open = embedded || globalOpen
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const setOpen = next => {
    if (embedded) { if (!next) onClose() } else $searchOpen.set(next)
    if (!next) {
      setQuery('')
      setResults([])
      setHasSearched(false)
      setError('')
    }
  }

  const submit = async event => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed || busy) return

    setBusy(true)
    try {
      const snapshot = await runNativeSpotify('search', query)
      setResults(snapshot.results.slice(0, 10))
      setHasSearched(true)
      setError('')
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Spotify search failed.')
    } finally {
      setBusy(false)
    }
  }

  const playResult = async result => {
    if (busy) return
    setBusy(true)
    try {
      await runNativeSpotify('play-uri', result.uri)
      setOpen(false)
    } catch (playError) {
      setError(playError instanceof Error ? playError.message : 'Could not play that track.')
    } finally {
      setBusy(false)
    }
  }

  return jsx(embedded ? ScreenPanel : Dialog, {
    open,
    onOpenChange: setOpen,
    children: jsx(embedded ? 'div' : DialogContent, {
      className: 'max-w-lg gap-0 overflow-hidden p-0',
      children: jsxs('form', {
        onSubmit: submit,
        children: [
          jsxs(DialogHeader, {
            className: 'border-b border-(--ui-stroke-secondary) px-4 py-3 text-left',
            children: [
              jsx(embedded ? 'h2' : DialogTitle, { children: 'Search Spotify' }),
              jsx(embedded ? 'p' : DialogDescription, { children: 'Find a track, then click it to play.' })
            ]
          }),
          jsxs('div', {
            className: 'flex items-center gap-2 px-4 py-3',
            children: [
              jsx(icons.Search, { className: 'size-4 shrink-0 text-(--ui-text-tertiary)' }),
              jsx(Input, {
                'aria-label': 'Search Spotify',
                autoFocus: true,
                disabled: busy,
                maxLength: 200,
                onChange: event => setQuery(event.target.value),
                placeholder: 'Search music…',
                value: query
              })
            ]
          }),
          results.length
            ? jsx('div', {
                className: 'spotify-search-results max-h-80 overflow-y-auto border-t border-(--ui-stroke-secondary) p-1.5',
                children: results.map(result =>
                  jsxs('button', {
                    'aria-label': `Play ${result.title} by ${result.artist}`,
                    title: `Play ${result.title} by ${result.artist}`,
                    className: 'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-(--ui-bg-hover)',
                    disabled: busy,
                    onClick: () => void playResult(result),
                    type: 'button',
                    children: [
                      result.artworkUrl
                        ? jsx('img', {
                            alt: '',
                            className: 'size-9 shrink-0 rounded object-cover',
                            src: result.artworkUrl
                          })
                        : jsx('div', {
                            className: 'flex size-9 shrink-0 items-center justify-center rounded bg-(--ui-bg-secondary) text-(--ui-text-quaternary)',
                            children: jsx(icons.AudioLines, { className: 'size-4' })
                          }),
                      jsxs('span', {
                        className: 'min-w-0 flex-1',
                        children: [
                          jsx('span', { className: 'block truncate text-sm font-medium', children: result.title }),
                          jsx('span', {
                            className: 'block truncate text-xs text-(--ui-text-secondary)',
                            children: `${result.artist}${result.album ? ` — ${result.album}` : ''}`
                          })
                        ]
                      }),
                      jsx(icons.Play, { className: 'size-4 shrink-0 text-(--ui-text-tertiary)' })
                    ]
                  }, result.uri)
                )
              })
            : hasSearched && !error
              ? jsx('p', {
                  className: 'border-t border-(--ui-stroke-secondary) px-4 py-6 text-center text-sm text-(--ui-text-secondary)',
                  children: 'No tracks found.'
                })
              : null,
          error
            ? jsx('p', { className: 'px-4 pb-3 text-xs text-destructive', children: error })
            : jsx('p', {
                className: 'px-4 pb-3 text-[0.6875rem] text-(--ui-text-quaternary)',
                children: results.length ? 'Select a result to play it. Esc closes.' : 'Press Enter to search. Esc closes.'
              })
        ]
      })
    })
  })
}

function SpotifyRightRail() {
  return jsx('div', {
    className: 'h-full',
    children: jsx(NativePlayer, {})
  })
}

export default {
  id: PLUGIN_ID,
  name: 'Spotify Retro Player',
  defaultEnabled: true,
  register(ctx) {
    pluginStorage = ctx.storage
    hostPreferences = ctx.hostPreferences || null
    openExternal = url => ctx.os.openExternal(url)
    pluginRest = (path, options) => ctx.rest(path, options)
    restControl = (action, argument) =>
      ctx.rest('/control', {
        method: 'POST',
        body: { action, argument }
      })

    registerPlayerPane = contribution => ctx.register(contribution)
    registeredPaneMode = null
    const savedPlayerPreferences = playerPreferences(pluginStorage?.get('playerPreferences'))
    updatePlayerPane(savedPlayerPreferences.mode, 1, 0, savedPlayerPreferences.style)

    ctx.register({
      id: 'persistent-status',
      area: 'statusBar.right',
      order: 115,
      render: () => jsx(SpotifyStatusBar, {})
    })

    ctx.register({
      id: 'search',
      area: PALETTE_AREA,
      data: {
        id: 'spotify.search',
        label: 'Spotify: Search music',
        keywords: ['spotify', 'music', 'song', 'artist', 'album', 'playlist'],
        run: () => $searchOpen.set(true)
      }
    })
  }
}
