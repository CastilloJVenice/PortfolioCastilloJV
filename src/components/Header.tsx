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
  isAdmin?: boolean;
}

export default function Header({ activeTab, onChangeTab, profileSettings, isAdmin }: HeaderProps) {
  const primaryTabs: { id: ActiveTab; label: string }[] = [
    { id: "HOME", label: "HOME" },
    { id: "PROJECTS", label: "PROJECTS" },
    { id: "ABOUT", label: "ABOUT" },
  ];

  const casingClass = profileSettings?.textCasingStyle === "normal-case" ? "" : "uppercase";
  const hasAdminAuth = isAdmin || (typeof window !== "undefined" && localStorage.getItem("portfolio_admin_auth") === "true");

  return (
    <header className="border-b border-neutral-200/80 bg-white/90 backdrop-blur-md py-3.5 px-6 md:px-12 sticky top-0 z-50 shadow-[0_1px_2px_rgba(0,0,0,0.03)]" id="main-header-element">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branded Title */}
        <button
          onClick={() => onChangeTab("HOME")}
          className="group flex flex-col items-start select-none cursor-pointer text-left focus:outline-none"
          id="header-branding-logo"
        >
          <span className={`font-syne font-black text-xl md:text-2xl leading-none tracking-tight text-neutral-900 group-hover:text-[#D5001C] transition-colors ${casingClass}`}>
            {profileSettings?.fullName || "JULIARISTY"}
          </span>
          <span className="font-mono text-[8.5px] font-bold text-neutral-500 uppercase tracking-[0.22em] mt-1">
            PORTFOLIO // LAB
          </span>
        </button>

        {/* Tab Menus and Connect CTA */}
        <div className="flex flex-wrap items-center gap-3 md:gap-6 font-mono text-xs font-semibold" id="header-tabs-group">
          <nav className="flex items-center gap-1 md:gap-2">
            {primaryTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const tabLabel = tab.label;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeTab(tab.id)}
                  className={`relative px-3.5 py-1.5 cursor-pointer transition-colors duration-150 select-none uppercase tracking-[0.16em] text-[11px] ${
                    isActive 
                      ? "text-neutral-900 font-bold" 
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                  id={`header-tab-${tab.id.toLowerCase()}`}
                >
                  <span className="relative z-10">{tabLabel}</span>
                  {isActive && (
                    <motion.div
                      layoutId="headerActiveLine"
                      className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#D5001C]"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Connect Action Button (Guaranteed Carbon Black & Guards Red - Never Green) */}
          <button
            onClick={() => onChangeTab("CONNECT")}
            style={{
              backgroundColor: activeTab === "CONNECT" ? "#D5001C" : "#0A0A0A",
              color: "#FFFFFF"
            }}
            className="cursor-pointer px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-all focus:outline-none select-none hover:!bg-[#D5001C] hover:!text-white border border-neutral-900 shadow-sm"
            id="header-connect-cta-btn"
          >
            CONNECT
          </button>

          {/* Dedicated Admin Dashboard quick-return button when authenticated */}
          {hasAdminAuth && (
            <button
              onClick={() => onChangeTab("ADMIN")}
              style={{
                backgroundColor: activeTab === "ADMIN" ? "#D5001C" : "#18181B",
                color: "#FFFFFF"
              }}
              className="cursor-pointer px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] transition-all select-none flex items-center gap-2 border border-neutral-800 hover:!bg-[#D5001C] hover:border-[#D5001C] shadow-sm"
              id="header-admin-dashboard-btn"
              title="Return to Admin Dashboard"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" />
              <span>DASHBOARD</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
