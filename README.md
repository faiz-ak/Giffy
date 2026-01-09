# 🎬 Custom GIF Generator

A **frontend-only customizable GIF generator** built using **React.js** that allows users to search GIFs based on text prompts, overlay aesthetic custom text, and **download real animated GIFs with the text embedded**, all without using any backend.

This project demonstrates advanced frontend concepts such as **API integration, canvas rendering, GIF frame decoding and re-encoding**, and dynamic UI customization.

---

## 🚀 Features

- 🔍 Smart GIF search based on user intent  
- ✍️ Custom text overlay with font size, color & position control  
- 🎞️ Real animated GIF download (text embedded in every frame)  
- ⏳ Loader for better user experience  
- ♻️ Reload / reset functionality  
- 🧠 Keyword extraction for accurate GIF results  
- 💯 No backend required  

---

## 🛠️ Technologies Used

### ⚛️ React.js
- Component-based UI
- State management using hooks
- Conditional rendering for loaders & previews

### 🌐 Axios
- API communication with GIPHY
- Simplified HTTP requests & error handling

### 🎞️ GIPHY API
- Fetches emotion-based and keyword-matched GIFs
- Provides a large and reliable GIF database

### 🧩 gifuct-js
- Decodes GIFs into individual frames
- Enables frame-level manipulation using canvas

### 🎥 gifshot
- Re-encodes edited frames into a new animated GIF
- Generates downloadable GIF files in-browser

---

## 🔁 Project Workflow

1. User enters a custom text prompt  
2. Core keyword is extracted for accurate GIF search  
3. GIF is fetched from GIPHY API  
4. GIF frames are decoded using gifuct-js  
5. Custom text is drawn on each frame using Canvas  
6. Frames are re-encoded into a new animated GIF using gifshot  
7. User downloads the customized GIF  

---

## 📁 Folder Structure

