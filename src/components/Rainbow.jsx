import React, { useEffect, useRef, useState } from "react";
import "../Rainbow.css";
import "../fonts.css";
import {
  RAINBOW_COLORS,
  GRADIENT_PRESETS,
  GOOGLE_FONTS,
  loadGoogleFont,
} from "../utils/utils";
import { saveAs } from "file-saver";

// Global state variables (like JS version)
let text = "";
let fontSize = 36;
let lineHeight = 1.2;
let letterSpacing = 1;
let fontFamily = "Arial";
let textStyle = "rainbow";
let gradientAngle = 45;
let selectedGradient = "rainbow";
let customGradient = null;

export default function Rainbow() {
  const previewRef = useRef(null);
  const angleSliderRef = useRef(null);
  const [angleDisplay, setAngleDisplay] = useState(45);
  const [showGradientOptions, setShowGradientOptions] = useState(false);

  useEffect(() => {
    updatePreview();
  }, []);

  // Create gradient text using canvas rendering (like JS version)
  const createGradientText = (text, fontSize, lineHeight, fontFamily, letterSpacing) => {
    const container = document.createElement("div");
    const lines = text.split("\n");
    const gradientStr = customGradient || GRADIENT_PRESETS[selectedGradient];
    const colorMatches = gradientStr.match(/#[0-9a-fA-F]{6}/g) || [];

    lines.forEach((line) => {
      const lineDiv = document.createElement("div");
      lineDiv.style.lineHeight = String(lineHeight);
      lineDiv.style.height = fontSize * lineHeight + "px";

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      
      lineDiv.appendChild(canvas);
      container.appendChild(lineDiv);
      
      const renderCanvas = () => {
        ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
        
        let textWidth = 0;
        for (let i = 0; i < line.length; i++) {
          textWidth += ctx.measureText(line[i]).width + letterSpacing;
        }
        
        canvas.width = Math.max(textWidth + 50, 1);
        canvas.height = fontSize + 20;
        canvas.style.verticalAlign = "top";
        
        ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
        ctx.textBaseline = "top";

        const angleRad = (gradientAngle * Math.PI) / 180;
        const centerX = 5 + textWidth / 2;
        const centerY = canvas.height / 2;
        const x1 = centerX - Math.cos(angleRad) * textWidth;
        const y1 = centerY - Math.sin(angleRad) * fontSize;
        const x2 = centerX + Math.cos(angleRad) * textWidth;
        const y2 = centerY + Math.sin(angleRad) * fontSize;

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        colorMatches.forEach((color, index) => {
          gradient.addColorStop(index / (colorMatches.length - 1), color);
        });

        ctx.fillStyle = gradient;

        let x = 5;
        for (let i = 0; i < line.length; i++) {
          ctx.fillText(line[i], x, 5);
          x += ctx.measureText(line[i]).width + letterSpacing;
        }
      };
      
      if (document.fonts.check(`bold ${fontSize}px "${fontFamily}"`)) {
        renderCanvas();
      } else {
        document.fonts.load(`bold ${fontSize}px "${fontFamily}"`).then(() => {
          setTimeout(renderCanvas, 100);
        });
      }
    });

    return container;
  };

  // Create rainbow text (like JS version)
  const createRainbowSpans = (text, fontSize, lineHeight, fontFamily, letterSpacing) => {
    const container = document.createElement("div");
    const lines = text.split("\n");
    let colorIndex = 0;

    lines.forEach((line) => {
      const lineDiv = document.createElement("div");
      lineDiv.style.lineHeight = String(lineHeight);

      for (const char of line) {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char;
        span.style.fontSize = fontSize + "px";
        span.style.fontWeight = "bold";
        span.style.fontFamily = `"${fontFamily}", sans-serif`;
        span.style.letterSpacing = letterSpacing + "px";
        span.style.color = RAINBOW_COLORS[colorIndex % RAINBOW_COLORS.length];
        colorIndex++;
        lineDiv.appendChild(span);
      }
      container.appendChild(lineDiv);
    });

    return container;
  };

  // Update preview (like JS version)
  const updatePreview = () => {
    loadGoogleFont(fontFamily);
    const preview = previewRef.current;
    if (!preview) return;

    preview.innerHTML = "";

    if (!text.trim()) {
      preview.innerHTML = '<p style="color: #94a3b8; font-style: italic;">Enter text to see preview...</p>';
      return;
    }

    const styledText = textStyle === "gradient"
      ? createGradientText(text, fontSize, lineHeight, fontFamily, letterSpacing)
      : createRainbowSpans(text, fontSize, lineHeight, fontFamily, letterSpacing);

    preview.appendChild(styledText);
  };

  // PNG export (exact JS version)
  const generatePngImage = async () => {
    if (!text.trim()) return;

    try {
      const lines = text.split("\n");
      const padding = 40;
      
      // Measure text dimensions
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;

      let maxWidth = 0;
      let totalHeight = 0;

      lines.forEach((line) => {
        let lineWidth = 0;
        for (const char of line) {
          lineWidth += ctx.measureText(char).width;
        }
        maxWidth = Math.max(maxWidth, lineWidth);
        totalHeight += fontSize * 1.2;
      });

      const pixelRatio = window.devicePixelRatio || 2;
      const width = Math.ceil(maxWidth) + padding * 2 + (lines[0] ? lines[0].length * letterSpacing : 0);
      const height = Math.ceil(totalHeight) + padding * 2;

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (textStyle === "gradient") {
        // Draw gradient text
        ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
        ctx.letterSpacing = letterSpacing + "px";
        ctx.textBaseline = "top";
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const gradientStr = customGradient || GRADIENT_PRESETS[selectedGradient];
        const colorMatches = gradientStr.match(/#[0-9a-fA-F]{6}/g) || [];

        let y = padding;

        lines.forEach((line) => {
          let x = padding;
          const lineWidth_text = ctx.measureText(line).width + line.length * letterSpacing;

          const angleRad = (gradientAngle * Math.PI) / 180;
          const centerX = x + lineWidth_text / 2;
          const centerY = y + fontSize / 2;

          const x1 = centerX - Math.cos(angleRad) * lineWidth_text;
          const y1 = centerY - Math.sin(angleRad) * fontSize;
          const x2 = centerX + Math.cos(angleRad) * lineWidth_text;
          const y2 = centerY + Math.sin(angleRad) * fontSize;

          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          colorMatches.forEach((color, index) => {
            gradient.addColorStop(index / (colorMatches.length - 1), color);
          });

          ctx.fillStyle = gradient;
          ctx.fillText(line, x, y);
          y += fontSize * lineHeight;
        });
      } else {
        // Draw rainbow text
        ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
        ctx.textBaseline = "top";
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let y = padding;
        let colorIndex = 0;

        lines.forEach((line) => {
          let x = padding;
          for (const char of line) {
            ctx.fillStyle = RAINBOW_COLORS[colorIndex % RAINBOW_COLORS.length];
            ctx.fillText(char, x, y);
            x += ctx.measureText(char).width + letterSpacing;
            colorIndex++;
          }
          y += fontSize * lineHeight;
        });
      }

      const link = document.createElement("a");
      link.download = "Rainbow Text.png";
      link.href = canvas.toDataURL("image/png", 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    }
  };

  // Helper function to calculate gradient color for character position
  const getGradientColorForPosition = (charIndex, totalChars) => {
    const gradientStr = customGradient || GRADIENT_PRESETS[selectedGradient];
    const colors = gradientStr.match(/#[0-9a-fA-F]{6}/g) || [];
    if (colors.length < 2) return colors[0] || "#FF0000";
    
    const position = charIndex / (totalChars - 1);
    const segmentIndex = Math.floor(position * (colors.length - 1));
    const segmentFactor = (position * (colors.length - 1)) % 1;
    
    if (segmentIndex >= colors.length - 1) return colors[colors.length - 1];
    
    const color1 = colors[segmentIndex];
    const color2 = colors[segmentIndex + 1];
    
    // Simple color interpolation
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * segmentFactor);
    const g = Math.round(g1 + (g2 - g1) * segmentFactor);
    const b = Math.round(b1 + (b2 - b1) * segmentFactor);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Word export (matching live preview colors)
  const downloadWordDoc = () => {
    if (!text.trim()) return;
    
    try {
      const lines = text.split("\n");
      let globalCharIndex = 0;
      const totalChars = text.replace(/\n/g, "").length;
      
      const bodyContent = lines.map((line) => {
        const spans = Array.from(line).map((char) => {
          let color;
          if (textStyle === "gradient") {
            color = getGradientColorForPosition(globalCharIndex, totalChars);
          } else {
            color = RAINBOW_COLORS[globalCharIndex % RAINBOW_COLORS.length];
          }
          globalCharIndex++;
          return `<span style="font-weight:bold; font-size:${fontSize}px; font-family:'${fontFamily}'; color:${color}">${char === ' ' ? '&nbsp;' : char}</span>`;
        }).join("");
        return `<div style="line-height:${lineHeight}">${spans}</div>`;
      }).join("");
      
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Rainbow Text</title></head><body>${bodyContent}</body></html>`;
      const blob = new Blob([html], { type: "application/msword" });
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Rainbow Text.doc";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Word export failed:', error);
    }
  };

  return (
    <div className="rainbow-page">
      <div className="tool-header">
        <h1>
          <span className="emoji">🌈</span>
          <span className="text">Rainbow Text Generator</span>
        </h1>
      </div>

      <div className="tool-grid">
        {/* LEFT */}
        <div className="tool-panel">
          <h3>Text Input</h3>
          <label>Enter your text</label>
          <textarea
            className="input"
            defaultValue={text}
            onChange={e => { text = e.target.value; updatePreview(); }}
          />

          <div className="control-grid">
            <div>
              <label>Font Size</label>
              <input type="number" defaultValue={fontSize} onChange={e => { fontSize = +e.target.value; updatePreview(); }} />
            </div>

            <div>
              <label>Line Height</label>
              <input type="number" step="0.1" defaultValue={lineHeight} onChange={e => { lineHeight = +e.target.value; updatePreview(); }} />
            </div>

            <div>
              <label>Letter Spacing</label>
              <input type="number" step="0.1" defaultValue={letterSpacing} onChange={e => { letterSpacing = +e.target.value; updatePreview(); }} />
            </div>

            <div>
              <label>Text Style</label>
              <select defaultValue={textStyle} onChange={e => { 
                textStyle = e.target.value; 
                setShowGradientOptions(textStyle === "gradient");
                updatePreview(); 
              }}>
                <option value="rainbow">Rainbow Colors</option>
                <option value="gradient">Gradient Text</option>
              </select>
            </div>

            <div>
              <label>Font Family</label>
              <select defaultValue={fontFamily} onChange={e => { fontFamily = e.target.value; updatePreview(); }} data-font-select>
                {GOOGLE_FONTS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {showGradientOptions && (
            <>
              <label>Gradient Direction: {angleDisplay}°</label>
              <input 
                ref={angleSliderRef}
                type="range" 
                min="0" 
                max="360" 
                defaultValue={gradientAngle} 
                onChange={e => { 
                  gradientAngle = +e.target.value; 
                  setAngleDisplay(gradientAngle);
                  updatePreview(); 
                }} />

              <label>Choose Gradient</label>
              <div className="gradient-grid">
                {Object.keys(GRADIENT_PRESETS).map(g => (
                  <div
                    key={g}
                    className={`gradient-circle ${selectedGradient === g ? "selected" : ""}`}
                    style={{ background: GRADIENT_PRESETS[g] }}
                    onClick={() => { 
                      selectedGradient = g; 
                      customGradient = null; 
                      gradientAngle = 45;
                      setAngleDisplay(45);
                      if (angleSliderRef.current) angleSliderRef.current.value = 45;
                      updatePreview(); 
                    }}
                  />
                ))}
              </div>

              <label>Custom Gradient Colors</label>
              <div className="custom-colors">
                <input type="color" defaultValue="#ff0000" onChange={e => {
                  const color1 = e.target.value;
                  const color2 = e.target.parentElement.children[1].value;
                  const color3 = e.target.parentElement.children[2].value;
                  customGradient = `linear-gradient(${gradientAngle}deg, ${color1}, ${color2}, ${color3})`;
                  selectedGradient = "custom";
                  updatePreview();
                }} />
                <input type="color" defaultValue="#00ff00" onChange={e => {
                  const color1 = e.target.parentElement.children[0].value;
                  const color2 = e.target.value;
                  const color3 = e.target.parentElement.children[2].value;
                  customGradient = `linear-gradient(${gradientAngle}deg, ${color1}, ${color2}, ${color3})`;
                  selectedGradient = "custom";
                  updatePreview();
                }} />
                <input type="color" defaultValue="#0000ff" onChange={e => {
                  const color1 = e.target.parentElement.children[0].value;
                  const color2 = e.target.parentElement.children[1].value;
                  const color3 = e.target.value;
                  customGradient = `linear-gradient(${gradientAngle}deg, ${color1}, ${color2}, ${color3})`;
                  selectedGradient = "custom";
                  updatePreview();
                }} />
                <button className="apply-btn" onClick={() => {
                  const inputs = document.querySelectorAll('.custom-colors input[type="color"]');
                  customGradient = `linear-gradient(${gradientAngle}deg, ${inputs[0].value}, ${inputs[1].value}, ${inputs[2].value})`;
                  selectedGradient = "custom";
                  updatePreview();
                }}>
                  Apply Custom
                </button>
              </div>
            </>
          )}

          <div className="export-box">
            <button className="secondary" onClick={downloadWordDoc}>
              Download Word Doc
            </button>
            <button onClick={generatePngImage}>
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