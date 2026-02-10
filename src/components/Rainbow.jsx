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
import mammoth from "mammoth";

// Global state variables (like JS version)
let text = "";
let fontSize = 24;
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
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedGradientState, setSelectedGradientState] = useState("rainbow");
  const [activeTab, setActiveTab] = useState("gradient");
  const [showGradientOptions, setShowGradientOptions] = useState(false);
  const [showBackgroundColor, setShowBackgroundColor] = useState(false);
  const [floatingToolbar, setFloatingToolbar] = useState({ show: false, x: 0, y: 0 });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef(null);

  // Smart conditional logic for interface display
  const showGradientOnly = textStyle === "gradient" && isTransparent;
  const showBackgroundOnly = textStyle === "rainbow" && !isTransparent;
  const showTabbedInterface = textStyle === "gradient" && !isTransparent;
  const showRightPanel = showGradientOnly || showBackgroundOnly || showTabbedInterface;

  useEffect(() => {
    updatePreview();
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      // Reset all global variables when component unmounts
      text = "";
      fontSize = 24;
      lineHeight = 1;
      letterSpacing = 1;
      fontFamily = "Arial";
      textStyle = "rainbow";
      gradientAngle = 45;
      selectedGradient = "rainbow";
      customGradient = null;
      backgroundColor = "#ffffff";
      isTransparent = true;
      textSelections = {};
      selectedTextRange = null;
    };
  }, []);

  // Reset React state when component mounts
  useEffect(() => {
    setAngleDisplay(45);
    setSelectedGradientState("rainbow");
    setShowGradientOptions(false);
    setShowBackgroundColor(false);
    setFloatingToolbar({ show: false, x: 0, y: 0 });
  }, []);

  const addPersistentFocus = (element) => {
    document.querySelectorAll('.gradient-circle.focus-effect, .custom-colors input.focus-effect').forEach(el => {
      el.classList.remove('focus-effect');
    });
    element.classList.add('focus-effect');
  };

  const updateBackgroundSelection = (selectedColor) => {
    document.querySelectorAll('.color-circle').forEach(circle => {
      circle.classList.remove('selected');
    });
    document.querySelectorAll('.color-circle').forEach(circle => {
      if (circle.style.backgroundColor === selectedColor || 
          rgbToHex(circle.style.backgroundColor) === selectedColor) {
        circle.classList.add('selected');
      }
    });
  };

  const rgbToHex = (rgb) => {
    if (!rgb || rgb === 'transparent') return rgb;
    const result = rgb.match(/\d+/g);
    if (!result) return rgb;
    return '#' + result.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  };

  const applyToSelection = (property, value) => {
    if (!selectedTextRange) return;
    
    for (let i = selectedTextRange.start; i <= selectedTextRange.end; i++) {
      if (!textSelections[i]) textSelections[i] = {};
      textSelections[i][property] = value;
    }
    updatePreview();
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      setHasSelection(true);
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Position floating toolbar above selected text with edge case handling
      const toolbarWidth = 300;
      const toolbarHeight = 100;
      const margin = 6;
      
      let x = rect.left + (rect.width / 2) - (toolbarWidth / 2);
      let y = rect.top - toolbarHeight - margin + window.scrollY;
      
      // Handle left edge
      if (x < margin) x = margin;
      // Handle right edge
      if (x + toolbarWidth > window.innerWidth - margin) {
        x = window.innerWidth - toolbarWidth - margin;
      }
      // Handle top edge
      if (y < margin + window.scrollY) {
        y = rect.bottom + margin + window.scrollY;
      }
      
      setFloatingToolbar({
        show: true,
        x: x,
        y: y
      });
      
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;
      
      let startIndex = -1;
      let endIndex = -1;
      
      if (startContainer.nodeType === Node.TEXT_NODE) {
        const startSpan = startContainer.parentElement;
        if (startSpan && startSpan.hasAttribute('data-char-index')) {
          startIndex = parseInt(startSpan.getAttribute('data-char-index'));
        }
      }
      
      if (endContainer.nodeType === Node.TEXT_NODE) {
        const endSpan = endContainer.parentElement;
        if (endSpan && endSpan.hasAttribute('data-char-index')) {
          endIndex = parseInt(endSpan.getAttribute('data-char-index'));
          if (startContainer === endContainer) {
            endIndex = startIndex + range.toString().length - 1;
          }
        }
      }
      
      if (startIndex !== -1 && endIndex === -1) {
        const selectedText = selection.toString();
        endIndex = startIndex + selectedText.length - 1;
      }
      
      if (startIndex !== -1 && endIndex !== -1) {
        selectedTextRange = {
          start: Math.min(startIndex, endIndex),
          end: Math.max(startIndex, endIndex)
        };
      }
    } else {
      setHasSelection(false);
      setFloatingToolbar({ show: false, x: 0, y: 0 });
      selectedTextRange = null;
    }
  };

  const handleClickOutside = (e) => {
    if (!previewRef.current?.contains(e.target) && 
        !e.target.closest('.control-grid') && 
        !e.target.closest('.gradient-grid') && 
        !e.target.closest('.custom-colors') &&
        !e.target.closest('.background-color-section') &&
        !e.target.closest('.color-circle') &&
        !e.target.closest('.floating-toolbar') &&
        !e.target.closest('.export-dropdown')) {
      if (window.getSelection().toString().length === 0) {
        setHasSelection(false);
        setFloatingToolbar({ show: false, x: 0, y: 0 });
        selectedTextRange = null;
      }
      setShowExportMenu(false);
    }
  };

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
      
      let lineAlignment = 'left';
      for (let i = 0; i < line.length; i++) {
        const charSettings = textSelections[charIndex + i] || {};
        if (charSettings.alignment) {
          lineAlignment = charSettings.alignment;
          break;
        }
      }
      lineDiv.style.textAlign = lineAlignment;

      const nonSpaceChars = line.replace(/ /g, '');
      let nonSpaceIndex = 0;

      for (let charInLine = 0; charInLine < line.length; charInLine++) {
        const char = line[charInLine];
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char;
        span.setAttribute('data-char-index', charIndex);
        
        const charSettings = textSelections[charIndex] || {};
        span.style.fontSize = (charSettings.fontSize || fontSize) + "px";
        span.style.fontWeight = "bold";
        span.style.fontFamily = `"${charSettings.fontFamily || fontFamily}", sans-serif`;
        span.style.letterSpacing = (charSettings.letterSpacing || letterSpacing) + "px";
        span.style.userSelect = "text";
        
        if (charSettings.customColor) {
          span.style.color = charSettings.customColor;
        } else if (char === ' ') {
          span.style.color = 'transparent';
        } else {
          let position = nonSpaceChars.length === 1 ? 0 : nonSpaceIndex / (nonSpaceChars.length - 1);
          const rotatedPosition = (position + (gradientAngle / 360)) % 1;
          const segmentIndex = Math.floor(rotatedPosition * (colorMatches.length - 1));
          const segmentFactor = (rotatedPosition * (colorMatches.length - 1)) % 1;
          
          if (segmentIndex >= colorMatches.length - 1 || colorMatches.length === 1) {
            span.style.color = colorMatches[colorMatches.length - 1];
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
            span.style.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          }
          nonSpaceIndex++;
        }
        
        charIndex++;
        lineDiv.appendChild(span);
      }
      container.appendChild(lineDiv);
    });

    container.addEventListener('mouseup', handleTextSelection);
    container.addEventListener('keyup', handleTextSelection);
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      setTimeout(handleTextSelection, 10);
    });

    return container;
  };

  const createRainbowSpans = (text, fontSize, lineHeight, fontFamily, letterSpacing) => {
    const container = document.createElement("div");
    const lines = text.split("\n");
    let charIndex = 0;

    lines.forEach((line, lineIndex) => {
      const lineDiv = document.createElement("div");
      lineDiv.style.lineHeight = String(lineHeight);
      lineDiv.style.userSelect = "text";
      lineDiv.style.cursor = "text";
      
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

    container.addEventListener('mouseup', handleTextSelection);
    container.addEventListener('keyup', handleTextSelection);
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      setTimeout(handleTextSelection, 10);
    });

    return container;
  };

  const cleanupTextSelections = () => {
    const textLength = text.replace(/\n/g, "").length;
    Object.keys(textSelections).forEach(key => {
      if (parseInt(key) >= textLength) {
        delete textSelections[key];
      }
    });
  };

  const debouncedUpdatePreview = () => {
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      cleanupTextSelections();
      updatePreview();
    }, 100);
  };

  const updatePreview = () => {
    const preview = previewRef.current;
    if (!preview) return;

    if (fontFamily !== preview.dataset.currentFont) {
      loadGoogleFont(fontFamily);
      preview.dataset.currentFont = fontFamily;
    }

    preview.innerHTML = "";
    
    if (!isTransparent) {
      preview.style.backgroundColor = backgroundColor;
    } else {
      preview.style.backgroundColor = "transparent";
    }

    if (!text.trim()) {
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.txt')) {
        const extractedText = await file.text();
        const textarea = document.querySelector('.big-text-input');
        if (textarea) {
          textarea.value = extractedText;
          text = extractedText;
          updatePreview();
        }
      } else if (fileName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const textarea = document.querySelector('.big-text-input');
        if (textarea) {
          textarea.value = result.value;
          text = result.value;
          updatePreview();
        }
      } else if (fileName.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        
        // Check if PDF.js is loaded
        if (!window.pdfjsLib) {
          alert('PDF support is not available. Please try .txt or .docx files.');
          return;
        }
        
        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let extractedText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          let lastY = null;
          let lineText = '';
          
          textContent.items.forEach((item, index) => {
            const currentY = item.transform[5];
            
            // New line detected (Y position changed significantly)
            if (lastY !== null && Math.abs(currentY - lastY) > 5) {
              extractedText += lineText.trim() + '\n';
              lineText = '';
            }
            
            // Add space between words if needed
            if (lineText && !lineText.endsWith(' ') && !item.str.startsWith(' ')) {
              lineText += ' ';
            }
            
            lineText += item.str;
            lastY = currentY;
          });
          
          // Add last line
          if (lineText.trim()) {
            extractedText += lineText.trim() + '\n';
          }
          
          // Add page break
          if (i < pdf.numPages) {
            extractedText += '\n';
          }
        }
        
        const textarea = document.querySelector('.big-text-input');
        if (textarea) {
          textarea.value = extractedText.trim();
          text = extractedText.trim();
          updatePreview();
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Error reading file. Please try again.');
    }

    e.target.value = '';
  };

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
          <div className={`top-section ${showRightPanel ? 'has-right-panel' : 'no-right-panel'}`}>
            <div className="left-section">
              <div className="text-input-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.docx,.pdf"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="upload-file-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload .txt, .docx or .pdf file"
                  >
                    📄 Upload
                  </button>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>(.txt, .docx, .pdf)</span>
                </div>
                <textarea
                  className="big-text-input"
                  placeholder="Enter your text here..."
                  defaultValue={text}
                  onChange={e => { text = e.target.value; debouncedUpdatePreview(); }}
                />
              </div>
              
              <div className="controls-row">
                <div className="control-item">
                  <label>Font</label>
                  <select 
                    ref={fontFamilyRef}
                    data-font-select
                    defaultValue={fontFamily} 
                    onChange={e => { fontFamily = e.target.value; updatePreview(); }}
                  >
                    {GOOGLE_FONTS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

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
                  <label>Text Style</label>
                  <select 
                    defaultValue={textStyle} 
                    onChange={e => { 
                      textStyle = e.target.value; 
                      updatePreview();
                    }}
                  >
                    <option value="rainbow">Rainbow Colors</option>
                    <option value="gradient">Gradient Text</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="right-section">
              {showTabbedInterface && (
                <div className="options-panel">
                  <div className="tab-header">
                    <button 
                      className={`tab-btn ${activeTab === 'gradient' ? 'active' : ''}`}
                      onClick={() => setActiveTab('gradient')}
                    >
                      Gradient
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'background' ? 'active' : ''}`}
                      onClick={() => setActiveTab('background')}
                    >
                      Background
                    </button>
                  </div>
                  
                  {activeTab === 'gradient' && (
                    <div className="tab-content">
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
                      
                      <div className="custom-gradient-header">
                        <label>Custom Gradient Colors</label>
                      </div>
                      
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
                      
                      <div className="gradient-direction-below">
                        <label>Gradient Direction: {angleDisplay}°</label>
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
                    </div>
                  )}
                  
                  {activeTab === 'background' && (
                    <div className="tab-content">
                      <label>Background Colors</label>
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
              )}

              {showGradientOnly && (
                <div className="options-panel">
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
                  
                  <div className="custom-gradient-header">
                    <label>Custom Gradient Colors</label>
                  </div>
                  
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
                  
                  <div className="gradient-direction-below">
                    <label>Gradient Direction: {angleDisplay}°</label>
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
                </div>
              )}

              {showBackgroundOnly && (
                <div className="options-panel">
                  <label>Background Colors</label>
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

        <div className="preview-column">
          <div className="preview-section">
            <div className="preview-header">
              <h3>Preview <span style={{opacity: 0.4, fontSize: '12px'}}>(Select Text to Customize)</span></h3>
              <div className="preview-controls">
                <div className="transparent-toggle">
                  <label>Transparent Background</label>
                  <button 
                    className={`toggle-btn ${isTransparent ? 'active' : ''}`}
                    onClick={() => { 
                      isTransparent = !isTransparent; 
                      updatePreview(); 
                    }}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>
                <div className="export-dropdown">
                  <button 
                    className="export-btn" 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    style={{fontSize: '24px', lineHeight: '1'}}
                  >
                    ⬇
                  </button>
                  {showExportMenu && (
                    <div className="export-menu">
                      <button onClick={() => { generatePngImage(); setShowExportMenu(false); }}>PNG</button>
                      <button onClick={() => { downloadWordDoc(); setShowExportMenu(false); }}>Word</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div ref={previewRef} className="preview-canvas" />
            
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
