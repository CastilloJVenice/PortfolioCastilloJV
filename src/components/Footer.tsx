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
}

export default function Footer({ onChangeTab, profileSettings }: FooterProps) {
  const [showAdminTrigger, setShowAdminTrigger] = useState(false);

  const socialIcons = [
    { icon: <Instagram className="w-3.5 h-3.5" />, link: profileSettings?.instagramUrl || "https://instagram.com/" },
    { icon: <Linkedin className="w-3.5 h-3.5" />, link: profileSettings?.linkedinUrl || "https://linkedin.com/" },
    { icon: <Globe className="w-3.5 h-3.5" />, link: profileSettings?.websiteUrl || "https://juliaristy.me/" }
  ];

  return (
    <footer className="border-t-2 border-dashed border-verdant-cream/20 bg-verdant-dark py-6 px-6 md:px-12 relative z-10 selection:bg-verdant-yellow text-[10px]" id="global-footer">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-verdant-gray">
        
        {/* Left Side: Creative Lead Legal Copyright and attribution lines */}
        <div className="text-center md:text-left flex flex-col md:flex-row items-center gap-1 md:gap-3">
          <span 
            onClick={() => setShowAdminTrigger(prev => !prev)}
            className="text-verdant-cream uppercase font-black cursor-pointer select-none pb-0.5 hover:text-verdant-yellow transition-colors"
            title="Press to authenticate"
          >
            © {new Date().getFullYear()} JULIARISTY.
          </span>
          {showAdminTrigger && (
            <button
              onClick={() => onChangeTab?.("ADMIN")}
              className="text-verdant-yellow hover:text-white font-mono font-black uppercase text-[8px] sm:text-[9px] tracking-widest ml-1 sm:ml-2 bg-[#DCA221]/15 px-2 py-1 border border-verdant-yellow/40 hover:bg-verdant-yellow cursor-pointer select-none transition-all active:scale-95 leading-none shrink-0"
              id="hidden-portal-access-btn"
            >
              [ ACCESS LAB PORTAL ]
            </button>
          )}
          <span className="hidden md:inline-block text-zinc-700">|</span>
          <span className="uppercase tracking-wider">
            ALL RIGHTS RESERVED. HAND-PAINTED IN CODE.
          </span>
        </div>

        {/* Right Side: Quick secondary feed links */}
        <div className="flex items-center flex-wrap gap-4 justify-center" id="footer-links-group">
          {/* Social symbols */}
          <div className="flex items-center gap-1.5 border-r border-zinc-800 pr-4 mr-2">
            {socialIcons.map((social, idx) => (
              <a
                key={idx}
                href={social.link}
                target="_blank"
                rel="noreferrer"
                className="w-5 h-5 rounded-none hover:text-white flex items-center justify-center transition-colors"
              >
                {social.icon}
              </a>
            ))}
          </div>

          <button className="hover:text-white uppercase cursor-pointer select-none">Archives</button>
          <button className="hover:text-white uppercase cursor-pointer select-none">Feed</button>
          <button className="hover:text-white uppercase cursor-pointer select-none flex items-center gap-1">
            <Rss className="w-3 h-3 text-verdant-yellow" />
            <span>RSS</span>
          </button>
          <a href={`mailto:${profileSettings?.contactEmail || "juliaristycastillo0@gmail.com"}`} className="hover:text-white uppercase cursor-pointer select-none">
            Email
          </a>
        </div>

      </div>
    </footer>
  );
}
