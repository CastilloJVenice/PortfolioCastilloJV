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

  // Drawing the interactive artistic sketch portrait
  useEffect(() => {
    const canvas = profileCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = 300;
    let height = canvas.height = 340;

    const drawBasePortrait = () => {
      ctx.clearRect(0, 0, width, height);

      // Raw canvas dark cream background to simulate watercolor paper texture
      ctx.fillStyle = "#FAF8F5";
      ctx.fillRect(0, 0, width, height);

      // Starry night / painterly green circular brush washes in background
      ctx.fillStyle = "rgba(48, 102, 52, 0.12)";
      ctx.beginPath();
      ctx.arc(150, 140, 95, 0, Math.PI * 2);
      ctx.fill();

      // Bright neon green paint droplets
      ctx.fillStyle = "rgba(82, 139, 86, 0.18)";
      ctx.beginPath();
      ctx.arc(110, 80, 45, 0, Math.PI * 2);
      ctx.fill();

      // Paint splats (simulating Swirling paint in Image 1 backdrop)
      ctx.strokeStyle = "rgba(48, 102, 52, 0.15)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(150, 140, 110, 0.5, Math.PI * 1.5);
      ctx.stroke();

      // Sketch lines representing head shape
      ctx.strokeStyle = "rgba(20, 34, 21, 0.85)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      // Chin / jaw
      ctx.moveTo(115, 120);
      ctx.bezierCurveTo(115, 205, 185, 205, 185, 120);
      // Head dome
      ctx.bezierCurveTo(185, 50, 115, 50, 115, 120);
      ctx.stroke();

      // Shoulder and suit structure (highly stylized pencil marks from Image 1)
      ctx.strokeStyle = "rgba(20, 34, 21, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(70, 280);
      ctx.lineTo(110, 220); // left shoulder
      ctx.lineTo(135, 230); // collar
      ctx.lineTo(150, 215); // throat
      ctx.lineTo(165, 230); // right collar
      ctx.lineTo(190, 220); 
      ctx.lineTo(230, 280); // right shoulder
      ctx.stroke();

      // Hair sketch lines (retro parted clean lines)
      ctx.strokeStyle = "rgba(48, 102, 52, 0.65)";
      for (let i = 0; i < 22; i++) {
        ctx.beginPath();
        ctx.moveTo(120 + i * 3, 85 - (i % 3) * 3);
        ctx.lineTo(105 + i * 4, 55 + (i % 4) * 6);
        ctx.stroke();
      }

      // Portrait Guide Lines
      ctx.strokeStyle = "rgba(48, 102, 52, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(150, 50); ctx.lineTo(150, 220); // vertical
      ctx.moveTo(105, 130); ctx.lineTo(195, 130); // horizontal
      ctx.stroke();

      // Draw faint "PROFILE PLACEHOLDER" stencil text
      ctx.fillStyle = "rgba(20, 34, 21, 0.8)";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PROFILE", width / 2, 260);
      ctx.fillText("PLACEHOLDER", width / 2, 276);
    };

    drawBasePortrait();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Draw neon-moss green dripping spray painterly strokes at cursor position
      ctx.fillStyle = Math.random() > 0.5 ? "#FFD200" : "#90E090";
      ctx.shadowBlur = 4;
      ctx.shadowColor = ctx.fillStyle;

      ctx.beginPath();
      ctx.arc(x, y, 3 + Math.random() * 5, 0, Math.PI * 2);
      ctx.fill();

      // Splat random droplets near it
      ctx.fillStyle = "rgba(144, 224, 144, 0.5)";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const dx = x + (Math.random() - 0.5) * 20;
        const dy = y + (Math.random() - 0.5) * 20;
        ctx.arc(dx, dy, 1 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0; // reset
      setScribbleCount((prev) => prev + 1);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", drawBasePortrait);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", drawBasePortrait);
    };
  }, []);

  const bgAccent = profileSettings?.bgAccentStyle || "grid-mesh";
  const customBgColor = profileSettings?.customCanvasBg || "#FAF8F5";
  const casingClass = profileSettings?.textCasingStyle === "normal-case" ? "" : "uppercase";

  return (
    <div 
      style={{ backgroundColor: customBgColor }}
      className={`relative min-h-screen overflow-hidden ${bgAccent} text-verdant-cream pb-12`}
    >
      {/* Absolute Swirling Backdrop paint spray visual matching background look */}
      <div className="absolute top-[15%] left-[5%] w-[450px] h-[450px] bg-verdant-yellow/5 rounded-full filter blur-[100px] pointer-events-none select-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-verdant-mint/10 rounded-full filter blur-[80px] pointer-events-none select-none" />

      {/* 1. Hero Block layout (ALEX RIVERS) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 pt-12 md:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
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
                className="bg-verdant-charcoal border border-[#306634]/50 focus:border-verdant-yellow font-mono text-xs font-bold tracking-wider text-[#306634] px-3 py-1.5 focus:outline-none w-full uppercase"
                placeholder="Capsule Title"
              />
            </div>
          ) : (
            <div className="inline-block bg-verdant-charcoal border border-verdant-mint/30 font-mono text-[10px] uppercase font-bold tracking-widest text-[#306634] px-4 py-1.5 rounded-none" id="hero-badge">
              {profileSettings?.headline || "COMPUTER SCIENCE STUDENT & DIGITAL DESIGNER"}
            </div>
          )}

          {/* Huge Wide Heading Title */}
          {isAdmin && onUpdateSettings ? (
            <div className="flex flex-col gap-2 w-full">
              <span className="font-mono text-[9px] text-verdant-yellow font-black uppercase tracking-widest">📝 Edit On-Screen Names:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="font-mono text-[8px] text-zinc-500 uppercase block">FIRST LINE TITLE</label>
                  <input
                    type="text"
                    value={profileSettings?.fullName || ""}
                    onChange={(e) => onUpdateSettings({ ...profileSettings, fullName: e.target.value })}
                    className="bg-verdant-charcoal/20 border border-dashed border-verdant-yellow/40 focus:border-verdant-yellow text-verdant-cream p-2 font-syne font-black text-2xl uppercase focus:outline-none w-full"
                    placeholder="First name logo text..."
                  />
                </div>
                <div>
                  <label className="font-mono text-[8px] text-zinc-500 uppercase block">HIGHLIGHT SECOND LINE</label>
                  <input
                    type="text"
                    value={profileSettings?.lastNameHighlight || ""}
                    onChange={(e) => onUpdateSettings({ ...profileSettings, lastNameHighlight: e.target.value })}
                    className="bg-verdant-charcoal/20 border border-dashed border-verdant-yellow/40 focus:border-verdant-yellow text-verdant-cream p-2 font-syne font-black text-2xl uppercase focus:outline-none w-full"
                    placeholder="Highlight last name..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex flex-col font-syne font-black text-verdant-cream leading-[0.85] tracking-tight select-none w-full ${casingClass}`}>
              <h1 className="text-5xl md:text-[4.50rem] tracking-tighter">
                {profileSettings?.fullName || "JULIARISTY"}
              </h1>
              <div className="relative inline-block w-full">
                {/* Highlight bar underneath the last name following Image 1 */}
                <div className="absolute left-0 bottom-1 bg-verdant-yellow h-6 md:h-11 w-[90%] -skew-y-1 z-0 opacity-90 border-b border-t border-dashed border-verdant-cream" />
                <h1 className="text-4xl md:text-[3.8rem] relative z-10 text-verdant-cream tracking-widest">
                  {profileSettings?.lastNameHighlight || "VENICE CASTILLO"}
                </h1>
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
                className="bg-verdant-charcoal/40 border border-dashed border-[#306634]/40 focus:border-verdant-yellow font-sans text-xs text-verdant-gray p-3 focus:outline-none w-full font-semibold uppercase leading-relaxed tracking-wide"
                placeholder="Short bio description..."
              />
            </div>
          ) : (
            <p className="font-sans text-xs md:text-sm text-verdant-gray max-w-2xl leading-relaxed mt-2 uppercase font-semibold tracking-wide" id="hero-subtitle">
              {profileSettings?.biography || (
                <>
                  Hello! I'm a Computer Science student at the University of the Cordilleras. My interests sit at <span className="text-[#306634] font-black">UI/UX Design</span>, where design meets behavior; <span className="text-[#306634] font-black">Cryptography</span>, where math meets security; and <span className="text-[#306634] font-black">Theoretical Computer Science</span>, where logic meets the limits of what's computable. I like understanding things deeply and not just how to build them, but why they work.
                </>
              )}
            </p>
          )}

          {/* Solid Green Offset Action buttons */}
          <div className="flex flex-wrap gap-4 mt-3 w-full sm:w-auto" id="hero-buttons-container">
            {/* SOLID MINT CTA BUTTON */}
            <a
              href="#selected-projects-section"
              className="group cursor-pointer px-6 py-4 bg-verdant-mint border-2 border-verdant-cream text-white font-mono text-xs font-black tracking-widest shadow-mint-offset hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(48,102,52,1)] active:translate-x-0 active:translate-y-0 active:shadow-mint-offset transition-all duration-150 select-none flex items-center justify-center gap-2"
              id="hero-explore"
            >
              <span>EXPLORE WORK</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Right polaroid artwork card box */}
        {!profileSettings?.hideHeroPolaroid && (
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative group hover:rotate-2 transition-transform duration-300 select-none">
              {/* Shadow layer */}
              <div className="absolute inset-0 bg-verdant-cream translate-x-2.5 translate-y-2.5 border border-verdant-cream/20" />

              {/* Polaroid framing box resembling Image 1 */}
              <div className="relative border-4 border-verdant-cream bg-verdant-charcoal p-3 flex flex-col gap-3 max-w-[325px] w-full" id="hero-polaroid">
                {/* Painterly painting canvas or dynamic custom uploaded image */}
                <div className="relative aspect-[4/5] bg-verdant-dark overflow-hidden border border-verdant-cream/10">
                  {profileSettings?.profileImageBase64 ? (
                    <div className="w-full h-full relative" id="dynamic-profile-image-container">
                      <img
                        src={profileSettings.profileImageBase64}
                        alt={profileSettings.fullName || "Juliaristy"}
                        className="w-full h-full object-cover select-none"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-verdant-charcoal/40 to-transparent mix-blend-multiply pointer-events-none" />
                    </div>
                  ) : (
                    <div className="relative w-full h-full cursor-crosshair">
                      <canvas ref={profileCanvasRef} className="w-full h-full block" title="Scribble & throw virtual color spray onto Alex's face!" />
                      <div className="absolute bottom-2 left-2 bg-verdant-cream text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-1 text-white pointer-events-none">
                        {scribbleCount > 0 ? `scrawled: ${scribbleCount}` : "hover / paint interactive canvas"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Verified details footer inside polaroid */}
                <div className="pt-2 border-t border-verdant-cream/20 flex items-center justify-between font-mono text-[10px] text-verdant-gray">
                  <div className="text-left font-bold">
                    <header className="uppercase text-[8px] text-zinc-500">IDENTITY REFERENCE</header>
                    <span className="text-verdant-cream tracking-widest font-extrabold text-xs">
                      {((profileSettings?.lastNameHighlight || "CASTILLO").split(" ").pop() || "CASTILLO").toUpperCase()}.JV_01
                    </span>
                  </div>
                  {/* Yellow vintage log markup logo */}
                  <div className="w-8 h-8 rounded-none border border-verdant-yellow bg-verdant-yellow/10 flex items-center justify-center font-bold text-verdant-yellow">
                    <Sparkles className="w-4 h-4 text-verdant-yellow" />
                  </div>
                </div>
              </div>

              {/* LIVE HIDE TRIGGER FOR ADMINS */}
              {isAdmin && onUpdateSettings && (
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ ...profileSettings, hideHeroPolaroid: true })}
                  className="absolute -top-3.5 -right-3.5 z-40 bg-red-800 text-white hover:bg-red-700 font-mono text-[9px] font-black p-2 border-2 border-slate-900 shadow-charcoal-offset flex items-center gap-1 cursor-pointer"
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



      {/* 3. Selected Projects Section from Image 2 */}
      {!profileSettings?.hideSelectedProjects && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-12 relative z-10" id="selected-projects-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between select-none mb-12 gap-4">
            <div className="flex flex-col items-start text-left">
              <div className="relative inline-block">
                <div className="absolute left-0 bottom-1 md:bottom-2 bg-verdant-yellow h-6 md:h-10 w-[90%] -skew-y-1 z-0 opacity-90 border-b border-t border-dashed border-verdant-cream" />
                <h2 className={`font-syne font-black text-verdant-cream text-4xl md:text-6xl leading-none relative z-10 tracking-tight ${casingClass}`}>
                  SOME OF MY PROJECTS
                </h2>
              </div>
              <p className="font-mono text-xs md:text-sm text-verdant-gray mt-4 max-w-xl font-bold uppercase tracking-wider leading-relaxed">
                Here are some projects I have worked on while studying at the University of the Cordilleras.
              </p>
            </div>

            {/* Direct deletion on screen */}
            {isAdmin && onUpdateSettings && (
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...profileSettings, hideSelectedProjects: true })}
                className="bg-red-800 text-white hover:bg-red-700 font-mono text-[10px] font-black px-4 py-2 border-2 border-slate-900 shadow-charcoal-offset flex items-center gap-1 cursor-pointer h-fit self-start"
                title="Hide projects from view"
              >
                <X className="w-3 h-3 text-white" />
                <span>HIDE PROJECTS</span>
              </button>
            )}
          </div>

          {/* Grid layout containing lunar waves, crystal voids, logic grains */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {sampleProjects.map((proj) => (
              <div
                key={proj.id}
                className="border-brutal bg-verdant-charcoal p-5 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-200 shadow-charcoal-offset group animate-none"
              >
                <div className="flex flex-col gap-4">
                  {/* Visual Frame rendering the item */}
                  <div className="relative aspect-video bg-verdant-dark border border-verdant-cream/20 flex flex-col justify-between p-3 overflow-hidden select-none">
                    {/* Absolute glowing badge in the corner */}
                    <div className="absolute top-2 left-2 bg-verdant-yellow text-verdant-cream font-mono text-[8px] font-extrabold px-2 py-1 uppercase tracking-widest z-20">
                      {proj.badge}
                    </div>

                    {/* Render programmatic mock art representation matching the title */}
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-10">
                      {proj.imageType && proj.imageType.startsWith("data:image/") ? (
                        <img
                          src={proj.imageType}
                          alt={proj.title}
                          className="w-full h-full object-cover opacity-80"
                          referrerPolicy="no-referrer"
                        />
                      ) : proj.imageType === "lunar" ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {/* Faint crescent moon glowing in the darkness */}
                          <div className="absolute top-4 right-8 w-8 h-8 rounded-full bg-white opacity-95 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                          <div className="absolute top-4 right-10 w-8 h-8 rounded-full bg-verdant-dark" />
                          {/* Waves outline list matching image 2 */}
                          <svg className="absolute bottom-0 w-full h-[60%] text-verdant-mint/30" viewBox="0 0 100 40" stroke="currentColor" fill="none">
                            <path d="M0 30 Q 15 15, 30 30 T 60 30 T 90 30 T 120 30" strokeWidth="2" />
                            <path d="M0 35 Q 20 20, 40 35 T 80 35 T 120 35" strokeWidth="1.5" />
                          </svg>
                        </div>
                      ) : proj.imageType === "void" ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-t from-verdant-charcoal/30 to-white/10">
                          {/* Shard visual from void calls image 2 */}
                          <svg className="w-16 h-16 text-verdant-mint" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
                            <polygon points="12,2 22,12 17,21 7,21 2,12" />
                            <line x1="12" y1="2" x2="17" y2="21" />
                            <line x1="12" y1="2" x2="7" y2="21" />
                            <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="2 2" />
                          </svg>
                        </div>
                      ) : proj.imageType === "logic" ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-verdant-charcoal/40">
                          {/* Wheat lines from image 2 and logical layout dot grid */}
                          <svg className="w-14 h-14 text-verdant-yellow/80 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M12 22 V5 M12 5 L8 8 M12 7 L16 10 M12 9 L7 13 M12 11 L17 14" strokeWidth="2" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-verdant-mint/5">
                          <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">DYNAMIC COVER</span>
                        </div>
                      )}
                    </div>

                    <span 
                      style={{ color: proj.accentColor || "#306634" }}
                      className="mt-auto ml-auto font-mono text-[9.5px] relative z-20 font-black uppercase tracking-widest bg-verdant-dark/90 rounded border border-verdant-cream/15 px-2.5 py-1 select-none shadow-sm"
                    >
                      {proj.tag}
                    </span>
                  </div>

                  <div className="text-left py-2">
                    <h3 className={`font-syne font-black text-xl text-verdant-cream tracking-wide leading-none group-hover:text-verdant-yellow transition-colors ${casingClass}`}>
                      {proj.title}
                    </h3>
                    <p className="font-sans text-xs text-verdant-gray mt-3 leading-relaxed font-medium capitalize">
                      {proj.category.toLowerCase()} — {proj.year}
                    </p>
                  </div>
                </div>

                {/* Action trigger which jumps immediately into Interactive sketch view */}
                <button
                  onClick={() => {
                    onChangeTab("PROJECTS");
                    onSelectProject(proj.id);
                  }}
                  className="mt-4 w-full cursor-pointer bg-verdant-charcoal border-2 border-verdant-mint text-verdant-mint font-mono text-[10px] font-black uppercase py-2 hover:bg-verdant-mint hover:text-white transition-colors tracking-widest select-none"
                >
                  VIEW DETAILS
                </button>
              </div>
            ))}
          </div>
        </section>
      )}



      {/* 5. Infinite scrolling ticker ribbon at the bottom */}
      {!profileSettings?.hideProcessTicker && (
        <div className="w-full bg-verdant-green-deep border-t border-b border-verdant-cream py-3.5 mt-12 overflow-hidden relative group">
          {/* Direct remove handle for admin */}
          {isAdmin && onUpdateSettings && (
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...profileSettings, hideProcessTicker: true })}
              className="absolute top-1/2 left-4 z-40 -translate-y-1/2 bg-red-800 text-white hover:bg-red-700 font-mono text-[9px] font-black px-3 py-1.5 border border-slate-900 shadow-charcoal-offset flex items-center gap-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove ticker band from page"
            >
              <X className="w-3 h-3 text-white" strokeWidth={3} />
              <span>HIDE TICKER</span>
            </button>
          )}

          <div className="animate-verdant-ticker font-syne font-black uppercase text-xs tracking-wider text-verdant-lime">
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
              <span key={idx} className="shrink-0 flex items-center gap-8 whitespace-nowrap px-4 select-none text-white font-bold">
                <span>{phrase}</span>
                <span className="w-2.5 h-2.5 bg-verdant-yellow rotate-45 inline-block" />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
