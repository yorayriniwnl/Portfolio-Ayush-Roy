"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./SiteNav.module.css";

const links = [["Discover", "/#products"], ["Arcade", "/#games"], ["Watch", "/#videos"], ["About", "/#about"]] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", handleKey);
    return () => removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (wasOpen.current && !open) menuRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link className={styles.mark} href="/" aria-label="Ayush Roy home"><b>Y</b>OR / AYUSH ROY</Link>
        <nav className={styles.links} aria-label="Primary">{links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}<Link href="/#contact">Contact</Link><Link className={styles.resume} href="/resume">Resume</Link></nav>
        <button ref={menuRef} className={styles.menu} onClick={() => setOpen((value) => !value)} aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="mobile-nav"><span aria-hidden>{open ? "×" : "☰"}</span><span className="sr-only">Menu</span></button>
      </div>
      <nav id="mobile-nav" className={styles.mobile} data-open={open} aria-label="Mobile primary">{links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}<Link href="/#contact" onClick={() => setOpen(false)}>Contact</Link><Link href="/resume" onClick={() => setOpen(false)}>Resume</Link></nav>
    </header>
  );
}
