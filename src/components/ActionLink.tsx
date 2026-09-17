import Link from "next/link";
import styles from "./ActionLink.module.css";

type ActionLinkProps = {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
  external?: boolean;
};

export function ActionLink({ href, children, primary = false, external = false }: ActionLinkProps) {
  const className = `${styles.link} ${primary ? styles.primary : ""}`;

  if (external) {
    return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  }

  return <Link className={className} href={href}>{children}</Link>;
}
