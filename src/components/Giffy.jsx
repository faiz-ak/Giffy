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

export default function Giffy() {

const GOOGLE_FONTS = ["Poppins","Roboto","Montserrat","Open Sans","Lato","Inter","Raleway","Nunito","Playfair Display","Merriweather","Oswald","Ubuntu","Roboto Slab","DM Sans","Source Sans 3","Pacifico","Dancing Script","Great Vibes","Lobster","Bebas Neue","Anton"];

const LIMIT = 24;
const [offset, setOffset] = useState(0);
const [hasMore, setHasMore] = useState(true);
const [page, setPage] = useState(0);

const inputRef = useRef(null);
const [inputText, setInputText] = useState("");
const [gifs, setGifs] = useState([]);
const [loading, setLoading] = useState(false);

const [showText, setShowText] = useState(true);

/* 🌍 GLOBAL CUSTOMIZATION */
const [globalText, setGlobalText] = useState("");
const [globalSize, setGlobalSize] = useState(28);
const [globalColor, setGlobalColor] = useState("#ffffff");
const [globalFont, setGlobalFont] = useState("Poppins");
const [globalPosition, setGlobalPosition] = useState("bottom");

/* 🎯 PER GIF CUSTOM */
const [gifCustom, setGifCustom] = useState({});
const [activeGif, setActiveGif] = useState(null);

/* WAIT MESSAGE */
const [showWaitMessage, setShowWaitMessage] = useState(true);
useEffect(() => {
  const timer = setTimeout(() => setShowWaitMessage(false), 60000);
  return () => clearTimeout(timer);
}, []);

const generateGif = async () => {
  if (!inputText.trim()) return;
  setLoading(true);
  setGifs([]);
  setOffset(0);
  setPage(0);
  setHasMore(true);

  const res = await axios.get(`${BACKEND_URL}/api/gifs`, { params: { q: getSearchKeyword(inputText), offset: 0 }});
  setGifs(res.data);
  setOffset(LIMIT);
  if (res.data.length < LIMIT) setHasMore(false);
  setLoading(false);
};

/* PAGINATION */
const nextPage = async () => {
  if (loading || !hasMore) return;
  setLoading(true);
  const res = await axios.get(`${BACKEND_URL}/api/gifs`, { params: { q: getSearchKeyword(inputText), offset }});
  setGifs(res.data);
  setOffset(offset + LIMIT);
  setPage(page + 1);
  if (res.data.length < LIMIT) setHasMore(false);
  setLoading(false);
};

const prevPage = async () => {
  if (loading || page === 0) return;
  const newOffset = Math.max(0, offset - LIMIT * 2);
  setLoading(true);
  const res = await axios.get(`${BACKEND_URL}/api/gifs`, { params: { q: getSearchKeyword(inputText), offset: newOffset }});
  setGifs(res.data);
  setOffset(newOffset + LIMIT);
  setPage(page - 1);
  setHasMore(true);
  setLoading(false);
};

/* DOWNLOAD */
const downloadGifWithText = async (gifUrl) => {
  const custom = gifCustom[gifUrl] || {};
  const finalText = custom.text ?? globalText ?? inputText;
  const finalSize = custom.size ?? globalSize;
  const finalColor = custom.color ?? globalColor;
  const finalFont = custom.font ?? globalFont;
  const finalPosition = custom.position ?? globalPosition;

  setLoading(true);
  const res = await fetch(`${BACKEND_URL}${gifUrl}`);
  const buffer = await res.arrayBuffer();
  const gif = parseGIF(buffer);
  const frames = decompressFrames(gif, true);

  const images = frames.map(frame => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = frame.dims.width;
    canvas.height = frame.dims.height;
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    imageData.data.set(frame.patch);
    ctx.putImageData(imageData, 0, 0);

    ctx.font = `bold ${finalSize}px ${finalFont}`;
    ctx.fillStyle = finalColor;
    ctx.textAlign = "center";

    let y = canvas.height * 0.85;
    if (finalPosition === "top") y = canvas.height * 0.15;
    if (finalPosition === "center") y = canvas.height * 0.5;

    ctx.fillText(finalText, canvas.width/2, y);
    return canvas.toDataURL("image/png");
  });

  gifshot.createGIF({ images, interval: 0.15 }, (obj) => {
    const link = document.createElement("a");
    link.href = obj.image;
    link.download = `${finalText}.gif`;
    link.click();
    setLoading(false);
  });
};

