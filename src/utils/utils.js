// ===== CONFIGURATION =====
export const RAINBOW_COLORS = [
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#00FF00",
  "#00FFFF",
  "#0000FF",
  "#8B00FF",
];

export const GRADIENT_PRESETS = {
  rainbow: "linear-gradient(45deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #00FFFF, #0000FF, #8B00FF)",
  sunset: "linear-gradient(45deg, #ff6b6b, #feca57, #ff9ff3)",
  ocean: "linear-gradient(45deg, #667eea, #764ba2, #00d2ff)",
  fire: "linear-gradient(45deg, #ff0000, #ff4500, #ffa500, #ffff00)",
  neon: "linear-gradient(45deg, #ff00ff, #00ffff, #ffff00)",
  cosmic: "linear-gradient(45deg, #8e2de2, #4a00e0, #ff006e)",
  tropical: "linear-gradient(45deg, #ff9a9e, #fecfef, #fecfef)",
  electric: "linear-gradient(45deg, #00f5ff, #0080ff, #8000ff)",
  lava: "linear-gradient(45deg, #ff4500, #ff6347, #ff1493)",
  aurora: "linear-gradient(45deg, #00ff87, #60efff, #ff0080)",
  peach: "linear-gradient(45deg, #ffeaa7, #fdcb6e, #e17055)",
  emerald: "linear-gradient(45deg, #11998e, #38ef7d, #2ecc71)",
  crimson: "linear-gradient(45deg, #eb3349, #f45c43, #ff6b6b)",
  lavender: "linear-gradient(45deg, #a29bfe, #6c5ce7, #fd79a8)",
  gold: "linear-gradient(45deg, #f39c12, #f1c40f, #ffeb3b)",
  rose: "linear-gradient(45deg, #fd79a8, #e84393, #ff6b9d)",
  mint: "linear-gradient(45deg, #00b09b, #96c93d, #4ecdc4)",
  violet: "linear-gradient(45deg, #9c27b0, #e91e63, #ff5722)",
  cyber: "linear-gradient(45deg, #00ff41, #00d4aa, #007cf0)",
  magma: "linear-gradient(45deg, #ff0844, #ffb199, #ff6b35)",
  berry: "linear-gradient(45deg, #8e44ad, #c0392b, #e74c3c)",
};

export const GOOGLE_FONTS = [
  "Arial","Impact","Verdana","Tahoma","Georgia","Abril Fatface","Anton","Bebas Neue",
  "Bangers","Creepster","Lobster","Pacifico","Great Vibes","Dancing Script",
  "Gloria Hallelujah","Indie Flower","Kaushan Script","Luckiest Guy","Orbitron",
  "Righteous","Rowdies","Staatliches","Yellowtail","Zeyada"
];

// ===== FONT LOADER =====
const loadedFonts = new Set(["Arial"]);

export function loadGoogleFont(font) {
  if (loadedFonts.has(font)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;700&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(font);
}
