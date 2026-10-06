/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { Play, RotateCcw, Share2, Volume2, Sparkles, FolderGit2, X, AlertCircle, ExternalLink } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { ActiveTab, Project, ProfileSettings } from "../types";

interface WorkViewProps {
  onChangeTab: (tab: ActiveTab) => void;
  selectedProjectId: string | null;
  onClearSelectedProject: () => void;
  projects: Project[];
  profileSettings?: ProfileSettings;
  isAdmin?: boolean;
  onUpdateSettings?: (settings: ProfileSettings) => void;
}

export default function WorkView({ 
  onChangeTab, 
  selectedProjectId, 
  onClearSelectedProject, 
  projects, 
  profileSettings,
  isAdmin = false,
  onUpdateSettings
}: WorkViewProps) {
  const [activePlayground, setActivePlayground] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const defaultCategories = ["Game Development", "Cryptography", "3D Modelling", "UIUX Design", "Graphics Design", "Others"];
  const configuredCategories = (profileSettings?.projectCategories && profileSettings.projectCategories.length > 0)
    ? profileSettings.projectCategories
    : defaultCategories;

  // Deduplicate and combine configured categories with any active categories in existing projects
  const categoriesList = Array.from(
    new Set([
      "All",
      ...configuredCategories,
      ...projects.map((p) => p.category).filter(Boolean)
    ])
  );

  const handleAddCategory = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed || !onUpdateSettings) return;

    if (!configuredCategories.includes(trimmed)) {
      const updatedCategories = [...configuredCategories, trimmed];
      onUpdateSettings({
        ...(profileSettings || {
          fullName: "JULIARISTY",
          lastNameHighlight: "VENICE CASTILLO",
          headline: "COMPUTER SCIENCE GRADUATE & DIGITAL DESIGNER",
          biography: "",
          aboutParagraphs: [],
          contactEmail: "",
          instagramUrl: "",
          linkedinUrl: "",
          websiteUrl: ""
        }),
        projectCategories: updatedCategories
      });
      setSelectedCategory(trimmed);
    }
    setNewCategoryInput("");
    setShowAddCategoryInput(false);
  };

  // Auto-initialize active playground if selected from Gallery view
  useEffect(() => {
    if (selectedProjectId) {
      setActivePlayground(selectedProjectId);
      onClearSelectedProject();
    }
  }, [selectedProjectId, onClearSelectedProject]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const bgAccent = (profileSettings?.bgAccentStyle && !profileSettings.bgAccentStyle.includes("grid") && !profileSettings.bgAccentStyle.includes("matrix") && !profileSettings.bgAccentStyle.includes("blueprint") && !profileSettings.bgAccentStyle.includes("mesh")) 
    ? profileSettings.bgAccentStyle 
    : "solid-plain";
  const customBgColor = profileSettings?.customCanvasBg || "#F8F9FA";
  const casingClass = profileSettings?.textCasingStyle === "normal-case" ? "" : "uppercase";

  return (
    <div 
      style={{ backgroundColor: customBgColor }}
      className={`relative min-h-screen overflow-hidden ${bgAccent} text-neutral-900 pb-20`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-10 md:pt-16">
        
        {/* Layout Heading Section - Direct & Clean */}
        <div className="flex flex-col items-start select-none mb-10 border-b border-neutral-200 pb-6">
          <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
            <span className="w-2 h-[2px] bg-[#D5001C]" />
            <span>FEATURED WORK</span>
          </span>
          <h1 className={`font-syne font-black text-neutral-900 text-3xl md:text-5xl leading-none tracking-tight ${casingClass}`}>
            PROJECT PORTFOLIO
          </h1>
          <p className="font-sans text-xs md:text-sm text-neutral-500 mt-2 font-normal leading-relaxed text-left max-w-2xl">
            Selected projects and prototypes across design, development, and 3D modeling.
          </p>
        </div>

        {/* Organized tab filters list */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-neutral-200 pb-5 text-left relative z-10 select-none">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 border text-[11px] uppercase font-mono font-bold tracking-[0.16em] cursor-pointer transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-neutral-950 text-white border-neutral-950 shadow-sm"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-900 hover:text-neutral-900"
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Quick Admin Category Adder */}
          {isAdmin && onUpdateSettings && (
            <div className="flex items-center gap-1.5 ml-auto">
              {showAddCategoryInput ? (
                <form onSubmit={handleAddCategory} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="New category..."
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    autoFocus
                    className="border border-neutral-900 bg-white text-neutral-900 font-mono text-[10px] px-2.5 py-1.5 uppercase font-bold focus:outline-none w-36 shadow-sm"
                  />
                  <button
                    type="submit"
                    className="bg-[#D5001C] hover:bg-neutral-950 text-white font-mono text-[10px] uppercase font-bold px-3 py-1.5 cursor-pointer shadow-sm"
                  >
                    ADD
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCategoryInput(false);
                      setNewCategoryInput("");
                    }}
                    className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-mono text-[10px] px-2 py-1.5 cursor-pointer"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddCategoryInput(true)}
                  className="px-3 py-2 border border-dashed border-neutral-400 hover:border-neutral-900 text-neutral-700 hover:text-neutral-950 font-mono text-[10.5px] uppercase font-bold tracking-wider cursor-pointer bg-neutral-50 transition-colors flex items-center gap-1.5"
                  title="Add a new custom project category"
                >
                  <span className="text-[#D5001C] font-bold">+</span>
                  <span>ADD CATEGORY</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Playgrounds Grid stack */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {(() => {
            const filteredProjects = projects.filter((proj) => {
              if (selectedCategory === "All") return true;
              return proj.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
            });

            if (filteredProjects.length === 0) {
              return (
                <div className="border border-neutral-200 bg-white p-12 text-center font-mono text-xs text-neutral-500 uppercase tracking-widest col-span-3">
                  <AlertCircle className="w-8 h-8 text-[#D5001C] mx-auto mb-3 animate-pulse" />
                  <p className="mb-4">No projects found under "{selectedCategory}" yet.</p>
                  {isAdmin && (
                    <button
                      onClick={() => onChangeTab("ADMIN")}
                      className="inline-block bg-neutral-950 hover:bg-[#D5001C] text-white font-mono text-[10px] font-bold px-4 py-2 uppercase tracking-widest cursor-pointer transition-colors shadow-sm"
                    >
                      + ADD PROJECT UNDER "{selectedCategory}"
                    </button>
                  )}
                </div>
              );
            }

            return filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="border border-neutral-200 bg-white p-5 flex flex-col justify-between hover:border-neutral-950 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                <div className="flex flex-col gap-4">
                  {/* Visual rendering frame */}
                  <div className="relative aspect-video bg-neutral-950 border border-neutral-800 flex items-center justify-center p-3 overflow-hidden select-none">
                    <div className="absolute top-2 left-2 bg-neutral-900/90 border border-neutral-700 text-neutral-200 font-mono text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest z-10">
                      {proj.badge}
                    </div>

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
                          <span>POST-QUANTUM / ECC</span>
                          <span className="text-[#D5001C] font-bold">SECURITY</span>
                        </div>
                        <div className="flex items-center justify-center my-auto">
                          <svg className="w-14 h-14 text-neutral-300" viewBox="0 0 40 40" fill="none" stroke="currentColor">
                            <polygon points="20,4 36,12 36,28 20,36 4,28 4,12" strokeWidth="1.2" />
                            <circle cx="20" cy="20" r="3" fill="#D5001C" />
                          </svg>
                        </div>
                        <div className="flex justify-between text-[7px] text-neutral-500 font-mono tracking-wider">
                          <span>ECC_AUTH: VERIFIED</span>
                          <span className="text-neutral-400">SHA-256</span>
                        </div>
                      </div>
                    ) : proj.imageType === "void" ? (
                      <div className="relative w-full h-full flex flex-col justify-between p-4 bg-neutral-950 text-white font-mono">
                        <div className="flex justify-between items-center text-[7.5px] text-neutral-400">
                          <span>UI/UX PROTOTYPE</span>
                          <span className="text-neutral-300 font-bold">MOBILE</span>
                        </div>
                        <div className="flex items-center justify-center my-auto">
                          <div className="w-24 h-12 border border-neutral-700 bg-neutral-900 p-1.5 flex flex-col justify-between">
                            <div className="h-1.5 w-8 bg-neutral-600 rounded-sm" />
                            <div className="grid grid-cols-3 gap-1">
                              <div className="h-4 bg-neutral-800 border border-neutral-700" />
                              <div className="h-4 bg-neutral-800 border border-neutral-700" />
                              <div className="h-4 bg-neutral-800 border border-neutral-700" />
                            </div>
                            <div className="h-1 w-12 bg-[#D5001C]" />
                          </div>
                        </div>
                        <div className="flex justify-between text-[7px] text-neutral-500">
                          <span>LAYOUT DESIGN</span>
                          <span className="text-[#D5001C]">FIGMA</span>
                        </div>
                      </div>
                    ) : proj.imageType === "logic" ? (
                      <div className="relative w-full h-full flex flex-col justify-between p-4 bg-neutral-950 text-white font-mono">
                        <div className="flex justify-between items-center text-[7.5px] text-neutral-400">
                          <span>3D MESH</span>
                          <span className="text-neutral-300 font-bold">BLENDER</span>
                        </div>
                        <div className="flex items-center justify-center my-auto">
                          <svg className="w-14 h-14 text-neutral-300" viewBox="0 0 40 40" fill="none" stroke="currentColor">
                            <ellipse cx="20" cy="20" rx="14" ry="7" strokeWidth="1.2" />
                            <ellipse cx="20" cy="20" rx="6" ry="3" strokeWidth="1" strokeDasharray="1 1" />
                          </svg>
                        </div>
                        <div className="flex justify-between text-[7px] text-neutral-500">
                          <span>RENDER SHADER</span>
                          <span className="text-neutral-400">CYCLES</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center font-mono text-[8px] text-neutral-400 uppercase tracking-widest">
                        PROJECT PREVIEW
                      </div>
                    )}
                  </div>

                  <div className="text-left">
                    <h3 className={`font-syne font-black text-lg text-neutral-900 tracking-tight leading-snug group-hover:text-[#D5001C] transition-colors ${casingClass}`}>
                      {proj.title}
                    </h3>
                    <p className="font-mono text-[9.5px] font-bold tracking-wider mt-1.5 uppercase text-neutral-600">
                      {proj.tag}
                    </p>
                    <p className="font-sans text-xs text-neutral-500 mt-2.5 leading-relaxed font-normal">
                      {proj.description}
                    </p>
                  </div>
                </div>

                {/* Directly boot project modal button */}
                <button
                  onClick={() => setActivePlayground(proj.id)}
                  className="mt-6 w-full cursor-pointer bg-white border border-neutral-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white text-neutral-900 font-mono text-[10px] font-bold py-2.5 uppercase tracking-[0.2em] transition-all select-none"
                >
                  VIEW PROJECT
                </button>
              </div>
            ));
          })()}
        </div>

        {/* Separator */}
        <hr className="my-16 border-t border-neutral-200" />

        {/* Mini CTA footer */}
        <div className="flex flex-col items-center gap-3 text-center select-none" id="work-pre-cta">
          <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-[0.25em]">
            INITIATE COLLABORATION
          </span>
          <h2 className="font-syne font-black text-2xl md:text-3xl tracking-tight text-neutral-900">
            Have a project in mind?
          </h2>
          <button
            onClick={() => onChangeTab("CONNECT")}
            style={{ backgroundColor: "#0A0A0A", color: "#FFFFFF" }}
            className="cursor-pointer hover:!bg-[#D5001C] text-white font-mono text-xs font-bold tracking-[0.2em] uppercase px-8 py-3.5 transition-all shadow-sm hover:shadow-md mt-2"
          >
            START A PROJECT
          </button>
        </div>

      </div>

      {/* --- Fullscreen Interactive Project Modal --- */}
      <AnimatePresence>
        {activePlayground && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePlayground(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 md:p-10"
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] bg-white border border-neutral-200 p-6 flex flex-col gap-4 shadow-2xl overflow-hidden text-neutral-900"
            >
              {/* Header strip */}
              <div className="flex justify-between items-center border-b border-neutral-100 pb-3 flex-shrink-0 select-none">
                <div className="flex items-center gap-2 font-mono text-neutral-900">
                  <FolderGit2 className="w-4 h-4 text-[#D5001C]" />
                  <span className="text-[10px] md:text-xs uppercase font-bold tracking-[0.2em]">PROJECT DETAILS</span>
                </div>
                {/* Close Button */}
                <button
                  onClick={() => setActivePlayground(null)}
                  className="w-8 h-8 cursor-pointer border border-neutral-200 bg-neutral-50 text-neutral-700 flex items-center justify-center font-bold hover:bg-neutral-900 hover:text-white transition-colors"
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
                      <div className="relative aspect-video bg-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                            className="w-full h-full object-contain opacity-100"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-center font-mono text-[9px] uppercase tracking-widest text-neutral-300 p-6 relative w-full h-full flex flex-col items-center justify-center min-h-[160px]">
                            <Sparkles className="w-10 h-10 text-[#D5001C] mx-auto mb-3" />
                            <span className="font-bold block tracking-wider text-white uppercase mb-1.5">{currentProj.title}</span>
                            <span className="text-neutral-500 text-[8px] tracking-[0.2em]">{currentProj.category} PROJECT</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2">
                          <span 
                            className="font-mono text-[9px] border border-neutral-200 bg-neutral-50 text-neutral-700 px-2.5 py-0.5 font-bold uppercase tracking-widest"
                          >
                            {currentProj.badge}
                          </span>
                          <span className="font-mono text-[9.5px] text-neutral-500 font-bold uppercase">
                            YEAR: <span className="text-neutral-900 font-black">{currentProj.year}</span>
                          </span>
                        </div>

                        <h3 className="font-syne font-black text-2xl text-neutral-900 uppercase tracking-tight leading-tight">
                          {currentProj.title}
                        </h3>

                        <span 
                          className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase block text-neutral-600 border-l-2 border-[#D5001C] pl-2 py-0.5"
                        >
                          {currentProj.tag.toUpperCase()}
                        </span>

                        <p className="font-sans text-sm text-neutral-600 leading-relaxed font-normal">
                          {currentProj.description}
                        </p>

                        {/* Extended detailed description */}
                        {currentProj.extendedDescription && (
                          <div className="pt-4 border-t border-neutral-100">
                            <h4 
                              className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2 flex items-center gap-1.5 select-none"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#D5001C] shrink-0" />
                              <span>OVERVIEW & PROJECT NOTES</span>
                            </h4>
                            <p className="font-sans text-xs md:text-sm text-neutral-700 leading-relaxed whitespace-pre-line font-normal bg-neutral-50 border border-neutral-200 p-4">
                              {currentProj.extendedDescription}
                            </p>
                          </div>
                        )}

                        {/* Interactive Gallery of Secondary Photos */}
                        {currentProj.additionalImages && currentProj.additionalImages.length > 0 && (
                          <div className="flex flex-col gap-2 pt-2">
                            <span className="text-[9px] font-mono text-neutral-500 uppercase font-semibold tracking-widest">
                              PROJECT MEDIA GALLERY
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                              {currentProj.additionalImages.map((imgUrl, idx) => (
                                <div key={idx} className="relative aspect-video border border-neutral-200 bg-neutral-100 overflow-hidden group/thumb cursor-zoom-in hover:border-neutral-900 transition-colors">
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

                        <p className="font-mono text-xs text-neutral-500 uppercase leading-relaxed font-normal border-t border-neutral-100 pt-3">
                          <span className="text-neutral-900 font-bold mr-2">CATEGORY:</span>
                          {currentProj.category}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  {(() => {
                    const currentProj = projects.find(p => p.id === activePlayground);
                    if (currentProj?.link) {
                      return (
                        <a
                          href={currentProj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-2.5 bg-neutral-950 hover:bg-[#D5001C] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                        >
                          <span>{currentProj.linkLabel || "OPEN LIVE PROJECT"}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      );
                    }
                    return null;
                  })()}

                  <button
                    onClick={handleShare}
                    className="px-4 py-2.5 border border-neutral-300 hover:border-neutral-950 text-neutral-800 font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedLink ? "LINK COPIED" : "SHARE"}</span>
                  </button>
                </div>

                <button
                  onClick={() => setActivePlayground(null)}
                  className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
