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
const $searchOpen = atom(false)
const $authOpen = atom(false)
let pluginRest = null
let pluginStorage = null
let restControl = null

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

// Nokie's engaged perimeter, adapted to host tokens and finite animation.
const PLAYER_CSS = `
.spotify-surface{position:relative;isolation:isolate;border:1px solid transparent;border-radius:8px}
.spotify-surface:focus-within{border-color:var(--ui-accent);box-shadow:0 0 0 1px color-mix(in srgb,var(--ui-accent) 70%,transparent),0 0 12px color-mix(in srgb,var(--ui-accent) 26%,transparent);animation:spotify-engaged-perimeter 1.7s ease-in-out 1}
@keyframes spotify-engaged-perimeter{50%{box-shadow:0 0 0 1px var(--ui-text-secondary),0 0 18px color-mix(in srgb,var(--ui-accent) 36%,transparent)}}
.spotify-loader{display:inline-flex;gap:3px;align-items:center;height:18px;color:var(--ui-accent)}
.spotify-loader i{display:block;width:3px;height:12px;background:currentColor;border-radius:2px;animation:spotify-loader-step .9s ease-in-out infinite alternate}
.spotify-loader i:nth-child(2){animation-delay:.15s}.spotify-loader i:nth-child(3){animation-delay:.3s}
@keyframes spotify-loader-step{from{transform:scaleY(.35);opacity:.4}to{transform:scaleY(1);opacity:1}}

.spotify-range{width:100%;min-width:0;accent-color:var(--ui-accent)}
.spotify-surface button{min-height:28px;height:28px;min-width:28px}
.spotify-view-tabs{display:flex;align-items:center;gap:4px;flex-shrink:0;height:28px;margin-bottom:6px;border-bottom:1px solid var(--ui-stroke-secondary)}
.spotify-view-tabs button{font-size:11px;font-weight:500;border-radius:0;padding:0 8px;background:transparent;color:var(--ui-text-tertiary)}
.spotify-view-tabs button[aria-selected=true]{color:var(--ui-text-primary);box-shadow:inset 0 -2px var(--ui-accent)}
.spotify-view-tabs button:last-child{margin-left:auto}
.spotify-artwork{display:block;min-height:0;max-height:192px;width:100%;flex:1;object-fit:cover;border-radius:5px}
.spotify-controls{display:flex;align-items:center;gap:4px;margin-top:4px;flex-shrink:0}
.spotify-metal-control{position:relative;display:inline-flex;flex-shrink:0}
.spotify-metal-control>button{border-radius:50%}
.spotify-metal{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:50%}
.spotify-metal canvas{display:block;width:100%;height:100%}
.spotify-volume{display:flex;align-items:center;gap:6px;margin-left:auto;width:108px;min-width:64px;font-size:10px;color:var(--ui-text-tertiary)}
.spotify-volume .spotify-range{flex:1;width:0;height:18px;margin:0}

.spotify-standard-top{display:grid;grid-template-columns:40px minmax(0,1fr);gap:4px 8px;align-items:center}
.spotify-standard-top>:first-child{width:40px;height:40px}
.spotify-standard-top>:last-child{grid-column:1/-1;justify-content:flex-end}
.spotify-surface[data-visible=false],.spotify-surface[data-visible=false] *{animation:none!important}
@media(prefers-reduced-motion:reduce){.spotify-surface,.spotify-loader i{animation:none!important}.spotify-surface *{scroll-behavior:auto!important}}
`

function FactoryLoader({ label = 'Loading Spotify' }) {
  return jsx('span', { role: 'status', 'aria-label': label, className: 'spotify-loader', children: [0, 1, 2].map(i => jsx('i', { 'aria-hidden': true }, i)) })
}

function signalAllowed(enabled, visible, playing, reducedMotion) {
  return enabled && visible && playing && !reducedMotion
}

