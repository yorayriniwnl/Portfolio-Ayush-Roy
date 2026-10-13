# Pastel Workstation Room Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose and polish the existing 3D workstation so its rendered layout and finishes follow the supplied pastel gaming-room reference.

**Architecture:** Keep the structural room and authored workstation GLBs. Adjust the cloned workstation scene in `YorWorldShowcaseScene.tsx`, and use `StudioReferenceDressing.tsx` for lightweight physical props and room accents. Preserve the current camera, avatar, door and accessible interaction system.

**Tech Stack:** Next.js 16.3.8, React 19.2.8, React Three Fiber 9.7.0, Three.js 0.185.1.

**Spec:** `docs/superpowers/specs/2026-10-13-pastel-workstation-room-design.md`

## Global Constraints

- Keep `public/models/yor-world-room.glb` as the structural room and preserve the existing camera, door, avatar, and interaction rig.
- Keep changes within the existing Three.js/React Three Fiber stack; add no package or external model dependency unless implementation evidence shows the current scene cannot meet the accepted visual direction.
- Prefer shared geometry and materials, selective lighting, and lightweight detail.
- Preserve the supplied reference's broad desk and central monitor, near-right blue gaming chair, right-side PC and controller pegboard, left-side shelves and plants, pink-violet hex lights, and saturated blue floor.
- Maintain the project's viewport matrix: 375×812, 390×844, 430×932, 768×1024, 1024×768, 1280×720, 1440×900, 1728×1117, 1920×1080, and 2560×1440.
- Preserve existing accessible room controls, semantic content without WebGL, reduced-motion behavior, and renderer-failure fallback.
- Do not introduce hover-only actions; preserve the existing authored entry, camera transitions, and object-interaction behavior. The provided `.mov` is unavailable, so it does not define motion requirements.
- Keep the portfolio shell, copy, project order, routes, metadata, and production domain unchanged during this branch review.

## Review Focus

- **Desktop reference view:** PC on the right below the pegboard, monitor centered at about 42–45% of room-frame width, chair in the near-right foreground, and no main object clipped. Task 1 includes a render comparison at 1440×900 and 1920×1080.
- **Portrait mobile:** At 390×844, all five main anchors remain identifiable and the monitor, PC, or chair does not cover the touch controls. Task 1 includes a render comparison at 390×844 and 430×932.
- **Dressing after PC relocation:** The left foreground plant remains clear of the case and the right-side gamepads remain in front of the pegboard. Task 2 includes a rendered view check at 1440×900.
- **Dimmed lighting:** With studio lights dimmed, materials retain readable color and the hex panels do not bloom into white blocks. Task 3 checks both light states.
- **Reduced motion or WebGL failure:** Semantic portfolio content and the existing accessible controls remain usable. Task 3 checks the current fallback paths without changing their behavior.

---

### Task 1: Recompose the reference workstation

**Files:**
- Modify: `src/components/experience/YorWorldShowcaseScene.tsx`

**Interfaces:**
- Consumes: the cloned `workstation-sample-root` scene and its named `helios-pc`, `monitor_bezel`, `monitor_rear_housing`, `monitor_screen_mesh`, `lightbar_chassis`, `lightbar_diffuser_lens`, and `lightbar_mount_clamp` nodes; the authored `Camera_ReferenceMatch`, `Camera_HomeDesktop`, and `Camera_HomeMobile` poses.
- Produces: a default workstation composition with the monitor centered, the PC on the right under the pegboard, and the existing chair retained in the near-right foreground.

- [x] **Step 1: Move the authored PC back to the reference's right side.** Set the cloned `helios-pc` to `(1.02, 0.98, -1.15)` instead of `(-1.02, 0.98, -1.15)`. Update the fan-light overlay call's `pcX` to `1.02` so its lights stay aligned to the case.
- [x] **Step 2: Enlarge the screen and lightbar together.** Change the current `scale.x = 1.4` for the six named display/lightbar meshes to `scale.x = 2.0`; leave the monitor stand, camera-independent hit behavior, and vertical scale unchanged. The desktop render target is approximately 42–45% of the 4:3 room-frame width.
- [x] **Step 3: Fit the composition across the three authored camera poses.** Keep the 1600px desktop breakpoint and source GLB transforms. Select `Camera_HomeDesktop` from the browser width because the room canvas is capped at 112svh; otherwise wide screens never reach the 1600px threshold. The `Camera_ReferenceMatch` pose receives a 3° field-of-view increase and a 10° upward runtime pitch; `Camera_HomeDesktop` receives a 6° upward pitch so the pegboard and full workstation composition remain in frame. Keep the authored eye positions and portrait camera orientation unchanged.
- [x] **Step 4: Inspect the rendered result.** Compared the default workstation frame at 1440×900, 1920×1080, 390×844, and 430×932 with the attached image. The PC reads on the right, the monitor remains the focal point, the chair stays legible, and mobile touch controls remain clear.
- [x] **Step 5: Commit and push this task.** Use `feat: align workstation composition to pastel reference` and push `feat/reference-framed-pastel-room-20261011`.

