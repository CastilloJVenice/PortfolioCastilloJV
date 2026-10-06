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
    case "gt-spec":
    case "star": // legacy mapping
      return (
        <svg width={size} height={size * 0.75} viewBox="0 0 160 120" fill="none" className="drop-shadow-md select-none pointer-events-none">
          <rect x="4" y="4" width="152" height="112" rx="3" fill="#0A0A0A" stroke="#27272A" strokeWidth="2" />
          <path d="M4 26 L156 26" stroke="#27272A" strokeWidth="1.5" />
          <rect x="12" y="11" width="8" height="8" fill="#D5001C" />
          <text x="26" y="19" fill="#FFFFFF" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="1.5">GT // SPEC 01</text>
          <text x="125" y="19" fill="#71717A" fontFamily="monospace" fontSize="8">VER 2.4</text>
          <text x="14" y="65" fill="#FFFFFF" fontFamily="sans-serif" fontSize="24" fontWeight="900" letterSpacing="1">911 GT</text>
          <path d="M14 74 L146 74" stroke="#D5001C" strokeWidth="2.5" />
          <text x="14" y="93" fill="#A1A1AA" fontFamily="monospace" fontSize="7.5" letterSpacing="1.5">AERODYNAMIC // DOWNFORCE</text>
          <text x="14" y="106" fill="#71717A" fontFamily="monospace" fontSize="7">LAT: 1.45G // 9000 RPM</text>
        </svg>
      );
    case "iso-certified":
    case "badge": // legacy mapping
      return (
        <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className="drop-shadow-md select-none pointer-events-none">
          <circle cx="60" cy="60" r="54" stroke="#0A0A0A" strokeWidth="3" fill="#FFFFFF" />
          <circle cx="60" cy="60" r="46" stroke="#D5001C" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
          <circle cx="60" cy="60" r="36" stroke="#0A0A0A" strokeWidth="1" fill="#F8F9FA" />
          <path d="M60 6 L60 20 M60 100 L60 114 M6 60 L20 60 M100 60 L114 60" stroke="#0A0A0A" strokeWidth="2" />
          <text x="60" y="52" fill="#0A0A0A" fontFamily="sans-serif" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="1">ISO 9001</text>
          <text x="60" y="66" fill="#D5001C" fontFamily="monospace" fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="1.5">QUALIFIED</text>
          <text x="60" y="78" fill="#71717A" fontFamily="monospace" fontSize="6" textAnchor="middle">PRECISION ENG</text>
        </svg>
      );
    case "radar-target":
    case "daisy": // legacy mapping
      return (
        <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className="drop-shadow-md select-none pointer-events-none">
          <circle cx="60" cy="60" r="52" stroke="#18181B" strokeWidth="1.5" strokeDasharray="6 3" fill="#FFFFFF" />
          <circle cx="60" cy="60" r="36" stroke="#27272A" strokeWidth="1" fill="none" />
          <circle cx="60" cy="60" r="18" stroke="#D5001C" strokeWidth="1.5" fill="none" />
          <line x1="60" y1="4" x2="60" y2="116" stroke="#27272A" strokeWidth="1" />
          <line x1="4" y1="60" x2="116" y2="60" stroke="#27272A" strokeWidth="1" />
          <circle cx="60" cy="60" r="3" fill="#D5001C" />
          <circle cx="78" cy="42" r="2.5" fill="#D5001C" />
          <text x="83" y="44" fill="#0A0A0A" fontFamily="monospace" fontSize="7" fontWeight="bold">TARGET</text>
          <text x="12" y="18" fill="#71717A" fontFamily="monospace" fontSize="6.5">AZ: 045°</text>
          <text x="12" y="27" fill="#71717A" fontFamily="monospace" fontSize="6.5">RNG: 8.4KM</text>
        </svg>
      );
    case "cad-wireframe":
    case "heart": // legacy mapping
      return (
        <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className="drop-shadow-md select-none pointer-events-none">
          <rect x="6" y="6" width="108" height="108" rx="2" fill="#F8F9FA" stroke="#E4E4E7" strokeWidth="1.5" />
          <path d="M60 25 L95 45 L95 85 L60 105 L25 85 L25 45 Z" stroke="#0A0A0A" strokeWidth="2" fill="none" />
          <path d="M60 25 L60 65 L95 45" stroke="#0A0A0A" strokeWidth="1.5" />
          <path d="M60 65 L25 45" stroke="#0A0A0A" strokeWidth="1.5" />
          <path d="M60 65 L60 105" stroke="#0A0A0A" strokeWidth="1.5" />
          <circle cx="60" cy="25" r="2.5" fill="#D5001C" />
          <circle cx="95" cy="45" r="2.5" fill="#0A0A0A" />
          <circle cx="95" cy="85" r="2.5" fill="#0A0A0A" />
          <circle cx="60" cy="105" r="2.5" fill="#0A0A0A" />
          <circle cx="25" cy="85" r="2.5" fill="#0A0A0A" />
          <circle cx="25" cy="45" r="2.5" fill="#0A0A0A" />
          <text x="12" y="18" fill="#0A0A0A" fontFamily="monospace" fontSize="7" fontWeight="bold">CAD // 3D ISO</text>
          <text x="64" y="114" fill="#71717A" fontFamily="monospace" fontSize="6">[X:0, Y:0, Z:1]</text>
        </svg>
      );
    case "carbon-composite":
    case "coffee": // legacy mapping
      return (
        <svg width={size} height={size * 0.9} viewBox="0 0 140 120" fill="none" className="drop-shadow-md select-none pointer-events-none">
          <polygon points="70,6 130,38 130,82 70,114 10,82 10,38" fill="#18181B" stroke="#27272A" strokeWidth="2" />
          <polygon points="70,14 122,42 122,78 70,106 18,78 18,42" fill="#0A0A0A" stroke="#D5001C" strokeWidth="1" strokeDasharray="4 2" />
          <text x="70" y="52" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="1.5">CARBON</text>
          <text x="70" y="66" fill="#A1A1AA" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="1">COMPOSITE</text>
          <line x1="45" y1="72" x2="95" y2="72" stroke="#D5001C" strokeWidth="1.5" />
          <text x="70" y="84" fill="#71717A" fontFamily="monospace" fontSize="6.5" textAnchor="middle">HIGH-MODULUS WEAVE</text>
        </svg>
      );
    case "approved-qa":
    case "tape": // legacy mapping
      return (
        <div 
          style={{ width: size * 1.5, height: size * 0.55 }} 
          className="bg-neutral-950 border border-neutral-700 text-white p-2 flex flex-col justify-between select-none pointer-events-none shadow-md rotate-[-3deg] relative"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 pb-0.5">
            <span className="font-mono text-[7px] text-[#D5001C] font-black uppercase tracking-widest">
              QA INSPECTED & VERIFIED
            </span>
            <span className="font-mono text-[6.5px] text-neutral-400">#911-PASS</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-sans font-black text-xs text-white tracking-widest uppercase">
              APPROVED
            </span>
            <div className="flex items-center gap-0.5">
              {[3, 8, 4, 10, 6, 2, 7, 5, 9, 3].map((h, i) => (
                <div key={i} style={{ height: `${h}px` }} className="w-0.5 bg-neutral-300" />
              ))}
            </div>
          </div>
        </div>
      );
    case "status-chip":
    case "smiley": // legacy mapping
      return (
        <svg width={size} height={size * 0.75} viewBox="0 0 140 100" fill="none" className="drop-shadow-md select-none pointer-events-none">
          <rect x="15" y="10" width="110" height="80" rx="3" fill="#0A0A0A" stroke="#27272A" strokeWidth="1.5" />
          {[25, 45, 65, 85, 105].map((x) => (
            <g key={x}>
              <line x1={x} y1="4" x2={x} y2="10" stroke="#71717A" strokeWidth="2" />
              <line x1={x} y1="90" x2={x} y2="96" stroke="#71717A" strokeWidth="2" />
            </g>
          ))}
          <circle cx="30" cy="30" r="3" fill="#D5001C" />
          <text x="38" y="33" fill="#FFFFFF" fontFamily="monospace" fontSize="8" fontWeight="bold">CHIP // SEC</text>
          <text x="30" y="52" fill="#E4E4E7" fontFamily="sans-serif" fontSize="12" fontWeight="900" letterSpacing="1">ECC-256</text>
          <text x="30" y="68" fill="#71717A" fontFamily="monospace" fontSize="7">CRYPTO HARDENED</text>
          <text x="30" y="78" fill="#D5001C" fontFamily="monospace" fontSize="6.5">STATUS: OPTIMAL</text>
        </svg>
      );
    case "telemetry-vector":
    case "leaf": // legacy mapping
      return (
        <svg width={size} height={size * 0.75} viewBox="0 0 150 100" fill="none" className="drop-shadow-md select-none pointer-events-none">
          <rect x="4" y="4" width="142" height="92" rx="2" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="1.5" />
          <path d="M12 70 Q 55 15, 138 35" stroke="#0A0A0A" strokeWidth="2.5" fill="none" />
          <path d="M12 78 Q 60 30, 138 45" stroke="#D5001C" strokeWidth="1.5" fill="none" />
          <path d="M12 86 Q 65 45, 138 55" stroke="#A1A1AA" strokeWidth="1" strokeDasharray="3 2" fill="none" />
          <text x="14" y="20" fill="#0A0A0A" fontFamily="sans-serif" fontSize="9" fontWeight="900" letterSpacing="1">AERO VECTOR</text>
          <text x="14" y="32" fill="#71717A" fontFamily="monospace" fontSize="7">CD: 0.28 // DOWNFORCE</text>
          <text x="96" y="85" fill="#D5001C" fontFamily="monospace" fontSize="7" fontWeight="bold">▼ -140 KG</text>
        </svg>
      );
    default:
      return null;
  }
}

