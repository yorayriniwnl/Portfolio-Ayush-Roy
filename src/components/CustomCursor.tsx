"use client";

import { useEffect, useRef } from "react";
import styles from "./CustomCursor.module.css";

const INTERACTIVE_SELECTOR =
  'a[href], button:not(:disabled), [role="button"], input[type="button"], input[type="submit"], input[type="reset"], summary, select';
const TEXT_CONTROL_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable]:not([contenteditable="false"])';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLSpanElement>(null);
  const pointRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const orbit = orbitRef.current;
    const point = pointRef.current;
    if (!cursor || !orbit || !point) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let targetX = 0;
    let targetY = 0;
    let ringX = 0;
    let ringY = 0;
    let animationFrame = 0;
    let previousX: number | null = null;
    let previousY = 0;

    const place = (element: HTMLElement, x: number, y: number) => {
      element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const animateRing = () => {
      ringX += (targetX - ringX) * 0.28;
      ringY += (targetY - ringY) * 0.28;
      place(orbit, ringX, ringY);

      if (Math.abs(targetX - ringX) > 0.1 || Math.abs(targetY - ringY) > 0.1) {
        animationFrame = window.requestAnimationFrame(animateRing);
      } else {
        ringX = targetX;
        ringY = targetY;
        place(orbit, ringX, ringY);
        animationFrame = 0;
      }
    };

    const hideCursor = () => {
      cursor.dataset.visible = "false";
      cursor.dataset.hovered = "false";
      cursor.dataset.pressed = "false";
      previousX = null;
      previousY = 0;
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
      if (previousX !== null) {
        const deltaX = event.clientX - previousX;
        const deltaY = event.clientY - previousY;
        if (Math.hypot(deltaX, deltaY) > 0.5) {
          cursor.style.setProperty("--cursor-angle", `${Math.atan2(deltaY, deltaX)}rad`);
        }
      }
      previousX = event.clientX;
      previousY = event.clientY;
      targetX = event.clientX;
      targetY = event.clientY;
      place(point, targetX, targetY);
      if (!wasVisible) {
        ringX = targetX;
        ringY = targetY;
        place(orbit, ringX, ringY);
      }
      if (!animationFrame) animationFrame = window.requestAnimationFrame(animateRing);
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
      <span ref={orbitRef} className={styles.orbitAnchor}>
        <span className={styles.orbit} />
      </span>
      <span ref={pointRef} className={styles.point} />
    </div>
  );
}
