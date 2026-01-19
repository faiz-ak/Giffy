import React, { useEffect, useRef, useState } from "react";
import "../Rainbow.css";
import {
  RAINBOW_COLORS,
  GRADIENT_PRESETS,
  GOOGLE_FONTS,
  loadGoogleFont,
} from "../utils/utils";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";

export default function Rainbow() {
  const previewRef = useRef(null);

  /* TEXT */
  const [text, setText] = useState("");

  /* TYPOGRAPHY */
  const [fontSize, setFontSize] = useState(36);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [letterSpacing, setLetterSpacing] = useState(1);
  const [fontFamily, setFontFamily] = useState("Arial");

  /* STYLE */
  const [textStyle, setTextStyle] = useState("gradient"); // gradient | rainbow
  const [angle, setAngle] = useState(45);

  /* GRADIENT */
  const [activeGradient, setActiveGradient] = useState("rainbow");
  const [customColors, setCustomColors] = useState([
    "#ff0000",
    "#00ff00",
    "#0000ff",
  ]);

  useEffect(() => {
    loadGoogleFont(fontFamily);
    renderPreview();
    // eslint-disable-next-line
  }, [
    text,
    fontSize,
    lineHeight,
    letterSpacing,
    fontFamily,
    textStyle,
    angle,
    activeGradient,
    customColors,
  ]);

  /* ---------- PREVIEW ---------- */
  const renderPreview = () => {
    const preview = previewRef.current;
    if (!preview) return;

    preview.innerHTML = "";
    if (!text.trim()) {
      preview.innerHTML =
        `<div class="preview-placeholder">Enter your text to preview</div>`;
      return;
    }

    const lines = text.split("\n");

    /* RAINBOW */
    if (textStyle === "rainbow") {
      let idx = 0;
      lines.forEach(line => {
        const row = document.createElement("div");
        row.style.whiteSpace = "pre";
        row.style.lineHeight = lineHeight;

        [...line].forEach(char => {
          const span = document.createElement("span");
          span.textContent = char;
          span.style.fontSize = `${fontSize}px`;
          span.style.fontFamily = fontFamily;
          span.style.letterSpacing = `${letterSpacing}px`;
          span.style.fontWeight = "700";
          span.style.color =
            RAINBOW_COLORS[idx++ % RAINBOW_COLORS.length];
          row.appendChild(span);
        });
        preview.appendChild(row);
      });
      return;
    }

    /* GRADIENT */
    const gradientCSS =
      activeGradient === "custom"
        ? `linear-gradient(${angle}deg, ${customColors.join(",")})`
        : GRADIENT_PRESETS[activeGradient].replace(
            /linear-gradient\([^,]+,/,
            `linear-gradient(${angle}deg,`
          );

    lines.forEach(line => {
      const div = document.createElement("div");
      div.className = "gradient-text";
      div.textContent = line || " ";
      div.style.fontSize = `${fontSize}px`;
      div.style.fontFamily = fontFamily;
      div.style.letterSpacing = `${letterSpacing}px`;
      div.style.lineHeight = lineHeight;
      div.style.background = gradientCSS;
      div.style.backgroundClip = "text";
      div.style.webkitBackgroundClip = "text";
      div.style.color = "transparent";
      div.style.webkitTextFillColor = "transparent";
      div.style.display = "block";
      div.style.whiteSpace = "pre";
      preview.appendChild(div);
    });
  };

  /* ---------- PNG EXPORT (MATCH PREVIEW) ---------- */
  const downloadPNG = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const lines = text.split("\n");
    const padding = 40;
    const lh = fontSize * lineHeight;

    canvas.width = 1200;
    canvas.height = padding * 2 + lines.length * lh;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";

    let y = padding;

    if (textStyle === "rainbow") {
      let idx = 0;
      lines.forEach(line => {
        let x = padding;
        [...line].forEach(ch => {
          ctx.fillStyle =
            RAINBOW_COLORS[idx++ % RAINBOW_COLORS.length];
          ctx.fillText(ch, x, y);
          x += ctx.measureText(ch).width + letterSpacing;
        });
        y += lh;
      });
    } else {
      const grad = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        0
      );

      const colors =
        activeGradient === "custom"
          ? customColors
          : GRADIENT_PRESETS[activeGradient].match(
              /#([0-9a-f]{6})/gi
            );

      colors.forEach((c, i) =>
        grad.addColorStop(i / (colors.length - 1), c)
      );

      ctx.fillStyle = grad;
      lines.forEach(line => {
        ctx.fillText(line, padding, y);
        y += lh;
      });
    }

    canvas.toBlob(blob => saveAs(blob, "rainbow-text.png"));
  };

  /* ---------- WORD EXPORT (FORMAT SAFE) ---------- */
  const downloadWord = async () => {
    const doc = new Document({
      sections: [
        {
          children: text.split("\n").map(line =>
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  font: fontFamily,
                  size: fontSize * 2,
                  bold: true,
                }),
              ],
            })
          ),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "rainbow-text.docx");
  };

  return (
    <div className="rainbow-page">
      <div className="tool-header">
        <h1>🌈 Rainbow Text Generator</h1>
      </div>

      <div className="tool-grid">
        {/* LEFT */}
        <div className="tool-panel">
          <h3>Text Input</h3>
          <label>Enter your text</label>
          <textarea
            className="input"
            value={text}
            onChange={e => setText(e.target.value)}
          />

          <div className="control-grid">
            <div>
              <label>Font Size</label>
              <input type="number" value={fontSize} onChange={e => setFontSize(+e.target.value)} />
            </div>

            <div>
              <label>Line Height</label>
              <input type="number" step="0.1" value={lineHeight} onChange={e => setLineHeight(+e.target.value)} />
            </div>

            <div>
              <label>Letter Spacing</label>
              <input type="number" step="0.1" value={letterSpacing} onChange={e => setLetterSpacing(+e.target.value)} />
            </div>

            <div>
              <label>Text Style</label>
              <select value={textStyle} onChange={e => setTextStyle(e.target.value)}>
                <option value="gradient">Gradient Text</option>
                <option value="rainbow">Rainbow Colors</option>
              </select>
            </div>

            <div>
              <label>Font Family</label>
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                {GOOGLE_FONTS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {textStyle === "gradient" && (
            <>
              <label>Gradient Direction: {angle}°</label>
              <input type="range" min="0" max="360" value={angle} onChange={e => setAngle(+e.target.value)} />

              <label>Choose Gradient</label>
              <div className="gradient-grid">
                {Object.keys(GRADIENT_PRESETS).map(g => (
                  <div
                    key={g}
                    className={`gradient-circle ${activeGradient === g ? "selected" : ""}`}
                    style={{ background: GRADIENT_PRESETS[g] }}
                    onClick={() => setActiveGradient(g)}
                  />
                ))}
              </div>

              <label>Custom Gradient Colors</label>
              <div className="custom-colors">
                {customColors.map((c, i) => (
                  <input
                    key={i}
                    type="color"
                    value={c}
                    onChange={e => {
                      const arr = [...customColors];
                      arr[i] = e.target.value;
                      setCustomColors(arr);
                    }}
                  />
                ))}
                <button
                  className="apply-btn"
                  onClick={() => setActiveGradient("custom")}
                >
                  Apply Custom
                </button>
              </div>
            </>
          )}

          <div className="export-box">
            <button className="secondary" onClick={downloadWord}>
              Download Word Doc
            </button>
            <button onClick={downloadPNG}>
              Generate PNG
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="preview-panel">
          <h3>Live Preview</h3>
          <div ref={previewRef} className="preview-canvas" />
        </div>
      </div>
    </div>
  );
}
