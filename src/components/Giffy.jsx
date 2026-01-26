import React, {useEffect, useState, useRef } from "react";
import axios from "axios";
import { parseGIF, decompressFrames } from "gifuct-js";
import gifshot from "gifshot";
import "../Giffy.css";

 
/* SMART KEYWORD MAPPING (ADVANCED) */
const getSearchKeyword = (text) => {
  const t = text.toLowerCase().trim();
//  love and romance
  if (/(i\s*love\s*you|love\s*you|luv\s*u|romantic|heart|my\s*love)/.test(t))
    return "i love you";
//  miss / longing
  if (/(miss\s*you|missing\s*you|wish\s*you\s*were\s*here|longing)/.test(t))
    return "i miss you";
//  Birthday
  if (/(birthday|bday|born\s*day|happy\s*birthday)/.test(t))
    return "happy birthday";
//  sorry / apology
  if (/(sorry|apologize|apology|forgive\s*me|my\s*bad)/.test(t))
    return "sorry";
//  celebration
  if (/(congrats|congratulations|celebrate|celebration|party|cheers)/.test(t))
    return "celebration";
//  funny / laugh
  if (/(funny|lol|lmao|haha|laugh|joke|meme)/.test(t))
    return "funny reaction";
// compliments 
  if (/(cute|beautiful|handsome|gorgeous|pretty|adorable)/.test(t))
    return "cute reaction";
// motivation 
  if (/(motivation|inspire|you\s*can\s*do\s*it|never\s*give\s*up|success)/.test(t))
    return "motivational";
// angry 
  if (/(angry|mad|annoyed|frustrated|rage)/.test(t))
    return "angry reaction";
//  cool / attitude
  if (/(cool|awesome|legend|boss|king|queen|savage)/.test(t))
    return "cool reaction";
// tired / sleep 
  if (/(sleepy|tired|exhausted|need\s*sleep|good\s*night)/.test(t))
    return "sleepy";
// sad 
  if (/(sad|depressed|lonely|heartbroken|cry)/.test(t))
    return "sad reaction";
// greeting 
  if (/(hi|hello|hey|good\s*morning|good\s*evening)/.test(t))
    return "hello greeting";
 
  /* 🧠 SMART FALLBACK */
  const cleaned = t
    .replace(/[^a-zA-Z\s]/g, "")
    .split(" ")
    .filter((w) => w.length > 2);
 
  return cleaned.slice(0, 3).join(" ") || "reaction";
};
 
const BACKEND_URL = "https://giffy-backend.onrender.com";
 
 
/* 🧠 SAFE TEXT WRAP (NO CUTTING) */
const drawWrappedText = (
  ctx,
  text,
  x,
  y,
  maxWidth,
  lineHeight,
  canvasHeight
) => {
  const words = text.split(" ");
  let line = "";
  const lines = [];
 
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line);
 
  const totalHeight = lines.length * lineHeight;
 
  let startY = y;
  if (startY + totalHeight > canvasHeight - 10) {
    startY = canvasHeight - totalHeight - 10;
  }
 
  lines.forEach((l, i) => {
    ctx.fillText(l.trim(), x, startY + i * lineHeight);
  });
};
 
