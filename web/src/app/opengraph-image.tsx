import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NDT Academy — Online NDT Training built to SNT-TC-1A & NAS410";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(160deg, #061830 0%, #0A2342 55%, #0D3060 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#1B82E8",
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          <div style={{ width: 48, height: 4, background: "#1B82E8", display: "flex" }} />
          SNT-TC-1A 2024 · NAS410 · CP-105
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            lineHeight: 1.02,
            textTransform: "uppercase",
            marginTop: 28,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Online NDT Training</span>
          <span style={{ color: "#1B82E8" }}>Built to the Standards</span>
        </div>
        <div style={{ marginTop: 36, fontSize: 34, color: "#C7D5E6", display: "flex" }}>
          NDTAcademy.com — UT · RT · MT · PT · ET · VT · Levels I–III
        </div>
        <svg
          width="1200"
          height="200"
          viewBox="0 0 560 220"
          style={{ position: "absolute", bottom: -30, right: -100, opacity: 0.5 }}
        >
          <polyline
            points="0,180 60,180 80,176 95,40 110,176 150,180 200,180 215,172 228,98 242,172 270,180 330,180 345,174 358,128 372,174 420,180 560,180"
            stroke="#1B82E8"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
