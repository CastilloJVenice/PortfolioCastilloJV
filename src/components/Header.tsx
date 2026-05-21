/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ActiveTab, ProfileSettings } from "../types";

interface HeaderProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  profileSettings?: ProfileSettings;
}

export default function Header({ activeTab, onChangeTab, profileSettings }: HeaderProps) {
  const primaryTabs: { id: ActiveTab; label: string }[] = [
    { id: "HOME", label: "HOME" },
    { id: "PROJECTS", label: "PROJECTS" },
    { id: "ABOUT", label: "ABOUT" },
  ];

  const casingClass = profileSettings?.textCasingStyle === "normal-case" ? "" : "uppercase";

  return (
    <header className="border-b-[3px] border-verdant-cream bg-verdant-dark/95 backdrop-blur-md py-4 px-6 md:px-12 sticky top-0 z-50 overflow-hidden shadow-sm" id="main-header-element">
      {/* Background soft artistic brush glow inside header */}
      <div className="absolute top-0 right-0 w-64 h-24 bg-verdant-mint/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branded "CREATIVE LEAD" Title Badge */}
        <button
          onClick={() => onChangeTab("HOME")}
          className="group flex flex-col items-start select-none cursor-pointer text-left focus:outline-none"
          id="header-branding-logo"
        >
          <span className={`font-syne font-black text-xl md:text-2xl leading-[0.85] tracking-tight text-verdant-cream group-hover:text-verdant-mint transition-colors ${casingClass}`}>
            {profileSettings?.fullName || "JULIARISTY"}
          </span>
          <span className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest mt-1">
            PORTFOLIO
          </span>
        </button>

        {/* Tab Menus and Connect CTA */}
        <div className="flex flex-wrap items-center gap-4 md:gap-8 font-mono text-xs font-bold" id="header-tabs-group">
          <nav className="flex items-center gap-1 md:gap-3">
            {primaryTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const tabLabel = profileSettings?.textCasingStyle === "normal-case" ? tab.label.toLowerCase() : tab.label;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeTab(tab.id)}
                  className={`relative px-3 py-1.5 cursor-pointer transition-all duration-200 select-none ${isActive ? "text-verdant-yellow" : "text-verdant-gray hover:text-verdant-cream"} ${casingClass}`}
                  id={`header-tab-${tab.id.toLowerCase()}`}
                >
                  <span className="relative z-10 tracking-widest">{tabLabel}</span>
                  {isActive && (
                    <motion.div
                      layoutId="headerActiveLine"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-verdant-yellow"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Connected Button */}
          <button
            onClick={() => onChangeTab("CONNECT")}
            className={`cursor-pointer px-5 py-2 font-mono text-[11px] font-black uppercase tracking-widest transition-all focus:outline-none select-none ${
              activeTab === "CONNECT"
                ? "bg-verdant-yellow text-verdant-dark ring-2 ring-verdant-yellow"
                : "bg-verdant-mint text-verdant-dark hover:bg-verdant-lime hover:scale-105"
            }`}
            id="header-connect-cta-btn"
          >
            CONNECT
          </button>
        </div>
      </div>
    </header>
  );
}
