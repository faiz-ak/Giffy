import { Routes, Route } from "react-router-dom";
import LandingLayout from "./components/LandingLayout";

import NotFound from "./components/NotFound";
import Navbar from "./components/Navbar";
import Rainbow from "./components/Rainbow";
import Giffy from "./components/Giffy";


export default function App() {
  return (
<<<<<<< HEAD
    <>
      <Navbar />
=======
    <div className="container">
  <h1>Giffy - A customized Gif Generator ✨</h1>
{showWaitMessage && (
   <p className="hint-text">
  ⏳ Please wait <strong>up to 1 minute</strong> after clicking <strong>Generate GIF</strong>.
  Our server may take a short time to wake up during the first run or after being idle for 15 minutes.
</p>
)}
 
<input
  placeholder="User Friendly Prompt"
  value={inputText}
  onChange={(e) => setInputText(e.target.value)}
/>
 
      <div className="btn-group">
        <button onClick={generateGif}  disabled={loading}>
          Generate GIF
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
>>>>>>> 0d3def4d8426c95f2d6ba6bd48388849df9299ae

      <Routes>
        <Route path="/" element={<LandingLayout />} />
        <Route path="/rainbow" element={<Rainbow />} />
        <Route path="/giffy" element={<Giffy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
