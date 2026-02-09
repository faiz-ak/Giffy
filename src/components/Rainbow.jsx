import React, { useEffect, useRef, useState } from "react";
import "../Rainbow.css";
import "../fonts.css";
import {
  RAINBOW_COLORS,
  GRADIENT_PRESETS,
  GOOGLE_FONTS,
  loadGoogleFont,
} from "../utils/utils";
import { saveAs } from "file-saver";
 
// Global state variables (like JS version)
let text = "";
let fontSize = 36;
let lineHeight = 1;
let letterSpacing = 1;
let fontFamily = "Arial";
let textStyle = "rainbow";
let gradientAngle = 45;
let selectedGradient = "rainbow";
let customGradient = null;
let backgroundColor = "#ffffff";
let isTransparent = true;
let textSelections = {}; // Store per-character settings
let selectedTextRange = null; // Currently selected text range
let updateTimeout = null; // Debounce timeout
 
// Background color presets
const BACKGROUND_COLORS = [
  "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080", "#ffc0cb", "#a52a2a", "#808080", "#000000", "#90ee90", "#add8e6",
  "#f5deb3", "#dc143c", "#32cd32", "#4169e1", "#ffd700", "#da70d6", "#40e0d0", "#ff6347", "#9370db", "#f0e68c", "#d2691e", "#708090", "#2f4f4f", "#8fbc8f", "#6495ed"
];
 
