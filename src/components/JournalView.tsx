/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Compass, FileText, Sparkles, Terminal, Cpu, Award, Bookmark, Layers, Plus, Trash2, X } from "lucide-react";
import { ActiveTab, ProfileSettings, SkillItem, CertItem } from "../types";

interface JournalViewProps {
  onChangeTab: (tab: ActiveTab) => void;
  profileSettings?: ProfileSettings;
  isAdmin?: boolean;
  onUpdateSettings?: (settings: ProfileSettings) => void;
}

export default function JournalView({ onChangeTab, profileSettings, isAdmin = false, onUpdateSettings }: JournalViewProps) {
  // Local input buffers to prevent cursor jumps on global updates
  const [localBioText, setLocalBioText] = useState(() => profileSettings?.aboutParagraphs?.join("\n") || "");
  const [localQuoteText, setLocalQuoteText] = useState(() => 
    profileSettings?.quoteText !== undefined ? profileSettings.quoteText : "Great things are done by a series of small things brought together."
  );
  const [localQuoteAuthor, setLocalQuoteAuthor] = useState(() => 
    profileSettings?.quoteAuthor !== undefined ? profileSettings.quoteAuthor : "Vincent van Gogh"
  );
  const [localDedicationTitle, setLocalDedicationTitle] = useState(() => 
    profileSettings?.dedicationTitle !== undefined ? profileSettings.dedicationTitle : "INCREMENTAL PROGRESS"
  );
  const [localDedicationText, setLocalDedicationText] = useState(() => 
    profileSettings?.dedicationText !== undefined ? profileSettings.dedicationText : "Building secure networks, modeling 3D space, and shaping digital user paths with clean pixel harmony."
  );

  useEffect(() => {
    setLocalBioText(profileSettings?.aboutParagraphs?.join("\n") || "");
  }, [profileSettings?.aboutParagraphs]);

  useEffect(() => {
    setLocalQuoteText(profileSettings?.quoteText !== undefined ? profileSettings.quoteText : "Great things are done by a series of small things brought together.");
  }, [profileSettings?.quoteText]);

  useEffect(() => {
    setLocalQuoteAuthor(profileSettings?.quoteAuthor !== undefined ? profileSettings.quoteAuthor : "Vincent van Gogh");
  }, [profileSettings?.quoteAuthor]);

  useEffect(() => {
    setLocalDedicationTitle(profileSettings?.dedicationTitle !== undefined ? profileSettings.dedicationTitle : "INCREMENTAL PROGRESS");
  }, [profileSettings?.dedicationTitle]);

  useEffect(() => {
    setLocalDedicationText(profileSettings?.dedicationText !== undefined ? profileSettings.dedicationText : "Building secure networks, modeling 3D space, and shaping digital user paths with clean pixel harmony.");
  }, [profileSettings?.dedicationText]);

  // Setup dynamic list helpers
  const skillsList: SkillItem[] = profileSettings?.skills || [
    { id: "s1", name: "UI/UX Design (Figma)", category: "Design" },
    { id: "s2", name: "Digital Illustration / Graphic Design (Krita, Figma, Illustrator)", category: "Design" },
    { id: "s3", name: "Visual Communication & Prototyping", category: "Design" },
    { id: "s4", name: "Software Development (C#, Python)", category: "Engineering" },
    { id: "s5", name: "Version Control & Collaborative Coding (Git/GitHub)", category: "Engineering" },
    { id: "s6", name: "IDE Proficiency & Developer Tooling", category: "Engineering" },
    { id: "s7", name: "Document & Data Management (Word, Excel, PowerPoint)", category: "Productivity" },
    { id: "s8", name: "Cloud Collaboration (Workspace: Docs, Sheets, Drive)", category: "Productivity" },
    { id: "s9", name: "Civil Service Professional Passer", category: "General" },
    { id: "s10", name: "Analytical Thinking & Problem Solving", category: "General" },
    { id: "s11", name: "Adaptability & Cross-functional Teamwork", category: "General" }
  ];

  const certificates: CertItem[] = profileSettings?.certs || [
    {
      id: "c1",
      title: "GDG Build with AI",
      date: "May 9, 2026",
      issuer: "University of the Cordilleras, Baguio City",
      badge: "AI/ML"
    },
    {
      id: "c2",
      title: "AI-powered Design Mastery: Adobe Express and Firefly",
      date: "April 21, 2026",
      issuer: "Commerce First",
      badge: "Design"
    },
    {
      id: "c3",
      title: "CITCS Webinar Series",
      date: "March 7-14, 2026",
      issuer: "University of the Cordilleras, Baguio City",
      badge: "Webinar"
    },
    {
      id: "c4",
      title: "From Hype to Readiness: What Post Quantum Security Really Means for Businesses",
      date: "January 22, 2026",
      issuer: "BrightTalk",
      badge: "Security"
    },
    {
      id: "c5",
      title: "Introduction to SQL",
      date: "November 1, 2024",
      issuer: "Simplilearn, SkillUP",
      badge: "Database"
    },
    {
      id: "c6",
      title: "CCNAv7: Introduction to Networks",
      date: "August 17, 2024",
      issuer: "CISCO Networking Academy",
      badge: "Networking"
    },
    {
      id: "c7",
      title: "AI and Internet of Things",
      date: "May 11, 2024",
      issuer: "DICT Region III",
      badge: "IoT"
    }
  ];

  // Live Skills modification logic
  const handleUpdateSkill = (id: string, name: string) => {
    if (!onUpdateSettings) return;
    const updated = skillsList.map(s => s.id === id ? { ...s, name } : s);
    onUpdateSettings({ ...profileSettings, skills: updated });
  };

  const handleCreateSkill = (category: string) => {
    if (!onUpdateSettings) return;
    const newSkill: SkillItem = {
      id: "skill-" + Date.now() + Math.random().toString(36).substr(2, 4),
      name: "NEW SKILL CAPABILITY RECORDED",
      category
    };
    onUpdateSettings({ ...profileSettings, skills: [...skillsList, newSkill] });
  };

  const handleDeleteSkill = (id: string) => {
    if (!onUpdateSettings) return;
    const updated = skillsList.filter(s => s.id !== id);
    onUpdateSettings({ ...profileSettings, skills: updated });
  };

  // Live Certificates modification logic
  const handleUpdateCert = (id: string, fields: Partial<CertItem>) => {
    if (!onUpdateSettings) return;
    const updated = certificates.map(c => c.id === id ? { ...c, ...fields } : c);
    onUpdateSettings({ ...profileSettings, certs: updated });
  };

  const handleCreateCert = () => {
    if (!onUpdateSettings) return;
    const newCert: CertItem = {
      id: "cert-" + Date.now() + Math.random().toString(36).substr(2, 4),
      title: "NEW ACQUIRED PROFESSIONAL CERTIFICATION Record",
      date: "MAY 2026",
      issuer: "ACADEMIC AUTHORITY / ORG",
      badge: "SKILL"
    };
    onUpdateSettings({ ...profileSettings, certs: [...certificates, newCert] });
  };

  const handleDeleteCert = (id: string) => {
    if (!onUpdateSettings) return;
    const updated = certificates.filter(c => c.id !== id);
    onUpdateSettings({ ...profileSettings, certs: updated });
  };

  const handleDownloadDossier = () => {
    const nameLine = `${(profileSettings?.fullName || "JULIARISTY")} ${(profileSettings?.lastNameHighlight || "VENICE CASTILLO")}`.toUpperCase();
    const fileContent = `${nameLine} // PORTFOLIO DOSSIER\n` +
      "==========================================================\n\n" +
      "BIOGRAPHY\n" +
      (profileSettings?.biography || "Hello! I'm a Computer Science student at the University of the Cordilleras. My interests sit at UI/UX Design, where design meets behavior; Cryptography, where math meets security; and Theoretical Computer Science, where logic meets the limits of what's computable.") + "\n\n" +
      "PROFESSIONAL SKILLS\n" +
      skillsList.map(s => `- ${s.name} [${s.category}]`).join("\n") + "\n\n" +
      "CERTIFICATIONS & TIMELINE\n" +
      certificates.map(c => `* ${c.title} (${c.date}) - ${c.issuer}`).join("\n") + "\n\n" +
      "CONTACT INFO\n" +
      "- Location: Baguio City\n" +
      `- Direct Contact: ${profileSettings?.contactEmail || "juliaristycastillo0@gmail.com"}\n\n` +
      "----------------------------------------------------------\n" +
      `"${profileSettings?.quoteText || "Great things are done by a series of small things brought together."}" - ${profileSettings?.quoteAuthor || "Vincent van Gogh"}`;
    
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "CASTILLO_DOSSIER.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative min-h-screen bg-verdant-dark text-neutral-900 overflow-hidden pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-10 md:pt-16 relative z-10 w-full">
        
        {/* Header Title Section */}
        <div className="flex flex-col mb-10 items-start select-none border-b border-neutral-200 pb-6">
          <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
            <span className="w-2 h-[2px] bg-verdant-yellow" />
            <span>BACKGROUND & EXPERIENCE</span>
          </span>
          <h1 className="font-syne font-black text-neutral-900 text-4xl md:text-6xl leading-none tracking-tight uppercase text-left">
            ABOUT ME
          </h1>
          <p className="font-sans text-xs md:text-sm font-medium text-neutral-500 mt-2 text-left">
            {profileSettings?.fullName || "JULIARISTY"} {profileSettings?.lastNameHighlight || "VENICE CASTILLO"} · Computer Science Student & Digital Designer
          </p>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* Left Column Card: BIO & SKILLS */}
          <div className="lg:col-span-7 flex flex-col gap-8 w-full">
            <div className="border border-neutral-200 bg-white p-6 md:p-8 text-left relative shadow-sm w-full flex flex-col gap-6" id="manifesto-card">
              <h2 className="font-syne font-black text-xl text-neutral-900 tracking-tight uppercase border-b border-neutral-100 pb-3 flex items-center justify-between col-span-12">
                <span>BIOGRAPHY</span>
                <Cpu className="w-4 h-4 text-verdant-yellow" />
              </h2>

                {isAdmin && onUpdateSettings ? (
                  <div className="flex flex-col gap-2 w-full">
                    <span className="font-mono text-[9px] text-verdant-yellow font-black uppercase tracking-widest text-left block">
                      📝 Edit Biography Paragraphs (Each line represents one paragraph):
                    </span>
                    <textarea
                      rows={5}
                      value={localBioText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocalBioText(val);
                        onUpdateSettings({ ...profileSettings, aboutParagraphs: val.split("\n") });
                      }}
                      className="w-full bg-neutral-50 text-neutral-900 px-3 py-2 border border-neutral-300 font-sans text-xs focus:outline-none focus:border-neutral-900 leading-relaxed"
                      placeholder="Line 1 paragraph...&#10;Line 2 paragraph..."
                    />
                  </div>
                ) : (
                  <div className="font-sans text-sm md:text-base text-neutral-600 leading-relaxed space-y-4 text-left font-normal normal-case">
                    {profileSettings?.aboutParagraphs && profileSettings.aboutParagraphs.length > 0 ? (
                      profileSettings.aboutParagraphs.map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))
                    ) : (
                      <>
                        <p>
                          Hello! I'm a <span className="text-neutral-900 font-semibold">Computer Science student</span> at the University of the Cordilleras.
                        </p>
                        <p>
                          My interests sit at <span className="text-neutral-900 font-semibold">UI/UX Design</span>, where design meets behavior; <span className="text-neutral-900 font-semibold">Cryptography</span>, where math meets security; and <span className="text-neutral-900 font-semibold">Theoretical Computer Science</span>, where logic meets the limits of what's computable.
                        </p>
                        <p>
                          I enjoy understanding things deeply and not just how to build them, but why they work. This drive is reflected in every cryptographic system, low-poly 3D render, or visual design draft I compose.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

            {/* SKILLS BOX LISTING */}
            <div className="border border-neutral-200 bg-white p-6 text-left relative shadow-sm w-full">
              <h3 className="font-syne font-black text-xl text-neutral-900 uppercase tracking-tight border-b border-neutral-100 pb-3 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-verdant-yellow" />
                <span>PROFESSIONAL SKILLS</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Design Category */}
                <div className="border border-neutral-200 p-4 bg-neutral-50/60 flex flex-col justify-between">
                  <div>
                    <h4 className="font-mono text-[11px] text-neutral-900 font-bold tracking-[0.18em] uppercase mb-3">
                      // 01. DESIGN & PROTOTYPING
                    </h4>
                    <ul className="space-y-2.5 text-xs font-sans text-neutral-700">
                      {skillsList
                        .filter(s => s.category === "Design")
                        .map((skill) => (
                          <li key={skill.id} className="flex items-center gap-2 group/skill justify-between">
                            <div className="flex items-center gap-2 flex-grow">
                              <span className="w-1.5 h-1.5 bg-verdant-yellow shrink-0" />
                              {isAdmin && onUpdateSettings ? (
                                <input 
                                  type="text"
                                  value={skill.name}
                                  onChange={(e) => handleUpdateSkill(skill.id, e.target.value)}
                                  className="bg-transparent border-b border-neutral-300 focus:border-neutral-900 font-sans text-neutral-900 focus:outline-none w-full"
                                />
                              ) : (
                                <span>{skill.name}</span>
                              )}
                            </div>
                            
                            {isAdmin && onUpdateSettings && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSkill(skill.id)}
                                className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                                title="Delete skill"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>

                  {isAdmin && onUpdateSettings && (
                    <button
                      type="button"
                      onClick={() => handleCreateSkill("Design")}
                      className="mt-4 border border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 py-1 text-[9px] font-mono uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>ADD DESIGN SKILL</span>
                    </button>
                  )}
                </div>

                {/* Engineering Category */}
                <div className="border border-neutral-200 p-4 bg-neutral-50/60 flex flex-col justify-between">
                  <div>
                    <h4 className="font-mono text-[11px] text-neutral-900 font-bold tracking-[0.18em] uppercase mb-3">
                      // 02. ENGINEERING CORE
                    </h4>
                    <ul className="space-y-2.5 text-xs font-sans text-neutral-700">
                      {skillsList
                        .filter(s => s.category === "Engineering")
                        .map((skill) => (
                          <li key={skill.id} className="flex items-center gap-2 group/skill justify-between">
                            <div className="flex items-center gap-2 flex-grow">
                              <span className="w-1.5 h-1.5 bg-neutral-900 shrink-0" />
                              {isAdmin && onUpdateSettings ? (
                                <input 
                                  type="text"
                                  value={skill.name}
                                  onChange={(e) => handleUpdateSkill(skill.id, e.target.value)}
                                  className="bg-transparent border-b border-neutral-300 focus:border-neutral-900 font-sans text-neutral-900 focus:outline-none w-full"
                                />
                              ) : (
                                <span>{skill.name}</span>
                              )}
                            </div>
                            
                            {isAdmin && onUpdateSettings && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSkill(skill.id)}
                                className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                                title="Delete skill"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>

                  {isAdmin && onUpdateSettings && (
                    <button
                      type="button"
                      onClick={() => handleCreateSkill("Engineering")}
                      className="mt-4 border border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 py-1 text-[9px] font-mono uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>ADD CORE SKILL</span>
                    </button>
                  )}
                </div>

                {/* Productivity Category */}
                <div className="border border-neutral-200 p-4 bg-neutral-50/60 flex flex-col justify-between">
                  <div>
                    <h4 className="font-mono text-[11px] text-neutral-900 font-bold tracking-[0.18em] uppercase mb-3">
                      // 03. DATA & CLOUD SYSTEMS
                    </h4>
                    <ul className="space-y-2.5 text-xs font-sans text-neutral-700">
                      {skillsList
                        .filter(s => s.category === "Productivity")
                        .map((skill) => (
                          <li key={skill.id} className="flex items-center gap-2 group/skill justify-between">
                            <div className="flex items-center gap-2 flex-grow">
                              <span className="w-1.5 h-1.5 bg-neutral-900 shrink-0" />
                              {isAdmin && onUpdateSettings ? (
                                <input 
                                  type="text"
                                  value={skill.name}
                                  onChange={(e) => handleUpdateSkill(skill.id, e.target.value)}
                                  className="bg-transparent border-b border-neutral-300 focus:border-neutral-900 font-sans text-neutral-900 focus:outline-none w-full"
                                />
                              ) : (
                                <span>{skill.name}</span>
                              )}
                            </div>
                            
                            {isAdmin && onUpdateSettings && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSkill(skill.id)}
                                className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                                title="Delete skill"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>

                  {isAdmin && onUpdateSettings && (
                    <button
                      type="button"
                      onClick={() => handleCreateSkill("Productivity")}
                      className="mt-4 border border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 py-1 text-[9px] font-mono uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>ADD SYSTEMS SKILL</span>
                    </button>
                  )}
                </div>

                {/* General/Cognitive Category */}
                <div className="border border-neutral-200 p-4 bg-neutral-50/60 flex flex-col justify-between">
                  <div>
                    <h4 className="font-mono text-[11px] text-neutral-900 font-bold tracking-[0.18em] uppercase mb-3">
                      // 04. COGNITIVE & GENERAL
                    </h4>
                    <ul className="space-y-2.5 text-xs font-sans text-neutral-700">
                      {skillsList
                        .filter(s => s.category === "General")
                        .map((skill) => (
                          <li key={skill.id} className="flex items-center gap-2 group/skill justify-between">
                            <div className="flex items-center gap-2 flex-grow">
                              <span className="w-1.5 h-1.5 bg-neutral-900 shrink-0" />
                              {isAdmin && onUpdateSettings ? (
                                <input 
                                  type="text"
                                  value={skill.name}
                                  onChange={(e) => handleUpdateSkill(skill.id, e.target.value)}
                                  className="bg-transparent border-b border-neutral-300 focus:border-neutral-900 font-sans text-neutral-900 focus:outline-none w-full"
                                />
                              ) : (
                                <span>{skill.name}</span>
                              )}
                            </div>
                            
                            {isAdmin && onUpdateSettings && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSkill(skill.id)}
                                className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                                title="Delete skill"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>

                  {isAdmin && onUpdateSettings && (
                    <button
                      type="button"
                      onClick={() => handleCreateSkill("General")}
                      className="mt-4 border border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 py-1 text-[9px] font-mono uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>ADD GENERAL SKILL</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Right Column Stack: CERTIFICATES & CREDENTIAL TIMELINE */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            
            {/* Certifications container with dynamic items */}
            {!profileSettings?.hideCertifications && (
              <div className="border border-neutral-200 bg-white p-6 text-left relative shadow-sm w-full">
                <h3 className="font-syne font-black text-xl text-neutral-900 uppercase tracking-tight border-b border-neutral-100 pb-3 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-verdant-yellow" />
                    <span>CERTIFICATIONS</span>
                  </span>
                  
                  {/* Direct hide from screen trigger */}
                  {isAdmin && onUpdateSettings && (
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ ...profileSettings, hideCertifications: true })}
                      className="bg-red-800 text-white hover:bg-red-700 font-mono text-[8px] font-bold px-2 py-1 border border-slate-900 cursor-pointer flex items-center gap-1"
                      title="Hide Certificates container"
                    >
                      <X className="w-2.5 h-2.5" />
                      <span>REMOVE BLOCK</span>
                    </button>
                  )}
                </h3>

                <div className="flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar w-full">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="border border-neutral-200 hover:border-neutral-900 bg-white p-3.5 relative flex flex-col gap-1.5 font-mono transition-colors">
                      
                      {isAdmin && onUpdateSettings ? (
                        <div className="flex flex-col gap-1 w-full text-left">
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={cert.badge}
                              onChange={(e) => handleUpdateCert(cert.id, { badge: e.target.value })}
                              className="bg-neutral-50 border border-neutral-300 p-1 text-[8px] font-bold text-neutral-900 uppercase w-20 focus:outline-none"
                              placeholder="Badge"
                            />
                            <input 
                              type="text"
                              value={cert.date}
                              onChange={(e) => handleUpdateCert(cert.id, { date: e.target.value })}
                              className="bg-neutral-50 border border-neutral-300 p-1 text-[8px] font-bold text-neutral-500 uppercase w-full focus:outline-none text-right"
                              placeholder="Date"
                            />
                          </div>

                          <input 
                            type="text"
                            value={cert.title}
                            onChange={(e) => handleUpdateCert(cert.id, { title: e.target.value })}
                            className="bg-neutral-50 border border-neutral-300 p-1 text-xs font-bold text-neutral-900 uppercase w-full focus:outline-none my-0.5"
                            placeholder="Certificate Title"
                          />

                          <div className="flex justify-between items-center gap-2">
                            <input 
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => handleUpdateCert(cert.id, { issuer: e.target.value })}
                              className="bg-neutral-50 border border-neutral-300 p-1 text-[9px] font-medium text-neutral-600 uppercase w-full focus:outline-none"
                              placeholder="Issuer Org"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteCert(cert.id)}
                              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start gap-2">
                            <span className="border border-neutral-200 bg-neutral-50 text-neutral-700 text-[8px] font-bold px-2 py-0.5 tracking-wider uppercase select-none rounded-none shrink-0">
                              {cert.badge}
                            </span>
                            <span className="text-neutral-500 text-[9px] font-semibold uppercase shrink-0 tabular-nums">
                              {cert.date}
                            </span>
                          </div>
                          <h4 className="text-neutral-900 font-bold text-xs leading-snug tracking-wide uppercase mt-1">
                            {cert.title}
                          </h4>
                          <p className="text-neutral-500 text-[9.5px] uppercase font-normal tracking-tight">
                            {cert.issuer}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {isAdmin && onUpdateSettings && (
                  <button
                    type="button"
                    onClick={handleCreateCert}
                    className="mt-4 w-full border border-neutral-300 text-neutral-800 hover:border-neutral-900 hover:text-neutral-900 py-2 text-[10px] font-mono uppercase flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD CERTIFICATE TO LIST</span>
                  </button>
                )}
              </div>
            )}

            {/* Visual illustrative workspace desk drafting mockup */}
            {!profileSettings?.hideWorkspacePreview && (
              <div className="border border-neutral-200 bg-neutral-950 p-2 relative w-full group/blueprint">
                
                {/* Direct hide trigger in admin mode */}
                {isAdmin && onUpdateSettings && (
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ ...profileSettings, hideWorkspacePreview: true })}
                    className="absolute top-4 right-4 z-40 bg-red-800 text-white hover:bg-red-700 font-mono text-[9px] font-black px-2 py-1.5 border border-slate-900 cursor-pointer flex items-center gap-1 opacity-0 group-hover/blueprint:opacity-100 transition-opacity"
                    title="Remove Blueprint Widget"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                    <span>REMOVE BLUEPRINT</span>
                  </button>
                )}

                <div className="aspect-video relative bg-neutral-950 overflow-hidden flex flex-col justify-end p-3 border border-neutral-800">
                  <svg className="absolute inset-0 w-full h-full text-neutral-700/50 pointer-events-none" viewBox="0 0 100 60" fill="none" stroke="currentColor">
                    <line x1="5" y1="50" x2="95" y2="50" strokeWidth="1" />
                    <rect x="25" y="15" width="50" height="30" rx="1" strokeWidth="1.2" />
                    <line x1="68" y1="18" x2="80" y2="5" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="28" cy="20" r="2.5" fill="currentColor" />
                    <path d="M35 30 C45 20, 55 40, 65 30" strokeWidth="0.8" strokeDasharray="1 1" />
                  </svg>

                  <span className="font-mono text-[8.5px] text-neutral-400 uppercase ml-auto tracking-[0.2em] opacity-80 z-10">
                    CS & DESIGN FOCUS
                  </span>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Philosophy quotation section */}
        <section className="mt-16 border-t border-neutral-200 pt-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
          
          <div className="md:col-span-8 flex flex-col gap-3 w-full">
            <span className="font-mono text-[9.5px] font-bold text-neutral-500 uppercase tracking-[0.22em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#D5001C]" />
              <span>GUIDING INSIGHT</span>
            </span>
            
            {isAdmin && onUpdateSettings ? (
              <div className="flex flex-col gap-3 w-full">
                <div>
                  <span className="font-mono text-[8px] text-[#D5001C] font-black uppercase tracking-widest block mb-1">
                    📝 Edit Quote Body Copy:
                  </span>
                  <textarea
                    rows={2}
                    value={localQuoteText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalQuoteText(val);
                      onUpdateSettings({ ...profileSettings, quoteText: val });
                    }}
                    className="w-full bg-white text-neutral-900 font-syne font-black text-sm uppercase p-2 border border-neutral-300 focus:outline-none focus:border-neutral-900"
                    placeholder="ENTER QUOTE DIRECTLY..."
                  />
                </div>
                <div>
                  <span className="font-mono text-[8px] text-verdant-yellow font-black uppercase tracking-widest block mb-1">
                    📝 Edit Quote Author:
                  </span>
                  <input
                    type="text"
                    value={localQuoteAuthor}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalQuoteAuthor(val);
                      onUpdateSettings({ ...profileSettings, quoteAuthor: val });
                    }}
                    className="w-full bg-white text-neutral-600 font-mono text-xs uppercase p-2 border border-neutral-300 focus:outline-none focus:border-neutral-900"
                    placeholder="ENTER AUTHOR..."
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-syne font-black text-xl md:text-2xl text-neutral-900 leading-snug">
                  "{profileSettings?.quoteText || "GREAT THINGS ARE DONE BY A SERIES OF SMALL THINGS BROUGHT TOGETHER."}"
                </h3>
                <p className="font-mono text-xs text-neutral-500 font-semibold tracking-wider uppercase mt-2">
                  — {profileSettings?.quoteAuthor || "VINCENT VAN GOGH"}
                </p>
              </>
            )}
          </div>

          <div className="md:col-span-4 relative">
            <div className="border border-neutral-200 bg-white p-6 text-left shadow-sm">
              <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em] block mb-2">DEDICATION</span>
              {isAdmin && onUpdateSettings ? (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="font-mono text-[7px] text-verdant-yellow font-bold uppercase tracking-widest text-left block mb-0.5">
                    📝 Dedication Card Title:
                  </span>
                  <input
                    type="text"
                    value={localDedicationTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalDedicationTitle(val);
                      onUpdateSettings({ ...profileSettings, dedicationTitle: val });
                    }}
                    className="w-full bg-neutral-50 text-neutral-900 font-syne font-bold text-xs uppercase p-1.5 border border-neutral-300 focus:outline-none focus:border-neutral-900"
                    placeholder="DEDICATION CARD TITLE..."
                  />
                  <span className="font-mono text-[7px] text-verdant-yellow font-bold uppercase tracking-widest text-left block mt-1.5 mb-0.5">
                    📝 Dedication Card Text:
                  </span>
                  <textarea
                    rows={3}
                    value={localDedicationText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalDedicationText(val);
                      onUpdateSettings({ ...profileSettings, dedicationText: val });
                    }}
                    className="w-full bg-neutral-50 text-neutral-700 text-xs p-1.5 border border-neutral-300 focus:outline-none focus:border-neutral-900 resize-none"
                    placeholder="DEDICATION DESCRIPTION..."
                  />
                </div>
              ) : (
                <>
                  <h4 className="font-syne font-black text-base text-neutral-900 tracking-wider uppercase mb-2">
                    {profileSettings?.dedicationTitle || "INCREMENTAL PROGRESS"}
                  </h4>
                  <p className="font-sans text-xs text-neutral-600 leading-relaxed font-normal">
                    {profileSettings?.dedicationText || "Building secure networks, modeling 3D space, and shaping digital user paths with clean pixel harmony."}
                  </p>
                </>
              )}
            </div>
          </div>

        </section>

        {/* CTA bottom row */}
        <footer className="mt-16 flex flex-wrap gap-4 justify-center items-center" id="init-contact">
          <button
            onClick={() => onChangeTab("CONNECT")}
            style={{ backgroundColor: "#0A0A0A", color: "#FFFFFF" }}
            className="cursor-pointer hover:!bg-[#D5001C] text-white font-mono text-xs font-bold tracking-[0.2em] uppercase px-7 py-3.5 shadow-sm transition-all select-none"
          >
            START A PROJECT
          </button>

          <button
            onClick={handleDownloadDossier}
            className="group cursor-pointer bg-white border border-neutral-300 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white text-neutral-900 font-mono text-xs font-bold tracking-[0.2em] uppercase px-7 py-3.5 inline-flex items-center gap-2 transition-all select-none shadow-sm"
          >
            <FileText className="w-4 h-4 text-neutral-500 group-hover:text-white" />
            <span>DOWNLOAD PROFILE (.TXT)</span>
          </button>
        </footer>

      </div>
    </div>
  );
}
