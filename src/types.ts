/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActiveTab = "HOME" | "PROJECTS" | "ABOUT" | "CONNECT" | "ADMIN";

export interface Project {
  id: string;
  title: string;
  category: string; // Used for Category / Tab sort filter
  tag: string;      // Tech tags string (e.g. "React / TypeScript / Vite")
  badge: "CASE STUDY" | "EXPERIMENTAL" | "MASTERPRINT" | string;
  year: string;
  description: string;
  extendedDescription?: string; // Optional deep description when workspace expands
  accentColor: string;
  imageType: "lunar" | "void" | "logic" | string; // support base64 images as well
  isCustom?: boolean;
  link?: string;    // Optional external link (e.g. Streamlit app)
  additionalImages?: string[]; // Multiple additional base64 project photos
  videoUrl?: string; // Optional project video link (e.g., YouTube embed or direct link)
}

export interface JournalContent {
  title: string;
  date: string;
  slug: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface ProfileSettings {
  fullName: string;
  lastNameHighlight: string;
  headline: string;
  biography: string; // Dynamic presentation
  aboutParagraphs: string[]; // Dynamic about paragraphs list
  contactEmail: string;
  instagramUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  profileImageBase64?: string; // Optional custom base64 image representation
  
  // Custom Style parameters (Studio Customizer fields)
  fontFamilyHeader?: "Syne" | "Space Grotesk" | "Plus Jakarta Sans" | "JetBrains Mono" | "Playfair Display" | string;
  fontFamilyBody?: "Plus Jakarta Sans" | "JetBrains Mono" | string;
  bgAccentStyle?: "grid-mesh" | "checker-grid" | "solid-plain" | "radial-grain" | string;
  textCasingStyle?: "uppercase" | "normal-case" | string;
  themeColorPrimary?: string; // Hex for mint color
  themeColorSecondary?: string; // Hex for yellow color
  customCanvasBg?: string; // Hex for canvas backdrop
  customCardBg?: string; // Hex for cards backdrop
  themeColorTextHeader?: string; // Hex for primary headers/title text
  themeColorTextBody?: string; // Hex for secondary narrative text
  
  // Advanced Live Scrapbook Features
  customBgVideoUrl?: string; // Peaceful ocean/aesthetic loop mp4
  stickers?: Sticker[]; // Placed decorative stickers

  // Dynamic user data components for direct live edits
  skills?: SkillItem[];
  certs?: CertItem[];
  quoteText?: string;
  quoteAuthor?: string;
  
  // Custom dedication card variables
  dedicationTitle?: string;
  dedicationText?: string;

  // Infinite ticker tape customized words
  tickerPhrases?: string[];

  // Widget visibility toggles (allows removing original widgets on page)
  hideHeroPolaroid?: boolean;
  hideProcessTicker?: boolean;
  hideWorkspacePreview?: boolean;
  hideSelectedProjects?: boolean;
  hideCertifications?: boolean;
}

export interface SkillItem {
  id: string;
  name: string;
  category: "Design" | "Engineering" | "Productivity" | "General" | string;
}

export interface CertItem {
  id: string;
  title: string;
  date: string;
  issuer: string;
  badge: string;
}

export interface Sticker {
  id: string;
  type?: "sticker" | "text" | "shape" | "widget" | "image";
  src: string; // preloaded key (e.g. 'star', 'daisy') or custom base64 image URL
  x: number;   // coordinate placement percent (0-100)
  y: number;   // coordinate placement percent (0-100)
  scale: number; // multiplier scale, default 1.0
  rotation: number; // rotate angle, default 0
  tab: string;

  // Rich Live Designer Extension Properties
  textValue?: string; // Editable text
  textColor?: string; // Hex color override
  fontFamily?: string; // Custom header/body typography font selection
  textSizePx?: number; // Interactive scale slider size overlay
  fontWeight?: "normal" | "medium" | "bold" | "black";
  shapeType?: "circle" | "rectangle" | "line" | "star-badge"; // Geometries
  width?: number; // Custom pixel sizes
  height?: number;
  widgetType?: "clock" | "music" | "tech-counter" | "quote" | "contact-badge";
  zIndex?: number; // Depth layers control
}
