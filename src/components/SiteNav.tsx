"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./SiteNav.module.css";

const links = [["Work", "/projects"], ["About", "/#about"], ["Lab", "/lab"], ["Resume", "/resume"]] as const;

function isCurrentPage(href: (typeof links)[number][1], pathname: string) {
  if (href === "/projects") return pathname === "/projects" || pathname.startsWith("/projects/");
  return href === pathname;
}

export function SiteNav() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  useEffect(() => {
    if (!wasOpen.current && open) firstLinkRef.current?.focus();
    if (wasOpen.current && !open) menuRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link className={styles.mark} href="/" aria-label="Ayush Roy home" aria-current={pathname === "/" ? "page" : undefined}><b>Y</b>OR / AYUSH ROY</Link>
        <nav className={styles.links} aria-label="Primary">
          {links.map(([label, href]) => <Link key={label} href={href} aria-current={isCurrentPage(href, pathname) ? "page" : undefined}>{label}</Link>)}
        </nav>
        <button ref={menuRef} className={styles.menu} type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="mobile-nav">
          <span aria-hidden="true">{open ? "×" : "☰"}</span>
        </button>
      </div>
      <nav id="mobile-nav" className={styles.mobile} data-open={open} aria-label="Mobile primary" aria-hidden={!open}>
        {links.map(([label, href], index) => (
          <Link
            key={label}
            ref={index === 0 ? firstLinkRef : undefined}
            href={href}
            aria-current={isCurrentPage(href, pathname) ? "page" : undefined}
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
