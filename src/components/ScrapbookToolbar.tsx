import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Palette, Trash2, Save, Plus, RotateCw, Upload, X, Video, FileText, Check, LayoutGrid, Sliders, ChevronRight, Circle, Type, FilePlus, Image, Music, Clock, Compass, Layers, Settings, Maximize2
} from "lucide-react";
import { ProfileSettings, Sticker, ActiveTab } from "../types";

// Standard high-quality image compressor helper for custom canvas uploads
function shrinkImageToBase64(file: File, maxW = 350, maxH = 350, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/png", quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
    };
    reader.onerror = () => {
      resolve("");
    };
    reader.readAsDataURL(file);
  });
}

// Global sticker renderers used for decorative elements
export function StickerRenderer({ src, size = 100 }: { src: string; size?: number }) {
  if (src.startsWith("data:image/")) {
    return (
      <img 
        src={src} 
        alt="sticker" 
        style={{ width: size, height: size }} 
        className="object-contain pointer-events-none select-none max-w-full max-h-full" 
        referrerPolicy="no-referrer"
      />
    );
  }

  switch (src) {
    case "daisy":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="drop-shadow-md select-none pointer-events-none">
          <circle cx="50" cy="50" r="14" fill="#DCA221" stroke="#306634" strokeWidth="3" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <ellipse 
              key={angle}
              cx="50" 
              cy="23" 
              rx="10" 
              ry="18" 
              fill="#F9FAF9" 
              stroke="#306634" 
              strokeWidth="3" 
              transform={`rotate(${angle} 50 50)`} 
            />
          ))}
          <circle cx="50" cy="50" r="14" fill="#DCA221" stroke="#306634" strokeWidth="3" />
        </svg>
      );
    case "star":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="drop-shadow-md select-none pointer-events-none">
          <path 
            d="M50 5 L63 36 L95 38 L70 60 L78 92 L50 74 L22 92 L30 60 L5 38 L37 36 Z" 
            fill="#DCA221" 
            stroke="#306634" 
            strokeWidth="4" 
            strokeLinejoin="round" 
          />
        </svg>
      );
    case "smiley":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="drop-shadow-md select-none pointer-events-none">
          <circle cx="50" cy="50" r="42" fill="#FAF8F5" stroke="#306634" strokeWidth="4" />
          <circle cx="35" cy="40" r="5" fill="#306634" />
          <circle cx="65" cy="40" r="5" fill="#306634" />
          <path d="M 30,60 A 20,20 0 0,0 70,60" stroke="#306634" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "heart":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="drop-shadow-md select-none pointer-events-none">
          <path 
            d="M12,40 C12,18 42,16 50,38 C58,16 88,18 88,40 C88,68 50,92 50,92 C50,92 12,68 12,40 Z" 
            fill="#DC2626" 
            stroke="#1E170F" 
            strokeWidth="4" 
            strokeLinejoin="round" 
          />
        </svg>
      );
    case "leaf":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="drop-shadow-md select-none pointer-events-none">
          <path 
            d="M50,90 C80,90 90,60 90,40 C90,20 70,5 50,5 C30,5 10,20 10,40 C10,60 20,90 50,90 Z" 
            fill="#306634" 
            stroke="#F2EEE3" 
            strokeWidth="3.5" 
          />
          <path d="M50,7 M50,88" stroke="#F2EEE3" strokeWidth="3" strokeLinecap="round" />
          <path d="M50,30 Q75,25 85,20" stroke="#F2EEE3" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M50,45 Q75,45 88,48" stroke="#F2EEE3" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M50,60 Q70,70 82,75" stroke="#F2EEE3" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M50,30 Q25,25 15,20" stroke="#F2EEE3" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M50,45 Q25,45 12,48" stroke="#F2EEE3" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M50,60 Q30,70 18,75" stroke="#F2EEE3" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case "tape":
      return (
        <div 
          style={{ width: size * 1.5, height: size * 0.4 }} 
          className="bg-transparent border-2 border-dashed border-verdant-yellow/60 bg-verdant-yellow/20 backdrop-blur-[1px] rotate-[-5deg] flex items-center justify-center select-none pointer-events-none shadow-sm rounded-sm"
        >
          <span className="font-mono text-[9px] text-[#306634] font-bold uppercase tracking-widest leading-none">APPROVED</span>
        </div>
      );
    case "coffee":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="drop-shadow-md select-none pointer-events-none">
          <path d="M25,35 L75,35 L70,80 L30,80 Z" fill="#F2EEE3" stroke="#306634" strokeWidth="4" />
          <path d="M75,45 C85,45 85,60 72,60" stroke="#306634" strokeWidth="4" strokeLinecap="round" />
          <path d="M40,15 Q43,25 40,30" stroke="#DCA221" strokeWidth="3" strokeLinecap="round" />
          <path d="M50,12 Q53,23 50,28" stroke="#DCA221" strokeWidth="3" strokeLinecap="round" />
          <path d="M60,15 Q63,25 60,30" stroke="#DCA221" strokeWidth="3" strokeLinecap="round" />
          <rect x="35" y="50" width="30" height="15" rx="3" fill="#DCA221" stroke="#306634" strokeWidth="2.5" />
          <circle cx="50" cy="57" r="3" fill="#F2EEE3" />
        </svg>
      );
    case "badge":
      return (
        <div 
          style={{ width: size, height: size }} 
          className="rounded-full border-4 border-double border-verdant-mint bg-verdant-yellow text-verdant-cream flex flex-col items-center justify-center text-center font-syne select-none pointer-events-none rotate-[6deg] shadow-lg p-1"
        >
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight leading-none text-verdant-dark">100%</span>
          <span className="text-[9px] sm:text-[10px] font-bold leading-none text-white mt-0.5">EST. 2026</span>
        </div>
      );
    default:
      return null;
  }
}

interface ScrapbookToolbarProps {
  profileSettings: ProfileSettings;
  activeTab: ActiveTab;
  onUpdateSettings: (settings: ProfileSettings) => void;
  onSaveDatabase: () => Promise<void>;
  onCloseAdmin: () => void;
}

