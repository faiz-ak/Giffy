import React, { useState } from "react";
import axios from "axios";
import { parseGIF, decompressFrames } from "gifuct-js";
import gifshot from "gifshot";
import "./App.css";

/* 🔎 Smart keyword mapping */
const getSearchKeyword = (text) => {
  const t = text.toLowerCase();
  if (t.includes("love")) return "i love you";
  if (t.includes("miss")) return "i miss you";
  if (t.includes("birthday")) return "happy birthday";
  if (t.includes("sorry")) return "sorry";
  return text.split(" ").slice(0, 2).join(" ");
};

const BACKEND_URL = "https://giffy.up.railway.app";

function App() {
  const [inputText, setInputText] = useState("");
  const [gifs, setGifs] = useState([]); // ⬅️ multiple gifs
  const [loading, setLoading] = useState(false);

  const [fontSize, setFontSize] = useState(28);
  const [textColor, setTextColor] = useState("#ffffff");
  const [position, setPosition] = useState("bottom");

  /* 🎬 Generate MULTIPLE GIFs */
  const generateGif = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setGifs([]);

    const keyword = getSearchKeyword(inputText);

    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/gifs`,
        {
          params: { q: keyword },
          timeout: 15000,
        }
      );

      // Backend already returns proxy-safe URLs
      setGifs(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch GIFs");
    } finally {
      setLoading(false);
    }
  };

  /* 🔥 Download with overlay text */
  const downloadGifWithText = async (gifUrl) => {
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}${gifUrl}`);
      const buffer = await res.arrayBuffer();

      const gif = parseGIF(buffer);
      const frames = decompressFrames(gif, true);

      const images = frames.map((frame) => {
        const width = frame.dims?.width || gif.lsd?.width || 300;
        const height = frame.dims?.height || gif.lsd?.height || 300;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;

        if (frame.patch) {
          const imageData = ctx.createImageData(width, height);
          imageData.data.set(frame.patch);
          ctx.putImageData(imageData, 0, 0);
        }

        ctx.font = `bold ${fontSize}px Poppins`;
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 12;

        let y = canvas.height * 0.85;
        if (position === "center") y = canvas.height * 0.5;
        if (position === "top") y = canvas.height * 0.15;

        ctx.fillText(inputText, canvas.width / 2, y);

        return canvas.toDataURL("image/png");
      });

      gifshot.createGIF(
        { images, interval: 0.15 },
        function (obj) {
          if (!obj.error) {
            const link = document.createElement("a");
            link.href = obj.image;
            link.download = "custom-text.gif";
            link.click();
          }
          setLoading(false);
        }
      );
    } catch (e) {
      console.error(e);
      alert("GIF processing failed");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Custom GIF Generator ✨</h1>

      <input
        placeholder="User Friendly Prompt"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <div className="btn-group">
        <button onClick={generateGif} disabled={loading}>
          Generate GIF
        </button>
      </div>

      <div className="custom-panel">
        <label>
          Font Size [{fontSize}px]
          <input
            type="range"
            min="18"
            max="44"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </label>

        <label>
          Text Color
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
        </label>

        <label>
          Position
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="bottom">Bottom</option>
            <option value="center">Center</option>
            <option value="top">Top</option>
          </select>
        </label>
      </div>

      {loading && <p className="loading">Processing… please wait</p>}

      {/* 🎞️ MULTIPLE GIF PREVIEW (same design) */}
<div className="gif-grid">
  {gifs.map((gif, i) => (
    <div className="gif-card" key={i}>
      <div className="gif-preview">
        <img src={`${BACKEND_URL}${gif}`} alt="gif" />

        <div
          className={`overlay ${position}`}
          style={{
            fontSize: `${fontSize}px`,
            color: textColor,
          }}
        >
          {inputText}
        </div>
      </div>

      <div className="gif-actions">
        <button onClick={() => downloadGifWithText(gif)}>
          Download GIF
        </button>
      </div>
    </div>
  ))}
</div>

    </div>
  );
}

export default App;
