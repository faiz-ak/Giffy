# 🎨 GiffyText – Custom GIF & Rainbow Text Generator (Frontend)

A modern **React.js** web application that allows users to:

- 🎬 Generate **customized animated GIFs** using text prompts  
- 🌈 Create **Rainbow & Gradient Text** with live preview and export options  

The frontend securely communicates with a **Spring Boot backend proxy** that fetches GIFs from the **GIPHY API**, ensuring API key protection and smooth access even on **restricted corporate networks**.

This project focuses on **clean UI, smooth UX, secure API handling, and export-ready outputs**.

---

## ✨ Features

### 🎬 GIF Generator
- Generate GIFs based on user text input  
- Smart keyword-based GIF fetching  
- Add custom text overlay on GIFs  
- Font size, color, position & font-family controls  
- Live preview before download  
- Download final GIF with text applied  
- Backend-proxied API for security  

### 🌈 Rainbow Text Generator
- Rainbow-colored text (per-character coloring)  
- Gradient text with:
  - Preset gradients  
  - Custom gradient colors  
  - Adjustable gradient direction (0°–360°)  
- Multi-line text support  
- Live preview with accurate rendering  
- Export options:
  - 🖼️ PNG (pixel-perfect match with preview)  
  - 📄 Word (.docx) with safe fallback formatting  

---

## 🚀 Key Highlights

- Clean, modern dark UI  
- Responsive layout (desktop & mobile)  
- Smooth loaders for better UX  
- Secure API consumption via backend proxy  
- Handles corporate network & firewall (403) restrictions  
- Canvas-based PNG export for exact visuals  
- Honest Word export handling format limitations  
- Modular and scalable React architecture  

---

## 🛠️ Tech Stack

### Frontend
- **React.js**
- **JavaScript (ES6+)**
- **Axios**
- **CSS**
- **HTML5 Canvas**

### Backend (Proxy)
- **Spring Boot**
- **OpenFeign**
- **REST APIs**
- **GIPHY API**