function MetalArtifact({ enabled, visible, playing }) {
  const ref = useRef(null)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [available, setAvailable] = useState(true)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
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

function NativeRange({ label, value, max, disabled, onCommit }) {
  const [draft, setDraft] = useState(value)
  const editing = useRef(false)
  const sent = useRef(value)
  useEffect(() => { if (!editing.current) { setDraft(value); sent.current = value } }, [value])
  const commit = event => {
    editing.current = false
    const next = Number(event.currentTarget.value)
    if (next === sent.current) return
    sent.current = next
    onCommit(String(next))
  }
  return jsx('input', { type: 'range', className: 'spotify-range', 'aria-label': label,
    min: 0, max: Math.max(1, max), step: 1, value: Math.min(draft, max), disabled,
    onChange: event => { editing.current = true; setDraft(Number(event.target.value)) },
    onPointerUp: commit, onBlur: commit,
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
    if (!scroller || !activeLine) return
    const reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const top = Math.max(0, activeLine.offsetTop - (scroller.clientHeight - activeLine.offsetHeight) / 2)
    scroller.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [active.lineIndex])

  if (!lines.length) {
    return jsx('div', {
      className: 'min-h-0 flex-1 overflow-y-auto whitespace-pre-line rounded-lg bg-(--ui-bg-secondary) px-3 py-2 text-center text-sm leading-6 text-(--ui-text-secondary)',
      children: plainLyrics
    })
  }

  return jsx('div', {
    'aria-label': 'Synced lyrics',
    className: 'relative min-h-0 flex-1 overflow-y-auto rounded-lg bg-(--ui-bg-secondary) px-3 py-8 text-center text-sm leading-6',
    ref: scrollerRef,
    children: lines.map((line, lineIndex) => {
      const isActiveLine = lineIndex === active.lineIndex
      return jsx('div', {
        className: 'py-1',
        ref: element => { lineRefs.current[lineIndex] = element },
        style: {
          color: 'var(--ui-text-secondary)',
          opacity: isActiveLine ? 1 : 0.38,
          transition: 'opacity 220ms ease'
        },
        children: line.words.map((word, wordIndex) => {
          const isActiveWord = isActiveLine && wordIndex === active.wordIndex
          return jsx('span', {
            style: {
              color: isActiveWord ? 'var(--ui-text-primary)' : 'var(--ui-text-secondary)',
              fontWeight: isActiveWord ? 500 : 400,
              opacity: isActiveWord ? 1 : isActiveLine ? 0.62 : 1,
              transition: 'color 180ms ease, opacity 180ms ease, font-weight 180ms ease'
            },
            children: word
          }, `${lineIndex}-${wordIndex}`)
        })
      }, `${line.startSeconds}-${lineIndex}`)
    })
  })
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

function nextPlayerDisplayMode(currentMode, measuredHeight) {
  const height = Number(measuredHeight) || 152
  if (currentMode === 'compact') return height > 112 ? 'default' : 'compact'
  if (currentMode === 'expanded') return height < 244 ? 'default' : 'expanded'
  if (height < 96) return 'compact'
  if (height > 276) return 'expanded'
  return 'default'
}

function NativePlayer() {
  const [player, setPlayer] = useState({ running: false, state: 'loading' })
  const [savedState, setSavedState] = useState({ uri: '', status: 'idle', saved: null })
  const [libraryBusy, setLibraryBusy] = useState(false)
  const [playlistOpen, setPlaylistOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [displayMode, setDisplayMode] = useState('default')
  const [activeExpandedView, setActiveExpandedView] = useState('artwork')
  const [effects, setEffects] = useState(() => pluginStorage?.get('visualEffects') === true)
  const toggleEffects = () => setEffects(current => { pluginStorage?.set('visualEffects', !current); return !current })
  const [lyrics, setLyrics] = useState('')
  const [syncedLyrics, setSyncedLyrics] = useState('')
  const [lyricsState, setLyricsState] = useState('idle')
  const containerRef = useRef(null)
  const visible = useSurfaceVisible(containerRef)
  const statusQuery = useNativeStatus()
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
    const element = containerRef.current
    if (!element || typeof ResizeObserver === 'undefined') return undefined
    const viewport = element.parentElement
    if (!viewport) return undefined
    let frameId = 0
    const observer = new ResizeObserver(entries => {
      const nextHeight = Math.round(entries[0]?.contentRect?.height || viewport.clientHeight || 152)
      if (frameId) globalThis.cancelAnimationFrame(frameId)
      frameId = globalThis.requestAnimationFrame(() => {
        frameId = 0
        setDisplayMode(currentMode => nextPlayerDisplayMode(currentMode, nextHeight))
      })
    })
    observer.observe(viewport)
    return () => {
      observer.disconnect()
      if (frameId) globalThis.cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const uri = player.spotifyUrl || ''
    if (!uri) {
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
  }, [player.spotifyUrl])

  useEffect(() => {
    let cancelled = false
    setLyrics('')
    setSyncedLyrics('')
    setLyricsState('idle')
    if (!visible || displayMode !== 'expanded' || activeExpandedView !== 'lyrics' || !player.title || !player.artist || !player.durationMs) return undefined
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
        if (!cancelled) setLyricsState('missing')
      })
    return () => {
      cancelled = true
    }
  }, [visible, displayMode, activeExpandedView, player.title, player.artist, player.album, player.durationMs])

  const toggleSaved = async () => {
    const uri = player.spotifyUrl || ''
    if (!uri || libraryBusy || !savedReady) return
    const desiredSaved = !savedState.saved
    setLibraryBusy(true)
    try {
      const snapshot = await runNativeSpotify('set-saved', JSON.stringify({ uri, saved: desiredSaved }))
      if (snapshot.uri !== uri) throw new Error('Spotify returned liked status for a different track.')
      setSavedState({ uri, status: 'ready', saved: Boolean(snapshot.saved) })
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
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'Spotify command failed.'
      setError(message)
      host.notify({ kind: 'error', message })
    } finally {
      setBusy(false)
    }
  }

  const isPlaying = player.state === 'playing'
  const durationSeconds = Number(player.durationMs || 0) / 1000
  const progress = durationSeconds > 0 ? Math.min(100, (Number(player.positionSeconds || 0) / durationSeconds) * 100) : 0
  const status = error
    ? { label: 'Unavailable', tone: 'bad' }
    : player.running
      ? { label: isPlaying ? 'Playing' : 'Paused', tone: isPlaying ? 'good' : 'muted' }
      : { label: 'Spotify app closed', tone: 'warn' }
  const savedReady = Boolean(player.spotifyUrl) && savedState.uri === player.spotifyUrl && savedState.status === 'ready'
  const saved = savedReady && savedState.saved === true
  const savedControlLabel = savedReady
    ? saved ? 'Remove from Liked Songs' : 'Add to Liked Songs'
    : savedState.status === 'error' ? 'Liked status unavailable' : 'Checking Liked Songs status'
  const savedAriaLabel = savedReady
    ? saved ? 'Unlike current track' : 'Like current track'
    : savedControlLabel
  if (displayMode === 'compact') {
    return jsxs('section', {
      ref: containerRef,
      'data-visible': visible,
      className: 'spotify-surface flex h-full min-h-0 items-center gap-1.5 overflow-hidden px-2 py-1',
      children: [
        jsx('style', { children: PLAYER_CSS }),
        jsxs('div', {
          className: 'min-w-0 flex-1',
          children: [
            jsx('div', {
              className: 'truncate text-xs font-medium',
              title: player.title || '',
              children: player.title || (player.running ? 'Nothing selected' : 'Open Spotify')
            }),
            jsxs('div', {
              className: 'flex min-w-0 items-center gap-1 text-[0.625rem] text-(--ui-text-tertiary)',
              children: [
                jsx('span', { className: 'truncate', children: player.artist || status.label }),
                jsx('span', { children: '·' }),
                jsx('span', { className: 'shrink-0 tabular-nums', children: `${formatTime(player.positionSeconds)} / ${formatTime(durationSeconds)}` })
              ]
            })
          ]
        }),
        jsxs('div', {
          className: 'flex shrink-0 items-center gap-0.5',
          children: [
            jsx(Button, {
              'aria-label': 'Previous track',
              disabled: busy || !player.running,
              onClick: () => void act('previous'),
              size: 'icon-sm',
              type: 'button',
              variant: 'ghost',
              children: jsx(icons.ChevronLeft, {})
            }),
            jsx(Button, {
              'aria-label': isPlaying ? 'Pause Spotify' : 'Play Spotify',
              disabled: busy,
              onClick: () => void act('playpause'),
              size: 'icon-sm',
              type: 'button',
              children: jsx(isPlaying ? icons.Pause : icons.Play, {})
            }),
            jsx(Button, {
              'aria-label': 'Next track',
              disabled: busy || !player.running,
              onClick: () => void act('next'),
              size: 'icon-sm',
              type: 'button',
              variant: 'ghost',
              children: jsx(icons.ChevronRight, {})
            })
          ]
        }),
        jsx(SpotifyPlaylistDialog, { open: playlistOpen, onOpenChange: setPlaylistOpen, track: player })
      ]
    })
  }

  if (displayMode === 'expanded') {
    const lyricsMessage = lyricsState === 'loading'
      ? 'Loading lyrics…'
      : lyricsState === 'instrumental'
        ? 'This track is instrumental.'
        : lyricsState === 'missing'
          ? 'Lyrics are not available for this track.'
          : lyrics

    return jsxs('section', {
      ref: containerRef,
      'data-visible': visible,
      className: 'spotify-surface flex h-full min-h-0 flex-col overflow-hidden p-2',
      children: [
        jsx('style', { children: PLAYER_CSS }),
        jsxs('div', {
          'aria-label': 'Expanded player view',
          className: 'spotify-view-tabs',
          role: 'tablist',
          children: [
            jsx(Button, {
              'aria-selected': activeExpandedView === 'artwork',
              className: 'shrink-0',
              onClick: () => setActiveExpandedView('artwork'),
              role: 'tab',
              size: 'xs',
              type: 'button',
              variant: activeExpandedView === 'artwork' ? 'secondary' : 'ghost',
              children: 'Artwork'
            }),
            jsx(Button, {
              'aria-selected': activeExpandedView === 'lyrics',
              className: 'shrink-0',
              onClick: () => setActiveExpandedView('lyrics'),
              role: 'tab',
              size: 'xs',
              type: 'button',
              variant: activeExpandedView === 'lyrics' ? 'secondary' : 'ghost',
              children: 'Lyrics'
            }),
            jsx(Button, { 'aria-label': effects ? 'Disable visual effects' : 'Enable visual effects', 'aria-pressed': effects, onClick: toggleEffects, variant: 'ghost', size: 'xs', children: effects ? 'FX on' : 'FX off' })
          ]
        }),
        activeExpandedView === 'artwork'
          ? player.artworkUrl
            ? jsx('img', {
                alt: player.album ? `${player.album} cover` : 'Album cover',
                className: 'spotify-artwork',
                src: player.artworkUrl
              })
            : jsx('div', {
                className: 'flex min-h-0 flex-1 items-center justify-center rounded-lg bg-(--ui-bg-secondary) text-(--ui-text-quaternary)',
                children: jsx(icons.AudioLines, { className: 'size-10' })
              })
          : lyricsState === 'loading'
            ? jsx('div', {
                className: 'flex min-h-0 flex-1 items-center justify-center',
                children: jsx(FactoryLoader, { label: 'Loading lyrics' })
              })
            : lyricsState === 'ready' && syncedLyrics
              ? jsx(SyncedLyrics, {
                  durationSeconds,
                  isPlaying: isPlaying && visible,
                  plainLyrics: lyrics,
                  positionSeconds: player.positionSeconds,
                  syncedLyrics
                })
              : jsx('div', {
                  className: 'min-h-0 flex-1 overflow-y-auto whitespace-pre-line rounded-lg bg-(--ui-bg-secondary) px-3 py-2 text-center text-sm leading-6 text-(--ui-text-secondary)',
                  children: lyricsMessage
                }),
        jsxs('div', {
          className: 'mt-2 flex shrink-0 items-center gap-2',
          children: [
            jsxs('div', {
              className: 'min-w-0 flex-1',
              children: [
                jsx('div', { className: 'truncate text-sm font-semibold', children: player.title || 'Nothing selected' }),
                jsx('div', { className: 'truncate text-xs text-(--ui-text-secondary)', children: player.artist || status.label })
              ]
            }),
            jsx(Button, {
              'aria-label': savedAriaLabel,
              disabled: libraryBusy || !savedReady,
              onClick: () => void toggleSaved(),
              size: 'icon-sm',
              type: 'button',
              variant: 'ghost',
              children: jsx('span', { className: saved ? 'text-(--ui-accent)' : 'text-(--ui-text-tertiary)', children: saved ? '♥' : '♡', 'aria-label': savedAriaLabel })
            }),
            jsx(Button, {
              'aria-label': 'Add current track to playlist',
              disabled: !player.spotifyUrl,
              onClick: () => setPlaylistOpen(true),
              size: 'icon-sm',
              type: 'button',
              variant: 'ghost',
              children: jsx(icons.Plus, {})
            })
          ]
        }),
        jsxs('div', {
          className: 'mt-1 flex shrink-0 items-center gap-1.5 text-[0.625rem] text-(--ui-text-quaternary)',
          children: [
            jsx('span', { className: 'w-7 tabular-nums', children: formatTime(player.positionSeconds) }),
            jsx(NativeRange, { label: 'Seek Spotify', value: Number(player.positionSeconds || 0), max: durationSeconds, disabled: busy || !durationSeconds, onCommit: value => void act('seek', value) }),
            jsx('span', { className: 'w-7 text-right tabular-nums', children: formatTime(durationSeconds) })
          ]
        }),
        jsxs('div', {
          className: 'spotify-controls',
          children: [
            jsx(Button, { 'aria-label': 'Previous track', disabled: busy || !player.running, onClick: () => void act('previous'), size: 'icon-sm', type: 'button', variant: 'ghost', children: jsx(icons.ChevronLeft, {}) }),
            jsxs('span', { className: 'spotify-metal-control', children: [
              jsx(Button, { 'aria-label': isPlaying ? 'Pause Spotify' : 'Play Spotify', disabled: busy, onClick: () => void act('playpause'), size: 'icon-sm', type: 'button', children: jsx(isPlaying ? icons.Pause : icons.Play, {}) }),
              jsx(MetalArtifact, { enabled: effects, visible, playing: isPlaying })
            ] }),
            jsx(Button, { 'aria-label': 'Next track', disabled: busy || !player.running, onClick: () => void act('next'), size: 'icon-sm', type: 'button', variant: 'ghost', children: jsx(icons.ChevronRight, {}) }),
            jsxs('div', { className: 'spotify-volume', children: [jsx('span', { 'aria-hidden': true, children: 'Vol' }), jsx(NativeRange, { label: 'Spotify volume', value: Number(player.volume || 0), max: 100, disabled: busy || !player.running, onCommit: value => void act('volume', value) })] })
          ]
        }),
        jsx(SpotifyPlaylistDialog, { open: playlistOpen, onOpenChange: setPlaylistOpen, track: player })
      ]
    })
  }

  return jsxs('section', {
    ref: containerRef,
    'data-visible': visible,
    className: 'spotify-surface h-full min-h-0 overflow-hidden px-2 py-2',
    children: [
      jsx('style', { children: PLAYER_CSS }),
      jsxs('div', {
        className: 'spotify-standard-top',
        children: [
          player.artworkUrl
            ? jsx('img', {
                alt: player.album ? `${player.album} cover` : 'Album cover',
                className: 'size-14 shrink-0 rounded object-cover',
                src: player.artworkUrl
              })
            : jsx('div', {
                className: 'flex size-14 shrink-0 items-center justify-center rounded border border-(--ui-stroke-secondary) text-(--ui-text-quaternary)',
                children: jsx(icons.AudioLines, {})
              }),
          jsxs('div', {
            className: 'min-w-0 flex-1',
            children: [
              jsx('div', {
                className: 'truncate text-sm font-medium',
                title: player.title || '',
                children: player.title || (player.running ? 'Nothing selected' : 'Open Spotify to start listening')
              }),
              jsxs('div', {
                className: 'mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-(--ui-text-secondary)',
                title: error || status.label,
                children: [
                  jsx(StatusDot, { tone: status.tone }),
                  jsx('span', {
                    className: 'truncate',
                    title: player.artist || '',
                    children: player.artist || 'Spotify for macOS'
                  })
                ]
              })
            ]
          }),
          jsxs('div', {
            className: 'flex shrink-0 items-center gap-0.5',
            children: [
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
                label: savedControlLabel,
                children: jsx(Button, {
                  'aria-label': savedAriaLabel,
                  disabled: libraryBusy || !savedReady,
                  onClick: () => void toggleSaved(),
                  size: 'icon-sm',
                  type: 'button',
                  variant: 'ghost',
                  children: jsx('span', {
                    className: saved ? 'text-sm text-(--ui-accent)' : 'text-sm text-(--ui-text-tertiary)',
                    children: saved ? '♥' : '♡',
                    'aria-label': savedAriaLabel
                  })
                })
              }),
              jsx(Tip, {
                label: 'Add to playlist',
                children: jsx(Button, {
                  'aria-label': 'Add current track to playlist',
                  disabled: !player.spotifyUrl,
                  onClick: () => setPlaylistOpen(true),
                  size: 'icon-sm',
                  type: 'button',
                  variant: 'ghost',
                  children: jsx(icons.Plus, {})
                })
              }),
              jsx(Tip, {
                label: 'Previous track',
                children: jsx(Button, {
                  'aria-label': 'Previous track',
                  disabled: busy || !player.running,
                  onClick: () => void act('previous'),
                  size: 'icon-sm',
                  type: 'button',
                  variant: 'ghost',
                  children: jsx(icons.ChevronLeft, {})
                })
              }),
              jsx(Tip, {
                label: isPlaying ? 'Pause' : 'Play',
                children: jsx(Button, {
                  'aria-label': isPlaying ? 'Pause Spotify' : 'Play Spotify',
                  disabled: busy,
                  onClick: () => void act('playpause'),
                  size: 'icon-sm',
                  type: 'button',
                  children: jsx(isPlaying ? icons.Pause : icons.Play, {})
                })
              }),
              jsx(Tip, {
                label: 'Next track',
                children: jsx(Button, {
                  'aria-label': 'Next track',
                  disabled: busy || !player.running,
                  onClick: () => void act('next'),
                  size: 'icon-sm',
                  type: 'button',
                  variant: 'ghost',
                  children: jsx(icons.ChevronRight, {})
                })
              })
            ]
          })
        ]
      }),
      jsxs('div', {
        className: 'mt-1.5 flex items-center gap-1.5 text-[0.625rem] text-(--ui-text-quaternary)',
        children: [
          jsx('span', { className: 'w-7', children: formatTime(player.positionSeconds) }),
          jsx(NativeRange, { label: 'Seek Spotify', value: Number(player.positionSeconds || 0), max: durationSeconds, disabled: busy || !durationSeconds, onCommit: value => void act('seek', value) }),
          jsx('span', { className: 'w-7 text-right', children: formatTime(durationSeconds) })
        ]
      }),
      jsxs('div', { className: 'spotify-volume', children: [jsx('span', { 'aria-hidden': true, children: 'Vol' }), jsx(NativeRange, { label: 'Spotify volume', value: Number(player.volume || 0), max: 100, disabled: busy || !player.running, onCommit: value => void act('volume', value) })] }),
      jsx(SpotifyPlaylistDialog, {
        open: playlistOpen,
        onOpenChange: setPlaylistOpen,
        track: player
      })
    ]
  })
}

