"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ProjectDemoMode } from "@/content/projects";

type Props = { mode: ProjectDemoMode; art: string };

const LazyProjectDemo = dynamic(
  () => import("./ProjectDemo").then((module) => module.ProjectDemo),
  { ssr: false },
);

export function DeferredProjectDemo(props: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => typeof window !== "undefined" && !("IntersectionObserver" in window));

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { rootMargin: "240px 0px" });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef}>
      {visible ? <LazyProjectDemo {...props} /> : <div className="demo-placeholder">Interactive explanation loads when reached.</div>}
    </div>
  );
}