return (
<div className="giffy-page">
<div className="container dashboard-layout">


<h1>Giffy - A customized Gif Generator ✨</h1>
{showWaitMessage &&  <p className="hint-text">
  ⏳ Please wait <strong>up to 1 minute</strong> After clicking <strong>Generate GIF</strong>.
  Our server may take a short time to wake up during the first run or after being idle for 15 minutes.
</p>}

<div className="input-container">
<div className="search-icon">⌕</div>
<input placeholder="Enter your text" ref={inputRef} value={inputText} onChange={(e)=>setInputText(e.target.value)} />
{inputText && <button className="clear-btn" onClick={()=>{setInputText(""); inputRef.current?.focus();}}>×</button>}
</div>

<div className="btn-group">
<button onClick={generateGif} disabled={loading}>Generate</button>
{globalText && <button onClick={()=>setShowText(!showText)}>{showText?"Remove Text":"Add Text"}</button>}
</div>

{gifs.length>0 && (
<div className="custom-panel">
<label>Overlay Text<input value={globalText} onChange={e=>setGlobalText(e.target.value)} /></label>
<label>Font Size<input type="range" min="18" max="44" value={globalSize} onChange={e=>setGlobalSize(+e.target.value)} /></label>
<label>Text Color<input type="color" value={globalColor} onChange={e=>setGlobalColor(e.target.value)} /></label>
<label>Font<select value={globalFont} onChange={e=>setGlobalFont(e.target.value)}>{GOOGLE_FONTS.map(f=><option key={f}>{f}</option>)}</select></label>
<label>Position<select value={globalPosition} onChange={e=>setGlobalPosition(e.target.value)}><option value="top">Top</option><option value="center">Center</option><option value="bottom">Bottom</option></select></label>
</div>
)}

<div className="gif-grid">
{gifs.map((gif,i)=>{
const custom = gifCustom[gif] || {};
const displayText = custom.text ?? globalText ?? inputText;
const displaySize = custom.size ?? globalSize;
const displayColor = custom.color ?? globalColor;
const displayFont = custom.font ?? globalFont;
const displayPosition = custom.position ?? globalPosition;

return (
<div className="gif-card" key={i}>
<div className="gif-preview">
<img src={`${BACKEND_URL}${gif}`} alt="gif" />
{showText && <div className={`overlay ${displayPosition}`} style={{fontSize:displaySize,color:displayColor,fontFamily:displayFont}}>{displayText}</div>}
</div>

<div className="gif-actions" style={{display:"flex",gap:"12px"}}>
<button onClick={()=>downloadGifWithText(gif)}>Download GIF</button>
<button onClick={()=>setActiveGif(gif)}>Customize</button>
</div>
</div>
);
})}
</div>

{gifs.length>0 && (
<div style={{ marginTop: "28px", display: "flex", gap: "16px", alignItems: "center" }}>
<button onClick={prevPage} disabled={loading || page===0}>⬅</button>
<span style={{ opacity: 0.7 }}>Page {page + 1}</span>
<button onClick={nextPage} disabled={loading || !hasMore}>➡</button>
</div>
)}

{activeGif && (
  <div className="modal-backdrop" onClick={() => setActiveGif(null)}>
    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
      
      <div className="modal-header">
        <h2>Customize GIF</h2>
      </div>

      <div className="modal-body">
        <div className="field">
          <label>Overlay Text</label>
         <input
  type="text"
  placeholder="Enter text..."
  value={
    gifCustom[activeGif]?.text ??
    globalText ??
    inputText
  }
  onChange={e =>
    setGifCustom(prev => ({
      ...prev,
      [activeGif]: {
        ...prev[activeGif],
        text: e.target.value
      }
    }))
  }
/>

        </div>

        <div className="field">
          <label>Font Size</label>
          <input
            type="range"
            min="18"
            max="44"
            onChange={e =>
              setGifCustom(prev => ({
                ...prev,
                [activeGif]: { ...prev[activeGif], size: +e.target.value }
              }))
            }
          />
        </div>

        <div className="field">
          <label>Text Color</label>
          <input
            type="color"
            onChange={e =>
              setGifCustom(prev => ({
                ...prev,
                [activeGif]: { ...prev[activeGif], color: e.target.value }
              }))
            }
          />
        </div>

        <div className="field">
          <label>Font Family</label>
          <select
            onChange={e =>
              setGifCustom(prev => ({
                ...prev,
                [activeGif]: { ...prev[activeGif], font: e.target.value }
              }))
            }
          >
            {GOOGLE_FONTS.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Text Position</label>
          <select
            onChange={e =>
              setGifCustom(prev => ({
                ...prev,
                [activeGif]: { ...prev[activeGif], position: e.target.value }
              }))
            }
          >
            <option value="top">Top</option>
            <option value="center">Center</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
      </div>

      <div className="modal-footer">
         <button className="closee-btn" onClick={() => setActiveGif(null)}>
          Close
        </button>
        <button className="done-btn" onClick={() => setActiveGif(null)}>
          Done
        </button>
       
      </div>

    </div>
  </div>
)}


</div>
</div>
);
}
