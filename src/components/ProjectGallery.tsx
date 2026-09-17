import Image from "next/image";
import type { ProjectMedia } from "@/content/projects";

export function ProjectGallery({ media }: { media: readonly ProjectMedia[] }) {
  if (!media.length) return null;

  return (
    <section className="case-section case-gallery" aria-labelledby="gallery-title">
      <div className="case-gallery-heading">
        <div>
          <span className="technical">Source visuals / repository assets</span>
          <h2 id="gallery-title">See the system.</h2>
        </div>
        <p>These visuals come from the project repository. They explain the product surface and the engineering path; they are not a substitute for deployment or field evidence.</p>
      </div>
      <div className="case-gallery-grid">
        {media.map((item) => (
          <figure className={`case-gallery-item case-gallery-item-${item.kind}`} key={item.src}>
            <div className="case-gallery-frame">
              <Image src={item.src} alt={item.alt} width={item.width} height={item.height} sizes="(max-width: 760px) 100vw, 50vw" />
            </div>
            <figcaption>
              <div className="case-gallery-caption">
                <span className="technical">{item.label}</span>
                <span>{item.caption}</span>
              </div>
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">View source asset ↗</a>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
