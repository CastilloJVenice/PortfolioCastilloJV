/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ActiveTab, Project, ProfileSettings } from "../types";

interface WelcomeViewProps {
  onChangeTab: (tab: ActiveTab) => void;
  onSelectProject: (id: string) => void;
  projects: Project[];
  profileSettings?: ProfileSettings;
  isAdmin?: boolean;
  onUpdateSettings?: (settings: ProfileSettings) => void;
}

export default function WelcomeView({ onChangeTab, onSelectProject, projects, profileSettings, isAdmin = false, onUpdateSettings }: WelcomeViewProps) {
  const profileCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scribbleCount, setScribbleCount] = useState(0);

  // Take the latest projects to display as selected artifacts on the landing page
  const sampleProjects = projects.slice(0, 3);

  // Static list for bottom Process Journal (Image 2 bottom)
  const processGuides = [
    { date: "MAY 26", title: "Deterministic Security and Modular Key Derivation" },
    { date: "APR 15", title: "Procedural Low-Polygon Rasterization Techniques" }
  ];

  // Drawing the interactive CAD technical wireframe & telemetry canvas
  useEffect(() => {
    const canvas = profileCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = 300;
    let height = canvas.height = 340;
    let angle = 0;
    let mousePos = { x: 150, y: 170 };
    let animationFrameId: number;

    const drawCADTelemetry = () => {
      ctx.clearRect(0, 0, width, height);

      // Clean modern drafting background with soft ambient gradient (no grids)
      const grad = ctx.createRadialGradient(width / 2, 160, 10, width / 2, 160, 160);
      grad.addColorStop(0, "#FFFFFF");
      grad.addColorStop(1, "#F4F5F7");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Corner technical crop marks
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 1.2;
      const corner = (cx: number, cy: number, dx: number, dy: number) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy + dy * 10);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + dx * 10, cy);
        ctx.stroke();
      };
      corner(14, 14, 1, 1);
      corner(width - 14, 14, -1, 1);
      corner(14, height - 14, 1, -1);
      corner(width - 14, height - 14, -1, -1);

      // Center telemetry circles
      const cx = width / 2;
      const cy = 160;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating 3D wireframe geometric model
      const size = 52;
      const rotY = angle + (mousePos.x - cx) * 0.01;
      const rotX = 0.4 + (mousePos.y - cy) * 0.01;

      const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
      ];

      const projected = vertices.map(([x, y, z]) => {
        // Rotate Y
        let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
        let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
        // Rotate X
        let y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
        // Project
        const scale = 220 / (z2 + 4.5);
        return [cx + x1 * size * (scale / 50), cy + y1 * size * (scale / 50)];
      });

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];

      // Draw wireframe edges
      ctx.strokeStyle = "#0A0A0A";
      ctx.lineWidth = 1.4;
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i][0], projected[i][1]);
        ctx.lineTo(projected[j][0], projected[j][1]);
        ctx.stroke();
      });

      // Vertices with Guards Red accents
      projected.forEach(([px, py], idx) => {
        ctx.fillStyle = idx === 0 ? "#D5001C" : "#0A0A0A";
        ctx.beginPath();
        ctx.arc(px, py, idx === 0 ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Crosshair tracking mouse position
      ctx.strokeStyle = "rgba(213, 0, 28, 0.4)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0); ctx.lineTo(mousePos.x, height);
      ctx.moveTo(0, mousePos.y); ctx.lineTo(width, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top Header telemetry
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.font = "600 8px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText("3D GEOMETRIC MODEL", 16, 26);
      ctx.textAlign = "right";
      ctx.fillText(`X:${mousePos.x.toFixed(0)} Y:${mousePos.y.toFixed(0)}`, width - 16, 26);

      // Bottom telemetry readouts
      ctx.fillStyle = "#D5001C";
      ctx.beginPath();
      ctx.arc(20, height - 24, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.textAlign = "left";
      ctx.fillText("INTERACTIVE VIEW", 28, height - 21);

      angle += 0.012;
      animationFrameId = requestAnimationFrame(drawCADTelemetry);
    };

    animationFrameId = requestAnimationFrame(drawCADTelemetry);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos = {
        x: Math.max(0, Math.min(width, e.clientX - rect.left)),
        y: Math.max(0, Math.min(height, e.clientY - rect.top))
      };
      setScribbleCount((prev) => prev + 1);
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const bgAccent = (profileSettings?.bgAccentStyle && !profileSettings.bgAccentStyle.includes("grid") && !profileSettings.bgAccentStyle.includes("matrix") && !profileSettings.bgAccentStyle.includes("blueprint") && !profileSettings.bgAccentStyle.includes("mesh")) ? profileSettings.bgAccentStyle : "solid-plain";
  const customBgColor = profileSettings?.customCanvasBg || "#F8F9FA";
  const casingClass = profileSettings?.textCasingStyle === "normal-case" ? "" : "uppercase";

  return (
    <div 
      style={{ backgroundColor: customBgColor }}
      className={`relative min-h-screen overflow-hidden ${bgAccent} text-verdant-cream pb-16`}
    >
      {/* 1. Hero Block layout */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 pt-12 md:pt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left hero metrics and actions */}
        <div className="lg:col-span-7 flex flex-col items-start gap-6 w-full">
          {/* Portfolio Label capsule */}
          {isAdmin && onUpdateSettings ? (
            <div className="flex flex-col gap-1 w-full max-w-md">
              <span className="font-mono text-[9px] text-verdant-yellow font-black uppercase tracking-widest flex items-center gap-1">
                <span>📝 Edit Capsule Subtitle:</span>
              </span>
              <input
                type="text"
                value={profileSettings?.headline || ""}
                onChange={(e) => onUpdateSettings({ ...profileSettings, headline: e.target.value })}
                className="bg-white border border-neutral-300 focus:border-neutral-900 font-mono text-xs font-bold tracking-wider text-neutral-900 px-3 py-1.5 focus:outline-none w-full uppercase"
                placeholder="Capsule Title"
              />
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 border border-neutral-200 bg-white px-3.5 py-1.5 font-mono text-[10px] uppercase font-bold tracking-[0.22em] text-neutral-600 shadow-sm" id="hero-badge">
              <span className="w-1.5 h-1.5 bg-[#D5001C]" />
              <span>{profileSettings?.headline || "COMPUTER SCIENCE GRADUATE & DIGITAL DESIGNER"}</span>
            </div>
          )}

          {/* Huge Wide Heading Title */}
          {isAdmin && onUpdateSettings ? (
            <div className="flex flex-col gap-2 w-full">
              <span className="font-mono text-[9px] text-[#D5001C] font-black uppercase tracking-widest">📝 Edit On-Screen Names:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="font-mono text-[8px] text-zinc-500 uppercase block">FIRST LINE TITLE</label>
                  <input
                    type="text"
                    value={profileSettings?.fullName || ""}
                    onChange={(e) => onUpdateSettings({ ...profileSettings, fullName: e.target.value })}
                    className="bg-white border border-neutral-300 focus:border-neutral-900 text-neutral-900 p-2 font-syne font-black text-2xl uppercase focus:outline-none w-full"
                    placeholder="First name logo text..."
                  />
                </div>
                <div>
                  <label className="font-mono text-[8px] text-zinc-500 uppercase block">HIGHLIGHT SECOND LINE</label>
                  <input
                    type="text"
                    value={profileSettings?.lastNameHighlight || ""}
                    onChange={(e) => onUpdateSettings({ ...profileSettings, lastNameHighlight: e.target.value })}
                    className="bg-white border border-neutral-300 focus:border-neutral-900 text-neutral-900 p-2 font-syne font-black text-2xl uppercase focus:outline-none w-full"
                    placeholder="Highlight last name..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex flex-col font-syne font-black text-neutral-900 leading-[0.9] tracking-tight select-none w-full ${casingClass}`}>
              <h1 className="text-5xl md:text-7xl lg:text-[4.8rem] tracking-tight text-neutral-900">
                {profileSettings?.fullName || "JULIARISTY"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 md:gap-5 mt-1.5">
                <h1 className="text-4xl md:text-6xl lg:text-[4.1rem] tracking-tight text-neutral-800">
                  {profileSettings?.lastNameHighlight || "VENICE CASTILLO"}
                </h1>
                <span className="hidden sm:inline-block h-[3px] w-14 md:w-20 bg-verdant-yellow mt-1 shrink-0" />
              </div>
            </div>
          )}

          {/* Subtitle description */}
          {isAdmin && onUpdateSettings ? (
            <div className="flex flex-col gap-1 w-full max-w-2xl">
              <span className="font-mono text-[9px] text-verdant-yellow font-black uppercase tracking-widest">📝 Edit On-Screen Biography Paragraph:</span>
              <textarea
                rows={3}
                value={profileSettings?.biography || ""}
                onChange={(e) => onUpdateSettings({ ...profileSettings, biography: e.target.value })}
                className="bg-white border border-neutral-300 focus:border-neutral-900 font-sans text-xs text-neutral-700 p-3 focus:outline-none w-full leading-relaxed tracking-normal"
                placeholder="Short bio description..."
              />
            </div>
          ) : (
            <p className="font-sans text-xs md:text-sm text-neutral-600 max-w-2xl leading-relaxed mt-2 font-normal normal-case tracking-normal" id="hero-subtitle">
              {profileSettings?.biography || (
                <>
                  Hello! I'm a Computer Science graduate from the University of the Cordilleras. I focus on <span className="text-neutral-900 font-semibold">UI/UX Design</span>, <span className="text-neutral-900 font-semibold">Cryptography</span>, and <span className="text-neutral-900 font-semibold">Software Development</span>. I create intuitive user interfaces, explore system security, and build practical applications that solve real problems.
                </>
              )}
            </p>
          )}

          {/* Precision Action buttons */}
          <div className="flex flex-wrap gap-4 mt-2 w-full sm:w-auto" id="hero-buttons-container">
            <a
              href="#selected-projects-section"
              className="group cursor-pointer px-7 py-3.5 bg-neutral-950 hover:bg-[#D5001C] text-white font-mono text-xs font-bold tracking-[0.2em] transition-all duration-200 select-none flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
              id="hero-explore"
            >
              <span>EXPLORE WORK</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
            </a>

            <button
              onClick={() => onChangeTab("CONNECT")}
              style={{ backgroundColor: "#0A0A0A", color: "#FFFFFF" }}
              className="cursor-pointer px-7 py-3.5 border border-neutral-900 hover:!bg-[#D5001C] hover:!border-[#D5001C] text-white font-mono text-xs font-bold tracking-[0.2em] transition-all select-none shadow-sm flex items-center justify-center gap-2"
              id="hero-connect-btn"
            >
              <span>INITIATE CONNECT</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5001C]" />
            </button>
          </div>
        </div>

        {/* Right CAD artwork card box */}
        {!profileSettings?.hideHeroPolaroid && (
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative select-none w-full max-w-[340px]">
              {/* Professional portrait & showcase card */}
              <div className="relative border border-neutral-200 bg-white p-3.5 flex flex-col gap-3 w-full shadow-[0_4px_24px_rgba(0,0,0,0.06)]" id="hero-polaroid">
                {/* Visual canvas or dynamic custom uploaded image */}
                <div className="relative aspect-[4/5] bg-neutral-50 overflow-hidden border border-neutral-100">
                  {profileSettings?.profileImageBase64 ? (
                    <div className="w-full h-full relative" id="dynamic-profile-image-container">
                      <img
                        src={profileSettings.profileImageBase64}
                        alt={profileSettings.fullName || "Juliaristy"}
                        className="w-full h-full object-cover select-none"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full cursor-crosshair">
                      <canvas ref={profileCanvasRef} className="w-full h-full block" title="Interactive 3D Geometric Visual" />
                    </div>
                  )}
                </div>

                {/* Direct personal details footer */}
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-neutral-800">
                  <div className="text-left">
                    <span className="text-neutral-900 font-bold text-xs uppercase tracking-wider block">
                      {profileSettings?.fullName || "JULIARISTY"} {profileSettings?.lastNameHighlight || "VENICE CASTILLO"}
                    </span>
                    <span className="font-sans text-[11px] text-neutral-500 font-normal">
                      Computer Science & Design
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                    PH
                  </span>
                </div>
              </div>

              {/* LIVE HIDE TRIGGER FOR ADMINS */}
              {isAdmin && onUpdateSettings && (
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ ...profileSettings, hideHeroPolaroid: true })}
                  className="absolute -top-3.5 -right-3.5 z-40 bg-red-800 text-white hover:bg-red-700 font-mono text-[9px] font-black p-2 border border-slate-900 shadow-sm flex items-center gap-1 cursor-pointer"
                  title="Remove Polaroid from page"
                >
                  <X className="w-3 h-3 text-white" />
                  <span>HIDE ARTWORK</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Selected Projects Section */}
      {!profileSettings?.hideSelectedProjects && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-12 relative z-10" id="selected-projects-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between select-none mb-10 gap-4 border-b border-neutral-200 pb-6">
            <div className="flex flex-col items-start text-left">
              <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                <span className="w-2 h-[2px] bg-[#D5001C]" />
                <span>FEATURED PROJECTS</span>
              </span>
              <h2 className={`font-syne font-black text-neutral-900 text-3xl md:text-5xl leading-none tracking-tight ${casingClass}`}>
                SOME OF MY PROJECTS
              </h2>
              <p className="font-sans text-xs md:text-sm text-neutral-500 mt-2 max-w-xl font-normal leading-relaxed">
                Selected projects and prototypes created while studying Computer Science at the University of the Cordilleras.
              </p>
            </div>

            {/* Direct deletion on screen */}
            {isAdmin && onUpdateSettings && (
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...profileSettings, hideSelectedProjects: true })}
                className="bg-red-800 text-white hover:bg-red-700 font-mono text-[10px] font-black px-4 py-2 border border-slate-900 shadow-sm flex items-center gap-1 cursor-pointer h-fit self-start"
                title="Hide projects from view"
              >
                <X className="w-3 h-3 text-white" />
                <span>HIDE PROJECTS</span>
              </button>
            )}
          </div>

          {/* Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {sampleProjects.map((proj) => (
              <div
                key={proj.id}
                className="border border-neutral-200 bg-white p-5 flex flex-col justify-between hover:border-neutral-900 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                <div className="flex flex-col gap-4">
                  {/* Visual Frame rendering the item */}
                  <div className="relative aspect-video bg-neutral-950 border border-neutral-800 flex flex-col justify-between p-3 overflow-hidden select-none">
                    {/* Render programmatic technical representations */}
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-10">
                      {proj.imageType && proj.imageType.startsWith("data:image/") ? (
                        <img
                          src={proj.imageType}
                          alt={proj.title}
                          className="w-full h-full object-cover opacity-85"
                          referrerPolicy="no-referrer"
                        />
                      ) : proj.imageType === "lunar" ? (
                        <div className="relative w-full h-full flex flex-col justify-between p-4 bg-neutral-950 text-white font-mono">
                          <div className="flex justify-between items-center text-[7.5px] text-neutral-400">
                            <span>CRYPTOGRAPHY // PQC</span>
                            <span className="text-[#D5001C] font-bold">256-BIT</span>
                          </div>
                          <div className="flex items-center justify-center my-auto">
                            <svg className="w-16 h-16 text-neutral-300" viewBox="0 0 40 40" fill="none" stroke="currentColor">
                              <polygon points="20,4 36,12 36,28 20,36 4,28 4,12" strokeWidth="1.2" />
                              <line x1="20" y1="4" x2="20" y2="36" strokeWidth="0.8" strokeDasharray="2 2" stroke="rgba(213,0,28,0.7)" />
                              <line x1="4" y1="12" x2="36" y2="28" strokeWidth="0.8" strokeDasharray="2 2" />
                              <line x1="4" y1="28" x2="36" y2="12" strokeWidth="0.8" strokeDasharray="2 2" />
                              <circle cx="20" cy="20" r="3" fill="#D5001C" />
                            </svg>
                          </div>
                          <div className="flex justify-between text-[7px] text-neutral-500 font-mono tracking-wider">
                            <span>SECURITY // VERIFIED</span>
                            <span className="text-neutral-400">SHA-256</span>
                          </div>
                        </div>
                      ) : proj.imageType === "void" ? (
                        <div className="relative w-full h-full flex flex-col justify-between p-4 bg-neutral-950 text-white font-mono">
                          <div className="flex justify-between items-center text-[7.5px] text-neutral-400">
                            <span>FIGMA // UI/UX DESIGN</span>
                            <span className="text-neutral-300 font-bold">MOBILE</span>
                          </div>
                          <div className="flex items-center justify-center my-auto">
                            <div className="w-28 h-14 border border-neutral-700 bg-neutral-900 p-1.5 flex flex-col justify-between">
                              <div className="h-1.5 w-10 bg-neutral-600 rounded-sm" />
                              <div className="grid grid-cols-3 gap-1">
                                <div className="h-5 bg-neutral-800 border border-neutral-700" />
                                <div className="h-5 bg-neutral-800 border border-neutral-700" />
                                <div className="h-5 bg-neutral-800 border border-neutral-700" />
                              </div>
                              <div className="h-1.5 w-14 bg-verdant-yellow" />
                            </div>
                          </div>
                          <div className="flex justify-between text-[7px] text-neutral-500">
                            <span>DESIGN SYSTEM</span>
                            <span className="text-[#D5001C]">PROTOTYPE</span>
                          </div>
                        </div>
                      ) : proj.imageType === "logic" ? (
                        <div className="relative w-full h-full flex flex-col justify-between p-4 bg-neutral-950 text-white font-mono">
                          <div className="flex justify-between items-center text-[7.5px] text-neutral-400">
                            <span>BLENDER // 3D MODEL</span>
                            <span className="text-neutral-300 font-bold">CYCLES</span>
                          </div>
                          <div className="flex items-center justify-center my-auto">
                            <svg className="w-16 h-16 text-neutral-300" viewBox="0 0 40 40" fill="none" stroke="currentColor">
                              <ellipse cx="20" cy="20" rx="14" ry="7" strokeWidth="1.2" />
                              <ellipse cx="20" cy="20" rx="6" ry="3" strokeWidth="1" strokeDasharray="1 1" />
                              <line x1="6" y1="20" x2="34" y2="20" strokeWidth="0.8" stroke="rgba(213,0,28,0.7)" />
                              <line x1="20" y1="13" x2="20" y2="27" strokeWidth="0.8" stroke="rgba(213,0,28,0.7)" />
                            </svg>
                          </div>
                          <div className="flex justify-between text-[7px] text-neutral-500">
                            <span>RENDER // SHADER</span>
                            <span className="text-neutral-400">CYCLES</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                          <span className="font-mono text-[8px] text-neutral-400 uppercase tracking-widest">PROJECT PREVIEW</span>
                        </div>
                      )}
                    </div>

                    <span 
                      className="mt-auto ml-auto font-mono text-[9px] relative z-20 font-bold uppercase tracking-wider bg-neutral-900/90 text-neutral-300 border border-neutral-700 px-2.5 py-0.5 select-none"
                    >
                      {proj.tag}
                    </span>
                  </div>

                  <div className="text-left py-1">
                    <h3 className={`font-syne font-black text-lg text-neutral-900 tracking-tight leading-snug group-hover:text-verdant-yellow transition-colors ${casingClass}`}>
                      {proj.title}
                    </h3>
                    <p className="font-sans text-xs text-neutral-500 mt-2 leading-relaxed font-normal">
                      {proj.category} · {proj.year}
                    </p>
                  </div>
                </div>

                {/* Action trigger */}
                <button
                  onClick={() => {
                    onChangeTab("PROJECTS");
                    onSelectProject(proj.id);
                  }}
                  className="mt-4 w-full cursor-pointer bg-white border border-neutral-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white text-neutral-900 font-mono text-[10px] font-bold uppercase py-2.5 transition-all tracking-[0.2em] select-none"
                >
                  VIEW PROJECT
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Infinite scrolling ticker ribbon at the bottom */}
      {!profileSettings?.hideProcessTicker && (
        <div className="w-full bg-[#09090B] border-t border-b border-neutral-800 py-3 mt-16 overflow-hidden relative group">
          {/* Direct remove handle for admin */}
          {isAdmin && onUpdateSettings && (
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...profileSettings, hideProcessTicker: true })}
              className="absolute top-1/2 left-4 z-40 -translate-y-1/2 bg-red-800 text-white hover:bg-red-700 font-mono text-[9px] font-black px-3 py-1.5 border border-slate-900 flex items-center gap-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove ticker band from page"
            >
              <X className="w-3 h-3 text-white" strokeWidth={3} />
              <span>HIDE TICKER</span>
            </button>
          )}

          <div className="animate-verdant-ticker font-mono font-bold uppercase text-[11px] tracking-[0.25em] text-neutral-300">
            {Array(5).fill(
              profileSettings?.tickerPhrases && profileSettings.tickerPhrases.filter(p => p.trim() !== "").length > 0
                ? profileSettings.tickerPhrases.filter(p => p.trim() !== "").map(p => p.trim().endsWith("◼") ? p : `${p} ◼`)
                : [
                  "DECODING CRYPTOGRAPHIC SYSTEMS ◼",
                  "MODELING SPATIAL 3D WIREFRAMES ◼",
                  "OPTIMIZING REAL-TIME PHYSICS LOOPS ◼",
                  "VERIFYING SECURITY SCHEMAS ◼",
                  "DESIGNING COGNITIVE HUMAN INTERFACES ◼"
                ]
            ).flat().map((phrase, idx) => (
              <span key={idx} className="shrink-0 flex items-center gap-8 whitespace-nowrap px-4 select-none">
                <span>{phrase.replace("◼", "")}</span>
                <span className="w-1.5 h-1.5 bg-verdant-yellow rotate-45 inline-block shrink-0" />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
