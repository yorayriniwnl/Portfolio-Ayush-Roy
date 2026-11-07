import { ImageResponse } from "next/og";

export const alt = "Ayush Roy, Backend and Full-Stack Engineer. Code with character.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card mirrors the site's Obsidian Pearl editorial identity, while
 * retaining a readable, text-first preview when shared without any WebGL.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          width: "100%",
          height: "100%",
          padding: "58px 66px 48px",
          overflow: "hidden",
          background: "linear-gradient(123deg, #09090D 0%, #17151D 60%, #242432 100%)",
          color: "#F7F4FA",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-42px",
            top: "93px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            border: "1px solid rgba(187,164,217,.2)",
            background: "linear-gradient(145deg, rgba(187,164,217,.12), rgba(198, 205, 216, .03))",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: "41px",
            top: "190px",
            fontSize: 180,
            fontWeight: 900,
            letterSpacing: -24,
            color: "rgba(187,164,217,.1)",
          }}
        >
          YOR
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", width: 12, height: 12, borderRadius: 6, background: "#BBA4D9" }} />
            <div style={{ display: "flex", fontSize: 17, letterSpacing: 2.6, fontWeight: 700 }}>YOR / AYUSH ROY</div>
          </div>
          <div style={{ display: "flex", fontSize: 15, letterSpacing: 2.1, color: "#9D96A7", fontWeight: 700 }}>ENGINEERING PORTFOLIO</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "relative", marginTop: "auto", marginBottom: "auto" }}>
          <div style={{ display: "flex", color: "#BBA4D9", fontSize: 18, fontWeight: 700, letterSpacing: 3, marginBottom: 30 }}>
            BACKEND / FULL-STACK / APPLIED ML
          </div>
          <div style={{ display: "flex", fontSize: 86, lineHeight: 1, letterSpacing: -5.2, fontWeight: 800 }}>Code with</div>
          <div style={{ display: "flex", fontSize: 82, lineHeight: 1.13, letterSpacing: -4.4, color: "#BBA4D9", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
            character.
          </div>
          <div style={{ display: "flex", marginTop: 28, maxWidth: 890, color: "#C9C3D1", fontSize: 22, lineHeight: 1.4 }}>
            Evidence-driven tools, real-time products, and thoughtful interactive experiences.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", width: "100%", borderTop: "1px solid rgba(198, 205, 216, .2)", paddingTop: 20 }}>
          <div style={{ display: "flex", fontSize: 14, letterSpacing: 1.8, fontWeight: 700, color: "#9D96A7" }}>SELECTED WORK / CASE STUDIES / SOURCE CODE</div>
          <div style={{ display: "flex", fontSize: 17, letterSpacing: 1.3, fontWeight: 800, color: "#F7F4FA" }}>YORAYRINIWNL.IN ↗</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
