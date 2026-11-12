# Orbit

A browser-based graphing tool for multivariable calculus.

[Open Orbit](https://orbit-graph-studio.pianoabhilash894720.chatgpt.site/)

## Graph types

- Explicit surfaces: `z = sin(x)cos(y)`
- Parametric surfaces: `r(u,v) = ⟨x(u,v), y(u,v), z(u,v)⟩`
- Space curves: `r(t) = ⟨2cos(t), 2sin(t), t⟩`
- Implicit surfaces: `x² + y² + z² = 9`
- Vector fields: `F(x,y,z) = ⟨-y, x, sin(z)⟩`

Expressions accept implicit multiplication and a supported subset of LaTeX, including fractions, roots, powers, and trigonometric functions. MathML displays formatted previews.

## Calculus tools

Explicit surfaces include approximate partial derivatives, tangent planes, and adjustable level curves. Objects can be named, recolored, and duplicated. Curves include tangent vectors, speed, and numerical arc length. Adaptive curve sampling leaves gaps around detected undefined values and large jumps.

Use the animation parameter `a` in any expression. Camera controls include rotation, zoom, fit-to-scene, and XY/XZ/YZ views.

## Scene files

Save scene downloads a `.json` file containing equations, parameter ranges, inspection settings, and the camera view. Open scene accepts JSON files and legacy `.abhilash` scenes. The editor also accepts pasted scene-file text.

The format is versioned, UTF-8 JSON. Files are validated before loading. Scene files contain data, not executable code.

## Run locally

No build step or external frontend dependencies are required.

```sh
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`.

## Tests

Node.js 20 or later is required.

```sh
npm test
```

Tests cover expression evaluation, malformed input, geometry sampling, numerical derivatives, arc-length estimates, and scene-file round trips. Browser testing is separate from these checks.

## Implementation

The app uses HTML, CSS, and JavaScript. Canvas 2D draws projected 3D geometry. Expressions are parsed by a restricted parser without JavaScript evaluation. Browser storage keeps the current equations between visits.

## Numerical limits

This is a numerical visualization tool. Implicit surfaces are approximated on a finite grid; small features, tangent zero sets, and discontinuities may be missed. Adaptive curve sampling reduces false connections but does not prove continuity. Arc lengths and derivatives are estimates. Vector lengths are compressed for display. Canvas depth sorting can produce artifacts where surfaces overlap.