export default function ScrapbookToolbar({
  profileSettings,
  activeTab,
  onUpdateSettings,
  onSaveDatabase,
  onCloseAdmin
}: ScrapbookToolbarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenuTab, setActiveMenuTab] = useState<"ADD" | "TWEAK" | "CANVAS" | "IDENTITY">("ADD");
  
  // Local state for the ticker phrases text area to avoid cursor resetting on re-renders
  const [localTickerText, setLocalTickerText] = useState(() => 
    profileSettings.tickerPhrases ? profileSettings.tickerPhrases.join("\n") : ""
  );

  useEffect(() => {
    setLocalTickerText(profileSettings.tickerPhrases ? profileSettings.tickerPhrases.join("\n") : "");
  }, [profileSettings.tickerPhrases]);
  
  // Save status helpers
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active element selection helper for tweaking on the fly
  const [selectedElementId, setSelectedElementId] = useState<string>("");

  // Listen for direct on-screen clicks to select elements and open the tweaks tab
  useEffect(() => {
    const handleScreenSelect = (e: Event) => {
      const customEv = e as CustomEvent<{ id: string }>;
      if (customEv.detail && customEv.detail.id) {
        setSelectedElementId(customEv.detail.id);
        setActiveMenuTab("TWEAK");
      }
    };
    window.addEventListener("scrapbook-sticker-select", handleScreenSelect);
    return () => window.removeEventListener("scrapbook-sticker-select", handleScreenSelect);
  }, []);

  // Preset stickers list
  const presetStickers = [
    { key: "daisy", label: "🌼 Botanical Daisy" },
    { key: "star", label: "⭐ Retro Star" },
    { key: "smiley", label: "🙂 Cute Face" },
    { key: "heart", label: "❤️ Hearth Stamp" },
    { key: "leaf", label: "🌿 Green Leaves" },
    { key: "tape", label: "🎟️ Washi Tape" },
    { key: "coffee", label: "☕ Designer Brew" },
    { key: "badge", label: "🏅 Quality Badge" }
  ];

  // Video backgrounds
  const videoPresets = [
    { name: "Peaceful Forest Loop (Standard)", url: "" },
    { name: "Gentle Ocean Waters", url: "https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-gentlewaves-41566-large.mp4" },
    { name: "Rainy Cozy Green leaves", url: "https://assets.mixkit.co/videos/preview/mixkit-raindrops-on-green-leaves-41718-large.mp4" },
    { name: "Retro Ambient Bokeh Glow", url: "https://assets.mixkit.co/videos/preview/mixkit-soft-bokeh-particles-shimmering-42797-large.mp4" }
  ];

  // Helper logic to add custom canvas items
  const handleAddNewElement = (elementData: Partial<Sticker>) => {
    const currentList = profileSettings.stickers || [];
    const maxZ = Math.max(...currentList.map(s => s.zIndex || 30), 30);
    
    const newSticker: Sticker = {
      id: `el-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      x: 35 + Math.random() * 15,
      y: 35 + Math.random() * 15,
      scale: 1.0,
      rotation: Math.floor(Math.random() * 30) - 15,
      tab: activeTab,
      zIndex: maxZ + 2,
      ...elementData
    } as Sticker;

    const updatedStickers = [...currentList, newSticker];
    onUpdateSettings({
      ...profileSettings,
      stickers: updatedStickers
    });
    
    // Auto focus on the newly placed item
    setSelectedElementId(newSticker.id);
  };

  // Helper file uploader for brand custom images as canvas stickers
  const handleGraphicImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await shrinkImageToBase64(file, 280, 280, 0.75);
        if (base64) {
          handleAddNewElement({
            type: "sticker",
            src: base64,
            scale: 1.2,
            rotation: 0
          });
        }
      } catch (err) {
        console.error("Image shrink calculation failed:", err);
      }
    }
  };

  // Safe removal function
  const handleRemoveSticker = (id: string) => {
    const filtered = (profileSettings.stickers || []).filter(s => s.id !== id);
    onUpdateSettings({
      ...profileSettings,
      stickers: filtered
    });
    if (selectedElementId === id) {
      setSelectedElementId("");
    }
  };

  // Update specific property on the current element list
  const handleUpdateProp = (id: string, updates: Partial<Sticker>) => {
    const nextList = (profileSettings.stickers || []).map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    onUpdateSettings({
      ...profileSettings,
      stickers: nextList
    });
  };

  const handlePublish = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveDatabase();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Group elements on this current tab helper
  const pageElements = (profileSettings.stickers || []).filter(s => s.tab === activeTab || s.tab === "ALL");
  const selectedElementObj = (profileSettings.stickers || []).find(s => s.id === selectedElementId);

  return (
    <>
      {/* Minimized Bottom Floating Studio Access Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            layoutId="designer-studio-floating"
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#DCA221] text-white border-2 border-slate-900 px-4 py-3 shadow-charcoal-offset cursor-pointer font-mono text-xs font-black uppercase tracking-wider hover:bg-emerald-800 transition-all text-left"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            <span>Open Canvas Studio</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Draggable Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            layoutId="designer-studio-floating"
            className="fixed bottom-6 right-6 top-20 w-80 sm:w-96 bg-verdant-charcoal border-[3px] border-verdant-cream overflow-hidden z-50 flex flex-col shadow-charcoal-offset text-left rounded-none"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
          >
            {/* Header section with brand info */}
            <header className="bg-verdant-dark p-4 border-b-[3px] border-verdant-cream flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 bg-[#DCA221] border border-slate-900 rounded-none flex items-center justify-center font-black text-xs text-white">
                  C
                </div>
                <div>
                  <h3 className="font-syne font-black text-verdant-cream text-[13px] uppercase tracking-wide leading-none">
                    Studio Design Canvas
                  </h3>
                  <span className="font-mono text-[9px] text-verdant-lime font-bold uppercase tracking-wider block mt-0.5">
                    Editing Page: <span className="text-white">{activeTab}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={onCloseAdmin}
                  title="Logout admin access"
                  className="p-1 hover:bg-verdant-charcoal border border-transparent hover:border-red-500/20 text-red-400 rounded-none cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-verdant-charcoal border border-transparent hover:border-verdant-cream text-verdant-cream rounded-none cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-verdant-yellow" />
                </button>
              </div>
            </header>

            {/* Studio Navigation Workspace Options */}
            <nav className="flex border-b border-verdant-cream/20 bg-verdant-dark/25 text-[10px] font-mono font-black uppercase shrink-0">
              {[
                { id: "ADD", label: "🌿 Add Layer", icon: Plus },
                { id: "TWEAK", label: "⚙️ Layout Settings", icon: Sliders },
                { id: "CANVAS", label: "🎨 Background", icon: Palette },
                { id: "IDENTITY", label: "✍️ Details", icon: FileText }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMenuTab(m.id as any)}
                  className={`flex-1 py-3 text-center border-b-2 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${
                    activeMenuTab === m.id
                      ? "border-[#DCA221] text-[#DCA221] bg-verdant-charcoal"
                      : "border-transparent text-verdant-gray hover:text-verdant-cream"
                  }`}
                >
                  <m.icon className="w-4 h-4 mb-0.5" />
                  <span className="text-[8px] tracking-tight">{m.label.split(" ")[1]}</span>
                </button>
              ))}
            </nav>

            {/* Inner scroll container */}
            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
              
              {/* TAB 1: ADD NEW ELEMENTS (CANVA STYLE) */}
              {activeMenuTab === "ADD" && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="font-syne font-black text-xs text-verdant-cream uppercase mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-verdant-yellow" />
                      <span>Canvas Component Engine</span>
                    </h4>
                    <p className="font-sans text-[11px] text-verdant-gray font-semibold leading-relaxed">
                      Transform your workspace. Add draggable text blocks, vector geometrics, customizable custom uploaded images, or widgets!
                    </p>
                  </div>

                  {/* Text blocks templates input */}
                  <div className="border border-verdant-cream/15 p-3 bg-verdant-dark/20 flex flex-col gap-2">
                    <header className="font-mono text-[9px] font-bold text-[#306634] uppercase tracking-wider flex items-center gap-1">
                      <Type className="w-3.5 h-3.5" />
                      <span>1. Custom Typography Text Box</span>
                    </header>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleAddNewElement({
                          type: "text",
                          textValue: "HEADING TITLE",
                          fontFamily: "Syne",
                          textSizePx: 26,
                          fontWeight: "black",
                          textColor: "#FAF8F5"
                        })}
                        className="py-2.5 border border-verdant-cream/20 hover:border-verdant-yellow bg-verdant-charcoal hover:bg-verdant-dark text-center cursor-pointer text-[10px] uppercase font-black tracking-tight text-white"
                      >
                        Title
                      </button>
                      <button
                        onClick={() => handleAddNewElement({
                          type: "text",
                          textValue: "Type custom narrative body copy details directly on screen...",
                          fontFamily: "Plus Jakarta Sans",
                          textSizePx: 12,
                          fontWeight: "normal",
                          textColor: "#F2EEE3"
                        })}
                        className="py-2.5 border border-verdant-cream/20 hover:border-verdant-yellow bg-verdant-charcoal hover:bg-verdant-dark text-center cursor-pointer text-[10px] uppercase font-bold text-verdant-cream"
                      >
                        Paragraph
                      </button>
                      <button
                        onClick={() => handleAddNewElement({
                          type: "text",
                          textValue: "★ AESTHETIC STAMP LABEL ★",
                          fontFamily: "JetBrains Mono",
                          textSizePx: 10,
                          fontWeight: "black",
                          textColor: "#DCA221"
                        })}
                        className="py-2.5 border border-verdant-cream/20 hover:border-verdant-yellow bg-verdant-charcoal hover:bg-verdant-dark text-center cursor-pointer text-[10px] uppercase font-black text-verdant-yellow"
                      >
                        Stamp Label
                      </button>
                    </div>
                  </div>

                  {/* Shapes templates input */}
                  <div className="border border-verdant-cream/15 p-3 bg-verdant-dark/20 flex flex-col gap-2">
                    <header className="font-mono text-[9px] font-bold text-[#306634] uppercase tracking-wider flex items-center gap-1">
                      <Circle className="w-3.5 h-3.5" />
                      <span>2. Organic Shapes & Dividers</span>
                    </header>
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        onClick={() => handleAddNewElement({
                          type: "shape",
                          shapeType: "circle",
                          width: 80,
                          textColor: "#DCA221"
                        })}
                        className="py-2 border border-verdant-cream/20 hover:border-verdant-yellow bg-verdant-charcoal text-[9px] font-mono hover:text-white text-verdant-cream"
                      >
                        🟢 Circle
                      </button>
                      <button
                        onClick={() => handleAddNewElement({
                          type: "shape",
                          shapeType: "rectangle",
                          width: 120,
                          height: 60,
                          textColor: "#306634"
                        })}
                        className="py-2 border border-verdant-cream/20 hover:border-verdant-yellow bg-verdant-charcoal text-[9px] font-mono hover:text-white text-verdant-cream"
                      >
                        🟧 Rect
                      </button>
                      <button
                        onClick={() => handleAddNewElement({
                          type: "shape",
                          shapeType: "line",
                          width: 160,
                          textColor: "#306634"
                        })}
                        className="py-2 border border-verdant-cream/20 hover:border-verdant-yellow bg-verdant-charcoal text-[9px] font-mono hover:text-white text-verdant-cream"
                      >
                        ➖ Divider
                      </button>
                      <button
                        onClick={() => handleAddNewElement({
                          type: "shape",
                          shapeType: "star-badge",
                          width: 80,
                          textColor: "#DCA221"
                        })}
                        className="py-2 border border-verdant-cream/20 hover:border-verdant-yellow bg-verdant-charcoal text-[9px] font-mono hover:text-white text-verdant-cream"
                      >
                        ⭐ Star
                      </button>
                    </div>
                  </div>

                  {/* Custom Draggable widgets */}
                  <div className="border border-verdant-cream/15 p-3 bg-verdant-dark/20 flex flex-col gap-2">
                    <header className="font-mono text-[9px] font-bold text-[#306634] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>3. Live Interactive Mini Widgets</span>
                    </header>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleAddNewElement({
                          type: "widget",
                          widgetType: "clock",
                          scale: 1.0,
                          rotation: 0
                        })}
                        className="py-2 border border-[#306634]/30 hover:border-verdant-yellow bg-verdant-charcoal text-[9px] font-mono font-black text-white hover:bg-[#306634]/10"
                      >
                        🕒 Real Clock
                      </button>
                      <button
                        onClick={() => handleAddNewElement({
                          type: "widget",
                          widgetType: "music",
                          scale: 1.0,
                          rotation: -1
                        })}
                        className="py-2 border border-[#306634]/30 hover:border-verdant-yellow bg-verdant-charcoal text-[9px] font-mono font-black text-white hover:bg-[#306634]/10"
                      >
                        📻 Tape Player
                      </button>
                      <button
                        onClick={() => handleAddNewElement({
                          type: "widget",
                          widgetType: "tech-counter",
                          scale: 1.0,
                          rotation: 3
                        })}
                        className="py-2 border border-[#306634]/30 hover:border-verdant-yellow bg-verdant-charcoal text-[9px] font-mono font-black text-white hover:bg-[#306634]/10"
                      >
                        ⚡ Status Feed
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      <button
                        onClick={() => handleAddNewElement({
                          type: "widget",
                          widgetType: "quote",
                          scale: 1.1,
                          rotation: -2
                        })}
                        className="py-2 border border-verdant-cream/20 hover:border-verdant-yellow bg-verdant-charcoal text-[9px] font-mono text-verdant-cream"
                      >
                        📜 Charles Eames Quote
                      </button>
                      <button
                        onClick={() => handleAddNewElement({
                          type: "widget",
                          widgetType: "contact-badge",
                          scale: 1.0,
                          rotation: 0
                        })}
                        className="py-2 border border-verdant-cream/20 hover:border-verdant-yellow bg-verdant-charcoal text-[9px] font-mono text-verdant-cream"
                      >
                        ✉️ Talk Stamp Envelope
                      </button>
                    </div>
                  </div>

                  {/* Graphic stickers and upload block */}
                  <div className="border border-verdant-cream/15 p-3 bg-verdant-dark/20 flex flex-col gap-2.5">
                    <header className="font-mono text-[9px] font-bold text-[#306634] uppercase tracking-wider flex items-center justify-between">
                      <span>4. Built-in Graphic Stamps / Stickers</span>
                      <Maximize2 className="w-3 h-3 text-stone-500" />
                    </header>
                    <div className="grid grid-cols-4 gap-1.5">
                      {presetStickers.map((ps) => (
                        <button
                          key={ps.key}
                          onClick={() => handleAddNewElement({
                            type: "sticker",
                            src: ps.key,
                            scale: 1.0,
                            rotation: Math.floor(Math.random() * 20) - 10
                          })}
                          className="aspect-square bg-verdant-charcoal border border-verdant-cream/10 hover:border-verdant-yellow flex items-center justify-center p-1.5 cursor-pointer rounded-none"
                          title={ps.label}
                        >
                          <StickerRenderer src={ps.key} size={30} />
                        </button>
                      ))}
                    </div>

                    <div className="border border-dashed border-verdant-cream/30 p-2.5 flex flex-col gap-1.5 mt-1.5 bg-verdant-dark/40">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[8px] text-verdant-cream font-bold uppercase tracking-wider">
                          📤 Drag & Drop Custom Images / Artwork
                        </span>
                        <Upload className="w-3 h-3 text-verdant-yellow" />
                      </div>
                      <label className="cursor-pointer bg-verdant-charcoal border border-[#306634]/40 hover:border-verdant-yellow p-1.5 text-center text-[10px] font-mono text-verdant-cream hover:text-white transition-colors block">
                        Drop Custom PNG Sticker
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleGraphicImageUpload}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: ACTIVE PLACED LIST & PROPERTY CONTROLS (TWEAK) */}
              {activeMenuTab === "TWEAK" && (
                <div className="flex flex-col gap-4">
                  {/* Select target element to edit */}
                  <div className="flex flex-col gap-1 bg-verdant-dark/30 p-2 border border-verdant-cream/15">
                    <label className="font-mono text-[9px] text-[#306634] font-black uppercase tracking-widest block">
                      🎨 Selected Canvas Layer to Modify
                    </label>
                    <select
                      value={selectedElementId}
                      onChange={(e) => setSelectedElementId(e.target.value)}
                      className="w-full bg-verdant-charcoal font-mono text-xs text-verdant-cream p-2 border border-verdant-cream/20 focus:outline-none focus:border-verdant-yellow"
                    >
                      <option value="">-- [Choose layer to tweak] --</option>
                      {pageElements.map((el) => {
                        let name = "Sticker - " + el.src;
                        if (el.type === "text") name = "📝 Text Box: " + (el.textValue ? el.textValue.slice(0, 16) + "..." : "Empty");
                        if (el.type === "shape") name = "🟩 Shape: " + el.shapeType;
                        if (el.type === "widget") name = "🕒 Widget: " + el.widgetType;
                        if (el.src.startsWith("data:")) name = "🖼️ Custom Upload Image";

                        return (
                          <option key={el.id} value={el.id}>
                            {name} (X:{Math.round(el.x)}% Y:{Math.round(el.y)}%)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Render parameters tweaks ONLY if selected element sits in memory */}
                  {!selectedElementObj ? (
                    <div className="text-center py-8 text-zinc-500 font-sans text-xs italic">
                      No draggable layer selected. Click on any element directly on the website preview, or choose from the dropdown list above to unlock visual slide selectors!
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 border border-verdant-cream/15 p-3.5 bg-verdant-dark/15 text-xs">
                      
                      {/* Depth Sorting Layer */}
                      <div className="flex justify-between items-center bg-verdant-dark p-2 border border-verdant-cream/10">
                        <span className="font-mono text-[9px] font-bold text-[#306634] uppercase">Depth Structure:</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateProp(selectedElementObj.id, { zIndex: 10 })}
                            className="bg-verdant-charcoal text-[9px] border border-verdant-cream/30 hover:border-verdant-yellow p-1 font-mono hover:text-white"
                          >
                            Send Under
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const maxZ = Math.max(...(profileSettings.stickers || []).map(s => s.zIndex || 30), 30);
                              handleUpdateProp(selectedElementObj.id, { zIndex: maxZ + 2 });
                            }}
                            className="bg-verdant-charcoal text-[9px] border border-verdant-cream/30 hover:border-verdant-yellow p-1 font-mono hover:text-white"
                          >
                            Bring Front
                          </button>
                        </div>
                      </div>

                      {/* Display Page Selector field */}
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[9px] text-[#306634] font-black uppercase tracking-widest block">
                          Target Display Page Location
                        </label>
                        <select
                          value={selectedElementObj.tab}
                          onChange={(e) => handleUpdateProp(selectedElementObj.id, { tab: e.target.value })}
                          className="w-full bg-verdant-charcoal font-mono text-[10px] text-verdant-cream p-1.5 border border-verdant-cream/25 focus:outline-none"
                        >
                          <option value="HOME">HOME Page View Only</option>
                          <option value="PROJECTS">PROJECTS Portfolio View Only</option>
                          <option value="ABOUT">ABOUT Story View Only</option>
                          <option value="CONNECT">CONNECT Forms View Only</option>
                          <option value="ALL">ALL Pages (Always sticky Backdrop!)</option>
                        </select>
                      </div>

                      {/* Scale / Sizing Slide */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-verdant-cream">
                          <span>Scale Scaling Factor:</span>
                          <span className="font-bold text-verdant-yellow">x{selectedElementObj.scale}</span>
                        </div>
                        <input
                          type="range"
                          min="0.3"
                          max="3.2"
                          step="0.05"
                          value={selectedElementObj.scale}
                          onChange={(e) => handleUpdateProp(selectedElementObj.id, { scale: parseFloat(e.target.value) })}
                          className="w-full accent-[#DCA221] cursor-pointer"
                        />
                      </div>

                      {/* Angle Rotation Selection */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-verdant-cream">
                          <span>Rotation Degree:</span>
                          <span className="font-bold text-verdant-yellow">{selectedElementObj.rotation}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          step="2"
                          value={selectedElementObj.rotation}
                          onChange={(e) => handleUpdateProp(selectedElementObj.id, { rotation: parseInt(e.target.value) })}
                          className="w-full accent-[#DCA221] cursor-pointer"
                        />
                      </div>

                      {/* Conditional Tweak field list: TEXT TYPE */}
                      {selectedElementObj.type === "text" && (
                        <div className="border-t border-verdant-cream/20 pt-3 flex flex-col gap-3">
                          
                          {/* Sizing text input override */}
                          <div className="flex flex-col gap-1">
                            <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest block">
                              Edit Text Value
                            </label>
                            <textarea
                              rows={2}
                              value={selectedElementObj.textValue || ""}
                              onChange={(e) => handleUpdateProp(selectedElementObj.id, { textValue: e.target.value })}
                              className="w-full bg-verdant-dark text-verdant-cream p-2 font-sans text-[11px] font-bold border border-verdant-cream/30 focus:outline-none"
                            />
                          </div>

                          {/* Font Family selector */}
                          <div className="flex flex-col gap-1">
                            <label className="font-mono text-[9px] text-[#306634] font-black uppercase tracking-widest block">
                              Custom Font Style
                            </label>
                            <select
                              value={selectedElementObj.fontFamily || "Plus Jakarta Sans"}
                              onChange={(e) => handleUpdateProp(selectedElementObj.id, { fontFamily: e.target.value })}
                              className="w-full bg-verdant-charcoal font-sans text-[10px] text-verdant-cream p-1.5 border border-verdant-cream/20"
                            >
                              <option value="Syne">Syne (Bold-black Display)</option>
                              <option value="Space Grotesk">Space Grotesk (Neo-brutalist)</option>
                              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Inter-like Body)</option>
                              <option value="Playfair Display">Playfair Display (Classy Serif)</option>
                              <option value="JetBrains Mono">JetBrains Mono (Technical Tech)</option>
                            </select>
                          </div>

                          {/* Custom Color Paint selection */}
                          <div className="flex flex-col gap-1">
                            <label className="font-mono text-[9px] text-[#306634] font-black uppercase tracking-widest block">
                              Font Text Color
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={selectedElementObj.textColor || "#FAF8F5"}
                                onChange={(e) => handleUpdateProp(selectedElementObj.id, { textColor: e.target.value })}
                                className="w-8 h-8 cursor-pointer shrink-0 border border-verdant-cream"
                              />
                              <input
                                type="text"
                                value={selectedElementObj.textColor || "#FAF8F5"}
                                onChange={(e) => handleUpdateProp(selectedElementObj.id, { textColor: e.target.value })}
                                className="w-full bg-verdant-dark font-mono text-[10px] text-white px-2 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Font size sliders px */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                              <span>Font Size:</span>
                              <span className="font-bold">{selectedElementObj.textSizePx || 16}px</span>
                            </div>
                            <input
                              type="range"
                              min="8"
                              max="85"
                              step="1"
                              value={selectedElementObj.textSizePx || 16}
                              onChange={(e) => handleUpdateProp(selectedElementObj.id, { textSizePx: parseInt(e.target.value) })}
                              className="w-full accent-emerald-700 cursor-pointer"
                            />
                          </div>

                        </div>
                      )}

                      {/* Conditional Tweak field list: SHAPE TYPE */}
                      {selectedElementObj.type === "shape" && (
                        <div className="border-t border-verdant-cream/20 pt-3 flex flex-col gap-3">
                          
                          {/* Shape background fill */}
                          <div className="flex flex-col gap-1">
                            <label className="font-mono text-[9px] text-[#306634] font-black uppercase tracking-widest block">
                              Shape Paint Color fill
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={selectedElementObj.textColor || "#DCA221"}
                                onChange={(e) => handleUpdateProp(selectedElementObj.id, { textColor: e.target.value })}
                                className="w-8 h-8 cursor-pointer shrink-0 border border-verdant-cream"
                              />
                              <input
                                type="text"
                                value={selectedElementObj.textColor || "#DCA221"}
                                onChange={(e) => handleUpdateProp(selectedElementObj.id, { textColor: e.target.value })}
                                className="w-full bg-verdant-dark font-mono text-[10px] text-white px-2 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Sizing indicators */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                              <span>Primary Width sizing:</span>
                              <span className="font-bold">{selectedElementObj.width || 80}px</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="400"
                              value={selectedElementObj.width || 80}
                              onChange={(e) => handleUpdateProp(selectedElementObj.id, { width: parseInt(e.target.value) })}
                              className="w-full accent-[#DCA221] cursor-pointer"
                            />
                          </div>

                          {selectedElementObj.shapeType === "rectangle" && (
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                                <span>Rectangle Height:</span>
                                <span className="font-bold">{selectedElementObj.height || 60}px</span>
                              </div>
                              <input
                                type="range"
                                min="10"
                                max="400"
                                value={selectedElementObj.height || 60}
                                onChange={(e) => handleUpdateProp(selectedElementObj.id, { height: parseInt(e.target.value) })}
                                className="w-full accent-[#DCA221] cursor-pointer"
                              />
                            </div>
                          )}

                        </div>
                      )}

                      {/* Danger deletion button */}
                      <div className="border-t border-verdant-cream/20 pt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveSticker(selectedElementObj.id)}
                          className="bg-red-600/25 hover:bg-red-600 color-white hover:text-white border border-red-500/30 p-2 font-mono text-[10px] uppercase font-black transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Trash Element</span>
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: CANVAS BACKGROUND WALPAPERS & BRAND PALETTE */}
              {activeMenuTab === "CANVAS" && (
                <div className="flex flex-col gap-4 text-xs">
                  <div>
                    <h4 className="font-syne font-black text-xs text-verdant-cream uppercase mb-1">
                      Canvas Backdrop Settings
                    </h4>
                    <p className="font-sans text-[11px] text-verdant-gray font-semibold leading-relaxed">
                      Choose cozy parchment presets, activate dynamic video elements, or customized color loops.
                    </p>
                  </div>

                  {/* Backdrop flats presets */}
                  <div className="border border-verdant-cream/15 p-3 flex flex-col gap-3">
                    <header className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-wider flex items-center justify-between">
                      <span>☘️ Backdrop Flat colors</span>
                      <Palette className="w-3.5 h-3.5" />
                    </header>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { name: "White Linen", hex: "#FAF8F5" },
                        { name: "Oats Oatmeal", hex: "#EFECE5" },
                        { name: "Zine Off-White", hex: "#F9FAF9" },
                        { name: "Cosmic Spruce Dark", hex: "#0E170F" }
                      ].map((cp) => (
                        <button
                          key={cp.hex}
                          onClick={() => onUpdateSettings({ ...profileSettings, customCanvasBg: cp.hex })}
                          className={`p-2 border text-left flex items-center gap-1.5 cursor-pointer bg-verdant-dark/20 ${
                            profileSettings.customCanvasBg === cp.hex ? "border-2 border-[#DCA221]" : "border-verdant-cream/15 hover:border-[#DCA221]"
                          }`}
                        >
                          <span style={{ backgroundColor: cp.hex }} className="w-3.5 h-3.5 border border-verdant-cream shrink-0 inline-block" />
                          <span className="font-mono text-[9px] text-verdant-cream leading-none font-bold truncate">{cp.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        value={profileSettings.customCanvasBg || "#FAF8F5"}
                        onChange={(e) => onUpdateSettings({ ...profileSettings, customCanvasBg: e.target.value })}
                        className="w-8 h-8 border border-verdant-cream cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={profileSettings.customCanvasBg || ""}
                        onChange={(e) => onUpdateSettings({ ...profileSettings, customCanvasBg: e.target.value })}
                        placeholder="#FAF8F5"
                        className="w-full bg-verdant-dark text-verdant-cream px-2 font-mono text-xs border border-verdant-cream focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Nature MP4 video backings */}
                  <div className="border border-verdant-cream/15 p-3 flex flex-col gap-3">
                    <header className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-wider flex items-center justify-between">
                      <span>🎥 Ambient Nature Video Wallpaper</span>
                      <Video className="w-3.5 h-3.5" />
                    </header>
                    <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                      Transform the backdrop with gorgeous atmospheric video streams looped automatically underneath components.
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {videoPresets.map((vid) => (
                        <button
                          key={vid.url}
                          onClick={() => onUpdateSettings({ ...profileSettings, customBgVideoUrl: vid.url })}
                          className={`p-2 border text-left text-[10px] font-mono flex items-center justify-between cursor-pointer bg-verdant-dark/20 ${
                            profileSettings.customBgVideoUrl === vid.url ? "border-2 border-verdant-yellow text-verdant-yellow" : "border-verdant-cream/15 text-verdant-cream hover:text-verdant-yellow"
                          }`}
                        >
                          <span>{vid.name}</span>
                          {profileSettings.customBgVideoUrl === vid.url && <Check className="w-3/12 h-3.5 text-verdant-yellow shrink-0 fill-current" />}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest block">
                        Or paste any dynamic direct loop video URL
                      </span>
                      <input 
                        type="text"
                        value={profileSettings.customBgVideoUrl || ""}
                        onChange={(e) => onUpdateSettings({ ...profileSettings, customBgVideoUrl: e.target.value })}
                        placeholder="https://example.com/ambient-loop.mp4"
                        className="w-full bg-verdant-dark text-verdant-cream px-2 py-1.5 font-mono text-[10px] border border-verdant-cream focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Backdrop canvas textures overlay */}
                  <div className="border border-verdant-cream/15 p-3 flex flex-col gap-3">
                    <header className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-wider flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Backing Canvas Grid Mesh</span>
                    </header>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: "Checkered Board", val: "checker-grid" },
                        { label: "Architectural Grid", val: "grid-mesh" },
                        { label: "Ambient Blur Glow", val: "radial-grain" },
                        { label: "Plain Solid Background", val: "solid-plain" }
                      ].map((gm) => (
                        <button
                          key={gm.val}
                          onClick={() => onUpdateSettings({ ...profileSettings, bgAccentStyle: gm.val })}
                          className={`p-2 border text-left text-[10px] font-mono cursor-pointer bg-verdant-dark/20 ${
                            profileSettings.bgAccentStyle === gm.val ? "border-2 border-verdant-yellow text-verdant-yellow" : "border-verdant-cream/15 text-verdant-cream"
                          }`}
                        >
                          {gm.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Theme Accent Colors */}
                  <div className="border border-verdant-cream/15 p-3 flex flex-col gap-3">
                    <header className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-wider flex items-center justify-between">
                      <span>🎨 Brand Accents & Colors</span>
                      <Palette className="w-3.5 h-3.5" />
                    </header>
                    <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                      Tweak primary line accents, glowing secondary alerts, widget cards background, and text colors on the fly.
                    </p>

                    {/* 1. Primary Accent */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-zinc-400 tracking-widest block font-bold uppercase">
                        Primary Accent (Borders & Buttons)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={profileSettings.themeColorPrimary || "#306634"}
                          onChange={(e) => onUpdateSettings({ ...profileSettings, themeColorPrimary: e.target.value })}
                          className="w-8 h-8 border border-verdant-cream cursor-pointer rounded-none shrink-0"
                        />
                        <input 
                          type="text"
                          value={profileSettings.themeColorPrimary || ""}
                          onChange={(e) => onUpdateSettings({ ...profileSettings, themeColorPrimary: e.target.value })}
                          placeholder="#306634"
                          className="w-full bg-verdant-dark text-verdant-cream px-2 py-1 font-mono text-xs border border-verdant-cream focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 2. Secondary Accent */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-zinc-400 tracking-widest block font-bold uppercase">
                        Secondary Accent (Highlighter / Badges)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={profileSettings.themeColorSecondary || "#DCA221"}
                          onChange={(e) => onUpdateSettings({ ...profileSettings, themeColorSecondary: e.target.value })}
                          className="w-8 h-8 border border-verdant-cream cursor-pointer rounded-none shrink-0"
                        />
                        <input 
                          type="text"
                          value={profileSettings.themeColorSecondary || ""}
                          onChange={(e) => onUpdateSettings({ ...profileSettings, themeColorSecondary: e.target.value })}
                          placeholder="#DCA221"
                          className="w-full bg-verdant-dark text-verdant-cream px-2 py-1 font-mono text-xs border border-verdant-cream focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 3. Component Cards Background */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-zinc-400 tracking-widest block font-bold uppercase">
                        Widget Cards Background Color
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={profileSettings.customCardBg || "#F2EEE3"}
                          onChange={(e) => onUpdateSettings({ ...profileSettings, customCardBg: e.target.value })}
                          className="w-8 h-8 border border-verdant-cream cursor-pointer rounded-none shrink-0"
                        />
                        <input 
                          type="text"
                          value={profileSettings.customCardBg || ""}
                          onChange={(e) => onUpdateSettings({ ...profileSettings, customCardBg: e.target.value })}
                          placeholder="#F2EEE3"
                          className="w-full bg-verdant-dark text-verdant-cream px-2 py-1 font-mono text-xs border border-verdant-cream focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 4. Header Text Color */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-zinc-400 tracking-widest block font-bold uppercase">
                        Header / Title Text Color
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={profileSettings.themeColorTextHeader || "#142215"}
                          onChange={(e) => onUpdateSettings({ ...profileSettings, themeColorTextHeader: e.target.value })}
                          className="w-8 h-8 border border-verdant-cream cursor-pointer rounded-none shrink-0"
                        />
                        <input 
                          type="text"
                          value={profileSettings.themeColorTextHeader || ""}
                          onChange={(e) => onUpdateSettings({ ...profileSettings, themeColorTextHeader: e.target.value })}
                          placeholder="#142215"
                          className="w-full bg-verdant-dark text-verdant-cream px-2 py-1 font-mono text-xs border border-verdant-cream focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 5. Body Text Color */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-zinc-400 tracking-widest block font-bold uppercase">
                        Body / Narrative Text Color
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={profileSettings.themeColorTextBody || "#4B564A"}
                          onChange={(e) => onUpdateSettings({ ...profileSettings, themeColorTextBody: e.target.value })}
                          className="w-8 h-8 border border-verdant-cream cursor-pointer rounded-none shrink-0"
                        />
                        <input 
                          type="text"
                          value={profileSettings.themeColorTextBody || ""}
                          onChange={(e) => onUpdateSettings({ ...profileSettings, themeColorTextBody: e.target.value })}
                          placeholder="#4B564A"
                          className="w-full bg-verdant-dark text-verdant-cream px-2 py-1 font-mono text-xs border border-verdant-cream focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Font Typography & Text Casing */}
                  <div className="border border-verdant-cream/15 p-3 flex flex-col gap-3">
                    <header className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-wider flex items-center justify-between">
                      <span>✍️ Font Pairing & Letter Case</span>
                      <Type className="w-3.5 h-3.5" />
                    </header>

                    {/* Header Font */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-zinc-400 tracking-widest block font-bold uppercase">
                        Header Typography Pairing
                      </label>
                      <select
                        value={profileSettings.fontFamilyHeader || "Syne"}
                        onChange={(e) => onUpdateSettings({ ...profileSettings, fontFamilyHeader: e.target.value })}
                        className="w-full bg-verdant-dark text-verdant-cream px-2 py-1.5 border border-verdant-cream font-mono text-[11px] focus:outline-none"
                      >
                        <option value="Syne">Syne (Default Bold)</option>
                        <option value="Space Grotesk">Space Grotesk (Tech Modern)</option>
                        <option value="Plus Jakarta Sans">Plus Jakarta Sans (Minimal Sans)</option>
                        <option value="JetBrains Mono">JetBrains Mono (Technical)</option>
                        <option value="Playfair Display">Playfair Display (Premium Serif)</option>
                      </select>
                    </div>

                    {/* Body Font */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-zinc-400 tracking-widest block font-bold uppercase">
                        Body Typography Font
                      </label>
                      <select
                        value={profileSettings.fontFamilyBody || "Plus Jakarta Sans"}
                        onChange={(e) => onUpdateSettings({ ...profileSettings, fontFamilyBody: e.target.value })}
                        className="w-full bg-verdant-dark text-verdant-cream px-2 py-1.5 border border-verdant-cream font-mono text-[11px] focus:outline-none"
                      >
                        <option value="Plus Jakarta Sans">Plus Jakarta Sans (Inter-like Sans)</option>
                        <option value="JetBrains Mono">JetBrains Mono (Developer Mono)</option>
                      </select>
                    </div>

                    {/* Heading Letter Case */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-zinc-400 tracking-widest block font-bold uppercase">
                        Global Heading Letter Case
                      </label>
                      <select
                        value={profileSettings.textCasingStyle || "uppercase"}
                        onChange={(e) => onUpdateSettings({ ...profileSettings, textCasingStyle: e.target.value })}
                        className="w-full bg-verdant-dark text-verdant-cream px-2 py-1.5 border border-verdant-cream font-mono text-[11px] focus:outline-none"
                      >
                        <option value="uppercase">ALL CAPITAL LETTERS (Symmetrical)</option>
                        <option value="normal-case">Preserve Input Case (Standard)</option>
                      </select>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: BIOGRAPHICAL & IDENTITY TEXT FIELDS */}
              {activeMenuTab === "IDENTITY" && (
                <div className="flex flex-col gap-4 text-xs font-sans">
                  <div>
                    <h4 className="font-syne font-black text-xs text-verdant-cream uppercase mb-1">
                      General Brand Information
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                      These parameters modify standard database templates loaded inside the main portfolio wrappers dynamically!
                    </p>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] text-[#306634] font-black uppercase tracking-widest block font-sans">
                        Founder First Name
                      </label>
                      <input 
                        type="text"
                        value={profileSettings.fullName || ""}
                        onChange={(e) => onUpdateSettings({ ...profileSettings, fullName: e.target.value })}
                        className="w-full bg-verdant-dark text-verdant-cream px-3 py-2 border-2 border-verdant-cream font-mono text-xs focus:outline-none focus:border-verdant-yellow"
                        placeholder="Juliaristy"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] text-[#306634] font-black uppercase tracking-widest block font-sans">
                        Last Name Highlight
                      </label>
                      <input 
                        type="text"
                        value={profileSettings.lastNameHighlight || ""}
                        onChange={(e) => onUpdateSettings({ ...profileSettings, lastNameHighlight: e.target.value })}
                        className="w-full bg-verdant-dark text-verdant-cream px-3 py-2 border-2 border-verdant-cream font-mono text-xs focus:outline-none focus:border-verdant-yellow"
                        placeholder="Castillo"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] text-[#306634] font-black uppercase tracking-widest block font-sans">
                        Core Dynamic Catchphrase
                      </label>
                      <textarea 
                        rows={2}
                        value={profileSettings.headline || ""}
                        onChange={(e) => onUpdateSettings({ ...profileSettings, headline: e.target.value })}
                        className="w-full bg-verdant-dark text-verdant-cream px-3 py-2 border-2 border-verdant-cream font-sans text-xs focus:outline-none focus:border-verdant-yellow leading-relaxed font-semibold"
                        placeholder="Botanical Designer"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] text-[#306634] font-black uppercase tracking-widest block font-sans">
                        Short Biography Paragraph
                      </label>
                      <textarea 
                        rows={3}
                        value={profileSettings.biography || ""}
                        onChange={(e) => onUpdateSettings({ ...profileSettings, biography: e.target.value })}
                        className="w-full bg-verdant-dark text-verdant-cream px-3 py-2 border-2 border-verdant-cream font-sans text-xs focus:outline-none focus:border-verdant-yellow leading-relaxed font-semibold"
                        placeholder="My interest sit at..."
                      />
                    </div>

                    {/* Dedication Card Editor */}
                    <div className="border-t border-verdant-cream/20 pt-3 mt-1 flex flex-col gap-2">
                      <header className="font-mono text-[9px] font-black text-verdant-yellow uppercase tracking-wider">
                        <span>🛠️ Custom Dedication Box</span>
                      </header>
                      <div className="flex flex-col gap-2 bg-verdant-dark/20 p-2 border border-verdant-cream/10">
                        <div className="flex flex-col gap-1">
                          <label className="font-mono text-[8px] text-[#306634] font-black uppercase tracking-widest">
                            Dedication Box Title
                          </label>
                          <input 
                            type="text"
                            value={profileSettings.dedicationTitle || ""}
                            onChange={(e) => onUpdateSettings({ ...profileSettings, dedicationTitle: e.target.value })}
                            className="w-full bg-verdant-dark text-verdant-cream px-2 py-1.5 border border-verdant-cream font-mono text-[11px] focus:outline-none focus:border-verdant-yellow"
                            placeholder="INCREMENTAL PROGRESS"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-mono text-[8px] text-[#306634] font-black uppercase tracking-widest">
                            Dedication Box Body
                          </label>
                          <textarea 
                            rows={2}
                            value={profileSettings.dedicationText || ""}
                            onChange={(e) => onUpdateSettings({ ...profileSettings, dedicationText: e.target.value })}
                            className="w-full bg-verdant-dark text-verdant-cream px-2 py-1.5 border border-verdant-cream font-sans text-[11px] focus:outline-none focus:border-verdant-yellow leading-normal font-semibold"
                            placeholder="Building secure networks..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ticker Ribbon Editor */}
                    <div className="border-t border-verdant-cream/20 pt-3 mt-1 flex flex-col gap-2">
                      <header className="font-mono text-[9px] font-black text-verdant-yellow uppercase tracking-wider">
                        <span>🛠️ Custom Ticker Phrases</span>
                      </header>
                      <div className="flex flex-col gap-1 bg-verdant-dark/20 p-2 border border-verdant-cream/10">
                        <label className="font-mono text-[8px] text-[#306634] font-black uppercase tracking-widest leading-normal">
                          Phrases list (One phrase per line)
                        </label>
                        <textarea 
                          rows={3}
                          value={localTickerText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLocalTickerText(val);
                            const lines = val.split("\n");
                            onUpdateSettings({ ...profileSettings, tickerPhrases: lines });
                          }}
                          className="w-full bg-verdant-dark text-verdant-cream px-2 py-1.5 border border-verdant-cream font-mono text-[11px] focus:outline-none focus:border-verdant-yellow leading-normal"
                          placeholder="DECODING CRYPTOGRAPHIC SYSTEMS&#10;MODELING SPATIAL 3D WIREFRAMES&#10;OPTIMIZING REAL-TIME PHYSICS LOOPS"
                        />
                      </div>
                    </div>

                    {/* Hiding/Unhiding widgets switches */}
                    <div className="border-t border-verdant-cream/20 pt-4 mt-2 flex flex-col gap-2">
                      <header className="font-mono text-[9px] font-black text-verdant-yellow uppercase tracking-wider flex items-center justify-between">
                        <span>🛠️ Visibility of Core Modules</span>
                        <Settings className="w-3.5 h-3.5" />
                      </header>
                      <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                        Toggle checkmarks to cover/reveal components like the Polaroid drawing canvas or Certifications grid.
                      </p>
                      <div className="flex flex-col gap-2 bg-verdant-dark/25 p-2.5 border border-verdant-cream/10 font-mono text-[10px] text-verdant-cream">
                        <label className="flex items-center gap-2 cursor-pointer select-none py-0.5 hover:text-white">
                          <input 
                            type="checkbox"
                            checked={!profileSettings.hideHeroPolaroid}
                            onChange={(e) => onUpdateSettings({ ...profileSettings, hideHeroPolaroid: !e.target.checked })}
                            className="accent-verdant-yellow h-3.5 w-3.5 cursor-pointer"
                          />
                          <span>Show Portrait Polaroid Artwork</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none py-0.5 hover:text-white">
                          <input 
                            type="checkbox"
                            checked={!profileSettings.hideSelectedProjects}
                            onChange={(e) => onUpdateSettings({ ...profileSettings, hideSelectedProjects: !e.target.checked })}
                            className="accent-verdant-yellow h-3.5 w-3.5 cursor-pointer"
                          />
                          <span>Show Selected Projects Feed</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none py-0.5 hover:text-white">
                          <input 
                            type="checkbox"
                            checked={!profileSettings.hideProcessTicker}
                            onChange={(e) => onUpdateSettings({ ...profileSettings, hideProcessTicker: !e.target.checked })}
                            className="accent-verdant-yellow h-3.5 w-3.5 cursor-pointer"
                          />
                          <span>Show Scrolling Ticker Ribbon</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none py-0.5 hover:text-white">
                          <input 
                            type="checkbox"
                            checked={!profileSettings.hideCertifications}
                            onChange={(e) => onUpdateSettings({ ...profileSettings, hideCertifications: !e.target.checked })}
                            className="accent-verdant-yellow h-3.5 w-3.5 cursor-pointer"
                          />
                          <span>Show Certifications Container</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none py-0.5 hover:text-white">
                          <input 
                            type="checkbox"
                            checked={!profileSettings.hideWorkspacePreview}
                            onChange={(e) => onUpdateSettings({ ...profileSettings, hideWorkspacePreview: !e.target.checked })}
                            className="accent-verdant-yellow h-3.5 w-3.5 cursor-pointer"
                          />
                          <span>Show Desk blueprint drafting widget</span>
                        </label>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Sticky bottom save/publish bar */}
            <div className="p-4 bg-verdant-dark border-t-[3px] border-verdant-cream flex flex-col gap-1.5 shrink-0">
              {saveSuccess && (
                <div className="flex items-center gap-1 bg-[#306634]/30 border-2 border-[#306634] text-white font-mono text-[9px] uppercase font-black tracking-wider leading-none p-2 justify-center animate-bounce">
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>DESIGN SAVED SECURELY!</span>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-verdant-charcoal text-verdant-cream border border-verdant-cream hover:bg-verdant-dark px-3 py-2.5 font-mono text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer"
                >
                  Minimize
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSaving}
                  className="flex-1 bg-verdant-yellow text-white border-2 border-slate-900 hover:bg-white hover:text-[#306634] px-3 py-2.5 font-mono text-[10px] uppercase font-black tracking-widest transition-colors cursor-pointer shadow-yellow-offset flex items-center justify-center gap-1"
                >
                  {isSaving ? (
                    <span>COMPILING...</span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>PUBLISH GRAPHICS</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
