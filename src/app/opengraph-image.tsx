import { ImageResponse } from "next/og";

export const alt = "Ayush Roy | Full Stack Developer portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social cards match the light editorial homepage.
 * This is generated at the edge without downloading external imagery.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", padding: "58px 66px", background: "linear-gradient(118deg, #f6f3e9 0%, #f4f2e8 53%, #e9edc8 100%)", color: "#25262e", fontFamily: "Arial, sans-serif", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", position: "absolute", top: "65px", right: "-27px", fontSize: "370px", fontWeight: 900, lineHeight: 1, color: "#e5e4d6", letterSpacing: "-30px" }}>YOR</div>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", position: "relative" }}>
          <div style={{ display: "flex", fontSize: 18, letterSpacing: 2, fontWeight: 700 }}>✳ &nbsp; YOR / AYUSH ROY</div>
          <div style={{ display: "flex", fontSize: 15, letterSpacing: 2, color: "#606360", fontWeight: 700 }}>PORTFOLIO / 2026</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", marginBottom: "auto", position: "relative" }}>
          <div style={{ display: "flex", fontSize: 17, letterSpacing: 3, color: "#646658", marginBottom: 32 }}>BACKEND THINKING. FRONTEND WITH FEELING.</div>
          <div style={{ display: "flex", fontSize: 114, fontWeight: 800, lineHeight: 1, letterSpacing: -7 }}>Full Stack</div>
          <div style={{ display: "flex", fontSize: 107, lineHeight: 1.08, letterSpacing: -6, fontFamily: "Georgia, serif" }}>Developer.</div>
          <div style={{ display: "flex", maxWidth: 800, fontSize: 21, lineHeight: 1.45, marginTop: 26, color: "#555954" }}>Full-stack products, practical engineering, and six evidence-backed project stories.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "space-between", borderTop: "1px solid #bfbdaf", paddingTop: 18, position: "relative", fontSize: 15, letterSpacing: 1.5, color: "#61655c" }}>
          <div style={{ display: "flex" }}>PYTHON / TYPESCRIPT / APPLIED AI</div>
          <div style={{ display: "flex" }}>YORAYRINIWNL.IN &nbsp; ↗</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
