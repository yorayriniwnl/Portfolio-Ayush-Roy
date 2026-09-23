"use client";

import { useEffect, useRef } from "react";
import styles from "./CustomCursor.module.css";

const INTERACTIVE_SELECTOR =
  'a[href], button:not(:disabled), [role="button"], input[type="button"], input[type="submit"], input[type="reset"], summary, select';
const TEXT_CONTROL_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable]:not([contenteditable="false"])';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const gauntletRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const arrow = arrowRef.current;
    const gauntlet = gauntletRef.current;
    const glow = glowRef.current;
    if (!cursor || !arrow || !gauntlet || !glow) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let targetX = 0;
    let targetY = 0;
    let glowX = 0;
    let glowY = 0;
    let animationFrame = 0;

    const place = (element: HTMLElement, x: number, y: number, hotspotX = 0, hotspotY = 0) => {
      element.style.transform = `translate3d(${x - hotspotX}px, ${y - hotspotY}px, 0)`;
    };

    const placeGlow = (x: number, y: number) => {
      glow.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const animateGlow = () => {
      glowX += (targetX - glowX) * 0.22;
      glowY += (targetY - glowY) * 0.22;
      placeGlow(glowX, glowY);

      if (Math.abs(targetX - glowX) > 0.1 || Math.abs(targetY - glowY) > 0.1) {
        animationFrame = window.requestAnimationFrame(animateGlow);
      } else {
        glowX = targetX;
        glowY = targetY;
        placeGlow(glowX, glowY);
        animationFrame = 0;
      }
    };

    const hideCursor = () => {
      cursor.dataset.visible = "false";
      cursor.dataset.hovered = "false";
      cursor.dataset.pressed = "false";
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      delete document.body.dataset.customCursor;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType === "touch") {
        hideCursor();
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(TEXT_CONTROL_SELECTOR)) {
        hideCursor();
        return;
      }

      const wasVisible = cursor.dataset.visible === "true";
      targetX = event.clientX;
      targetY = event.clientY;
      place(arrow, targetX, targetY, 6, 1);
      place(gauntlet, targetX, targetY, 13, 1);
      if (!wasVisible) {
        glowX = targetX;
        glowY = targetY;
        placeGlow(glowX, glowY);
      }
      if (!animationFrame) animationFrame = window.requestAnimationFrame(animateGlow);
      cursor.dataset.visible = "true";
      cursor.dataset.hovered = String(Boolean(target?.closest(INTERACTIVE_SELECTOR)));
      document.body.dataset.customCursor = "active";
    };

    const handlePointerDown = () => {
      if (cursor.dataset.visible === "true") cursor.dataset.pressed = "true";
    };

    const handlePointerUp = () => {
      cursor.dataset.pressed = "false";
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) hideCursor();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") hideCursor();
    };

    const handlePreferenceChange = () => {
      if (!finePointer.matches || reducedMotion.matches) hideCursor();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("blur", hideCursor);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    finePointer.addEventListener("change", handlePreferenceChange);
    reducedMotion.addEventListener("change", handlePreferenceChange);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", hideCursor);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      finePointer.removeEventListener("change", handlePreferenceChange);
      reducedMotion.removeEventListener("change", handlePreferenceChange);
      hideCursor();
    };
  }, []);

  return (
    <div ref={cursorRef} className={styles.cursor} aria-hidden="true" data-visible="false" data-hovered="false" data-pressed="false">
      <span ref={glowRef} className={styles.glow} />
      <span ref={arrowRef} className={`${styles.asset} ${styles.arrow}`} />
      <span ref={gauntletRef} className={`${styles.asset} ${styles.gauntlet}`} />
    </div>
  );
}
