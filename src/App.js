import React, { useState } from "react";
import axios from "axios";
import { parseGIF, decompressFrames } from "gifuct-js";
import gifshot from "gifshot";
import "./App.css";

const getSearchKeyword = (text) => {
  const t = text.toLowerCase();
  if (t.includes("love")) return "i love you";
  if (t.includes("miss")) return "i miss you";
  if (t.includes("birthday")) return "happy birthday";
  if (t.includes("sorry")) return "sorry";
  return text.split(" ").slice(0, 2).join(" ");
};

function App() {
  const [inputText, setInputText] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [fontSize, setFontSize] = useState(28);
  const [textColor, setTextColor] = useState("#ffffff");
  const [position, setPosition] = useState("bottom");

  const API_KEY = "UISKtTGeHvXS62y4bcZm4A1vhSsIP9bq";

  const generateGif = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setGifUrl("");

    const keyword = getSearchKeyword(inputText);

    try {
      const res = await axios.get(
        "https://api.giphy.com/v1/gifs/search",
        {
          params: {
            api_key: API_KEY,
            q: keyword,
            limit: 1,
            rating: "g",
          },
        }
      );

      const gif = res.data.data[0].images.original.url;
      setGifUrl(gif);
      setLoading(false);
    } catch {
      alert("GIF not found");
      setLoading(false);
    }
  };

  /* 🔥 REAL GIF EXPORT */
  const downloadGifWithText = async () => {
    setLoading(true);

    const res = await fetch(gifUrl);
    const buffer = await res.arrayBuffer();

    const gif = parseGIF(buffer);
    const frames = decompressFrames(gif, true);

    const images = frames.map((frame) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = frame.dims.width;
      canvas.height = frame.dims.height;

      const imageData = ctx.createImageData(
        frame.dims.width,
        frame.dims.height
      );
      imageData.data.set(frame.patch);
      ctx.putImageData(imageData, 0, 0);

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
      {
        images,
        gifWidth: frames[0].dims.width,
        gifHeight: frames[0].dims.height,
        interval: 0.15,
      },
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
        <button onClick={generateGif}>Generate GIF</button>
        {gifUrl && (
          <button className="download-btn" onClick={downloadGifWithText}>
            Download GIF
          </button>
        )}
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

      {gifUrl && (
        <div className="gif-preview">
          <img src={gifUrl} alt="preview" />
          <div
            className={`overlay ${position}`}
            style={{ fontSize: `${fontSize}px`, color: textColor }}
          >
            {inputText}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
