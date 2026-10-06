/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Instagram, Linkedin, Globe, Rss } from "lucide-react";
import { ActiveTab, ProfileSettings } from "../types";

interface FooterProps {
  onChangeTab?: (tab: ActiveTab) => void;
  profileSettings?: ProfileSettings;
  isAdmin?: boolean;
}

export default function Footer({ onChangeTab, profileSettings, isAdmin }: FooterProps) {
  const [showAdminTrigger, setShowAdminTrigger] = useState(false);
  const hasAdmin = isAdmin || (typeof window !== "undefined" && localStorage.getItem("portfolio_admin_auth") === "true");

  const socialIcons = [
    { icon: <Instagram className="w-3.5 h-3.5" />, link: profileSettings?.instagramUrl || "https://instagram.com/" },
    { icon: <Linkedin className="w-3.5 h-3.5" />, link: profileSettings?.linkedinUrl || "https://linkedin.com/" },
    { icon: <Globe className="w-3.5 h-3.5" />, link: profileSettings?.websiteUrl || "https://juliaristy.me/" }
  ];

  return (
    <footer className="border-t border-neutral-200/80 bg-white py-6 px-6 md:px-12 relative z-10 text-[11px]" id="global-footer">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-neutral-500">
        
        {/* Left Side: Legal Copyright and attribution lines */}
        <div className="text-center md:text-left flex flex-col md:flex-row items-center gap-1.5 md:gap-3">
          <span 
            onClick={() => setShowAdminTrigger(prev => !prev)}
            className="text-neutral-900 uppercase font-bold tracking-wider cursor-pointer select-none hover:text-[#D5001C] transition-colors"
            title="Press to authenticate or access dashboard"
          >
            © {new Date().getFullYear()} JULIARISTY CASTILLO
          </span>
          {(hasAdmin || showAdminTrigger) && (
            <button
              onClick={() => onChangeTab?.("ADMIN")}
              className="text-white hover:bg-[#D5001C] font-mono font-bold uppercase text-[9px] tracking-widest ml-1 sm:ml-2 bg-neutral-900 px-2.5 py-1 border border-neutral-800 cursor-pointer select-none transition-all active:scale-95 leading-none shrink-0 flex items-center gap-1.5 shadow-sm"
              id="hidden-portal-access-btn"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5001C] inline-block animate-pulse" />
              <span>[ ADMIN DASHBOARD ]</span>
            </button>
          )}
          <span className="hidden md:inline-block text-neutral-300">|</span>
          <span className="uppercase tracking-widest text-[9.5px] text-neutral-400">
            
          </span>
        </div>

        {/* Right Side: Quick secondary feed links */}
        <div className="flex items-center flex-wrap gap-4 justify-center" id="footer-links-group">
          {/* Social symbols */}
          <div className="flex items-center gap-2 border-r border-neutral-200 pr-4 mr-1">
            {socialIcons.map((social, idx) => (
              <a
                key={idx}
                href={social.link}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 hover:text-neutral-900 text-neutral-400 flex items-center justify-center transition-colors"
              >
                {social.icon}
              </a>
            ))}
          </div>

          <button className="text-neutral-500 hover:text-neutral-900 uppercase tracking-wider text-[10px] cursor-pointer select-none transition-colors">
            ARCHIVE
          </button>
          <button className="text-neutral-500 hover:text-neutral-900 uppercase tracking-wider text-[10px] cursor-pointer select-none transition-colors">
            FEED
          </button>
          <button className="text-neutral-500 hover:text-neutral-900 uppercase tracking-wider text-[10px] cursor-pointer select-none flex items-center gap-1 transition-colors">
            <Rss className="w-3 h-3 text-[#D5001C]" />
            <span>RSS</span>
          </button>
          <a 
            href={`mailto:${profileSettings?.contactEmail || "juliaristycastillo0@gmail.com"}`} 
            className="text-neutral-500 hover:text-neutral-900 uppercase tracking-wider text-[10px] cursor-pointer select-none transition-colors"
          >
            EMAIL
          </a>
        </div>

      </div>
    </footer>
  );
}
