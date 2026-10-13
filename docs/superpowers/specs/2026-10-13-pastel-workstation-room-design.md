# Pastel Workstation Room — Design Specification

**Status:** Draft for user review
**Repository:** `Portfolio-Ayush-Roy`
**Branch:** `feat/reference-framed-pastel-room-20261011`
**Baseline:** `0598c7f3413a05708adca66fb2166a040d583c1d`

## Purpose

Refine the portfolio's existing interactive 3D workstation so its rendered composition, modeled detail, materials, and lighting closely follow the supplied pastel gaming-room image. The room remains a real Three.js experience and stays integrated with the current YOR portfolio.

The live page already presents the room and semantic portfolio sections. This design covers the room's next reference-alignment pass. The existing portfolio navigation, project copy, routes, and factual claims remain intact.

## Audience and success

The room introduces Ayush's workspace to portfolio visitors, including recruiters and engineers. The first visible composition should feel intentional and richly modeled, then let visitors discover the existing workstation, art, blinds, avatar, lights, and exit interactions.

Success requires a rendered room that is recognizably composed like the supplied image at desktop and mobile sizes. Green code checks alone do not establish visual completion.

## Visual direction

The supplied still is the primary visual reference: a soft-lit, pastel gaming workstation with a lilac and blue room, pale desk surfaces, cyan fill light, pink and violet hexagonal wall lights, and a saturated blue floor. Use a polished stylized-CGI finish with rounded silhouettes, layered materials, soft shadows, and controlled emissive accents.

The main view should preserve the reference's spatial hierarchy:

- A broad desk and wide central monitor anchor the scene.
- A padded blue gaming chair occupies the near right foreground.
- A PC tower and pegboard with headphones and controllers define the right side.
- Keyboard, mouse, microphone arm, camera, controllers, and small desk objects make the workstation read as used and specific.
- Wall shelves, books, planters, trailing vines, and foreground foliage fill the left and upper background.
- Hexagonal lights and the blue floor establish the room's pastel lighting and depth.

Model prominent forms to read clearly at the default camera angle. Avoid filling the scene with tiny props that do not improve the main composition. The reference is a direction for a coherent 3D room, not a replacement background image.

## Scope and boundaries

The existing portfolio shell and its server-rendered content remain unchanged. This pass focuses on the workstation room's geometry, materials, lighting, and camera framing. It does not change page copy, project order, routes, metadata, or the overall navigation system.

The repository's earlier `YOR // THE MACHINE` specification remains in force for site architecture, accessibility, semantic content, and factual accuracy. This newer reference supersedes its dark visual treatment only within the workstation room.

The provided `.mov` could not be opened because browser security blocks local-file URLs. Motion-only details from that clip are therefore unspecified; retain the existing authored entry, camera, and object-interaction behavior.

## Scene architecture and interaction

Keep `public/models/yor-world-room.glb` as the structural room and preserve the existing camera, door, avatar, and interaction rig. Extend the current React Three Fiber dressing in `src/components/experience/StudioReferenceDressing.tsx`; make scene-level camera and composition changes in `src/components/experience/YorWorldShowcaseScene.tsx` only where needed.

Preserve the existing interactions and their accessible page controls:

- Open the workstation.
- Open the blinds.
- Tilt the wall art.
- Greet the creator/avatar.
- Toggle the room lights.
- Navigate the desk, avatar, art, and door scene states, including leaving the scene.

Do not introduce hover-only actions. Essential portfolio content stays available without WebGL. Reduced-motion preferences skip ambient and cinematic scene motion, and renderer failures leave a readable semantic page with a clear way to continue.

## Responsive and rendering requirements

Frame the room deliberately for desktop and portrait/mobile views so the monitor, chair, wall features, and desk remain legible together. Maintain the project's established viewport matrix: 375×812, 390×844, 430×932, 768×1024, 1024×768, 1280×720, 1440×900, 1728×1117, 1920×1080, and 2560×1440.

Prefer shared geometry and materials, selective lighting, and lightweight detail. Keep changes within the existing Three.js/React Three Fiber stack; add no package or external model dependency unless implementation evidence shows the current scene cannot meet the accepted visual direction.

## Acceptance evidence

1. Render and inspect the reference-framed room at desktop and mobile sizes against the supplied still. The whole composition should be balanced, the prominent forms should be modeled rather than blockout-like, and important room features should not be clipped.
2. Capture the default workstation view and the full-scene view. Inspect lighting, object scale, depth, and prop placement in the actual rendered scene.
3. Confirm existing object interactions remain represented by visible, accessible controls and that the scene remains usable on touch devices without hover.
4. Confirm portfolio content remains readable when WebGL is unavailable or motion is reduced.
5. Keep the production domain unchanged during this feature-branch review. Commit scoped implementation changes to the current branch and push them for review; production release follows separate review of the preview.

## Implementation direction

Use the recommended hybrid approach: retain the authored room and interaction system, then refine the existing scene dressing and camera/light composition around the image's strongest visual anchors. Prioritize proportion and framing first, followed by chair and workstation form, wall organization, foliage, materials, and lighting. Do not substitute extra controls or a static render for visual work on the room itself.
