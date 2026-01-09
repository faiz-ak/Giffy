# 🎬 Custom GIF Generator – Frontend

A React.js-based web application that allows users to generate customized GIFs using text prompts. The frontend communicates with a Spring Boot backend proxy that securely fetches GIF data from the GIPHY API, ensuring API key protection and reliable access even on restricted corporate networks.

This project focuses on clean UI design, smooth user experience, and secure API consumption.

---

## 🚀 Features

- Generate GIFs based on user text input
- Real-time loader for better UX
- Clean and responsive user interface
- Secure API access via backend proxy
- Handles corporate network (403) restrictions
- Easy to deploy on Netlify or similar platforms

---

## 🛠️ Tech Stack

- **React.js**
- **JavaScript (ES6+)**
- **Axios**
- **CSS**
- **Spring Boot Backend (OpenFeign Proxy)**
- **GIPHY API**

---

## 🔁 Application Flow

User enters text
↓
React Frontend
↓
Spring Boot Backend Proxy
↓
GIPHY API
↓
GIF data returned to frontend


---

## 📡 API Integration

The frontend does **not** call the GIPHY API directly.

All requests are routed through a Spring Boot backend that:
- Hides API keys
- Handles CORS
- Avoids corporate firewall restrictions
