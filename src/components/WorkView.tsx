/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { Play, RotateCcw, Share2, Volume2, Sparkles, FolderGit2, X, AlertCircle, ExternalLink } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { ActiveTab, Project, ProfileSettings } from "../types";

interface WorkViewProps {
  onChangeTab: (tab: ActiveTab) => void;
  selectedProjectId: string | null;
  onClearSelectedProject: () => void;
  projects: Project[];
  profileSettings?: ProfileSettings;
}

export default function WorkView({ onChangeTab, selectedProjectId, onClearSelectedProject, projects, profileSettings }: WorkViewProps) {
  const [activePlayground, setActivePlayground] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Auto-initialize active playground if selected from Gallery view
  useEffect(() => {
    if (selectedProjectId) {
      setActivePlayground(selectedProjectId);
      onClearSelectedProject(); // consume
    }
  }, [selectedProjectId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const bgAccent = profileSettings?.bgAccentStyle || "grid-mesh";
  const customBgColor = profileSettings?.customCanvasBg || "#FAF8F5";
  const casingClass = profileSettings?.textCasingStyle === "normal-case" ? "" : "uppercase";

  return (
    <div 
      style={{ backgroundColor: customBgColor }}
      className={`relative min-h-screen overflow-hidden ${bgAccent} text-verdant-cream pb-20`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-10 md:pt-16">
        
        {/* Layout Heading Section */}
        <div className="flex flex-col items-start select-none mb-12">
          <span className="font-mono text-[10px] font-black text-[#306634] uppercase tracking-widest mb-2">
            DEVELOPMENT SHOWCASE
          </span>
          <div className="relative inline-block w-full max-w-4xl">
            <div className="absolute left-0 bottom-1 md:bottom-2 bg-verdant-yellow h-8 md:h-12 w-[60%] -skew-y-1.5 z-0 opacity-90 border-b border-t border-dashed border-verdant-cream" />
            <h1 className={`font-syne font-black text-verdant-cream text-4xl md:text-7xl leading-none relative z-10 tracking-tight ${casingClass}`}>
              PROJECT PORTFOLIO
            </h1>
          </div>
          <p className="font-mono text-xs md:text-sm text-verdant-gray mt-4 max-w-2xl font-bold uppercase tracking-wider">
            A comprehensive index of interactive prototypes, designs, secure systems, and algorithmic projects constructed in modern frameworks.
          </p>
        </div>

        {/* Organized tab filters list */}
        <div className="flex flex-wrap gap-2.5 mb-8 border-b border-[#306634]/20 pb-6 text-left relative z-10 select-none">
          {["All", "Game Development", "Cryptography", "3D Modelling", "UIUX Design"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 border-2 text-[10px] uppercase font-mono font-black tracking-widest cursor-pointer transition-all ${
                selectedCategory === cat
                  ? "bg-verdant-yellow text-white border-verdant-yellow shadow-sm"
                  : "bg-verdant-charcoal text-verdant-cream border-verdant-cream/20 hover:border-[#306634]/55"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Playgrounds Grid stack representing Image 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {(() => {
            const filteredProjects = projects.filter((proj) => {
              if (selectedCategory === "All") return true;
              return proj.category.toLowerCase() === selectedCategory.toLowerCase();
            });

            if (filteredProjects.length === 0) {
              return (
                <div className="border border-dashed border-verdant-cream/20 bg-verdant-charcoal/30 p-12 text-center font-mono text-xs text-verdant-gray uppercase tracking-widest col-span-3">
                  <AlertCircle className="w-8 h-8 text-verdant-yellow mx-auto mb-3 animate-pulse" />
                  No projects found under "{selectedCategory}" yet.
                </div>
              );
            }

            return filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="border-brutal bg-verdant-charcoal p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-200 shadow-charcoal-offset"
              >
                <div className="flex flex-col gap-5">
                  {/* Visual rendering represent key interactive widgets */}
                  <div className="relative aspect-video bg-verdant-dark border border-verdant-cream/20 flex items-center justify-center p-3 overflow-hidden select-none">
                    <div className="absolute top-2 left-2 bg-verdant-yellow text-verdant-cream font-mono text-[8px] font-extrabold px-2 py-0.5 uppercase tracking-widest z-10">
                      {proj.badge}
                    </div>

                    {proj.imageType && proj.imageType.startsWith("data:image/") ? (
                      <img
                        src={proj.imageType}
                        alt={proj.title}
                        className="w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                    ) : proj.imageType === "lunar" ? (
                      <div className="text-center">
                        <Sparkles className="w-8 h-8 text-[#306634] mx-auto mb-1 animate-pulse" />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#306634] font-bold block">CHARCOAL CANVAS</span>
                      </div>
                    ) : proj.imageType === "void" ? (
                      <div className="text-center">
                        <FolderGit2 className="w-8 h-8 text-verdant-yellow mx-auto mb-1 animate-bounce" />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-verdant-yellow font-bold block">SOUND WAVE OSC</span>
                      </div>
                    ) : proj.imageType === "logic" ? (
                      <div className="text-center">
                        <RotateCcw className="w-8 h-8 text-verdant-mint mx-auto mb-1" />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-verdant-mint font-bold block">STATIONERY BOOK</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Sparkles className="w-8 h-8 text-zinc-500 mx-auto mb-1" />
                        <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-bold block">DYNAMIC RESOURCE</span>
                      </div>
                    )}
                  </div>

                  <div className="text-left">
                    <h3 className={`font-syne font-black text-xl text-verdant-cream tracking-wide leading-none ${casingClass}`}>
                      {proj.title}
                    </h3>
                    <p className="font-mono text-[9px] text-[#306634] font-black tracking-widest mt-1.5">
                      {proj.tag.toUpperCase()}
                    </p>
                    <p className="font-sans text-xs text-verdant-gray mt-3 leading-relaxed font-semibold">
                      {proj.description}
                    </p>
                  </div>
                </div>

              {/* Directly boot sandbox app button */}
              <button
                onClick={() => setActivePlayground(proj.id)}
                className="mt-6 w-full cursor-pointer bg-verdant-mint hover:bg-[#528B56] text-white border border-verdant-cream font-mono text-xs font-black py-3 uppercase tracking-widest transition-colors select-none"
              >
                OPEN WORKSPACE
              </button>
            </div>
          ));
        })()}
      </div>

        {/* Separator */}
        <hr className="my-16 border-t border-dashed border-verdant-cream/20" />

        {/* Mini CTA footer matching Image 3 bottom */}
        <div className="flex flex-col items-center gap-4 text-center select-none" id="work-pre-cta">
          <h2 className="font-syne font-black text-3xl uppercase tracking-tighter text-verdant-cream">
            Have a project in mind?
          </h2>
          <button
            onClick={() => onChangeTab("CONNECT")}
            className="cursor-pointer bg-verdant-yellow text-white border-2 border-verdant-cream font-mono text-xs font-black tracking-widest uppercase px-8 py-3.5 hover:bg-white hover:text-verdant-cream transition-colors shadow-yellow-offset"
          >
            START A PROJECT
          </button>
        </div>

      </div>

      {/* --- Fullscreen Interactive Playgrounds Modal (View Projects details) --- */}
      <AnimatePresence>
        {activePlayground && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePlayground(null)}
            className="fixed inset-0 z-50 bg-verdant-dark/95 backdrop-blur-md flex justify-center items-center p-4 md:p-10"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] bg-verdant-charcoal border-[3.5px] border-verdant-cream p-5 md:p-6 flex flex-col gap-4 shadow-double-offset overflow-hidden text-verdant-cream"
            >
              {/* Heavy border header strip */}
              <div className="flex justify-between items-center border-b border-verdant-cream/20 pb-3 flex-shrink-0 select-none">
                <div className="flex items-center gap-2 font-mono text-[#306634]">
                  <FolderGit2 className="w-5 h-5 text-[#306634]" />
                  <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest">ARTIFACT SYSTEM DETAILED ARCHIVE</span>
                </div>
                {/* Close Button */}
                <button
                  onClick={() => {
                    setActivePlayground(null);
                  }}
                  className="w-8 h-8 cursor-pointer border-2 border-verdant-cream bg-transparent text-verdant-cream flex items-center justify-center font-bold hover:bg-verdant-cream hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Project details representation with internal scroll viewport */}
              <div className="flex-1 overflow-y-auto pr-1.5 text-left custom-scrollbar">
                {(() => {
                  const currentProj = projects.find(p => p.id === activePlayground);
                  if (!currentProj) return <p className="font-mono text-xs text-red-500">PROJECT NOT FOUND IN LOCAL LEDGER.</p>;
                  return (
                    <div className="flex flex-col gap-5">
                      <div className="relative aspect-video bg-verdant-dark border border-verdant-cream/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {currentProj.videoUrl ? (
                          <div className="w-full h-full bg-black">
                            {currentProj.videoUrl.includes("youtube.com") || currentProj.videoUrl.includes("youtu.be") || currentProj.videoUrl.includes("vimeo.com") ? (
                              <iframe
                                src={
                                  currentProj.videoUrl.includes("youtube.com/shorts/")
                                    ? "https://www.youtube.com/embed/" + currentProj.videoUrl.split("youtube.com/shorts/")[1]?.split("?")[0]
                                    : currentProj.videoUrl.includes("youtube.com/embed/")
                                    ? currentProj.videoUrl
                                    : currentProj.videoUrl.includes("watch?v=")
                                    ? currentProj.videoUrl.replace("watch?v=", "embed/")
                                    : currentProj.videoUrl.includes("youtu.be/")
                                    ? "https://www.youtube.com/embed/" + currentProj.videoUrl.split("youtu.be/")[1]?.split("?")[0]
                                    : currentProj.videoUrl
                                }
                                title="Project Demonstration Video"
                                className="w-full h-full border-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video src={currentProj.videoUrl} controls className="w-full h-full object-contain" />
                            )}
                          </div>
                        ) : currentProj.imageType && currentProj.imageType.startsWith("data:image/") ? (
                          <img
                            src={currentProj.imageType}
                            alt={currentProj.title}
                            className="w-full h-full object-cover opacity-90"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-center font-mono text-[9px] uppercase tracking-widest text-[#306634] p-6 relative w-full h-full flex flex-col items-center justify-center min-h-[160px]">
                            <Sparkles className="w-12 h-12 text-verdant-yellow mx-auto mb-3 animate-pulse" />
                            <span className="font-bold block tracking-wider text-verdant-cream uppercase mb-1.5">{currentProj.title}</span>
                            <span className="text-zinc-500 text-[8px] tracking-widest">{currentProj.category} SPECIFICATION PROFILE</span>
                            <div className="absolute inset-x-0 bottom-4 text-center font-mono opacity-20 text-[7px] text-[#306634]">
                              MATRIX CONTEXT COMPILING SUCCESSFUL
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-verdant-cream/10 pb-2">
                          <span className="font-mono text-[9px] bg-[#306634]/20 border border-[#306634] text-verdant-cream px-2.5 py-0.5 font-bold uppercase tracking-widest">
                            {currentProj.badge}
                          </span>
                          <span className="font-mono text-[9.5px] text-verdant-gray font-bold uppercase">
                            RELEASE YEAR: <span className="text-verdant-yellow font-black">{currentProj.year}</span>
                          </span>
                        </div>

                        <h3 className="font-syne font-black text-2xl text-verdant-cream uppercase tracking-wide leading-tight">
                          {currentProj.title}
                        </h3>

                        <span className="font-mono text-[10px] text-[#306634] font-black tracking-widest uppercase block border-l-2 border-verdant-yellow pl-2 py-0.5">
                          {currentProj.tag.toUpperCase()}
                        </span>

                        <p className="font-sans text-sm text-verdant-gray leading-relaxed font-semibold">
                          {currentProj.description}
                        </p>

                        {/* Extended detailed description shown exclusively when deep/expanded parameters are defined */}
                        {currentProj.extendedDescription && (
                          <div className="pt-4 border-t border-dashed border-verdant-cream/20">
                            <h4 className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest mb-2 flex items-center gap-1.5 select-none">
                              <Sparkles className="w-3.5 h-3.5 text-verdant-yellow shrink-0" />
                              <span>EXTENDED SPECIFICATIONS & NOTES</span>
                            </h4>
                            <p className="font-sans text-xs md:text-sm text-verdant-cream/90 leading-relaxed whitespace-pre-line font-medium bg-verdant-dark/40 border border-verdant-cream/5 p-4 italic">
                              {currentProj.extendedDescription}
                            </p>
                          </div>
                        )}

                        {/* Interactive Gallery of Secondary Photos */}
                        {currentProj.additionalImages && currentProj.additionalImages.length > 0 && (
                          <div className="flex flex-col gap-2 pt-2">
                            <span className="text-[9px] font-mono text-grid text-verdant-gray uppercase font-semibold tracking-widest">
                              PROJECT MEDIA GALLERY
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                              {currentProj.additionalImages.map((imgUrl, idx) => (
                                <div key={idx} className="relative aspect-video border border-verdant-cream/20 bg-verdant-dark overflow-hidden group/thumb cursor-zoom-in hover:border-verdant-yellow transition-colors">
                                  <a href={imgUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={imgUrl}
                                      alt={`Media ${idx + 1}`}
                                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                                      referrerPolicy="no-referrer"
                                    />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="font-mono text-xs text-verdant-gray uppercase leading-relaxed font-bold border-t border-dashed border-verdant-cream/10 pt-3">
                          <span className="text-[#306634] font-black mr-2">CLASSIFICATION TAG:</span>
                          {currentProj.category}
                        </p>

                        {/* Streamlit or External Project Link Button */}
                        {currentProj.link && (
                          <div className="pt-3 border-t border-verdant-cream/10 flex flex-col gap-1.5">
                            <span className="text-[9px] font-mono text-verdant-gray uppercase font-bold tracking-widest block">
                              LIVE SYSTEM PORTAL
                            </span>
                            <a
                              href={currentProj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-verdant-yellow text-white border-2 border-verdant-cream font-mono text-xs font-black py-4 uppercase tracking-widest transition-all hover:bg-[#FAF8F5] hover:text-[#142215] flex items-center justify-center gap-2 shadow-yellow-offset select-none cursor-pointer animate-pulse"
                              id="active-sandbox-live-launch-btn"
                            >
                              <span>TEST PROTOTYPE ON STREAMLIT</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Close Bottom action */}
              <div className="border-t border-verdant-cream/20 pt-3 flex justify-between items-center font-mono text-[10px] flex-shrink-0 select-none">
                <span className="text-zinc-600 text-[8px] uppercase tracking-widest">
                  SECURE LEDGER ACCESS
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActivePlayground(null);
                  }}
                  className="underline text-[#306634] hover:text-verdant-cream font-extrabold cursor-pointer uppercase"
                >
                  Return to Projects
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