### Task 2: Correct the foreground plant and pegboard dressing

**Files:**
- Modify: `src/components/experience/StudioReferenceDressing.tsx`
- Modify: `src/components/experience/YorWorldShowcaseScene.tsx`

**Interfaces:**
- Consumes: the existing `lightsOn`, `onOpenComputer`, `onExplore`, and `includeFloorPlant` props and the authored room coordinates.
- Produces: broad-leaf foreground foliage at the left and two clearly visible gamepads mounted on the right pegboard; preserves the existing shelf books, headset, trailing vines, and light toggle.

- [x] **Step 1: Move the custom floor plant to the left foreground.** Render checks showed x=`-1.45` was outside the authored camera frames. Place `FloorPlant` at `(-1.0, 0, -0.65)` so the plant is visible in the lower-left of both desktop and portrait views, clear of the relocated PC and chair.
- [x] **Step 2: Replace the narrow upright leaves with broad overlapping foliage.** Keep the existing generated geometry and materials; shape a compact cluster of broad leaves that reads as the leafy foreground plant in the supplied reference rather than a row of cactus-like leaves.
- [x] **Step 3: Add the missing microphone boom in the focus view.** Add an optional `showBoomMicrophone` prop to `StudioReferenceDressing`; when enabled, render a desk clamp, two hinged arms, shock mount, and dark capsule at the monitor's front-left. Enable it only from `AuthoredWorkstationView`, and hide its cloned authored mic boom, capsule, pop filter, and clamp meshes to avoid overlap. The full-room view keeps its authored microphone.
- [x] **Step 4: Make both pegboard controllers readable.** Keep the existing 1.25× `Controller` groups at `y=1.66` and `y=1.40`, rotate their faces toward the room along the pegboard's X-facing plane, and place them at `(1.30, y, -0.99)` inside the panel bounds. Move the headset to `(1.25, 1.28, -1.25)` so it hangs to the panel's left and the desktop camera keeps the full set in frame. Retain the pastel accents and click interaction. Keep the existing `ai-real-camera` visible on the upper-left shelf; do not add a duplicate camera.
- [x] **Step 5: Inspect the rendered dressing.** Rendered views at 1440×900 and 390×844 show the plant in the lower-left foreground, both controllers beside the headset, and the boom arm beside the monitor. Touch controls remain below and clear of the room frame.
- [x] **Step 6: Commit and push this task.** Use `feat: complete workstation foreground and pegboard dressing` and push the feature branch.

### Task 3: Refine chair upholstery and pastel lighting

**Files:**
- Modify: `src/components/experience/YorWorldShowcaseScene.tsx`
- Modify: `src/components/experience/StudioReferenceDressing.tsx`

**Interfaces:**
- Consumes: the existing `ReferenceGamingChair`, room lights, `lightsOn` state, and the existing scene-level material and shadow settings.
- Produces: a softer, padded blue chair and a balanced lilac, cyan, and warm monitor-light mix that remains controlled when room lights are dimmed.

- [x] **Step 1: Give the chair cushions a padded silhouette.** Refine the current rounded back, side bolsters, headrest, seat, and lumbar cushion geometry so the layers read as upholstered cushions at the default camera angle; preserve the chair's footprint, gas lift, arms, casters, and avatar navigation click target.
- [x] **Step 2: Adjust upholstery and trim materials.** Use matte fabric-like roughness for the blue cushion meshes, retain the light shell and cyan piping, and keep seams visible without making the chair look metallic or plastic.
- [x] **Step 3: Balance the scene lights.** Tune the existing violet, cyan, and warm point lights and hex-panel emission so the room reads pastel rather than grey, while the monitor and hex panels retain detail at both `lightsOn` values.
- [x] **Step 4: Inspect the full viewport matrix and preserved controls.** Capture the default workstation view at every size in the global matrix; check the full-scene and mobile compositions, the dim/lit transition, visible touch controls, and the existing no-WebGL/reduced-motion content paths. Do not add or run automated tests as part of this visual pass.
- [x] **Step 5: Commit and push this task.** Use `feat: polish workstation upholstery and pastel lighting` and push the feature branch.