export default function Giffy() {
  /* GOOGLE FONTS*/
const GOOGLE_FONTS = [
  "Poppins",
  "Roboto",
  "Montserrat",
  "Open Sans",
  "Lato",
  "Inter",
  "Raleway",
  "Nunito",
  "Playfair Display",
  "Merriweather",
  "Oswald",
  "Ubuntu",
  "Roboto Slab",
  "DM Sans",
  "Source Sans 3",
  "Pacifico",
  "Dancing Script",
  "Great Vibes",
  "Lobster",
  "Bebas Neue",
  "Anton"
];

const LIMIT = 24;
const [offset, setOffset] = useState(0);
const [hasMore, setHasMore] = useState(true);
const [page, setPage] = useState(0);

  const [fontFamily, setFontFamily] = useState("Poppins");
  const inputRef = useRef(null);

  const [inputText, setInputText] = useState("");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
 
  const [fontSize, setFontSize] = useState(28);
  const [textColor, setTextColor] = useState("#ffffff");
  const [position, setPosition] = useState("bottom");
 
  const [showText, setShowText] = useState(true);
  const [showWaitMessage, setShowWaitMessage] = useState(true);
  useEffect(() => {
  const timer = setTimeout(() => {
    setShowWaitMessage(false);
  }, 60000); // ⏱️ 1 minute
 
  return () => clearTimeout(timer);
}, []);
  /* 🎬 Generate GIFs */
const generateGif = async () => {
  if (!inputText.trim()) return;

  setLoading(true);
  setGifs([]);
setOffset(0);
setPage(0);
  setHasMore(true);

  try {
    const res = await axios.get(`${BACKEND_URL}/api/gifs`, {
      params: {
        q: getSearchKeyword(inputText),
        offset: 0
      },
      timeout: 100000,
    });

    setGifs(res.data);
    setOffset(LIMIT);

    if (res.data.length < LIMIT) {
      setHasMore(false);
    }

  } catch {
    alert("Failed to fetch GIFs");
  } finally {
    setLoading(false);
  }
};

/* ➡ NEXT PAGE */
const nextPage = async () => {
  if (loading || !hasMore) return;

  setLoading(true);

  try {
    const res = await axios.get(`${BACKEND_URL}/api/gifs`, {
      params: {
        q: getSearchKeyword(inputText),
        offset: offset
      },
      timeout: 100000,
    });

    setGifs(res.data);
    setOffset(offset + LIMIT);
    setPage(page + 1);

    if (res.data.length < LIMIT) {
      setHasMore(false);
    }
  } catch {
    alert("Failed to load next page");
  } finally {
    setLoading(false);
  }
};

/* ⬅ PREVIOUS PAGE */
const prevPage = async () => {
  if (loading || page === 0) return;

  const newOffset = Math.max(0, offset - LIMIT * 2);

  setLoading(true);

  try {
    const res = await axios.get(`${BACKEND_URL}/api/gifs`, {
      params: {
        q: getSearchKeyword(inputText),
        offset: newOffset
      },
      timeout: 100000,
    });

    setGifs(res.data);
    setOffset(newOffset + LIMIT);
    setPage(page - 1);
    setHasMore(true);
  } catch {
    alert("Failed to load previous page");
  } finally {
    setLoading(false);
  }
};


 /* ⏭ LOAD MORE GIFS (PAGINATION) */
const loadMoreGifs = async () => {
  if (!hasMore || loading) return;

  setLoading(true);

  try {
    const res = await axios.get(`${BACKEND_URL}/api/gifs`, {
      params: {
        q: getSearchKeyword(inputText),
        offset: offset
      },
      timeout: 100000,
    });

    if (res.data.length === 0) {
      setHasMore(false);
    } else {
      setGifs((prev) => [...prev, ...res.data]);
      setOffset((prev) => prev + LIMIT);

      if (res.data.length < LIMIT) {
        setHasMore(false);
      }
    }
  } catch {
    alert("Failed to load more GIFs");
  } finally {
    setLoading(false);
  }
};

  /* 🔥 Download GIF */
  const downloadGifWithText = async (gifUrl) => {
    setLoading(true);
 
    try {
      const res = await fetch(`${BACKEND_URL}${gifUrl}`);
      const buffer = await res.arrayBuffer();
 
      const gif = parseGIF(buffer);
      const frames = decompressFrames(gif, true);
 
      const images = frames.map((frame) => {
        const width = frame.dims?.width || 300;
        const height = frame.dims?.height || 300;
 
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
 
        canvas.width = width;
        canvas.height = height;
 
        const imageData = ctx.createImageData(width, height);
        imageData.data.set(frame.patch);
        ctx.putImageData(imageData, 0, 0);
 
        if (showText) {
          let safeFontSize = fontSize;
          ctx.font = `bold ${safeFontSize}px Poppins`;
 
          while (
            ctx.measureText(inputText).width > width * 0.9 &&
            safeFontSize > 14
          ) {
            safeFontSize -= 2;
          ctx.font = `bold ${safeFontSize}px ${fontFamily}`;

          }
 
          ctx.fillStyle = textColor;
          ctx.textAlign = "center";
          ctx.shadowColor = "rgba(0,0,0,0.9)";
          ctx.shadowBlur = 12;
 
          let y = height * 0.85;
          if (position === "center") y = height * 0.5;
          if (position === "top") y = height * 0.15;
 
          drawWrappedText(
            ctx,
            inputText,
            width / 2,
            y,
            width * 0.85,
            safeFontSize * 1.25,
            height
          );
        }
 
        return canvas.toDataURL("image/png");
      });
 
      gifshot.createGIF({ images, interval: 0.15 }, (obj) => {
        if (!obj.error) {
          const link = document.createElement("a");
          link.href = obj.image;
          link.download = `${inputText}.gif`;
          link.click();
        }
        setLoading(false);
      });
    } catch {
      alert("GIF processing failed");
      setLoading(false);
    }
  };
 
  return (
  <div className="giffy-page">
    <div className="container">
  <h1>Giffy - A customized Gif Generator ✨</h1>
{showWaitMessage && (
   <p className="hint-text">
  ⏳ Please wait <strong>up to 1 minute</strong> After clicking <strong>Generate GIF</strong>.
  Our server may take a short time to wake up during the first run or after being idle for 15 minutes.
</p>
)}
 
<div className="input-container">
<div className="search-icon">⌕</div>
<input
  ref={inputRef}
  placeholder="Enter your text"
  value={inputText}
  onChange={(e) => setInputText(e.target.value)}
/>
{inputText && (
  <button className="clear-btn" onClick={() => {
    setInputText('');
    inputRef.current?.focus();
  }}>
    ×
  </button>
)}
</div>
 
      <div className="btn-group">
        <button onClick={generateGif}  disabled={loading}>
          Generate
        </button>
 
        <button onClick={() => setShowText(!showText)}   disabled={loading}>
          {showText ? "Remove Text" : "Add Text"}
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
            onChange={(e) => setFontSize(+e.target.value)}
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
  Font Family
  <select
    value={fontFamily}
    onChange={(e) => setFontFamily(e.target.value)}
  >
    {GOOGLE_FONTS.map((font) => (
      <option key={font} value={font} style={{ fontFamily: font }}>
        {font}
      </option>
    ))}
  </select>
</label>
        <label>
          Position
          <select value={position} onChange={(e) => setPosition(e.target.value)}>
            <option value="bottom">Bottom</option>
            <option value="center">Center</option>
            <option value="top">Top</option>
          </select>
        </label>
      </div>
 
     {loading && (
  <p className="loading">
    🎬 Generating GIFs…
  </p>
)}
 
      <div className="gif-grid">
        {gifs.map((gif, i) => (
          <div className="gif-card" key={i}>
            <div className="gif-preview">
              <img src={`${BACKEND_URL}${gif}`} alt="gif" />
 
              {showText && (
                <div
  className={`overlay ${position}`}
  style={{
    fontSize,
    color: textColor,
    fontFamily
  }}
>
  {inputText}
</div>

              )}
            </div>
 
            <div className="gif-actions">
              <button
  onClick={()=> downloadGifWithText(gif)}
>
  Download GIF
</button>
            </div>
          </div>
        ))}
      </div>
     {gifs.length > 0 && (
  <div style={{ marginTop: "28px", display: "flex", gap: "16px", alignItems: "center" }}>
    <button onClick={prevPage} disabled={loading || page === 0}>
      ⬅
    </button>

    <span style={{ opacity: 0.7 }}>Page {page + 1}</span>

    <button onClick={nextPage} disabled={loading || !hasMore}>
      ➡
    </button>
  </div>
)}

    </div>
    </div>
  );
}
 