function SpotifyPlaylistDialog({ open, onOpenChange, track }) {
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
  }, [open])

  const addToPlaylist = async playlist => {
    if (!track.spotifyUrl || addingId) return
    setAddingId(playlist.id)
    setError('')
    try {
      await runNativeSpotify('playlist-add', JSON.stringify({
        playlistId: playlist.id,
        uri: track.spotifyUrl
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

  return jsx(Dialog, {
    open,
    onOpenChange,
    children: jsx(DialogContent, {
      className: 'max-w-sm gap-0 overflow-hidden p-0',
      children: jsxs('div', {
        children: [
          jsxs(DialogHeader, {
            className: 'border-b border-(--ui-stroke-secondary) px-4 py-3 text-left',
            children: [
              jsx(DialogTitle, { children: 'Add to playlist' }),
              jsx(DialogDescription, {
                children: track.title ? `${track.title} — ${track.artist || 'Spotify'}` : 'Choose a playlist.'
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
              : jsx('p', {
                  className: 'px-4 py-6 text-center text-sm text-(--ui-text-secondary)',
                  children: 'No playlists found.'
                }),
          error ? jsx('p', { className: 'px-4 pb-3 text-xs text-destructive', children: error }) : null
        ]
      })
    })
  })
}

function SpotifyAuthDialog() {
  const open = useValue($authOpen)
  const [auth, setAuth] = useState({
    loggedIn: false,
    clientConfigured: false,
    phase: 'idle',
    redirectUri: 'http://127.0.0.1:43827/spotify/callback'
  })
  const [clientId, setClientId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const refreshAuth = async () => {
    if (!pluginRest) return
    try {
      const snapshot = await pluginRest('/auth/status', { method: 'GET' })
      setAuth(snapshot)
      setError('')
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Could not read Spotify connection status.')
    }
  }

  useEffect(() => {
    if (!open) return undefined
    void refreshAuth()
    const interval = globalThis.setInterval(() => void refreshAuth(), 1200)
    return () => globalThis.clearInterval(interval)
  }, [open])

  const setOpen = next => {
    $authOpen.set(next)
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

  return jsx(Dialog, {
    open,
    onOpenChange: setOpen,
    children: jsx(DialogContent, {
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
                      jsx(DialogTitle, { children: connected ? 'Spotify connected' : 'Connect Spotify' }),
                      jsx('div', { className: 'mt-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-(--ui-text-tertiary)', children: 'Secure PKCE connection' })
                    ]
                  })
                ]
              }),
              jsx(DialogDescription, {
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
  const statusQuery = useNativeStatus(true)
  const player = statusQuery.data || { running: false, state: 'loading' }
  const error = statusQuery.error?.message || ''
  const commandBusy = useValue($commandBusy)

  const toggle = async () => {
    try {
      await runNativeSpotify('playpause')
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

function SpotifySearchDialog() {
  const open = useValue($searchOpen)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const setOpen = next => {
    $searchOpen.set(next)
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

  return jsx(Dialog, {
    open,
    onOpenChange: setOpen,
    children: jsx(DialogContent, {
      className: 'max-w-lg gap-0 overflow-hidden p-0',
      children: jsxs('form', {
        onSubmit: submit,
        children: [
          jsxs(DialogHeader, {
            className: 'border-b border-(--ui-stroke-secondary) px-4 py-3 text-left',
            children: [
              jsx(DialogTitle, { children: 'Search Spotify' }),
              jsx(DialogDescription, { children: 'Find a track, then click it to play.' })
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
                className: 'max-h-80 overflow-y-auto border-t border-(--ui-stroke-secondary) p-1.5',
                children: results.map(result =>
                  jsxs('button', {
                    'aria-label': `Play ${result.title} by ${result.artist}`,
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
  name: 'Spotify Player',
  defaultEnabled: true,
  register(ctx) {
    pluginStorage = ctx.storage
    pluginRest = (path, options) => ctx.rest(path, options)
    restControl = (action, argument) =>
      ctx.rest('/control', {
        method: 'POST',
        body: { action, argument }
      })

    ctx.register({
      id: 'native-side-pocket',
      area: 'panes',
      title: 'Spotify',
      data: {
        placement: 'left',
        collapsible: true,
        dock: { pane: 'sessions', pos: 'bottom' },
        height: '136px',
        minHeight: '68px',
        maxHeight: '520px'
      },
      render: () => jsx(SpotifyRightRail, {})
    })

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