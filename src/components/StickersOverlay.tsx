import React, { useRef, useState, useEffect } from "react";
import { Sticker, ActiveTab, ProfileSettings } from "../types";
import { StickerRenderer } from "./ScrapbookToolbar";
import { Trash2, Move, Type, Square, HelpCircle, Layers, Play, Pause, Disc, RotateCw, Palette } from "lucide-react";

interface StickersOverlayProps {
  stickers: Sticker[];
  activeTab: ActiveTab;
  isAdmin: boolean;
  onUpdateStickers: (stickers: Sticker[]) => void;
  profileSettings?: ProfileSettings;
}

// Quick Audio waveform generator simulation inside custom widgets
function MusicTapeWidget({ isAdmin }: { isAdmin: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioWaves, setAudioWaves] = useState<number[]>([15, 25, 40, 10, 30, 20, 35, 12]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setAudioWaves(prev => prev.map(() => Math.floor(Math.random() * 32) + 5));
      }, 150);
    } else {
      setAudioWaves([10, 12, 10, 8, 11, 9, 10, 8]);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="bg-verdant-charcoal border-[3px] border-verdant-cream p-3 shadow-md w-64 text-left select-none pointer-events-auto rounded-none">
      <div className="flex items-center justify-between mb-2 border-b border-verdant-cream/20 pb-1.5">
        <span className="font-mono text-[9px] text-[#306634] font-black uppercase tracking-wider flex items-center gap-1">
          <Disc className={`w-3.5 h-3.5 ${isPlaying ? "animate-spin" : ""}`} />
          <span>AESTHETIC TAPE LOOPS</span>
        </span>
        <span className="font-mono text-[8.5px] bg-[#306634]/20 text-verdant-cream px-1 uppercase tracking-tight">
          SIDE A
        </span>
      </div>

      <div className="flex items-center gap-3 bg-verdant-dark p-2 border border-verdant-cream/10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying(!isPlaying);
          }}
          className="w-10 h-10 shrink-0 bg-verdant-yellow text-white border-2 border-verdant-cream flex items-center justify-center cursor-pointer hover:bg-white hover:text-[#306634] transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <div className="flex-grow flex flex-col justify-center">
          <span className="font-syne font-bold text-[10px] text-verdant-cream uppercase leading-tight select-none">
            {isPlaying ? "🌿 Midnight Forest Birds" : "Playback Standby"}
          </span>
          <div className="flex items-end gap-0.5 h-4 mt-1.5 overflow-hidden">
            {audioWaves.map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}px` }}
                className="w-1 bg-[#306634] transition-all duration-150 transform origin-bottom"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StickersOverlay({
  stickers = [],
  activeTab,
  isAdmin,
  onUpdateStickers,
  profileSettings
}: StickersOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [focusedTextId, setFocusedTextId] = useState<string | null>(null);

  // Filter stickers for current screen
  const displayStickers = stickers.filter(s => s.tab === activeTab || s.tab === "ALL");

  // Local clock widget value state helper 
  const [timeStr, setTimeStr] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, stickerId: string) => {
    // Check if clicked inside a button, input, textarea, or data-no-drag element
    const targetEl = e.target as HTMLElement;
    if (
      targetEl.closest("button") || 
      targetEl.closest("input") || 
      targetEl.closest("textarea") || 
      targetEl.closest("select") || 
      targetEl.closest("[data-no-drag]")
    ) {
      return;
    }

    if (!isAdmin) return;
    
    e.preventDefault();
    const currentTarget = e.currentTarget;
    currentTarget.setPointerCapture(e.pointerId);
    
    const container = containerRef.current;
    if (!container) return;

    setActiveDragId(stickerId);

    const updateCoordinate = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const xPct = ((clientX - rect.left) / rect.width) * 100;
      const yPct = ((clientY - rect.top) / rect.height) * 100;
      
      // Clamp values between 1% and 99%
      const clampedX = Math.round(Math.max(1, Math.min(99, xPct)) * 10) / 10;
      const clampedY = Math.round(Math.max(1, Math.min(99, yPct)) * 10) / 10;

      const updated = stickers.map(s => 
        s.id === stickerId ? { ...s, x: clampedX, y: clampedY } : s
      );
      onUpdateStickers(updated);
    };

    const handlePointerMove = (moveEv: PointerEvent) => {
      updateCoordinate(moveEv.clientX, moveEv.clientY);
    };

    const handlePointerUp = (upEv: PointerEvent) => {
      currentTarget.releasePointerCapture(upEv.pointerId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      setActiveDragId(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleTextValueChange = (id: string, newVal: string) => {
    const updated = stickers.map(s => 
      s.id === id ? { ...s, textValue: newVal } : s
    );
    onUpdateStickers(updated);
  };

  const handleDeleteSticker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStickers(stickers.filter(s => s.id !== id));
  };

  const handleSendToBack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = stickers.map(s => 
      s.id === id ? { ...s, zIndex: 10 } : s
    );
    onUpdateStickers(updated);
  };

  const handleIncreaseScale = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = stickers.map(s => {
      if (s.id === id) {
        if (s.type === "text") {
          return { ...s, textSizePx: (s.textSizePx || 16) + 2 };
        } else {
          return { ...s, scale: Math.min(3.0, Math.round(((s.scale || 1.0) + 0.1) * 10) / 10) };
        }
      }
      return s;
    });
    onUpdateStickers(updated);
  };

  const handleDecreaseScale = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = stickers.map(s => {
      if (s.id === id) {
        if (s.type === "text") {
          return { ...s, textSizePx: Math.max(8, (s.textSizePx || 16) - 2) };
        } else {
          return { ...s, scale: Math.max(0.3, Math.round(((s.scale || 1.0) - 0.1) * 10) / 10) };
        }
      }
      return s;
    });
    onUpdateStickers(updated);
  };

  const handleRotate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = stickers.map(s => 
      s.id === id ? { ...s, rotation: ((s.rotation || 0) + 15) % 360 } : s
    );
    onUpdateStickers(updated);
  };

  const handleColorCycle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const colors = [
      profileSettings?.themeColorPrimary || "#306634",
      profileSettings?.themeColorSecondary || "#DCA221",
      profileSettings?.customCanvasBg || "#FAF8F5",
      profileSettings?.customCardBg || "#F2EEE3",
      profileSettings?.themeColorTextHeader || "#142215",
      "#FF5A5F",
      "#1E293B"
    ];
    const updated = stickers.map(s => {
      if (s.id === id) {
        const currentColor = s.textColor || "";
        const currentIndex = colors.indexOf(currentColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        return { ...s, textColor: colors[nextIndex] };
      }
      return s;
    });
    onUpdateStickers(updated);
  };

  const handleBringToFront = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const maxZ = Math.max(...stickers.map(s => s.zIndex || 30), 30);
    const updated = stickers.map(s => 
      s.id === id ? { ...s, zIndex: maxZ + 2 } : s
    );
    onUpdateStickers(updated);
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full min-h-screen pointer-events-none overflow-hidden z-20"
    >
      {displayStickers.map((st) => {
        const isDraggingThis = activeDragId === st.id;
        const resolvedZIndex = st.zIndex || (st.type === "text" ? 40 : 30);

        // Styling configuration props
        const resolvedColor = st.textColor || "#FAF8F5";
        const resolvedFont = st.fontFamily === "Syne" ? "font-syne"
                          : st.fontFamily === "Space Grotesk" ? "font-space"
                          : st.fontFamily === "Playfair Display" ? "font-serif"
                          : st.fontFamily === "JetBrains Mono" ? "font-mono"
                          : "font-sans";

        const resolvedWeight = st.fontWeight === "bold" ? "font-bold"
                            : st.fontWeight === "black" ? "font-black"
                            : "font-medium";

        const sizePx = st.textSizePx || 16;

        return (
          <div
            key={st.id}
            onPointerDown={(e) => handlePointerDown(e, st.id)}
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              transform: `translate(-50%, -50%) rotate(${st.rotation || 0}deg) scale(${st.scale || 1.0})`,
              zIndex: isDraggingThis ? 9999 : resolvedZIndex
            }}
            className={`absolute flex flex-col items-center select-none ${
              isAdmin 
                ? "cursor-grab active:cursor-grabbing pointer-events-auto group" 
                : "pointer-events-none"
            }`}
          >
            {/* Visual Header Controls when Administrator drags/hovers element */}
            {isAdmin && (
              <div className="absolute -top-11 bg-verdant-charcoal border-2 border-verdant-cream px-2 py-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-50 text-[9px] font-mono font-black text-white leading-none uppercase select-none cursor-default">
                <Move className="w-3 h-3 text-verdant-yellow shrink-0" />
                <span>Move</span>
                <span className="w-1.5 h-1.5 bg-verdant-cream/30 rounded-full" />
                <button
                  type="button"
                  title="Send Back"
                  onClick={(e) => handleSendToBack(st.id, e)}
                  className="hover:text-verdant-yellow text-stone-400 p-0.5 cursor-pointer leading-none"
                >
                  Back
                </button>
                <button
                  type="button"
                  title="Bring Front"
                  onClick={(e) => handleBringToFront(st.id, e)}
                  className="hover:text-verdant-yellow text-stone-400 p-0.5 cursor-pointer leading-none"
                >
                  Front
                </button>
                <span className="w-1.5 h-1.5 bg-verdant-cream/30 rounded-full" />
                <button
                  type="button"
                  title="Scale Down"
                  onClick={(e) => handleDecreaseScale(st.id, e)}
                  className="hover:text-verdant-yellow text-[#DCA221] font-extrabold p-0.5 px-1 bg-[#142215]/30 rounded hover:bg-[#142215]/60 cursor-pointer text-xs"
                >
                  －
                </button>
                <button
                  type="button"
                  title="Scale Up"
                  onClick={(e) => handleIncreaseScale(st.id, e)}
                  className="hover:text-verdant-yellow text-[#DCA221] font-extrabold p-0.5 px-1 bg-[#142215]/30 rounded hover:bg-[#142215]/60 cursor-pointer text-xs"
                >
                  ＋
                </button>
                <button
                  type="button"
                  title="Rotate (15°)"
                  onClick={(e) => handleRotate(st.id, e)}
                  className="hover:text-verdant-yellow text-[#DCA221] p-0.5 px-1 bg-[#142215]/30 rounded hover:bg-[#142215]/60 cursor-pointer text-xs flex items-center gap-0.5"
                >
                  <RotateCw className="w-2.5 h-2.5 inline" />
                </button>
                {(st.type === "shape" || st.type === "text") && (
                  <button
                    type="button"
                    title="Cycle Color"
                    onClick={(e) => handleColorCycle(st.id, e)}
                    className="hover:text-verdant-yellow text-[#DCA221] p-0.5 px-1 bg-[#142215]/30 rounded hover:bg-[#142215]/60 cursor-pointer text-xs flex items-center gap-1"
                  >
                    <span 
                      className="w-2 h-2 rounded-full border border-white/40" 
                      style={{ backgroundColor: st.textColor || "#DCA221" }} 
                    />
                    Col
                  </button>
                )}
              </div>
            )}

            {/* Render Canvas Elements Based on Type */}
            <div className={`relative ${
              isAdmin && activeDragId === st.id ? "scale-105 duration-75" : ""
            }`}>
              
              {/* ELEMENT 1: STICKERS / GRAPHICS PRESET */}
              {(!st.type || st.type === "sticker") && (
                <StickerRenderer src={st.src} size={90} />
              )}

              {/* ELEMENT 2: DRAGGABLE TEXT BOXES (Canva Direct Typing) */}
              {st.type === "text" && (
                <div 
                  className="p-1 px-2 text-center select-text min-w-[150px] relative text-left"
                  style={{ color: resolvedColor }}
                >
                  {isAdmin ? (
                    <textarea
                      value={st.textValue || "Click to type..."}
                      onChange={(e) => handleTextValueChange(st.id, e.target.value)}
                      onFocus={() => setFocusedTextId(st.id)}
                      onBlur={() => setFocusedTextId(null)}
                      rows={1}
                      style={{ 
                        fontSize: `${sizePx}px`,
                        color: resolvedColor,
                        lineHeight: 1.2
                      }}
                      className={`bg-transparent outline-none border border-transparent focus:border-dashed focus:border-verdant-yellow text-center ${resolvedFont} ${resolvedWeight} w-full resize-none break-words focus:bg-verdant-charcoal/40`}
                    />
                  ) : (
                    <div 
                      style={{ fontSize: `${sizePx}px` }} 
                      className={`${resolvedFont} ${resolvedWeight} whitespace-pre-wrap break-words leading-tight text-center`}
                    >
                      {st.textValue || "Empty Text"}
                    </div>
                  )}
                </div>
              )}

              {/* ELEMENT 3: GEOMETRIES & SHAPES */}
              {st.type === "shape" && (
                <div className="flex items-center justify-center pointer-events-none">
                  {st.shapeType === "circle" && (
                    <div 
                      style={{ 
                        width: `${(st.width || 80) * (st.scale || 1)}px`, 
                        height: `${(st.width || 80) * (st.scale || 1)}px`,
                        backgroundColor: st.textColor || "#DCA221",
                        borderColor: "#306634"
                      }}
                      className="rounded-full border-[3px] shadow-sm shrink-0"
                    />
                  )}
                  {st.shapeType === "rectangle" && (
                    <div 
                      style={{ 
                        width: `${(st.width || 120) * (st.scale || 1)}px`, 
                        height: `${(st.height || 60) * (st.scale || 1)}px`,
                        backgroundColor: st.textColor || "#306634",
                        borderColor: "#FAF8F5"
                      }}
                      className="border-[3px] shadow-sm shrink-0 rounded-none"
                    />
                  )}
                  {st.shapeType === "line" && (
                    <div 
                      style={{ 
                        width: `${(st.width || 150) * (st.scale || 1)}px`, 
                        height: "4px",
                        backgroundColor: st.textColor || "#306634"
                      }}
                      className="shadow-xs shrink-0 rounded-full"
                    />
                  )}
                  {st.shapeType === "star-badge" && (
                    <svg 
                      width={(st.width || 85) * (st.scale || 1)} 
                      height={(st.width || 85) * (st.scale || 1)} 
                      viewBox="0 0 100 100" 
                      fill="none" 
                      className="drop-shadow-md shrink-0"
                    >
                      <path 
                        d="M50 5 L63 36 L95 38 L70 60 L78 92 L50 74 L22 92 L30 60 L5 38 L37 36 Z" 
                        fill={st.textColor || "#DCA221"} 
                        stroke="#306634" 
                        strokeWidth="4" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  )}
                </div>
              )}

              {/* ELEMENT 4: FUNCTIONAL MINI WIDGETS */}
              {st.type === "widget" && (
                <div className="pointer-events-auto">
                  {st.widgetType === "clock" && (
                    <div className="bg-verdant-dark border-2 border-verdant-cream p-3 text-center min-w-[130px] shadow-md select-none rounded-none">
                      <span className="font-mono text-[9px] text-[#306634] font-black uppercase tracking-wider block">
                        SYSTEM TIME
                      </span>
                      <span className="font-mono text-base font-bold text-verdant-cream block mt-1 tracking-widest">
                        {timeStr}
                      </span>
                    </div>
                  )}

                  {st.widgetType === "music" && (
                    <MusicTapeWidget isAdmin={isAdmin} />
                  )}

                  {st.widgetType === "tech-counter" && (
                    <div className="bg-verdant-charcoal border-2 border-[#306634] p-3 text-center shadow-md min-w-[140px] rounded-none">
                      <span className="font-mono text-[8px] bg-[#306634]/20 px-1 border border-dashed border-[#306634] text-white tracking-widest uppercase block mb-1">
                        INTEGRITY CORAL-INDEX
                      </span>
                      <span className="font-syne font-black text-xl text-verdant-cream block leading-tight">
                        99.82 <span className="text-[10px] text-verdant-yellow">%</span>
                      </span>
                      <span className="font-mono text-[8px] text-zinc-500 font-extrabold uppercase tracking-tight mt-0.5 block">
                        STABLE SYSTEM STATE 01
                      </span>
                    </div>
                  )}

                  {st.widgetType === "quote" && (
                    <div className="bg-[#FAF8F5] border-[3px] border-verdant-cream p-3 shadow-charcoal-offset max-w-[200px] text-center rounded-none select-none">
                      <p className="font-serif italic text-xs text-verdant-charcoal leading-relaxed font-semibold">
                        "The details are not the details. They make the design."
                      </p>
                      <span className="font-mono text-[8px] text-[#306634] uppercase tracking-wider mt-1.5 block font-bold">
                        ─ CHARLES EAMES
                      </span>
                    </div>
                  )}

                  {st.widgetType === "contact-badge" && (
                    <a
                      href="#CONNECT"
                      onClick={(e) => {
                        // Prevent page refresh but keep aesthetic linking
                        if (isAdmin) e.preventDefault();
                      }}
                      className="bg-[#DCA221] text-white border-2 border-slate-900 p-2.5 px-3.5 flex items-center gap-2 shadow-xs transition-transform active:scale-95 text-xs font-mono font-bold uppercase rounded-none cursor-pointer"
                    >
                      <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                      <span>TALK TO JULIARISTY</span>
                    </a>
                  )}
                </div>
              )}

              {/* Delete trashcan button when admin hover is active */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteSticker(st.id, e)}
                  title="Remove from Workspace"
                  className="absolute -right-3.5 -bottom-3.5 bg-red-600 hover:bg-red-700 hover:scale-110 active:scale-95 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-verdant-cream shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-50 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              )}
            </div>

            {/* Dotted canvas box target indicators */}
            {isAdmin && (
              <div className={`absolute inset-[-6px] border-2 border-dashed rounded-none transition-colors pointer-events-none ${
                activeDragId === st.id 
                  ? "border-verdant-yellow bg-verdant-yellow/5" 
                  : "border-transparent group-hover:border-verdant-mint/50"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