interface ScrapbookToolbarProps {
  profileSettings: ProfileSettings;
  activeTab: ActiveTab;
  onChangeTab?: (tab: ActiveTab) => void;
  onUpdateSettings: (settings: ProfileSettings) => void;
  onSaveDatabase: (latest?: ProfileSettings) => Promise<void>;
  onCloseAdmin: () => void;
}

export default function ScrapbookToolbar({
  profileSettings,
  activeTab,
  onChangeTab,
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

  // Preset stickers list (High-Tech Precision Porsche Engineering & Telemetry)
  const presetStickers = [
    { key: "gt-spec", label: "🏎️ 911 GT // SPEC Emblem" },
    { key: "iso-certified", label: "⚙️ ISO 9001 Quality Mark" },
    { key: "radar-target", label: "🎯 Telemetry Radar Reticle" },
    { key: "cad-wireframe", label: "📐 CAD 3D Isometric Cube" },
    { key: "carbon-composite", label: "⬛ Carbon Fiber Composite" },
    { key: "approved-qa", label: "🏷️ QA Inspected & Passed" },
    { key: "status-chip", label: "⚡ ECC-256 Silicon Chip" },
    { key: "telemetry-vector", label: "💨 Aero Downforce Vector" }
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
      await onSaveDatabase(profileSettings);
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
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-neutral-950 text-white border border-neutral-700 hover:border-[#D5001C] hover:bg-black px-4 py-3 shadow-2xl cursor-pointer font-mono text-xs font-bold uppercase tracking-wider transition-all text-left"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Sparkles className="w-4 h-4 text-[#D5001C] animate-pulse" />
            <span>Open Canvas Studio</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Draggable Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            layoutId="designer-studio-floating"
            className="fixed bottom-6 right-6 top-20 w-80 sm:w-96 bg-neutral-950 text-neutral-100 border border-neutral-700/80 overflow-hidden z-50 flex flex-col shadow-2xl text-left rounded-none"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
          >
            {/* Header section with brand info */}
            <header className="bg-neutral-900 p-3.5 border-b border-neutral-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#D5001C] rounded-none flex items-center justify-center font-black text-xs text-white">
                  P
                </div>
                <div>
                  <h3 className="font-sans font-bold text-white text-[12px] uppercase tracking-wide leading-none">
                    Studio Design Canvas
                  </h3>
                  <span className="font-mono text-[8.5px] text-neutral-400 font-semibold uppercase tracking-wider block mt-0.5">
                    PAGE: <span className="text-white font-bold">{activeTab}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {onChangeTab && (
                  <button
                    type="button"
                    onClick={() => onChangeTab("ADMIN")}
                    className="px-2 py-1 bg-[#D5001C] hover:bg-[#b00017] text-white font-mono text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                    title="Open full Admin Dashboard"
                  >
                    <span>DASHBOARD</span>
                    <span>➔</span>
                  </button>
                )}
                <button 
                  onClick={onCloseAdmin}
                  title="Logout admin access"
                  className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 rounded-none cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-none cursor-pointer"
                  title="Minimize"
                >
                  <ChevronRight className="w-4 h-4 text-[#D5001C]" />
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
                    <header className="font-mono text-[9px] font-bold text-neutral-300 font-bold uppercase tracking-wider flex items-center gap-1">
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
                    <header className="font-mono text-[9px] font-bold text-neutral-300 font-bold uppercase tracking-wider flex items-center gap-1">
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
                          textColor: "#0A0A0A"
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
                          textColor: "#0A0A0A"
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
                    <header className="font-mono text-[9px] font-bold text-neutral-300 font-bold uppercase tracking-wider flex items-center gap-1">
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
                        className="py-2 border border-neutral-700 hover:border-verdant-yellow bg-verdant-charcoal text-[9px] font-mono font-black text-white hover:bg-neutral-800"
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
                        className="py-2 border border-neutral-700 hover:border-verdant-yellow bg-verdant-charcoal text-[9px] font-mono font-black text-white hover:bg-neutral-800"
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
                        className="py-2 border border-neutral-700 hover:border-verdant-yellow bg-verdant-charcoal text-[9px] font-mono font-black text-white hover:bg-neutral-800"
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
                    <header className="font-mono text-[9px] font-bold text-neutral-300 font-bold uppercase tracking-wider flex items-center justify-between">
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
                      <label className="cursor-pointer bg-verdant-charcoal border border-neutral-700 hover:border-verdant-yellow p-1.5 text-center text-[10px] font-mono text-verdant-cream hover:text-white transition-colors block">
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
                    <label className="font-mono text-[9px] text-neutral-300 font-bold font-black uppercase tracking-widest block">
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
                        <span className="font-mono text-[9px] font-bold text-neutral-300 font-bold uppercase">Depth Structure:</span>
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
                        <label className="font-mono text-[9px] text-neutral-300 font-bold font-black uppercase tracking-widest block">
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
                            <label className="font-mono text-[9px] text-neutral-300 font-bold font-black uppercase tracking-widest block">
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
                            <label className="font-mono text-[9px] text-neutral-300 font-bold font-black uppercase tracking-widest block">
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
                              className="w-full accent-red-600 cursor-pointer"
                            />
                          </div>

                        </div>
                      )}

                      {/* Conditional Tweak field list: SHAPE TYPE */}
                      {selectedElementObj.type === "shape" && (
                        <div className="border-t border-verdant-cream/20 pt-3 flex flex-col gap-3">
                          
                          {/* Shape background fill */}
                          <div className="flex flex-col gap-1">
                            <label className="font-mono text-[9px] text-neutral-300 font-bold font-black uppercase tracking-widest block">
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
                  <div className="border border-neutral-200/60 p-3 bg-neutral-900/40 flex flex-col gap-3">
                    <header className="font-mono text-[9px] font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                      <span>🎨 Canvas Backdrop Color</span>
                      <Palette className="w-3.5 h-3.5 text-[#D5001C]" />
                    </header>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { name: "Carrera Pure White", hex: "#FFFFFF" },
                        { name: "Porsche Platinum", hex: "#F8F9FA" },
                        { name: "Chalk Gray", hex: "#F3F4F6" },
                        { name: "Slate Agate", hex: "#E5E7EB" },
                        { name: "Obsidian Carbon", hex: "#0A0A0A" }
                      ].map((cp) => (
                        <button
                          key={cp.hex}
                          onClick={() => onUpdateSettings({ ...profileSettings, customCanvasBg: cp.hex })}
                          className={`p-2 border text-left flex items-center gap-1.5 cursor-pointer bg-neutral-900 ${
                            profileSettings.customCanvasBg === cp.hex ? "border-2 border-[#D5001C]" : "border-neutral-700 hover:border-neutral-400"
                          }`}
                        >
                          <span style={{ backgroundColor: cp.hex }} className="w-3.5 h-3.5 border border-neutral-600 shrink-0 inline-block" />
                          <span className="font-mono text-[9px] text-neutral-200 leading-none font-bold truncate">{cp.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        value={profileSettings.customCanvasBg || "#F8F9FA"}
                        onChange={(e) => onUpdateSettings({ ...profileSettings, customCanvasBg: e.target.value })}
                        className="w-8 h-8 border border-neutral-700 cursor-pointer bg-transparent"
                      />
                      <input 
                        type="text"
                        value={profileSettings.customCanvasBg || ""}
                        onChange={(e) => onUpdateSettings({ ...profileSettings, customCanvasBg: e.target.value })}
                        placeholder="#F8F9FA"
                        className="w-full bg-neutral-900 text-white px-2 font-mono text-xs border border-neutral-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Nature MP4 video backings */}
                  <div className="border border-neutral-200/60 p-3 bg-neutral-900/40 flex flex-col gap-3">
                    <header className="font-mono text-[9px] font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                      <span>🎥 Ambient Loop Video Wallpaper</span>
                      <Video className="w-3.5 h-3.5 text-[#D5001C]" />
                    </header>
                    <p className="text-[10px] text-zinc-400 font-normal leading-relaxed">
                      Optionally activate a subtle ambient video stream beneath components.
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {videoPresets.map((vid) => (
                        <button
                          key={vid.url}
                          onClick={() => onUpdateSettings({ ...profileSettings, customBgVideoUrl: vid.url })}
                          className={`p-2 border text-left text-[10px] font-mono flex items-center justify-between cursor-pointer bg-neutral-900 ${
                            profileSettings.customBgVideoUrl === vid.url ? "border-2 border-[#D5001C] text-[#D5001C]" : "border-neutral-700 text-neutral-300 hover:text-white"
                          }`}
                        >
                          <span>{vid.name}</span>
                          {profileSettings.customBgVideoUrl === vid.url && <Check className="w-3.5 h-3.5 text-[#D5001C] shrink-0" />}
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
                        className="w-full bg-neutral-900 text-white px-2 py-1.5 font-mono text-[10px] border border-neutral-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Backdrop canvas finish overlay (no grids) */}
                  <div className="border border-neutral-700/80 p-3 bg-neutral-900/60 flex flex-col gap-3">
                    <header className="font-mono text-[9px] font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5 text-[#D5001C]" />
                      <span>Minimalist Background Finishes (No Grids)</span>
                    </header>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: "Carrera Pure Solid", val: "solid-plain" },
                        { label: "Aerodynamic Soft Vignette", val: "soft-vignette" },
                        { label: "Studio Precision Gradient", val: "studio-gradient" },
                        { label: "Matte Light Platinum", val: "matte-platinum" },
                        { label: "Warm Gallery White", val: "gallery-white" },
                        { label: "Obsidian Monolith Plane", val: "monolith-plane" }
                      ].map((gm) => (
                        <button
                          key={gm.val}
                          onClick={() => onUpdateSettings({ ...profileSettings, bgAccentStyle: gm.val })}
                          className={`p-2 border text-left text-[10px] font-mono cursor-pointer bg-neutral-900 ${
                            profileSettings.bgAccentStyle === gm.val ? "border-2 border-[#D5001C] text-white font-bold" : "border-neutral-700 text-neutral-300 hover:text-white"
                          }`}
                        >
                          {gm.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Theme Accent Colors */}
                  <div className="border border-neutral-700/80 p-3 bg-neutral-900/60 flex flex-col gap-3">
                    <header className="font-mono text-[9px] font-bold text-neutral-200 uppercase tracking-wider flex items-center justify-between">
                      <span>🎨 Brand Accents & Colors</span>
                      <Palette className="w-3.5 h-3.5 text-[#D5001C]" />
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
                          value={profileSettings.themeColorPrimary || "#0A0A0A"}
                          onChange={(e) => onUpdateSettings({ ...profileSettings, themeColorPrimary: e.target.value })}
                          className="w-8 h-8 border border-neutral-700 cursor-pointer rounded-none shrink-0"
                        />
                        <input 
                          type="text"
                          value={profileSettings.themeColorPrimary || ""}
                          onChange={(e) => onUpdateSettings({ ...profileSettings, themeColorPrimary: e.target.value })}
                          placeholder="#0A0A0A"
                          className="w-full bg-neutral-900 text-white px-2 py-1 font-mono text-xs border border-neutral-700 focus:outline-none"
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
                    <header className="font-mono text-[9px] font-black text-neutral-300 font-bold uppercase tracking-wider flex items-center justify-between">
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
                      <label className="font-mono text-[9px] text-neutral-300 font-bold font-black uppercase tracking-widest block font-sans">
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
                      <label className="font-mono text-[9px] text-neutral-300 font-bold font-black uppercase tracking-widest block font-sans">
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
                      <label className="font-mono text-[9px] text-neutral-300 font-bold font-black uppercase tracking-widest block font-sans">
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
                      <label className="font-mono text-[9px] text-neutral-300 font-bold font-black uppercase tracking-widest block font-sans">
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
                          <label className="font-mono text-[8px] text-neutral-300 font-bold font-black uppercase tracking-widest">
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
                          <label className="font-mono text-[8px] text-neutral-300 font-bold font-black uppercase tracking-widest">
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
                        <label className="font-mono text-[8px] text-neutral-300 font-bold font-black uppercase tracking-widest leading-normal">
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
                <div className="flex items-center gap-1 bg-neutral-900 border-2 border-neutral-700 text-white font-mono text-[9px] uppercase font-black tracking-wider leading-none p-2 justify-center animate-bounce">
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
                  className="flex-1 bg-verdant-yellow text-white border-2 border-slate-900 hover:bg-white hover:text-neutral-300 font-bold px-3 py-2.5 font-mono text-[10px] uppercase font-black tracking-widest transition-colors cursor-pointer shadow-yellow-offset flex items-center justify-center gap-1"
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
