# 🎨 GifText – GIF & Rainbow Text Generator (Frontend)

GifText is a modern **React + Vite** web application that allows users to generate **custom animated GIFs** and create **rainbow or gradient text** with live previews and export options.

The frontend communicates securely with a **Spring Boot backend proxy** to fetch GIFs from the **GIPHY API**, ensuring API key protection and reliable access even on **restricted corporate networks**.

This project focuses on **performance, clean UI, smooth UX, and secure API consumption**.

---

## ✨ Features

### 🎬 GIF Generator
- Generate GIFs using dynamic text prompts
- Smart keyword-based GIF fetching
- Live GIF preview with text overlay
- Customization options:
  - Font size
  - Font color
  - Font family
  - Text position
- Download final GIF with applied text
- Secure backend-proxied API calls

### 🌈 Rainbow Text Generator
- Rainbow-colored text (per-character coloring)
- Gradient text with:
  - Preset gradients
  - Custom gradient colors
  - Adjustable gradient direction (0°–360°)
- Multi-line text support
- Real-time live preview
- Export options:
  - 🖼️ PNG (pixel-perfect match with preview)
  - 📄 Word (.docx) with safe fallback formatting

---

## 🚀 Key Highlights

- Built with **React + Vite** for fast development & performance
- Clean, modern dark-themed UI
- Fully responsive (desktop & mobile)
- Smooth loaders for better user experience
- Secure API handling via Spring Boot proxy
- Handles corporate network & firewall (403) restrictions
- Canvas-based PNG export for accurate visuals
- Modular and scalable frontend architecture

---

## 🛠️ Tech Stack

### Frontend
- **React.js**
- **Vite**
- **JavaScript (ES6+)**
- **Axios**
- **CSS**
- **HTML5 Canvas**

### Backend (Proxy)
- **Spring Boot**
- **OpenFeign**
- **REST APIs**
- **GIPHY API**