export default function Rainbow() {
  const previewRef = useRef(null);
  const angleSliderRef = useRef(null);
  const fontSizeRef = useRef(null);
  const fontFamilyRef = useRef(null);
  const colorRef = useRef(null);
  const alignmentRef = useRef(null);
  const [angleDisplay, setAngleDisplay] = useState(45);
  const [showGradientOptions, setShowGradientOptions] = useState(false);
  const [showBackgroundColor, setShowBackgroundColor] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedGradientState, setSelectedGradientState] = useState("rainbow");
  const [floatingToolbar, setFloatingToolbar] = useState({ show: false, x: 0, y: 0 });
 
  useEffect(() => {
    updatePreview();
    // Add global click listener for deselection
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
 
  // Add persistent focus effect for gradient colors (stays until changed)
  const addPersistentFocus = (element) => {
    // Remove focus from all gradient elements
    document.querySelectorAll('.gradient-circle.focus-effect, .custom-colors input.focus-effect').forEach(el => {
      el.classList.remove('focus-effect');
    });
    // Add focus to clicked element (persistent)
    element.classList.add('focus-effect');
  };
 
  // Update background color selection (persistent)
  const updateBackgroundSelection = (selectedColor) => {
    // Remove selected class from all background color circles
    document.querySelectorAll('.color-circle').forEach(circle => {
      circle.classList.remove('selected');
    });
    // Add selected class to the circle with matching background color
    document.querySelectorAll('.color-circle').forEach(circle => {
      if (circle.style.backgroundColor === selectedColor ||
          rgbToHex(circle.style.backgroundColor) === selectedColor) {
        circle.classList.add('selected');
      }
    });
  };
 
  // Helper function to convert RGB to HEX
  const rgbToHex = (rgb) => {
    if (!rgb || rgb === 'transparent') return rgb;
    const result = rgb.match(/\d+/g);
    if (!result) return rgb;
    return '#' + result.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  };
 
  // Apply settings to selected text
  const applyToSelection = (property, value) => {
    if (!selectedTextRange) return;
   
    for (let i = selectedTextRange.start; i <= selectedTextRange.end; i++) {
      if (!textSelections[i]) textSelections[i] = {};
      textSelections[i][property] = value;
    }
    updatePreview();
  };
 
  // Handle text selection in preview
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      setHasSelection(true);
     
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const previewRect = previewRef.current.getBoundingClientRect();
     
      // Position floating toolbar at center of screen
      setFloatingToolbar({
        show: true,
        x: window.innerWidth / 2 - 150,
        y: window.innerHeight / 2 - 50
      });
     
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;
     
      // Find start and end character indices using data-char-index
      let startIndex = -1;
      let endIndex = -1;
     
      // Get start index
      if (startContainer.nodeType === Node.TEXT_NODE) {
        const startSpan = startContainer.parentElement;
        if (startSpan && startSpan.hasAttribute('data-char-index')) {
          startIndex = parseInt(startSpan.getAttribute('data-char-index'));
        }
      }
     
      // Get end index
      if (endContainer.nodeType === Node.TEXT_NODE) {
        const endSpan = endContainer.parentElement;
        if (endSpan && endSpan.hasAttribute('data-char-index')) {
          endIndex = parseInt(endSpan.getAttribute('data-char-index'));
          // Adjust for selection length within the span
          if (startContainer === endContainer) {
            endIndex = startIndex + range.toString().length - 1;
          }
        }
      }
     
      // Handle multi-span selections
      if (startIndex !== -1 && endIndex === -1) {
        const allSpans = previewRef.current.querySelectorAll('[data-char-index]');
        const selectedText = selection.toString();
        endIndex = startIndex + selectedText.length - 1;
      }
     
      if (startIndex !== -1 && endIndex !== -1) {
        selectedTextRange = {
          start: Math.min(startIndex, endIndex),
          end: Math.max(startIndex, endIndex)
        };
       
        // Update form controls to show selected text properties
        const firstCharSettings = textSelections[selectedTextRange.start] || {};
        if (fontSizeRef.current) {
          fontSizeRef.current.value = firstCharSettings.fontSize || fontSize;
        }
        if (fontFamilyRef.current) {
          fontFamilyRef.current.value = firstCharSettings.fontFamily || fontFamily;
        }
        if (colorRef.current) {
          colorRef.current.value = firstCharSettings.customColor || '#000000';
        }
        if (alignmentRef.current) {
          alignmentRef.current.value = firstCharSettings.alignment || 'left';
        }
      }
    } else {
      setHasSelection(false);
      setFloatingToolbar({ show: false, x: 0, y: 0 });
      selectedTextRange = null;
     
      // Reset form controls to global values
      if (fontSizeRef.current) {
        fontSizeRef.current.value = fontSize;
      }
      if (fontFamilyRef.current) {
        fontFamilyRef.current.value = fontFamily;
      }
    }
  };
 
  // Handle click outside to deselect
  const handleClickOutside = (e) => {
    // Only deselect if clicking outside the preview area AND outside controls AND not on background colors AND not on floating toolbar
    if (!previewRef.current?.contains(e.target) &&
        !e.target.closest('.control-grid') &&
        !e.target.closest('.gradient-grid') &&
        !e.target.closest('.custom-colors') &&
        !e.target.closest('.background-color-section') &&
        !e.target.closest('.color-circle') &&
        !e.target.closest('.floating-toolbar')) {
      if (window.getSelection().toString().length === 0) {
        setHasSelection(false);
        setFloatingToolbar({ show: false, x: 0, y: 0 });
        selectedTextRange = null;
      }
    }
  };
 
  // Create gradient text using HTML spans instead of canvas
  const createGradientText = (text, fontSize, lineHeight, fontFamily, letterSpacing) => {
    const container = document.createElement("div");
    const lines = text.split("\n");
    const gradientStr = customGradient || GRADIENT_PRESETS[selectedGradient];
    const colorMatches = gradientStr.match(/#[0-9a-fA-F]{6}/g) || [];
    let charIndex = 0;
 
    lines.forEach((line, lineIndex) => {
      const lineDiv = document.createElement("div");
      lineDiv.style.lineHeight = String(lineHeight);
      lineDiv.style.userSelect = "text";
      lineDiv.style.cursor = "text";
     
      // Check if any character in this line has alignment setting
      let lineAlignment = 'left';
      for (let i = 0; i < line.length; i++) {
        const charSettings = textSelections[charIndex + i] || {};
        if (charSettings.alignment) {
          lineAlignment = charSettings.alignment;
          break;
        }
      }
      lineDiv.style.textAlign = lineAlignment;
 
      // Count non-space characters for gradient calculation
      const nonSpaceChars = line.replace(/ /g, '');
      let nonSpaceIndex = 0;
 
      for (let charInLine = 0; charInLine < line.length; charInLine++) {
        const char = line[charInLine];
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char;
        span.setAttribute('data-char-index', charIndex);
       
        // Apply character-specific settings or defaults
        const charSettings = textSelections[charIndex] || {};
        span.style.fontSize = (charSettings.fontSize || fontSize) + "px";
        span.style.fontWeight = "bold";
        span.style.fontFamily = `"${charSettings.fontFamily || fontFamily}", sans-serif`;
        span.style.letterSpacing = (charSettings.letterSpacing || letterSpacing) + "px";
        span.style.userSelect = "text";
       
        // Apply gradient color or custom color
        if (charSettings.customColor) {
          span.style.color = charSettings.customColor;
        } else if (char === ' ') {
          // Spaces get transparent or inherit color
          span.style.color = 'transparent';
        } else {
          // Calculate gradient color per line for non-space characters only
          let position;
          if (nonSpaceChars.length === 1) {
            position = 0; // Single character gets first color
          } else {
            position = nonSpaceIndex / (nonSpaceChars.length - 1);
          }
         
          // Apply angle rotation to position
          const rotatedPosition = (position + (gradientAngle / 360)) % 1;
         
          const segmentIndex = Math.floor(rotatedPosition * (colorMatches.length - 1));
          const segmentFactor = (rotatedPosition * (colorMatches.length - 1)) % 1;
         
          if (segmentIndex >= colorMatches.length - 1 || colorMatches.length === 1) {
            span.style.color = colorMatches[colorMatches.length - 1];
          } else {
            const color1 = colorMatches[segmentIndex];
            const color2 = colorMatches[segmentIndex + 1];
           
            // Simple color interpolation
            const r1 = parseInt(color1.slice(1, 3), 16);
            const g1 = parseInt(color1.slice(3, 5), 16);
            const b1 = parseInt(color1.slice(5, 7), 16);
            const r2 = parseInt(color2.slice(1, 3), 16);
            const g2 = parseInt(color2.slice(3, 5), 16);
            const b2 = parseInt(color2.slice(5, 7), 16);
           
            const r = Math.round(r1 + (r2 - r1) * segmentFactor);
            const g = Math.round(g1 + (g2 - g1) * segmentFactor);
            const b = Math.round(b1 + (b2 - b1) * segmentFactor);
           
            span.style.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          }
          nonSpaceIndex++;
        }
       
        charIndex++;
        lineDiv.appendChild(span);
      }
      container.appendChild(lineDiv);
    });
 
    // Add selection event listeners
    container.addEventListener('mouseup', handleTextSelection);
    container.addEventListener('keyup', handleTextSelection);
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      setTimeout(handleTextSelection, 10);
    });
 
    return container;
  };
 
  // Create rainbow text with selection support
  const createRainbowSpans = (text, fontSize, lineHeight, fontFamily, letterSpacing) => {
    const container = document.createElement("div");
    const lines = text.split("\n");
    let charIndex = 0;
 
    lines.forEach((line, lineIndex) => {
      const lineDiv = document.createElement("div");
      lineDiv.style.lineHeight = String(lineHeight);
      lineDiv.style.userSelect = "text";
      lineDiv.style.cursor = "text";
     
      // Check if any character in this line has alignment setting
      let lineAlignment = 'left';
      for (let i = 0; i < line.length; i++) {
        const charSettings = textSelections[charIndex + i] || {};
        if (charSettings.alignment) {
          lineAlignment = charSettings.alignment;
          break;
        }
      }
      lineDiv.style.textAlign = lineAlignment;
 
      for (const char of line) {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char;
        span.setAttribute('data-char-index', charIndex);
       
        // Apply character-specific settings or defaults
        const charSettings = textSelections[charIndex] || {};
        span.style.fontSize = (charSettings.fontSize || fontSize) + "px";
        span.style.fontWeight = "bold";
        span.style.fontFamily = `"${charSettings.fontFamily || fontFamily}", sans-serif`;
        span.style.letterSpacing = (charSettings.letterSpacing || letterSpacing) + "px";
        span.style.color = charSettings.customColor || RAINBOW_COLORS[charIndex % RAINBOW_COLORS.length];
        span.style.userSelect = "text";
       
        charIndex++;
        lineDiv.appendChild(span);
      }
      container.appendChild(lineDiv);
    });
 
    // Add selection event listeners
    container.addEventListener('mouseup', handleTextSelection);
    container.addEventListener('keyup', handleTextSelection);
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      setTimeout(handleTextSelection, 10);
    });
 
    return container;
  };
 
  // Clean up textSelections for characters beyond current text length
  const cleanupTextSelections = () => {
    const textLength = text.replace(/\n/g, "").length;
    Object.keys(textSelections).forEach(key => {
      if (parseInt(key) >= textLength) {
        delete textSelections[key];
      }
    });
  };
 
  // Debounced update preview
  const debouncedUpdatePreview = () => {
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      cleanupTextSelections();
      updatePreview();
    }, 100);
  };
 
  // Update preview (like JS version)
  const updatePreview = () => {
    const preview = previewRef.current;
    if (!preview) return;
 
    // Only load font if it changed
    if (fontFamily !== preview.dataset.currentFont) {
      loadGoogleFont(fontFamily);
      preview.dataset.currentFont = fontFamily;
    }
 
    // Clear previous content and event listeners
    preview.innerHTML = "";
   
    // Set preview background
    if (!isTransparent) {
      preview.style.backgroundColor = backgroundColor;
    } else {
      preview.style.backgroundColor = "transparent";
    }
 
    if (!text.trim()) {
      preview.innerHTML = '<p style="color: #94a3b8; font-style: italic;">Enter text to see preview...</p>';
      return;
    }
 
    const styledText = textStyle === "gradient"
      ? createGradientText(text, fontSize, lineHeight, fontFamily, letterSpacing)
      : createRainbowSpans(text, fontSize, lineHeight, fontFamily, letterSpacing);
 
    preview.appendChild(styledText);
  };
 
  // PNG export with character-level customization
  const generatePngImage = async () => {
    if (!text.trim()) return;
 
    try {
      const lines = text.split("\n");
      const padding = 20;
     
      // Calculate line alignments and dimensions
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
     
      let maxWidth = 0;
      let totalHeight = 0;
      let charIndex = 0;
      const lineData = [];
 
      // First pass: calculate dimensions and alignments
      lines.forEach((line, lineIndex) => {
        let lineWidth = 0;
        let lineAlignment = 'left';
        const lineStartIndex = charIndex;
       
        // Check alignment for this line
        for (let i = 0; i < line.length; i++) {
          const charSettings = textSelections[charIndex + i] || {};
          if (charSettings.alignment) {
            lineAlignment = charSettings.alignment;
            break;
          }
        }
       
        // Calculate line width with character-specific settings
        for (const char of line) {
          const charSettings = textSelections[charIndex] || {};
          const charFontSize = charSettings.fontSize || fontSize;
          const charFontFamily = charSettings.fontFamily || fontFamily;
          const charLetterSpacing = charSettings.letterSpacing || letterSpacing;
         
          ctx.font = `bold ${charFontSize}px "${charFontFamily}", sans-serif`;
          lineWidth += ctx.measureText(char).width + charLetterSpacing;
          charIndex++;
        }
       
        lineData.push({
          text: line,
          width: lineWidth,
          alignment: lineAlignment,
          startIndex: lineStartIndex
        });
       
        maxWidth = Math.max(maxWidth, lineWidth);
        totalHeight += (fontSize * lineHeight);
        // Don't increment charIndex here for newline - it causes misalignment
      });
 
      // Check if any text uses center or right alignment
      let hasNonLeftAlignment = false;
      let alignmentCheckIndex = 0;
      lines.forEach((line) => {
        for (let i = 0; i < line.length; i++) {
          const charSettings = textSelections[alignmentCheckIndex + i] || {};
          if (charSettings.alignment === 'center' || charSettings.alignment === 'right') {
            hasNonLeftAlignment = true;
            break;
          }
        }
        alignmentCheckIndex += line.length;
        if (hasNonLeftAlignment) return;
      });
 
      const pixelRatio = 4;
      let width;
      if (hasNonLeftAlignment) {
        // Use preview width for center/right alignment
        const previewWidth = previewRef.current ? previewRef.current.offsetWidth - 56 : 400;
        width = Math.max(previewWidth, Math.ceil(maxWidth) + padding * 2);
      } else {
        // Use tight fit for left alignment only
        width = Math.ceil(maxWidth) + padding * 2;
      }
      const height = Math.ceil(totalHeight) + padding * 2;
 
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
 
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
 
      // Clear canvas and fill background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!isTransparent) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }
 
      ctx.textBaseline = "alphabetic";
      let y = padding + fontSize * 0.8;
      charIndex = 0;
 
      if (textStyle === "gradient") {
        const gradientStr = customGradient || GRADIENT_PRESETS[selectedGradient];
        const colorMatches = gradientStr.match(/#[0-9a-fA-F]{6}/g) || [];
 
        lineData.forEach((lineInfo) => {
          let x = padding;
         
          // Apply alignment
          if (lineInfo.alignment === 'center') {
            x = (width - lineInfo.width) / 2;
          } else if (lineInfo.alignment === 'right') {
            x = width - lineInfo.width - padding;
          }
         
          // Count non-space characters for gradient calculation
          const nonSpaceChars = lineInfo.text.replace(/ /g, '');
          let nonSpaceIndex = 0;
         
          for (let charInLine = 0; charInLine < lineInfo.text.length; charInLine++) {
            const char = lineInfo.text[charInLine];
            const charSettings = textSelections[charIndex] || {};
            ctx.font = `bold ${charSettings.fontSize || fontSize}px "${charSettings.fontFamily || fontFamily}", sans-serif`;
           
            if (charSettings.customColor) {
              ctx.fillStyle = charSettings.customColor;
            } else if (char === ' ') {
              // Skip spaces in gradient calculation
              ctx.fillStyle = 'transparent';
            } else {
              // Use per-line gradient calculation for non-space characters only
              let position;
              if (nonSpaceChars.length === 1) {
                position = 0; // Single character gets first color
              } else {
                position = nonSpaceIndex / (nonSpaceChars.length - 1);
              }
              const rotatedPosition = (position + (gradientAngle / 360)) % 1;
             
              const segmentIndex = Math.floor(rotatedPosition * (colorMatches.length - 1));
              const segmentFactor = (rotatedPosition * (colorMatches.length - 1)) % 1;
             
              let color;
              if (segmentIndex >= colorMatches.length - 1 || colorMatches.length === 1) {
                color = colorMatches[colorMatches.length - 1];
              } else {
                const color1 = colorMatches[segmentIndex];
                const color2 = colorMatches[segmentIndex + 1];
               
                const r1 = parseInt(color1.slice(1, 3), 16);
                const g1 = parseInt(color1.slice(3, 5), 16);
                const b1 = parseInt(color1.slice(5, 7), 16);
                const r2 = parseInt(color2.slice(1, 3), 16);
                const g2 = parseInt(color2.slice(3, 5), 16);
                const b2 = parseInt(color2.slice(5, 7), 16);
               
                const r = Math.round(r1 + (r2 - r1) * segmentFactor);
                const g = Math.round(g1 + (g2 - g1) * segmentFactor);
                const b = Math.round(b1 + (b2 - b1) * segmentFactor);
               
                color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
              }
              ctx.fillStyle = color;
              nonSpaceIndex++;
            }
           
            if (char !== ' ' || !isTransparent) {
              ctx.fillText(char, x, y);
            }
            const charWidth = ctx.measureText(char).width;
            const charLetterSpacing = charSettings.letterSpacing || letterSpacing;
            x += charWidth + charLetterSpacing;
            charIndex++;
          }
          y += fontSize * lineHeight;
        });
      } else {
        lineData.forEach((lineInfo) => {
          let x = padding;
         
          // Apply alignment
          if (lineInfo.alignment === 'center') {
            x = (width - lineInfo.width) / 2;
          } else if (lineInfo.alignment === 'right') {
            x = width - lineInfo.width - padding;
          }
         
          for (const char of lineInfo.text) {
            const charSettings = textSelections[charIndex] || {};
            ctx.font = `bold ${charSettings.fontSize || fontSize}px "${charSettings.fontFamily || fontFamily}", sans-serif`;
            ctx.fillStyle = charSettings.customColor || RAINBOW_COLORS[charIndex % RAINBOW_COLORS.length];
            ctx.fillText(char, x, y);
            const charWidth = ctx.measureText(char).width;
            const charLetterSpacing = charSettings.letterSpacing || letterSpacing;
            x += charWidth + charLetterSpacing;
            charIndex++;
          }
          y += fontSize * lineHeight;
        });
      }
 
      const link = document.createElement("a");
      link.download = "Rainbow Text.png";
      link.href = canvas.toDataURL("image/png", 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    }
  };
 
  // Helper function to calculate gradient color for character position
  const getGradientColorForPosition = (charIndex, totalChars) => {
    const gradientStr = customGradient || GRADIENT_PRESETS[selectedGradient];
    const colors = gradientStr.match(/#[0-9a-fA-F]{6}/g) || [];
    if (colors.length < 2) return colors[0] || "#FF0000";
   
    const position = charIndex / (totalChars - 1);
    const segmentIndex = Math.floor(position * (colors.length - 1));
    const segmentFactor = (position * (colors.length - 1)) % 1;
   
    if (segmentIndex >= colors.length - 1) return colors[colors.length - 1];
   
    const color1 = colors[segmentIndex];
    const color2 = colors[segmentIndex + 1];
   
    // Simple color interpolation
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
   
    const r = Math.round(r1 + (r2 - r1) * segmentFactor);
    const g = Math.round(g1 + (g2 - g1) * segmentFactor);
    const b = Math.round(b1 + (b2 - b1) * segmentFactor);
   
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
 
  // Word export (matching live preview colors)
  const downloadWordDoc = () => {
    if (!text.trim()) return;
   
    try {
      const lines = text.split("\n");
      let globalCharIndex = 0;
      const totalChars = text.replace(/\n/g, "").length;
     
      const bodyContent = lines.map((line) => {
        // Check alignment for this line
        let lineAlignment = 'left';
        const lineStartIndex = globalCharIndex;
        for (let i = 0; i < line.length; i++) {
          const charSettings = textSelections[lineStartIndex + i] || {};
          if (charSettings.alignment) {
            lineAlignment = charSettings.alignment;
            break;
          }
        }
       
        const spans = Array.from(line).map((char) => {
          const charSettings = textSelections[globalCharIndex] || {};
          let color;
         
          if (charSettings.customColor) {
            color = charSettings.customColor;
          } else if (textStyle === "gradient") {
            color = getGradientColorForPosition(globalCharIndex, totalChars);
          } else {
            color = RAINBOW_COLORS[globalCharIndex % RAINBOW_COLORS.length];
          }
         
          const charFontSize = charSettings.fontSize || fontSize;
          const charFontFamily = charSettings.fontFamily || fontFamily;
          const charLetterSpacing = charSettings.letterSpacing || letterSpacing;
         
          globalCharIndex++;
          return `<span style="font-weight:bold; font-size:${charFontSize}px; font-family:'${charFontFamily}'; color:${color}; letter-spacing:${charLetterSpacing}px">${char === ' ' ? '&nbsp;' : char}</span>`;
        }).join("");
       
        return `<div style="line-height:${lineHeight}; text-align:${lineAlignment}">${spans}</div>`;
      }).join("");
     
      const backgroundStyle = !isTransparent ? `background-color: ${backgroundColor};` : '';
      const tableContent = !isTransparent ?
        `<table style="width: 100%; border-collapse: collapse;"><tr><td style="${backgroundStyle} padding: 20px; border: none;">${bodyContent}</td></tr></table>` :
        bodyContent;
     
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Rainbow Text</title></head><body style="margin: 0; padding: 20px;">${tableContent}</body></html>`;
      const blob = new Blob([html], { type: "application/msword" });
     
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Rainbow Text.doc";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Word export failed:', error);
    }
  };
 
  return (
    <div className="rainbow-page">
      <div className="tool-header">
        <h1>
          <span className="emoji">🌈</span>
          <span className="text">Rainbow Text Generator</span>
        </h1>
      </div>
 
      <div className="new-layout">
        <div className="input-column">
          <div className={`top-section ${showGradientOptions || showBackgroundColor ? 'has-right-panel' : 'no-right-panel'}`}>
            <div className="left-section">
            <div className="text-input-container">
              <textarea
                className="big-text-input"
                placeholder="Enter your text here..."
                defaultValue={text}
                onChange={e => { text = e.target.value; debouncedUpdatePreview(); }}
              />
            </div>
           
            <div className="controls-row">
              <div className="control-item">
                <label>Font Size</label>
                <input
                  ref={fontSizeRef}
                  type="number"
                  defaultValue={fontSize}
                  onChange={e => { fontSize = +e.target.value; updatePreview(); }}
                />
              </div>
             
              <div className="control-item">
                <label>Line Height</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="5"
                  defaultValue={lineHeight}
                  onChange={e => { lineHeight = +e.target.value; updatePreview(); }}
                />
              </div>
             
              <div className="control-item">
                <label>Letter Spacing</label>
                <input
                  type="number"
                  step="0.1"  
                  min="0.5"
                  max="5"
                  defaultValue={letterSpacing}
                  onChange={e => { letterSpacing = +e.target.value; updatePreview(); }}
                />
              </div>
             
              <div className="control-item">
                <label>Font</label>
                <select
                  ref={fontFamilyRef}
                  defaultValue={fontFamily}
                  onChange={e => { fontFamily = e.target.value; updatePreview(); }}
                >
                  {GOOGLE_FONTS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
             
              <div className="control-item">
                <label>Text Style</label>
                <select
                  defaultValue={textStyle}
                  onChange={e => {
                    textStyle = e.target.value;
                    setShowGradientOptions(textStyle === "gradient");
                    updatePreview();
                  }}
                >
                  <option value="rainbow">Rainbow Colors</option>
                  <option value="gradient">Gradient Text</option>
                </select>
              </div>
            </div>
          </div>
 
          {/* RIGHT: Options Panel - Same Space for Gradient/Background */}
          <div className="right-section">
            {showGradientOptions && (
              <div className="options-panel">
                <h3>Gradient Options</h3>
               
                <label>Choose Gradient</label>
                <div className="gradient-grid-two-lines">
                  {Object.keys(GRADIENT_PRESETS).map(g => (
                    <div
                      key={g}
                      className={`gradient-circle ${selectedGradientState === g ? "selected" : ""}`}
                      style={{ background: GRADIENT_PRESETS[g] }}
                      onClick={() => {
                        selectedGradient = g;
                        setSelectedGradientState(g);
                        customGradient = null;
                        gradientAngle = 45;
                        setAngleDisplay(45);
                        if (angleSliderRef.current) angleSliderRef.current.value = 45;
                        updatePreview();
                      }}
                    />
                  ))}
                </div>
 
                <label>Custom Gradient Colors</label>
                <div className="custom-colors">
                  <input type="color" defaultValue="#ff0000" onChange={e => {
                    addPersistentFocus(e.target);
                    const color1 = e.target.value;
                    const color2 = e.target.parentElement.children[1].value;
                    const color3 = e.target.parentElement.children[2].value;
                    customGradient = `linear-gradient(${gradientAngle}deg, ${color1}, ${color2}, ${color3})`;
                    selectedGradient = "custom";
                    setSelectedGradientState("custom");
                    updatePreview();
                  }} />
                  <input type="color" defaultValue="#00ff00" onChange={e => {
                    addPersistentFocus(e.target);
                    const color1 = e.target.parentElement.children[0].value;
                    const color2 = e.target.value;
                    const color3 = e.target.parentElement.children[2].value;
                    customGradient = `linear-gradient(${gradientAngle}deg, ${color1}, ${color2}, ${color3})`;
                    selectedGradient = "custom";
                    setSelectedGradientState("custom");
                    updatePreview();
                  }} />
                  <input type="color" defaultValue="#0000ff" onChange={e => {
                    addPersistentFocus(e.target);
                    const color1 = e.target.parentElement.children[0].value;
                    const color2 = e.target.parentElement.children[1].value;
                    const color3 = e.target.value;
                    customGradient = `linear-gradient(${gradientAngle}deg, ${color1}, ${color2}, ${color3})`;
                    selectedGradient = "custom";
                    setSelectedGradientState("custom");
                    updatePreview();
                  }} />
                  <button className="apply-btn" onClick={() => {
                    const inputs = document.querySelectorAll('.custom-colors input[type="color"]');
                    customGradient = `linear-gradient(${gradientAngle}deg, ${inputs[0].value}, ${inputs[1].value}, ${inputs[2].value})`;
                    selectedGradient = "custom";
                    setSelectedGradientState("custom");
                    updatePreview();
                  }}>
                    Apply
                  </button>
                </div>
              </div>
            )}
 
            {showBackgroundColor && (
              <div className="options-panel">
                <h3>Background Colors</h3>
                <div className="background-color-grid-two-lines">
                  {BACKGROUND_COLORS.map(color => (
                    <div
                      key={color}
                      className={`color-circle ${backgroundColor === color ? "selected" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        backgroundColor = color;
                        updateBackgroundSelection(color);
                        updatePreview();
                      }}
                    />
                  ))}
                </div>
               
                <label>Custom Background</label>
                <div className="custom-background-section">
                  <input
                    type="color"
                    className="custom-color-circle"
                    value={backgroundColor}
                    onChange={e => {
                      backgroundColor = e.target.value;
                      updatePreview();
                    }}
                  />
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
 
        {/* RIGHT COLUMN: Preview Section */}
        <div className="preview-column">
          <div className="preview-section">
          <div className="preview-header">
            <h2>Preview (Select Text to Customize)</h2>
            <div className="preview-controls">
              {showGradientOptions && (
                <div className="gradient-direction-control">
                  <label>Direction: {angleDisplay}°</label>
                  <input
                    ref={angleSliderRef}
                    type="range"
                    min="0"
                    max="360"
                    defaultValue={gradientAngle}
                    onChange={e => {
                      gradientAngle = +e.target.value;
                      setAngleDisplay(gradientAngle);
                      updatePreview();
                    }}
                  />
                </div>
              )}
              <div className="transparent-toggle">
                <label>Transparent Background</label>
                <button
                  className={`toggle-btn ${isTransparent ? 'active' : ''}`}
                  onClick={() => {
                    isTransparent = !isTransparent;
                    setShowBackgroundColor(!isTransparent);
                    updatePreview();
                  }}
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>
              <button className="export-btn secondary" onClick={downloadWordDoc}>
                Word
              </button>
              <button className="export-btn" onClick={generatePngImage}>
                PNG
              </button>
            </div>
          </div>
         
          <div ref={previewRef} className="preview-canvas" />
         
          {/* Floating Toolbar */}
          {floatingToolbar.show && (
            <div
              className="floating-toolbar"
              style={{
                position: 'absolute',
                left: floatingToolbar.x,
                top: floatingToolbar.y,
                transform: 'none'
              }}
            >
              <div className="toolbar-controls">
                <input
                  type="number"
                  min="12"
                  max="72"
                  defaultValue={fontSize}
                  onChange={e => applyToSelection('fontSize', +e.target.value)}
                  title="Font Size"
                  style={{width: '50px'}}
                />
                <input
                  type="color"
                  defaultValue="#ffffff"
                  onChange={e => applyToSelection('customColor', e.target.value)}
                  title="Text Color"
                />
                <select onChange={e => {
                  loadGoogleFont(e.target.value);
                  applyToSelection('fontFamily', e.target.value);
                }} title="Font Family" className="toolbar-font-select">
                  {GOOGLE_FONTS.map(f => (
                    <option key={f} value={f} style={{fontFamily: f}}>{f}</option>
                  ))}
                </select>
                <div className="alignment-buttons">
                  <button onClick={() => applyToSelection('alignment', 'left')} title="Left">L</button>
                  <button onClick={() => applyToSelection('alignment', 'center')} title="Center">C</button>
                  <button onClick={() => applyToSelection('alignment', 'right')} title="Right">R</button>
                </div>
                <button
                  className="close-btn"
                  onClick={() => {
                    setFloatingToolbar({ show: false, x: 0, y: 0 });
                    window.getSelection().removeAllRanges();
                    setHasSelection(false);
                  }}
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
