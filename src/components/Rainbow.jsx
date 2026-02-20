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
import JSZip from "jszip";
import folderIcon from "../assets/folder.png";
import downloadIcon from "../assets/download.svg";
import italicIcon from "../assets/italic.png";

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
let isBold = false;
let isItalic = false;
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
  const [showLineHeightMenu, setShowLineHeightMenu] = useState(false);
  const [showLetterSpacingMenu, setShowLetterSpacingMenu] = useState(false);
  const [showGradientPopup, setShowGradientPopup] = useState(false);
  const [showBackgroundPopup, setShowBackgroundPopup] = useState(false);
  const [textStyleState, setTextStyleState] = useState('rainbow');
  const [isTransparentState, setIsTransparentState] = useState(true);
  const [isBoldState, setIsBoldState] = useState(false);
  const [isItalicState, setIsItalicState] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState(24);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Handle file import
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileType = file.name.split('.').pop().toLowerCase();
      let extractedText = '';

      if (fileType === 'txt') {
        // TXT: Preserve exact content including spaces and line breaks
        extractedText = await file.text();
      } else if (fileType === 'doc' || fileType === 'docx') {
        // Word: Extract text using JSZip
        try {
          const zip = await JSZip.loadAsync(file);
          const doc = await zip.file('word/document.xml').async('string');
          
          // Parse XML and extract text from <w:t> tags
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(doc, 'text/xml');
          const textNodes = xmlDoc.getElementsByTagName('w:t');
          const paragraphs = xmlDoc.getElementsByTagName('w:p');
          
          let text = '';
          for (let p of paragraphs) {
            const textElements = p.getElementsByTagName('w:t');
            for (let t of textElements) {
              text += t.textContent;
            }
            text += '\n';
          }
          extractedText = text.trim();
        } catch (error) {
          console.error('DOCX parsing error:', error);
          alert('Error reading .docx file. Please try .txt format.');
          return;
        }
      }

      // Set the extracted text preserving all spaces and line breaks
      text = extractedText;
      if (textareaRef.current) {
        textareaRef.current.value = extractedText;
      }
      updatePreview();
    } catch (error) {
      console.error('File import error:', error);
      alert('Error importing file. Please try again.');
    }

    // Reset file input
    event.target.value = '';
  };

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

  const applyGlobalAlignment = (alignment) => {
    // Apply alignment to all characters in the text
    const textLength = text.replace(/\n/g, "").length;
    for (let i = 0; i < textLength; i++) {
      if (!textSelections[i]) textSelections[i] = {};
      textSelections[i].alignment = alignment;
    }
    updatePreview();
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
        
        // Get font size of first selected character
        const firstCharSettings = textSelections[Math.min(startIndex, endIndex)] || {};
        setSelectedFontSize(firstCharSettings.fontSize || fontSize);
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
        !e.target.closest('.export-dropdown') &&
        !e.target.closest('.gradient-popup') &&
        !e.target.closest('.background-popup') &&
        !e.target.closest('.spacing-dropdown')) {
      if (window.getSelection().toString().length === 0) {
        setHasSelection(false);
        setFloatingToolbar({ show: false, x: 0, y: 0 });
        selectedTextRange = null;
      }
      setShowExportMenu(false);
      setShowGradientPopup(false);
      setShowBackgroundPopup(false);
      setShowLineHeightMenu(false);
      setShowLetterSpacingMenu(false);
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
        span.style.fontWeight = (charSettings.bold !== undefined ? charSettings.bold : isBold) ? "bold" : "normal";
        span.style.fontStyle = (charSettings.italic !== undefined ? charSettings.italic : isItalic) ? "italic" : "normal";
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
        span.style.fontWeight = (charSettings.bold !== undefined ? charSettings.bold : isBold) ? "bold" : "normal";
        span.style.fontStyle = (charSettings.italic !== undefined ? charSettings.italic : isItalic) ? "italic" : "normal";
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
            const fontWeight = isBold ? "bold" : "normal";
            const fontStyle = isItalic ? "italic" : "normal";
            ctx.font = `${fontStyle} ${fontWeight} ${charSettings.fontSize || fontSize}px "${charSettings.fontFamily || fontFamily}", sans-serif`;
            
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
            const fontWeight = isBold ? "bold" : "normal";
            const fontStyle = isItalic ? "italic" : "normal";
            ctx.font = `${fontStyle} ${fontWeight} ${charSettings.fontSize || fontSize}px "${charSettings.fontFamily || fontFamily}", sans-serif`;
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
      const gradientStr = customGradient || GRADIENT_PRESETS[selectedGradient];
      const colorMatches = gradientStr.match(/#[0-9a-fA-F]{6}/g) || [];
      
      const scaleFactor = 0.5;
      
      const bodyContent = lines.map((line) => {
        let lineAlignment = 'left';
        const lineStartIndex = globalCharIndex;
        for (let i = 0; i < line.length; i++) {
          const charSettings = textSelections[lineStartIndex + i] || {};
          if (charSettings.alignment) {
            lineAlignment = charSettings.alignment;
            break;
          }
        }
        
        const nonSpaceChars = line.replace(/ /g, '');
        let nonSpaceIndex = 0;
        
        const spans = Array.from(line).map((char) => {
          const charSettings = textSelections[globalCharIndex] || {};
          let color;
          
          if (charSettings.customColor) {
            color = charSettings.customColor;
          } else if (textStyle === "gradient") {
            if (char === ' ') {
              color = 'transparent';
            } else {
              const position = nonSpaceChars.length === 1 ? 0 : nonSpaceIndex / (nonSpaceChars.length - 1);
              const rotatedPosition = (position + (gradientAngle / 360)) % 1;
              const segmentIndex = Math.floor(rotatedPosition * (colorMatches.length - 1));
              const segmentFactor = (rotatedPosition * (colorMatches.length - 1)) % 1;
              
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
              nonSpaceIndex++;
            }
          } else {
            color = RAINBOW_COLORS[globalCharIndex % RAINBOW_COLORS.length];
          }
          
          const charFontSize = (charSettings.fontSize || fontSize) * scaleFactor;
          const currentFont = charSettings.fontFamily || fontFamily;
          const charLetterSpacing = (charSettings.letterSpacing || letterSpacing) * scaleFactor;
          const fontWeight = (charSettings.bold !== undefined ? charSettings.bold : isBold) ? "bold" : "normal";
          const fontStyle = (charSettings.italic !== undefined ? charSettings.italic : isItalic) ? "italic" : "normal";
          
          globalCharIndex++;
          return `<span style="font-weight:${fontWeight}; font-style:${fontStyle}; font-size:${charFontSize}pt; font-family:'${currentFont}', Arial, sans-serif; color:${color}; letter-spacing:${charLetterSpacing}pt;">${char === ' ' ? '&nbsp;' : char}</span>`;
        }).join("");
        
        return `<div style="line-height:${lineHeight}; text-align:${lineAlignment};">${spans}</div>`;
      }).join("");
      
      const contentWrapper = !isTransparent ? 
        `<div style="display: inline-block; background-color: ${backgroundColor}; padding: 20px;">${bodyContent}</div>` : 
        bodyContent;
      
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Rainbow Text</title><style>@page { size: A4; margin: 2cm; }</style></head><body>${contentWrapper}</body></html>`;
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
        try {
          const zip = await JSZip.loadAsync(file);
          const doc = await zip.file('word/document.xml').async('string');
          
          // Parse XML and extract text from <w:t> tags
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(doc, 'text/xml');
          const paragraphs = xmlDoc.getElementsByTagName('w:p');
          
          let extractedText = '';
          for (let p of paragraphs) {
            const textElements = p.getElementsByTagName('w:t');
            for (let t of textElements) {
              extractedText += t.textContent;
            }
            extractedText += '\n';
          }
          
          const textarea = document.querySelector('.big-text-input');
          if (textarea) {
            textarea.value = extractedText.trim();
            text = extractedText.trim();
            updatePreview();
          }
        } catch (docxError) {
          console.error('DOCX parsing error:', docxError);
          alert('Error reading .docx file. Please try .txt format.');
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
      alert('Error reading file. Please try again or use a different file format.');
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
        <button 
          className="header-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          title="To Extract text from file Upload .txt, .docx or .pdf file"
        >
          <img 
            src={folderIcon} 
            alt="Upload" 
            width="20" 
            height="20" 
            style={{display: 'block'}}
          />
        </button>
      </div>

      <div className="new-layout">
        <div className="input-column">
          <div className="top-section no-right-panel">
            <div className="left-section">
              <div className="text-input-container">
                <textarea
                  ref={textareaRef}
                  className="big-text-input"
                  placeholder="Enter your text here..."
                  defaultValue={text}
                  onChange={e => { text = e.target.value; debouncedUpdatePreview(); }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="preview-column">
          <div className="preview-section">
            <div className="preview-header">
              <h3>Preview <span style={{opacity: 0.4, fontSize: '12px'}}>(Select Text to Customize)</span></h3>
              <div className="preview-controls">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.docx,.pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                
                <div className="compact-toolbar">
                  <select 
                    ref={fontFamilyRef}
                    data-font-select
                    defaultValue={fontFamily} 
                    onChange={e => { fontFamily = e.target.value; updatePreview(); }}
                    title="Font Family"
                  >
                    {GOOGLE_FONTS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>

                  <select 
                    ref={fontSizeRef}
                    defaultValue={fontSize} 
                    onChange={e => { fontSize = +e.target.value; updatePreview(); }}
                    title="Font Size"
                    style={{width: '60px'}}
                  >
                    {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  
                  <button 
                    className={`spacing-btn ${isBoldState ? 'active' : ''}`}
                    onClick={() => { isBold = !isBold; setIsBoldState(isBold); updatePreview(); }}
                    title="Bold"
                  >
                    B
                  </button>
                  
                  <button 
                    className={`spacing-btn ${isItalicState ? 'active' : ''}`}
                    onClick={() => { isItalic = !isItalic; setIsItalicState(isItalic); updatePreview(); }}
                    title="Italic"
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                  >
                    <img 
                      src={italicIcon} 
                      alt="Italic" 
                      width="20" 
                      height="20" 
                      style={{display: 'block', filter: 'brightness(0) invert(1)'}}
                    />
                  </button>
                  
                  <div className="spacing-dropdown">
                    <button 
                      className="spacing-btn"
                      onClick={() => {
                        setShowLineHeightMenu(!showLineHeightMenu);
                        setShowLetterSpacingMenu(false);
                        setShowGradientPopup(false);
                        setShowBackgroundPopup(false);
                      }}
                      title="Line Height"
                    >
                      ↕
                    </button>
                    {showLineHeightMenu && (
                      <div className="spacing-menu">
                        {[0.5, 1, 1.5, 2, 2.5, 3].map(val => (
                          <button key={val} onClick={() => { lineHeight = val; updatePreview(); setShowLineHeightMenu(false); }}>{val}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="spacing-dropdown">
                    <button 
                      className="spacing-btn"
                      onClick={() => {
                        setShowLetterSpacingMenu(!showLetterSpacingMenu);
                        setShowLineHeightMenu(false);
                        setShowGradientPopup(false);
                        setShowBackgroundPopup(false);
                      }}
                      title="Letter Spacing"
                    >
                      ↔
                    </button>
                    {showLetterSpacingMenu && (
                      <div className="spacing-menu">
                        {[0.5, 1, 1.5, 2, 2.5, 3].map(val => (
                          <button key={val} onClick={() => { letterSpacing = val; updatePreview(); setShowLetterSpacingMenu(false); }}>{val}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="alignment-toolbar-buttons">
                    <button onClick={() => applyGlobalAlignment('left')} title="Align Left" className="align-btn">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="0" y="2" width="12" height="2"/>
                        <rect x="0" y="6" width="10" height="2"/>
                        <rect x="0" y="10" width="14" height="2"/>
                      </svg>
                    </button>
                    <button onClick={() => applyGlobalAlignment('center')} title="Align Center" className="align-btn">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="2" y="2" width="12" height="2"/>
                        <rect x="3" y="6" width="10" height="2"/>
                        <rect x="1" y="10" width="14" height="2"/>
                      </svg>
                    </button>
                    <button onClick={() => applyGlobalAlignment('right')} title="Align Right" className="align-btn">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="4" y="2" width="12" height="2"/>
                        <rect x="6" y="6" width="10" height="2"/>
                        <rect x="2" y="10" width="14" height="2"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="spacing-dropdown">
                    <button 
                      className={`spacing-btn ${textStyleState === 'gradient' ? 'active' : ''}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (textStyle === 'gradient') {
                          textStyle = 'rainbow';
                          setTextStyleState('rainbow');
                          setShowGradientPopup(false);
                        } else {
                          textStyle = 'gradient';
                          setTextStyleState('gradient');
                          setShowGradientPopup(!showGradientPopup);
                        }
                        setShowLineHeightMenu(false);
                        setShowLetterSpacingMenu(false);
                        setShowBackgroundPopup(false);
                        updatePreview();
                      }}
                      title="Gradient/Rainbow"
                    >
                      🎨
                    </button>
                    {showGradientPopup && (
                      <div className="gradient-popup" onClick={(e) => e.stopPropagation()}>
                        <label>Choose Gradient</label>
                        <div className="gradient-grid-popup">
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
                        <label>Custom Colors</label>
                        <div className="custom-colors">
                          <input type="color" defaultValue="#ff0000" onChange={e => {
                            const color1 = e.target.value;
                            const color2 = e.target.parentElement.children[1].value;
                            const color3 = e.target.parentElement.children[2].value;
                            customGradient = `linear-gradient(${gradientAngle}deg, ${color1}, ${color2}, ${color3})`;
                            selectedGradient = "custom";
                            setSelectedGradientState("custom");
                            updatePreview();
                          }} />
                          <input type="color" defaultValue="#00ff00" onChange={e => {
                            const color1 = e.target.parentElement.children[0].value;
                            const color2 = e.target.value;
                            const color3 = e.target.parentElement.children[2].value;
                            customGradient = `linear-gradient(${gradientAngle}deg, ${color1}, ${color2}, ${color3})`;
                            selectedGradient = "custom";
                            setSelectedGradientState("custom");
                            updatePreview();
                          }} />
                          <input type="color" defaultValue="#0000ff" onChange={e => {
                            const color1 = e.target.parentElement.children[0].value;
                            const color2 = e.target.parentElement.children[1].value;
                            const color3 = e.target.value;
                            customGradient = `linear-gradient(${gradientAngle}deg, ${color1}, ${color2}, ${color3})`;
                            selectedGradient = "custom";
                            setSelectedGradientState("custom");
                            updatePreview();
                          }} />
                        </div>
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
                          style={{width: '100%'}}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="spacing-dropdown">
                    <button 
                      className={`spacing-btn ${!isTransparentState ? 'active' : ''}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (!isTransparent) {
                          isTransparent = true;
                          setIsTransparentState(true);
                          setShowBackgroundPopup(false);
                        } else {
                          isTransparent = false;
                          setIsTransparentState(false);
                          setShowBackgroundPopup(!showBackgroundPopup);
                        }
                        setShowLineHeightMenu(false);
                        setShowLetterSpacingMenu(false);
                        setShowGradientPopup(false);
                        updatePreview();
                      }}
                      title="Background Color"
                      style={{fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                    >
                      <svg width="24" height="24" viewBox="0 0 128 128" style={{display: 'block', margin: 'auto'}}>
                        <g transform="translate(28,18) scale(0.7)">
                          <g transform="rotate(35, 40, 50)">
                            <rect x="8" y="20" rx="8" ry="8" width="64" height="60" fill="#ffffff" stroke="#000000" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
                            <path d="M16,28 C34,20 54,20 72,28" fill="none" stroke="#000000" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
                          </g>
                          <g transform="translate(62,10)">
                            <rect x="-3" y="0" width="6" height="38" rx="3" ry="3" fill="#ffffff" stroke="#000000" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
                          </g>
                        </g>
                        <g transform="translate(78,72) scale(1.8)">
                          <path d="M10 0 C10 0, 0 12, 0 18 C0 23, 4 28, 10 28 C16 28, 20 23, 20 18 C20 12, 10 0, 10 0 Z" fill="#ffc107" stroke="#000000" strokeWidth="2"/>
                        </g>
                      </svg>
                    </button>
                    {showBackgroundPopup && (
                      <div className="gradient-popup" onClick={(e) => e.stopPropagation()}>
                        <label>Background Colors</label>
                        <div className="gradient-grid-popup">
                          {BACKGROUND_COLORS.map(color => (
                            <div
                              key={color}
                              className={`gradient-circle ${backgroundColor === color ? "selected" : ""}`}
                              style={{ background: color }}
                              onClick={() => { 
                                backgroundColor = color;
                                updatePreview(); 
                              }}
                            />
                          ))}
                        </div>
                        <label>Custom Background</label>
                        <div className="custom-colors">
                          <input 
                            type="color" 
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
                <div className="export-dropdown">
                  <button 
                    className="export-btn" 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    style={{fontSize: '24px', lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                  >
                    <img 
                      src={downloadIcon} 
                      alt="Download" 
                      width="24" 
                      height="24" 
                      style={{display: 'block'}}
                    />
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
                    value={selectedFontSize}
                    onChange={e => {
                      const newSize = +e.target.value;
                      setSelectedFontSize(newSize);
                      applyToSelection('fontSize', newSize);
                    }}
                    title="Font Size"
                    style={{width: '50px'}}
                  />
                  <button 
                    className="toolbar-btn"
                    onClick={() => applyToSelection('bold', !isBold)}
                    title="Bold"
                    style={{width: '24px', height: '24px', padding: 0, fontSize: '12px', fontWeight: 'bold'}}
                  >
                    B
                  </button>
                  <button 
                    className="toolbar-btn"
                    onClick={() => applyToSelection('italic', !isItalic)}
                    title="Italic"
                    style={{width: '24px', height: '24px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                  >
                    <img 
                      src={italicIcon} 
                      alt="Italic" 
                      width="14" 
                      height="14" 
                      style={{display: 'block', filter: 'brightness(0) invert(1)'}}
                    />
                  </button>
                  <input 
                    type="color" 
                    defaultValue="#000000"
                    onChange={e => applyToSelection('customColor', e.target.value)}
                    title="Text Color"
                  />
                  <select 
                    value={fontFamily}
                    onChange={e => {
                      loadGoogleFont(e.target.value);
                      applyToSelection('fontFamily', e.target.value);
                    }} 
                    title="Font Family" 
                    className="toolbar-font-select"
                  >
                    {GOOGLE_FONTS.map(f => (
                      <option key={f} value={f} style={{fontFamily: f}}>{f}</option>
                    ))}
                  </select>
                  <div className="alignment-buttons">
                    <button onClick={() => applyToSelection('alignment', 'left')} title="Left">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="0" y="2" width="12" height="2"/>
                        <rect x="0" y="6" width="10" height="2"/>
                        <rect x="0" y="10" width="14" height="2"/>
                      </svg>
                    </button>
                    <button onClick={() => applyToSelection('alignment', 'center')} title="Center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="2" y="2" width="12" height="2"/>
                        <rect x="3" y="6" width="10" height="2"/>
                        <rect x="1" y="10" width="14" height="2"/>
                      </svg>
                    </button>
                    <button onClick={() => applyToSelection('alignment', 'right')} title="Right">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="4" y="2" width="12" height="2"/>
                        <rect x="6" y="6" width="10" height="2"/>
                        <rect x="2" y="10" width="14" height="2"/>
                      </svg>
                    </button>
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
