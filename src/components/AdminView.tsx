/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, DragEvent, ChangeEvent, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, FileUp, Sparkles, FolderPlus, LogOut, Check, AlertCircle, RefreshCw, Trash2, Edit3, User, Image, Link2, MessageSquare, Clock, Send, Mail, CheckCircle } from "lucide-react";
import { Project, ProfileSettings } from "../types";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, collection, onSnapshot, deleteDoc } from "firebase/firestore";

interface AdminViewProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onResetProjects: () => void;
  onDeleteProject: (id: string) => void;
  onChangeTab: (tab: any) => void;
  profileSettings: ProfileSettings;
  onUpdateProfile: (settings: ProfileSettings) => void;
  isAdmin?: boolean;
  onAuthChange?: (auth: boolean) => void;
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function shrinkImageToBase64(file: File, maxW = 550, maxH = 550, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
    };
    reader.onerror = () => {
      resolve("");
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminView({ 
  projects, 
  onAddProject, 
  onUpdateProject, 
  onResetProjects, 
  onDeleteProject, 
  onChangeTab,
  profileSettings,
  onUpdateProfile,
  isAdmin = false,
  onAuthChange
}: AdminViewProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("portfolio_admin_auth") === "true";
  });

  useEffect(() => {
    if (isAdmin !== isAuthenticated) {
      setIsAuthenticated(isAdmin);
    }
  }, [isAdmin]);
  const [accessKey, setAccessKey] = useState("");
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Active Admin Sub-tab
  const [adminTab, setAdminTab] = useState<"PROJECTS" | "PROFILE" | "INBOX" | "STYLE">("PROJECTS");

  // Visitor chats database tracker state
  const [messages, setMessages] = useState<any[]>([]);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub = onSnapshot(collection(db, "messages"), (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach(docSnap => {
        loaded.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort newest and unresolved first
      loaded.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setMessages(loaded);
    });
    return () => unsub();
  }, [isAuthenticated]);

  const handleDeleteMessage = async (msgId: string) => {
    if (window.confirm("ARE YOU SURE YOU WANT TO PERMANENTLY PURGE THIS MESSAGE FROM FIRESTORE SECURE LEDGER?")) {
      try {
        await deleteDoc(doc(db, "messages", msgId));
      } catch (err) {
        console.error("Purge failure:", err);
      }
    }
  };

  const handleSendEmailReply = async (msg: any) => {
    const text = replyTexts[msg.id];
    if (!text || !text.trim()) {
      alert("PLEASE ENTER REPLY COPY TEXT FIRST.");
      return;
    }

    const email = msg.email;
    const subject = encodeURIComponent(`RE: ${profileSettings.fullName} Portfolio Connection`);
    const body = encodeURIComponent(text);
    
    try {
      await setDoc(doc(db, "messages", msg.id), {
        ...msg,
        replied: true,
        replyContent: text,
        replyTimestamp: Date.now()
      }, { merge: true });

      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } catch (err) {
      console.error("Reply database tracking update failed:", err);
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }
  };

  // Local Profile Settings inputs
  const [pFullName, setPFullName] = useState(profileSettings.fullName);
  const [pLastNameHighlight, setPLastNameHighlight] = useState(profileSettings.lastNameHighlight);
  const [pHeadline, setPHeadline] = useState(profileSettings.headline);
  const [pBiography, setPBiography] = useState(profileSettings.biography);
  const [pPara1, setPPara1] = useState(profileSettings.aboutParagraphs[0] || "");
  const [pPara2, setPPara2] = useState(profileSettings.aboutParagraphs[1] || "");
  const [pPara3, setPPara3] = useState(profileSettings.aboutParagraphs[2] || "");
  const [pContactEmail, setPContactEmail] = useState(profileSettings.contactEmail);
  const [pInstagramUrl, setPInstagramUrl] = useState(profileSettings.instagramUrl);
  const [pLinkedinUrl, setPLinkedinUrl] = useState(profileSettings.linkedinUrl);
  const [pWebsiteUrl, setPWebsiteUrl] = useState(profileSettings.websiteUrl);
  const [pProfileImageBase64, setPProfileImageBase64] = useState<string | undefined>(profileSettings.profileImageBase64);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Interactive Live Style states
  const [pFontFamilyHeader, setPFontFamilyHeader] = useState(profileSettings.fontFamilyHeader || "Syne");
  const [pFontFamilyBody, setPFontFamilyBody] = useState(profileSettings.fontFamilyBody || "Plus Jakarta Sans");
  const [pBgAccentStyle, setPBgAccentStyle] = useState(profileSettings.bgAccentStyle || "grid-mesh");
  const [pTextCasingStyle, setPTextCasingStyle] = useState(profileSettings.textCasingStyle || "uppercase");
  const [pThemeColorPrimary, setPThemeColorPrimary] = useState(profileSettings.themeColorPrimary || "#306634");
  const [pThemeColorSecondary, setPThemeColorSecondary] = useState(profileSettings.themeColorSecondary || "#DCA221");
  const [pCustomCanvasBg, setPCustomCanvasBg] = useState(profileSettings.customCanvasBg || "#FAF8F5");
  const [pCustomCardBg, setPCustomCardBg] = useState(profileSettings.customCardBg || "#F2EEE3");

  // Sync inputs with profileSettings whenever values change globally (e.g. from parent/reset)
  useEffect(() => {
    setPFullName(profileSettings.fullName);
    setPLastNameHighlight(profileSettings.lastNameHighlight);
    setPHeadline(profileSettings.headline);
    setPBiography(profileSettings.biography);
    setPPara1(profileSettings.aboutParagraphs[0] || "");
    setPPara2(profileSettings.aboutParagraphs[1] || "");
    setPPara3(profileSettings.aboutParagraphs[2] || "");
    setPContactEmail(profileSettings.contactEmail);
    setPInstagramUrl(profileSettings.instagramUrl);
    setPLinkedinUrl(profileSettings.linkedinUrl);
    setPWebsiteUrl(profileSettings.websiteUrl);
    setPProfileImageBase64(profileSettings.profileImageBase64);

    setPFontFamilyHeader(profileSettings.fontFamilyHeader || "Syne");
    setPFontFamilyBody(profileSettings.fontFamilyBody || "Plus Jakarta Sans");
    setPBgAccentStyle(profileSettings.bgAccentStyle || "grid-mesh");
    setPTextCasingStyle(profileSettings.textCasingStyle || "uppercase");
    setPThemeColorPrimary(profileSettings.themeColorPrimary || "#306634");
    setPThemeColorSecondary(profileSettings.themeColorSecondary || "#DCA221");
    setPCustomCanvasBg(profileSettings.customCanvasBg || "#FAF8F5");
    setPCustomCardBg(profileSettings.customCardBg || "#F2EEE3");
  }, [profileSettings]);

  // Upload Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [extendedDescription, setExtendedDescription] = useState("");
  const [category, setCategory] = useState("Game Development");
  const [techTags, setTechTags] = useState("");
  const [badge, setBadge] = useState<"CASE STUDY" | "EXPERIMENTAL" | "MASTERPRINT">("CASE STUDY");
  const [year, setYear] = useState(() => new Date().getFullYear().toString());
  const [accentColor, setAccentColor] = useState("#306634");
  const [imageType, setImageType] = useState("lunar");
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [projectLink, setProjectLink] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  const [adminUser, setAdminUser] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Drag and Drop states
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminUser || !accessKey) return;
    setIsVerifying(true);
    setAuthError("");

    try {
      const cleanUser = adminUser.trim().toLowerCase();
      const cleanPass = accessKey.trim();

      const inputUserHash = await sha256(cleanUser);
      const inputPassHash = await sha256(cleanPass);
      
      const adminDocRef = doc(db, "profile", "admin");
      let adminSnap = await getDoc(adminDocRef);
      
      const correctAdminData = {
        usernameHash: "a3850a2abbfd6269eb9f74b67c8d3b254fccd043bc06c344a150e6ee5a6b7348", // hash of "julcastillo987"
        passwordHash: "00f7795ad165e91d7e52282ea0556c9ba7a3b086469f79bdad41d1fd388d4fba", // hash of "happypassword"
        legacyHashes: [
          "37fb2fd28d038c44276103dbdd9e779dce3961c13bf8287163ff6326a7ac6eef", // hash of "juliaristy123"
          "1a824bd14710944b28623c50b6a291ebdaf6fa3be9d773800e843b7ba418b7fd"  // hash of "castillo2026"
        ]
      };
      
      if (!adminSnap.exists() || adminSnap.data()?.usernameHash === "c1356bf1ac00fa1b703e223bfb2a26563604b0458dfda0fdd1ffd8a14ecb3917") {
        // Automatically bootstrap secure admin parameters on user's database or migrate old hashes
        await setDoc(adminDocRef, correctAdminData);
        adminSnap = await getDoc(adminDocRef);
      }

      const adminData = adminSnap.data();
      const dbUserHash = adminData?.usernameHash || "a3850a2abbfd6269eb9f74b67c8d3b254fccd043bc06c344a150e6ee5a6b7348";
      const dbPassHash = adminData?.passwordHash || "00f7795ad165e91d7e52282ea0556c9ba7a3b086469f79bdad41d1fd388d4fba";
      const dbLegacyHashes = adminData?.legacyHashes || [];

      const isUserMatch = inputUserHash === dbUserHash;
      const isPassMatch = inputPassHash === dbPassHash || dbLegacyHashes.includes(inputPassHash);

      // Console cryptographic debugger for diagnostic clarity
      console.log("=== PORTFOLIO ADMIN KEY-EXCHANGE DIAGNOSTICS ===");
      console.log("Entered Username (Cleaned):", cleanUser);
      console.log("Computed User Hash:        ", inputUserHash);
      console.log("Database Expected User Hash:", dbUserHash);
      console.log("Username Match Result:     ", isUserMatch);
      console.log("Computed Password Hash:    ", inputPassHash);
      console.log("Database Expected Pass Hash:", dbPassHash);
      console.log("Database Legacy Pass Hashes:", dbLegacyHashes);
      console.log("Password Match Result:     ", isPassMatch);
      console.log("================================================");

      if (isUserMatch && isPassMatch) {
        setIsAuthenticated(true);
        if (onAuthChange) onAuthChange(true);
        localStorage.setItem("portfolio_admin_auth", "true");
        setAccessKey("");
        setAdminUser("");
      } else {
        setAuthError("CRYPTOGRAPHIC ACCESS DENIED: INVALID USERNAME OR ACCESS KEY.");
      }
    } catch (err) {
      setAuthError("SECURE CONTEXT ERROR: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (onAuthChange) onAuthChange(false);
    localStorage.removeItem("portfolio_admin_auth");
  };

  const processProfilePicFile = async (file: File) => {
    try {
      const slimBase64 = await shrinkImageToBase64(file, 400, 400, 0.7);
      if (slimBase64) {
        setPProfileImageBase64(slimBase64);
      }
    } catch (err) {
      console.error("Scale image error:", err);
    }
  };

  const handleUpdateProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);

    const updated: ProfileSettings = {
      ...profileSettings,
      fullName: pFullName,
      lastNameHighlight: pLastNameHighlight,
      headline: pHeadline,
      biography: pBiography,
      aboutParagraphs: [pPara1, pPara2, pPara3].filter(p => p.trim() !== ""),
      contactEmail: pContactEmail,
      instagramUrl: pInstagramUrl,
      linkedinUrl: pLinkedinUrl,
      websiteUrl: pWebsiteUrl,
      profileImageBase64: pProfileImageBase64,
      
      // Interactive Live style variables
      fontFamilyHeader: pFontFamilyHeader,
      fontFamilyBody: pFontFamilyBody,
      bgAccentStyle: pBgAccentStyle,
      textCasingStyle: pTextCasingStyle,
      themeColorPrimary: pThemeColorPrimary,
      themeColorSecondary: pThemeColorSecondary,
      customCanvasBg: pCustomCanvasBg,
      customCardBg: pCustomCardBg
    };

    onUpdateProfile(updated);
    setProfileSuccess("PROFILE SETTINGS SYNCHRONIZED GLOBALLY & PERSISTED SECURELY.");
    
    // Clear banner after some seconds
    setTimeout(() => {
      setProfileSuccess(null);
    }, 4500);
  };

  const handleStyleChange = (key: keyof ProfileSettings, value: any) => {
    const updated: ProfileSettings = {
      ...profileSettings,
      fullName: pFullName,
      lastNameHighlight: pLastNameHighlight,
      headline: pHeadline,
      biography: pBiography,
      aboutParagraphs: [pPara1, pPara2, pPara3].filter(p => p.trim() !== ""),
      contactEmail: pContactEmail,
      instagramUrl: pInstagramUrl,
      linkedinUrl: pLinkedinUrl,
      websiteUrl: pWebsiteUrl,
      profileImageBase64: pProfileImageBase64,
      fontFamilyHeader: pFontFamilyHeader,
      fontFamilyBody: pFontFamilyBody,
      bgAccentStyle: pBgAccentStyle,
      textCasingStyle: pTextCasingStyle,
      themeColorPrimary: pThemeColorPrimary,
      themeColorSecondary: pThemeColorSecondary,
      customCanvasBg: pCustomCanvasBg,
      customCardBg: pCustomCardBg,
      [key]: value
    };
    onUpdateProfile(updated);
  };

  // Convert files to Base64 helper with intelligent compression
  const processFile = async (file: File) => {
    try {
      const slimBase64 = await shrinkImageToBase64(file, 550, 360, 0.72);
      if (slimBase64) {
        setUploadedImageBase64(slimBase64);
        setImageType(slimBase64); // use compressed base64 as imageType payload
      }
    } catch (err) {
      console.error("Scale cover photo error:", err);
      // Fallback to default raw convert
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === "string") {
          setUploadedImageBase64(e.target.result);
          setImageType(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const startEditing = (proj: Project) => {
    setEditingProjectId(proj.id);
    setTitle(proj.title);
    setDescription(proj.description || "");
    setExtendedDescription(proj.extendedDescription || "");
    setCategory(proj.category);
    setTechTags(proj.tag);
    setBadge(proj.badge as any || "CASE STUDY");
    setYear(proj.year);
    setAccentColor(proj.accentColor || "#306634");
    setImageType(proj.imageType || "lunar");
    setProjectLink(proj.link || "");
    setUploadedImageBase64(proj.imageType && proj.imageType.startsWith("data:image/") ? proj.imageType : null);
    setVideoUrl(proj.videoUrl || "");
    setAdditionalImages(proj.additionalImages || []);
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
    setTitle("");
    setDescription("");
    setExtendedDescription("");
    setCategory("Game Development");
    setTechTags("");
    setBadge("CASE STUDY");
    setYear(new Date().getFullYear().toString());
    setAccentColor("#306634");
    setImageType("lunar");
    setProjectLink("");
    setUploadedImageBase64(null);
    setVideoUrl("");
    setAdditionalImages([]);
  };

  const handleAddProjectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !description || !techTags) {
      alert("Please fill in all required fields.");
      return;
    }

    // Check total payload size approx to prevent Firestore document limit crash
    const estimatedSizeKb = ((uploadedImageBase64?.length || 0) + additionalImages.reduce((acc, img) => acc + img.length, 0)) * 3 / 4 / 1024;
    if (estimatedSizeKb > 850) {
      alert(`The combined image size is roughly ${estimatedSizeKb.toFixed(0)}KB. Firestore database has a hard 1MB (1000KB) limit per project. Please check/compress your screenshot or upload a smaller cover photo/fewer gallery photos first!`);
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);
    setUploadSuccess(null);

    const targetProject: Project = {
      id: editingProjectId || "dynamic-" + Date.now(),
      title: title.toUpperCase(),
      category: category,  // Store exactly the dynamic filter value
      tag: techTags,
      badge: badge,
      year: year,
      description: description,
      extendedDescription: extendedDescription || undefined,
      accentColor: accentColor,
      imageType: uploadedImageBase64 || imageType, // Use custom base64 or abstract placeholder
      isCustom: true,
      link: projectLink || undefined,
      videoUrl: videoUrl || undefined,
      additionalImages: additionalImages.length > 0 ? additionalImages : undefined
    };

    try {
      if (editingProjectId) {
        await onUpdateProject(targetProject);
        setUploadSuccess(`SUCCESS: "${title}" updated successfully.`);
        setEditingProjectId(null);
      } else {
        await onAddProject(targetProject);
        setUploadSuccess(`SUCCESS: "${title}" saved to gallery.`);
      }

      // Reset Form Fields ONLY on successful write!
      setTitle("");
      setDescription("");
      setExtendedDescription("");
      setTechTags("");
      setUploadedImageBase64(null);
      setProjectLink("");
      setVideoUrl("");
      setAdditionalImages([]);
      setUploadError(null);
    } catch (err: any) {
      console.error("Firestore write failure:", err);
      let errMsg = "Failed to save project. The screenshot files are too large (exceeding Firestore's 1MB document storage limit) or database authentication has expired.";
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) {
            errMsg = `Database Save Error: ${parsed.error}`;
          }
        } catch (_) {
          errMsg = `Error: ${err.message}`;
        }
      }
      setUploadError(errMsg);
    } finally {
      setIsSubmitting(false);
    }

    setTimeout(() => {
      setUploadSuccess(null);
      setUploadError(null);
    }, 6000);
  };

  return (
    <div className="relative min-h-screen bg-verdant-dark overflow-hidden grid-mesh text-verdant-cream pb-20">
      <div className="absolute top-[10%] right-[5%] w-[300px] h-[300px] bg-verdant-yellow/5 rounded-full filter blur-[100px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 pt-12 md:pt-16 relative z-10 text-center">
        
        {/* Dynamic transition between login panel & admin suite */}
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div
              key="auth-gate"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto"
            >
              <div className="flex flex-col items-center mb-8 select-none">
                <div className="w-14 h-14 bg-[#DCA221]/10 border-2 border-verdant-yellow flex items-center justify-center text-verdant-yellow rounded-none mb-4">
                  <Lock className="w-7 h-7" />
                </div>
                <h1 className="font-syne font-black text-verdant-cream text-3xl md:text-5xl uppercase tracking-widest">
                  ADMIN PORTAL
                </h1>
                <p className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest mt-2">
                  SECURE ACCESS CONTROL
                </p>
                <p className="font-sans text-xs text-verdant-gray mt-4 max-w-sm font-semibold">
                  Please authenticate with your administrative credentials to update the portfolio.
                </p>
              </div>

              <div className="relative border-brutal border-verdant-cream bg-verdant-charcoal p-6 md:p-8 text-left">
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                      ADMINISTRATOR USERNAME
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter username"
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream shadow-sm focus:outline-none focus:ring-1 focus:ring-[#306634] select-all mb-2"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                      ADMIN PASSWORD / KEY
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••••"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream shadow-sm focus:outline-none focus:ring-1 focus:ring-[#306634] select-all"
                    />
                  </div>

                  {authError && (
                    <div className="flex items-start gap-2 bg-red-950/40 p-3 border border-red-900 text-red-100 font-mono text-[10px] uppercase font-bold leading-relaxed">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full bg-verdant-yellow text-white border-2 border-verdant-cream font-mono text-xs font-black tracking-widest uppercase py-4 mt-2 hover:bg-verdant-cream hover:text-white transition-colors cursor-pointer select-none shadow-yellow-offset"
                  >
                    {isVerifying ? "VERIFYING..." : "LOG IN"}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-suite"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-left"
            >
              {/* Header block inside admin suite */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-verdant-cream/20">
                <div>
                  <div className="inline-block bg-[#DCA221]/15 border border-[#DCA221]/40 font-mono text-[9px] uppercase font-black text-verdant-yellow px-2 py-0.5 mb-1.5 rounded-none">
                    ADMINISTRATIVE CONTROL ACCESS ACTIVE
                  </div>
                  <h1 className="font-syne font-black text-verdant-cream text-3xl md:text-5xl uppercase tracking-tight">
                    PORTFOLIO ADMIN
                  </h1>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onResetProjects}
                    className="cursor-pointer border-2 border-dashed border-verdant-yellow hover:border-solid hover:bg-verdant-yellow text-verdant-yellow hover:text-white font-mono text-[10px] font-black tracking-wider uppercase px-4 py-2.5 flex items-center gap-2 transition-all"
                    title="Restore standard projects baseline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RESET SYSTEMS baseline</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="cursor-pointer border-2 border-verdant-cream hover:bg-verdant-cream text-verdant-cream hover:text-white font-mono text-[10px] font-black tracking-wider uppercase px-4 py-2.5 flex items-center gap-2 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>LOG OUT</span>
                  </button>
                </div>
              </div>

              {/* Selector Tabs for Projects Ledger vs. User Profile vs. Style Builder */}
              <div className="flex flex-wrap border-b border-verdant-cream/20 mb-8 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setAdminTab("PROJECTS")}
                  className={`px-4 sm:px-5 py-3 font-mono text-xs font-black tracking-wider uppercase border-t-2 border-x-2 transition-all cursor-pointer flex items-center gap-2 ${
                    adminTab === "PROJECTS"
                      ? "bg-verdant-charcoal border-verdant-cream text-verdant-cream font-bold"
                      : "bg-transparent border-transparent text-verdant-gray hover:text-verdant-cream"
                  }`}
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>MANAGE PROJECTS ({projects.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab("PROFILE")}
                  className={`px-4 sm:px-5 py-3 font-mono text-xs font-black tracking-wider uppercase border-t-2 border-x-2 transition-all cursor-pointer flex items-center gap-2 ${
                    adminTab === "PROFILE"
                      ? "bg-verdant-charcoal border-verdant-cream text-verdant-cream font-bold"
                      : "bg-transparent border-transparent text-verdant-gray hover:text-verdant-cream"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>EDIT PROFILE & SOCIALS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab("INBOX")}
                  className={`px-4 sm:px-5 py-3 font-mono text-xs font-black tracking-wider uppercase border-t-2 border-x-2 transition-all cursor-pointer flex items-center gap-2 ${
                    adminTab === "INBOX"
                      ? "bg-verdant-charcoal border-verdant-cream text-verdant-cream font-bold"
                      : "bg-transparent border-transparent text-verdant-gray hover:text-verdant-cream"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-verdant-yellow" />
                  <span>VISITOR CHATS & INBOX</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab("STYLE")}
                  className={`px-4 sm:px-5 py-3 font-mono text-xs font-black tracking-wider uppercase border-t-2 border-x-2 transition-all cursor-pointer flex items-center gap-2 ${
                    adminTab === "STYLE"
                      ? "bg-verdant-charcoal border-verdant-cream text-verdant-cream font-bold"
                      : "bg-transparent border-transparent text-verdant-gray hover:text-verdant-cream"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-verdant-yellow" />
                  <span>STYLE & PALETTES</span>
                </button>
              </div>

              {adminTab === "PROJECTS" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Form segment which generates new items */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <div className="relative border-[3px] border-verdant-cream bg-verdant-charcoal p-6 md:p-8 shadow-charcoal-offset">
                    <h2 className="font-syne font-black text-xl text-verdant-cream tracking-widest uppercase border-b border-verdant-cream/20 pb-3 mb-6 flex items-center justify-between">
                      <span>{editingProjectId ? "EDIT PROJECT PROFILE" : "REGISTER NEW PROJECT"}</span>
                      <FolderPlus className="w-5 h-5 text-[#306634]" />
                    </h2>

                    <form onSubmit={handleAddProjectSubmit} className="flex flex-col gap-4 text-left">
                      {/* Image feedback success */}
                      {uploadSuccess && (
                        <div className="flex items-center gap-2 bg-[#306634]/30 p-3 border-2 border-[#306634] text-white font-mono text-[10px] uppercase font-black leading-relaxed">
                          <Check className="w-4 h-4 shrink-0 text-white" />
                          <span>{uploadSuccess}</span>
                        </div>
                      )}

                      {/* Storage quota or large image upload error message */}
                      {uploadError && (
                        <div className="flex items-start gap-2 bg-red-950 p-3 border-2 border-red-600 text-red-200 font-mono text-[10px] uppercase font-bold leading-relaxed">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                          <span>{uploadError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Title Field */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            PROJECT TITLE *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., HELIOS SPATIAL REND"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream shadow-sm focus:outline-none focus:ring-1 focus:ring-[#306634]"
                          />
                        </div>

                        {/* Tech Tags */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            TECHNOLOGY TAGS *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., C++ / WASM / WebGL / Canvas"
                            value={techTags}
                            onChange={(e) => setTechTags(e.target.value)}
                            className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream shadow-sm focus:outline-none focus:ring-1 focus:ring-[#306634]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Category/Tab Selector */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            CATEGORY FILTER TAB *
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream shadow-sm focus:outline-none"
                          >
                            <option value="Game Development">Game Development</option>
                            <option value="Cryptography">Cryptography</option>
                            <option value="UIUX Design">UIUX Design</option>
                            <option value="3D Modelling">3D Modelling</option>
                          </select>
                        </div>

                        {/* Badge type */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            VISUAL BADGE LABEL *
                          </label>
                          <select
                            value={badge}
                            onChange={(e) => setBadge(e.target.value as any)}
                            className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream shadow-sm focus:outline-none"
                          >
                            <option value="CASE STUDY">CASE STUDY</option>
                            <option value="EXPERIMENTAL">EXPERIMENTAL</option>
                            <option value="MASTERPRINT">MASTERPRINT</option>
                          </select>
                        </div>

                        {/* Year */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            RELEASE YEAR *
                          </label>
                          <input
                            type="text"
                            required
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream shadow-sm focus:outline-none focus:ring-1 focus:ring-[#306634]"
                          />
                        </div>
                      </div>

                      {/* Description Objective Paragraph */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          PROJECT OBJECTIVES & DESCRIPTION *
                        </label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Detail the procedural framework parameters and math formulas utilized (Grid preview card / caption style)..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full bg-verdant-dark text-verdant-cream border-2 border-dashed border-verdant-cream/40 font-mono text-xs p-4 focus:outline-none focus:ring-1 focus:ring-[#306634] resize-none"
                        />
                      </div>

                      {/* Extended Description Overlay Paragraph */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          PROJECT DETAILED DESCRIPTION (OPTIONAL - EXPANDS INSIDE THE OPENED WORKSPACE)
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Detail deep notes, technical implementation specifications, mathematical models, or user guides that only show when this project workspace is opened..."
                          value={extendedDescription}
                          onChange={(e) => setExtendedDescription(e.target.value)}
                          className="w-full bg-verdant-dark text-verdant-cream border-2 border-dashed border-verdant-cream/40 font-mono text-xs p-4 focus:outline-none focus:ring-1 focus:ring-[#306634] resize-none"
                        />
                      </div>

                      {/* Optional Interactive Portal Link */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          PROJECT SIMULATOR / EXTERNAL LIVE LINK (OPTIONAL)
                        </label>
                        <input
                          type="url"
                          placeholder="e.g., https://crypto-agilitypqcthesis.streamlit.app/"
                          value={projectLink}
                          onChange={(e) => setProjectLink(e.target.value)}
                          className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream shadow-sm focus:outline-none focus:ring-1 focus:ring-[#306634]"
                        />
                      </div>

                      {/* Video Link */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          VIDEO LINK / EMBED URL (OPTIONAL)
                        </label>
                        <input
                          type="url"
                          placeholder="e.g., https://www.youtube.com/embed/yourvideo or external video link"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream shadow-sm focus:outline-none focus:ring-1 focus:ring-[#306634]"
                        />
                      </div>

                      {/* Additional Photos Upload */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          ADDITIONAL PHOTOS GALLERY (OPTIONAL)
                        </label>
                        <div className="border border-dashed border-verdant-cream/30 p-4 bg-verdant-dark flex flex-col gap-3">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files) {
                                const filesArray = Array.from(e.target.files);
                                for (const file of filesArray) {
                                  try {
                                    const slimBase64 = await shrinkImageToBase64(file as File, 550, 360, 0.72);
                                    if (slimBase64) {
                                      setAdditionalImages((prev) => [...prev, slimBase64]);
                                    }
                                  } catch (err) {
                                    console.error("Scale secondary photo error:", err);
                                  }
                                }
                              }
                            }}
                            className="w-full bg-transparent text-xs font-mono file:mr-4 file:py-1.5 file:px-3 file:border file:border-verdant-cream file:bg-verdant-charcoal file:text-verdant-cream file:text-xs file:font-mono hover:file:bg-verdant-cream hover:file:text-verdant-dark file:cursor-pointer"
                          />
                          {additionalImages.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-2">
                              {additionalImages.map((imgBase64, idx) => (
                                <div key={idx} className="relative aspect-video border border-verdant-cream bg-black">
                                  <img src={imgBase64} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <span className="absolute bottom-0 left-0 bg-[#306634] text-white text-[7px] px-1 font-mono font-black">
                                    {((imgBase64.length * 3) / 4 / 1024).toFixed(0)}KB
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setAdditionalImages((prev) => prev.filter((_, i) => i !== idx))}
                                    className="absolute top-1 right-1 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Custom Drag and Drop File Upload for Images */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          IMAGE COVER ATTACHMENT
                        </label>
                        
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-none p-6 text-center transition-all ${
                            dragActive
                              ? "border-verdant-yellow bg-verdant-yellow/5"
                              : uploadedImageBase64
                              ? "border-[#306634] bg-[#306634]/5"
                              : "border-verdant-cream/30 bg-verdant-dark"
                          }`}
                        >
                          {uploadedImageBase64 ? (
                            <div className="flex flex-col items-center gap-2">
                              <img
                                src={uploadedImageBase64}
                                alt="Pre-render upload frame"
                                className="h-28 object-contain border-2 border-verdant-cream"
                                referrerPolicy="no-referrer"
                              />
                              <p className="font-mono text-[8px] text-[#306634] font-bold uppercase mt-1">
                                Base64 Buffer loaded - Size {((uploadedImageBase64.length * 3) / 4 / 1024).toFixed(1)} KB
                              </p>
                              <button
                                type="button"
                                onClick={() => setUploadedImageBase64(null)}
                                className="text-[9px] underline text-red-700 font-bold uppercase cursor-pointer"
                              >
                                Replace Attachment
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <FileUp className="w-8 h-8 text-verdant-gray" />
                              <p className="font-sans text-xs text-verdant-gray font-semibold">
                                Drag and drop image file here, or{" "}
                                <label className="text-[#306634] underline font-black cursor-pointer">
                                  browse paths
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                  />
                                </label>
                              </p>
                              <span className="font-mono text-[7px] text-zinc-500 uppercase tracking-widest">
                                Limit file to 2MB. Converted securely on thread.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* If no custom image is selected, choose a stencil pattern style */}
                      {!uploadedImageBase64 && (
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[8.5px] font-black text-[#306634] uppercase tracking-widest">
                            DEFAULT GENERATIVE BACKGROUND STENCIL
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["lunar", "void", "logic"].map((pattern) => (
                              <button
                                type="button"
                                key={pattern}
                                onClick={() => setImageType(pattern)}
                                className={`py-2 border-2 text-[9px] font-bold uppercase font-mono cursor-pointer text-center ${
                                  imageType === pattern
                                    ? "bg-verdant-cream text-verdant-dark border-verdant-cream font-black"
                                    : "bg-verdant-dark text-verdant-gray border-verdant-cream/20 hover:border-verdant-cream/50"
                                }`}
                              >
                                {pattern === "lunar" ? "🌙 Lunar Waves" : pattern === "void" ? "💠 Vector Shard" : "🌾 Logic Wheat"}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-3">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full cursor-pointer bg-verdant-mint hover:bg-[#528B56] text-white border-2 border-verdant-cream font-mono text-xs font-black py-4 uppercase tracking-widest transition-colors select-none shadow-mint-offset disabled:opacity-50 disabled:cursor-not-allowed"
                          id="submit-dynamic-proj-btn"
                        >
                          {isSubmitting ? "SAVING TO FIREBASE..." : editingProjectId ? "SAVE CHANGES & UPDATE" : "PUBLISH TO GALLERY"}
                        </button>
                        
                        {editingProjectId && (
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="w-full cursor-pointer bg-transparent hover:bg-neutral-800 text-verdant-cream border-2 border-dashed border-verdant-cream/40 font-mono text-xs font-black py-2.5 uppercase tracking-widest transition-all select-none"
                          >
                            CANCEL EDITING
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right columns listing existing projects */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="border-[3px] border-verdant-cream bg-verdant-charcoal p-5 font-mono">
                    <h3 className="text-verdant-cream uppercase font-black text-xs tracking-widest border-b border-verdant-cream/15 pb-2.5 mb-4 flex justify-between items-center">
                      <span>PROJECT INDEX ({projects.length})</span>
                      <span className="text-[10px] text-verdant-gray">LIVE DB</span>
                    </h3>

                    {/* Scrolling container */}
                    <div className="flex flex-col gap-3.5 max-h-[640px] overflow-y-auto pr-1">
                      {projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="p-3 bg-verdant-dark border border-verdant-cream/20 flex flex-col gap-2 relative group"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="text-verdant-cream font-black text-xs uppercase tracking-tight">
                                {proj.title}
                              </h4>
                              <p className="text-[#306634] font-bold text-[9px] uppercase tracking-wider mt-0.5">
                                {proj.category}
                              </p>
                            </div>

                            <div className="flex gap-2 shrink-0">
                              {/* Edit project button */}
                              <button
                                onClick={() => startEditing(proj)}
                                className={`p-1 cursor-pointer transition-transform hover:scale-110 ${
                                  editingProjectId === proj.id ? "text-verdant-yellow" : "text-verdant-gray hover:text-verdant-yellow"
                                }`}
                                title="Edit project profile"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete project button */}
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${proj.title}?`)) {
                                    onDeleteProject(proj.id);
                                    if (editingProjectId === proj.id) {
                                      cancelEditing();
                                    }
                                  }
                                }}
                                className="text-verdant-gray hover:text-red-500 hover:scale-110 cursor-pointer p-1 transition-transform"
                                title="Delete project from database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-verdant-gray text-[9px] leading-relaxed capitalize">
                            {proj.description.slice(0, 95)}...
                          </p>

                          {/* Detail row */}
                          <div className="flex justify-between items-center border-t border-verdant-cream/10 pt-1.5 text-[8px] text-zinc-500">
                            <span>{proj.badge} // {proj.year}</span>
                            <span className="text-[7.5px] truncate max-w-[120px]" title={proj.tag}>{proj.tag}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
              )}

              {adminTab === "PROFILE" && (
                <div className="relative border-[3px] border-verdant-cream bg-verdant-charcoal p-6 md:p-8 shadow-charcoal-offset">
                  <h2 className="font-syne font-black text-xl text-verdant-cream tracking-widest uppercase border-b border-verdant-cream/20 pb-3 mb-6 flex items-center justify-between">
                    <span>EDIT PORTFOLIO IDENTITY & STORY</span>
                    <User className="w-5 h-5 text-[#306634]" />
                  </h2>

                  <form onSubmit={handleUpdateProfileSubmit} className="flex flex-col gap-6 text-left">
                    {/* Synchronize status message */}
                    {profileSuccess && (
                      <div className="flex items-center gap-2 bg-[#306634]/35 p-3.5 border-2 border-[#306634] text-white font-mono text-[10.5px] uppercase font-black leading-relaxed">
                        <Check className="w-4 h-4 shrink-0 text-white" />
                        <span>{profileSuccess}</span>
                      </div>
                    )}

                    {/* Section 1: Basic Information */}
                    <div className="flex flex-col gap-4">
                      <h3 className="font-mono text-[10px] uppercase font-extrabold text-verdant-yellow tracking-widest flex items-center gap-2 border-b border-verdant-cream/10 pb-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>1. Primary Core Metadata</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            FIRST NAME / INITIALS *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., JULIARISTY"
                            value={pFullName}
                            onChange={(e) => setPFullName(e.target.value)}
                            className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream focus:outline-none focus:ring-1 focus:ring-[#306634]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            LAST NAME OR HIGHLIGHTED LOGO *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., VENICE CASTILLO"
                            value={pLastNameHighlight}
                            onChange={(e) => setPLastNameHighlight(e.target.value)}
                            className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream focus:outline-none focus:ring-1 focus:ring-[#306634]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          HERO SUBTITLE / SERVICE HEADLINE *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., COMPUTER SCIENCE STUDENT & DIGITAL DESIGNER"
                          value={pHeadline}
                          onChange={(e) => setPHeadline(e.target.value)}
                          className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream focus:outline-none focus:ring-1 focus:ring-[#306634]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          HERO INTRODUCTORY BIOGRAPHY *
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Introduction bio..."
                          value={pBiography}
                          onChange={(e) => setPBiography(e.target.value)}
                          className="w-full bg-verdant-dark text-verdant-cream font-sans text-xs p-4 border-2 border-verdant-cream focus:outline-none focus:ring-1 focus:ring-[#306634] resize-none"
                        />
                      </div>
                    </div>

                    {/* Section 2: Graphic Avatar Upload */}
                    <div className="flex flex-col gap-4">
                      <h3 className="font-mono text-[10px] uppercase font-extrabold text-verdant-yellow tracking-widest flex items-center gap-2 border-b border-verdant-cream/10 pb-1.5">
                        <Image className="w-3.5 h-3.5" />
                        <span>2. Creative Portrait Asset</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        <div className="md:col-span-8 flex flex-col gap-2">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            AVATAR PORTRAIT IMAGE (CLICK / DRAG TO IMPORT)
                          </label>
                          
                          {/* Profile Dropzone */}
                          <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                processProfilePicFile(e.dataTransfer.files[0]);
                              }
                            }}
                            className={`border-2 border-dashed rounded-none p-5 text-center cursor-pointer flex flex-col items-center justify-center gap-2 select-none min-h-[110px] transition-all relative ${
                              dragActive
                                ? "bg-verdant-yellow/10 border-verdant-yellow"
                                : "bg-verdant-dark border-verdant-cream/30 hover:border-verdant-cream/60"
                            }`}
                            onClick={() => document.getElementById("profile-pic-uploader")?.click()}
                          >
                            <FileUp className="w-6 h-6 text-verdant-yellow" />
                            <span className="font-mono text-[9px] text-[#306634] font-black tracking-widest uppercase">
                              UPLOAD PICTURE / PNG, JPG, WEBP
                            </span>
                            <span className="font-mono text-[8px] text-zinc-500">
                              (MAX 2MB FORMAT BASE64)
                            </span>
                            <input
                              id="profile-pic-uploader"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  processProfilePicFile(e.target.files[0]);
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Dropzone preview */}
                        <div className="md:col-span-4 flex flex-col items-center gap-2 justify-center border-2 border-dashed border-verdant-cream/20 bg-verdant-dark p-3 aspect-square max-w-[130px] mx-auto w-full relative">
                          {pProfileImageBase64 ? (
                            <div className="relative w-full h-full group" id="p-avatar-preview-container">
                              <img
                                src={pProfileImageBase64}
                                alt="Uploader Sandbox preview"
                                className="w-full h-full object-cover border border-verdant-cream/10"
                                referrerPolicy="no-referrer"
                              />
                              <button
                                type="button"
                                onClick={() => setPProfileImageBase64(undefined)}
                                className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white font-mono text-[7px] px-1 py-0.5 border border-white cursor-pointer z-30"
                                title="Remove picture & restore scribble canvas"
                              >
                                REMOVE
                              </button>
                            </div>
                          ) : (
                            <div className="text-center font-mono text-[8px] text-zinc-500 flex flex-col gap-1.5 items-center justify-center h-full">
                              <span>NO IMAGE</span>
                              <span className="text-[7px] text-[#306634] uppercase font-bold">
                                (CANVAS ACTIVE)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section 3: About manifesto paragraphs */}
                    <div className="flex flex-col gap-4">
                      <h3 className="font-mono text-[10px] uppercase font-extrabold text-verdant-yellow tracking-widest flex items-center gap-2 border-b border-verdant-cream/10 pb-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>3. About Section Manifesto Details</span>
                      </h3>

                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            ABOUT PARAGRAPH 1 (INTRODUCTION)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Hello paragraph..."
                            value={pPara1}
                            onChange={(e) => setPPara1(e.target.value)}
                            className="w-full bg-verdant-dark text-verdant-cream font-sans text-xs p-3.5 border-2 border-verdant-cream focus:outline-none focus:ring-1 focus:ring-[#306634] resize-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            ABOUT PARAGRAPH 2 (CORE INTERESTS & ACADEMICS)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Core interests paragraph..."
                            value={pPara2}
                            onChange={(e) => setPPara2(e.target.value)}
                            className="w-full bg-verdant-dark text-verdant-cream font-sans text-xs p-3.5 border-2 border-verdant-cream focus:outline-none focus:ring-1 focus:ring-[#306634] resize-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            ABOUT PARAGRAPH 3 (PHILOSOPHY & EXPERIENCE)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Philosophical paragraph..."
                            value={pPara3}
                            onChange={(e) => setPPara3(e.target.value)}
                            className="w-full bg-verdant-dark text-verdant-cream font-sans text-xs p-3.5 border-2 border-verdant-cream focus:outline-none focus:ring-1 focus:ring-[#306634] resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Contact & Social urls */}
                    <div className="flex flex-col gap-4">
                      <h3 className="font-mono text-[10px] uppercase font-extrabold text-verdant-yellow tracking-widest flex items-center gap-2 border-b border-verdant-cream/10 pb-1.5">
                        <Link2 className="w-3.5 h-3.5" />
                        <span>4. Secured Communications & Cyber-Links</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            PORTFOLIO CONTACT EMAIL *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="e.g., juliaristycastillo0@gmail.com"
                            value={pContactEmail}
                            onChange={(e) => setPContactEmail(e.target.value)}
                            className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream focus:outline-none focus:ring-1 focus:ring-[#306634]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            LINKEDIN ACCOUNT URL *
                          </label>
                          <input
                            type="url"
                            required
                            placeholder="e.g., https://linkedin.com"
                            value={pLinkedinUrl}
                            onChange={(e) => setPLinkedinUrl(e.target.value)}
                            className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream focus:outline-none focus:ring-1 focus:ring-[#306634]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            INSTAGRAM PROFILE URL
                          </label>
                          <input
                            type="url"
                            placeholder="e.g., https://instagram.com/"
                            value={pInstagramUrl}
                            onChange={(e) => setPInstagramUrl(e.target.value)}
                            className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream focus:outline-none focus:ring-1 focus:ring-[#306634]"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                            DOCK / WEBSITE URL
                          </label>
                          <input
                            type="url"
                            placeholder="e.g., https://juliaristy.me/"
                            value={pWebsiteUrl}
                            onChange={(e) => setPWebsiteUrl(e.target.value)}
                            className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-4 py-3 border-2 border-verdant-cream focus:outline-none focus:ring-1 focus:ring-[#306634]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit settings button */}
                    <button
                      type="submit"
                      className="w-full cursor-pointer bg-verdant-mint hover:bg-[#528B56] text-white border-2 border-verdant-cream font-mono text-xs font-black py-4 uppercase tracking-widest transition-colors select-none shadow-mint-offset"
                    >
                      SAVE PROFILE SETTINGS
                    </button>
                  </form>
                </div>
              )}

              {adminTab === "INBOX" && (
                <div className="relative border-[3px] border-verdant-cream bg-verdant-charcoal p-6 md:p-8 shadow-charcoal-offset text-left flex flex-col gap-6 rounded-none">
                  <div>
                    <h2 className="font-syne font-black text-2xl text-verdant-cream tracking-tight uppercase flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-verdant-yellow" />
                      <span>VISITOR CHATS & INBOX MAILBOX</span>
                    </h2>
                    <p className="font-sans text-xs text-verdant-gray mt-1 leading-relaxed font-semibold">
                      Julie, handle incoming chats here in real-time. Craft pre-populated response emails to send back instantly.
                    </p>
                  </div>

                  {messages.length === 0 ? (
                    <div className="border-2 border-dashed border-verdant-cream/20 bg-verdant-dark/40 py-16 px-6 text-center flex flex-col items-center gap-3">
                      <Mail className="w-10 h-10 text-verdant-gray/60" />
                      <p className="font-mono text-xs uppercase font-black text-verdant-gray tracking-wider">
                        LEDGER REGISTER EMPTY: NO INCOMING CHATS DETECTED
                      </p>
                      <p className="font-sans text-[11px] text-zinc-500 max-w-sm leading-relaxed">
                        When visitors leave a message on your "Let's Connect" tab, they are stored securely in Firestore columns and will render here instantly in real-time.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {/* Metric Dashboard row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-verdant-cream/20 bg-verdant-dark p-4 font-mono">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-[#306634] font-black uppercase tracking-wider">TOTAL RECEIVED MESSAGE(S)</span>
                          <span className="text-2xl font-black text-white">{messages.length}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-[#306634] font-black uppercase tracking-wider">UNREPLIED / PENDING</span>
                          <span className="text-2xl font-black text-verdant-yellow">
                            {messages.filter(m => !m.replied).length}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-[#306634] font-black uppercase tracking-wider font-bold">MUTUAL SECURITY</span>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase py-1 select-none flex items-center gap-1.5 leading-none mt-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>CLOUDSYNC STEADY</span>
                          </span>
                        </div>
                      </div>

                      {/* Message cards feed */}
                      <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`border-2 p-5 flex flex-col gap-4 relative transition-colors ${
                              msg.replied 
                                ? "border-verdant-cream/20 bg-verdant-dark/25" 
                                : "border-[#DCA221]/50 bg-verdant-dark/45 shadow-md"
                            }`}
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-3 border-b border-verdant-cream/10">
                              {/* Left profile info */}
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 border border-verdant-cream bg-verdant-charcoal text-white flex items-center justify-center font-bold text-xs uppercase font-mono shrink-0">
                                  {msg.name ? msg.name.charAt(0) : "V"}
                                </div>
                                <div className="flex flex-col text-left">
                                  <span className="text-xs font-black text-verdant-cream uppercase font-mono leading-none flex items-center gap-2 flex-wrap">
                                    <span>{msg.name}</span>
                                    {msg.replied && (
                                      <span className="text-[8px] bg-emerald-950 border border-emerald-500 font-bold px-1.5 py-0.5 text-emerald-200">
                                        REPLIED
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 font-mono mt-1 font-semibold select-all">
                                    {msg.email}
                                  </span>
                                </div>
                              </div>

                              {/* Time relative/absolute display */}
                              <div className="flex items-center gap-1 text-[9px] font-mono text-verdant-gray font-bold shrink-0 md:pr-10">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date(msg.timestamp || Date.now()).toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Message content */}
                            <div className="bg-verdant-dark/50 p-3.5 border border-dashed border-verdant-cream/10 text-xs text-verdant-cream leading-relaxed font-sans font-semibold">
                              "{msg.message}"
                            </div>

                            {/* Reply History / Reply Composer Thread */}
                            {msg.replied && (
                              <div className="mt-2 bg-[#FAF8F5]/5 border border-dashed border-[#FAF8F5]/20 p-3 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[9px] uppercase font-black text-[#528B56] flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>SENT REPLY RECORD:</span>
                                  </span>
                                  {msg.replyTimestamp && (
                                    <span className="font-mono text-[8px] text-zinc-600">
                                      {new Date(msg.replyTimestamp).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <p className="font-sans text-xs text-verdant-gray leading-normal italic font-semibold">
                                  "{msg.replyContent}"
                                </p>
                              </div>
                            )}

                            {/* Reply Form Trigger (if unreplied) */}
                            {!msg.replied ? (
                              <div className="mt-2 flex flex-col gap-2 bg-verdant-dark p-3.5 border border-dashed border-[#DCA221]/30">
                                <span className="font-mono text-[9px] uppercase font-black text-[#DCA221] block font-bold">
                                  ✏️ Compose Email Reply Body:
                                </span>
                                <textarea
                                  rows={3}
                                  value={replyTexts[msg.id] || ""}
                                  onChange={(e) => {
                                    setReplyTexts(prev => ({
                                      ...prev,
                                      [msg.id]: e.target.value
                                    }));
                                  }}
                                  className="w-full bg-verdant-charcoal text-verdant-cream p-2 font-sans text-xs border border-verdant-cream/30 focus:outline-none focus:border-verdant-yellow resize-none leading-relaxed font-semibold placeholder:text-zinc-600"
                                  placeholder="Type response email content here..."
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSendEmailReply(msg)}
                                    className="flex-grow cursor-pointer bg-verdant-mint hover:bg-verdant-cream hover:text-verdant-dark text-white border border-verdant-cream font-mono text-[10px] font-black uppercase py-2.5 tracking-widest flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>LAUNCH EMAIL CLIENT & MARK REPLIED</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await setDoc(doc(db, "messages", msg.id), {
                                          ...msg,
                                          replied: true,
                                          replyContent: "Marked resolved manually",
                                          replyTimestamp: Date.now()
                                        }, { merge: true });
                                      } catch (err) {
                                        console.error("Manual solve failed:", err);
                                      }
                                    }}
                                    className="cursor-pointer bg-verdant-charcoal hover:bg-neutral-800 text-verdant-cream border border-verdant-cream font-mono text-[10px] font-black uppercase px-3 py-2 flex items-center justify-center transition-colors"
                                    title="Mark as resolved in history without composing a mail copy"
                                  >
                                    Mark Solved
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Let her reply again if needed by deleting replied flag
                                    setDoc(doc(db, "messages", msg.id), {
                                      ...msg,
                                      replied: false,
                                      replyContent: ""
                                    }, { merge: true });
                                  }}
                                  className="text-[9px] hover:underline font-mono text-zinc-500 hover:text-white cursor-pointer"
                                >
                                  [ RE-OPEN REPLY DRAFT THREAD ]
                                </button>
                              </div>
                            )}

                            {/* Absolute delete trigger in header */}
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="absolute top-4 right-4 text-red-500 hover:text-red-400 opacity-60 hover:opacity-100 transition-opacity p-1 cursor-pointer"
                              title="Permanently erase record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {adminTab === "STYLE" && (
                <div className="relative border-[3px] border-verdant-cream bg-verdant-charcoal p-6 md:p-8 shadow-charcoal-offset text-left flex flex-col gap-8 rounded-none">
                  <div>
                    <h2 className="font-syne font-black text-2xl text-verdant-cream tracking-tight uppercase flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-verdant-yellow" />
                      <span>Live Website Style Customizer</span>
                    </h2>
                    <p className="font-sans text-xs text-verdant-gray mt-1 leading-relaxed font-semibold">
                      Drag, click, and customize fonts, palettes, and layouts live. All adjustments are compiled instantaneously on the preview.
                    </p>
                  </div>

                  {profileSuccess && (
                     <div className="flex items-center gap-2 bg-[#306634]/30 p-3 border-2 border-[#306634] text-white font-mono text-[10px] uppercase font-black leading-relaxed">
                       <Check className="w-4 h-4 shrink-0 text-white" />
                       <span>{profileSuccess}</span>
                     </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Style controls (Left panel) */}
                    <div className="flex flex-col gap-6">
                      
                      {/* Font selector */}
                      <div className="border border-verdant-cream/20 bg-verdant-dark p-4 flex flex-col gap-3">
                        <header className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          1. Header & Title Typography Pairing (3-5 Selections)
                        </header>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            { name: "Syne (Default Bold)", val: "Syne", style: "font-syne font-black" },
                            { name: "Space Grotesk (Tech Modern)", val: "Space Grotesk", style: "font-space font-bold" },
                            { name: "Plus Jakarta Sans (Minimal Sans)", val: "Plus Jakarta Sans", style: "font-sans font-bold" },
                            { name: "JetBrains Mono (Technical)", val: "JetBrains Mono", style: "font-mono font-bold" },
                            { name: "Playfair Display (Premium Serif)", val: "Playfair Display", style: "font-serif italic font-medium" }
                          ].map((f) => (
                            <button
                              key={f.val}
                              onClick={() => {
                                setPFontFamilyHeader(f.val);
                                handleStyleChange("fontFamilyHeader", f.val);
                              }}
                              className={`p-3 border text-xs text-left cursor-pointer transition-all flex flex-col justify-between ${
                                pFontFamilyHeader === f.val
                                  ? "border-2 border-verdant-yellow bg-verdant-yellow/10"
                                  : "border-verdant-cream/20 hover:border-verdant-mint bg-verdant-charcoal"
                              }`}
                            >
                              <span className="text-[9px] text-[#306634] font-mono leading-none tracking-wider mb-2">
                                {f.name}
                              </span>
                              <span className={`text-sm text-verdant-cream leading-none ${f.style}`}>
                                Juliaristy
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Body Font Selection */}
                      <div className="border border-verdant-cream/20 bg-verdant-dark p-4 flex flex-col gap-3">
                        <header className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          2. Body & Narrative Typography
                        </header>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { name: "Plus Jakarta Sans (Inter-like Sans)", val: "Plus Jakarta Sans", style: "font-sans" },
                            { name: "JetBrains Mono (Developer Mono)", val: "JetBrains Mono", style: "font-mono text-[10px]" }
                          ].map((f) => (
                            <button
                              key={f.val}
                              onClick={() => {
                                setPFontFamilyBody(f.val);
                                handleStyleChange("fontFamilyBody", f.val);
                              }}
                              className={`p-3 border text-xs text-left cursor-pointer transition-all flex flex-col justify-between ${
                                pFontFamilyBody === f.val
                                  ? "border-2 border-verdant-yellow bg-verdant-yellow/10"
                                  : "border-verdant-cream/20 hover:border-verdant-mint bg-verdant-charcoal"
                              }`}
                            >
                              <span className="text-[9px] text-zinc-500 font-mono tracking-wider mb-2 leading-none">
                                {f.name}
                              </span>
                              <span className={`text-xs text-verdant-cream leading-normal ${f.style}`}>
                                My interests sit at UI/UX Design...
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Layout Background mesh styles */}
                      <div className="border border-verdant-cream/20 bg-verdant-dark p-4 flex flex-col gap-3">
                        <header className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          3. Canvas Backing Grid Style
                        </header>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { name: "Warm Checkered Board", val: "checker-grid", desc: "Zine-style checks pattern" },
                            { name: "Artistic Isometric Grid", val: "grid-mesh", desc: "Technical architectural grid lines" },
                            { name: "Soft Radial Grain Glow", val: "radial-grain", desc: "Ambient painterly spotlight blur" },
                            { name: "Solid Clean Minimal", val: "solid-plain", desc: "Vanilla plain backdrop without mesh texture" }
                          ].map((b) => (
                            <button
                              key={b.val}
                              onClick={() => {
                                setPBgAccentStyle(b.val);
                                handleStyleChange("bgAccentStyle", b.val);
                              }}
                              className={`p-3 border text-xs text-left cursor-pointer transition-all flex flex-col justify-between ${
                                pBgAccentStyle === b.val
                                  ? "border-2 border-verdant-yellow bg-verdant-yellow/10"
                                  : "border-verdant-cream/20 hover:border-verdant-mint bg-verdant-charcoal"
                              }`}
                            >
                              <span className="text-[10px] text-[#306634] font-mono leading-none tracking-tight font-black uppercase mb-1">
                                {b.name}
                              </span>
                              <span className="text-[9px] text-verdant-gray leading-normal block">
                                {b.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Text Casing Transformation */}
                      <div className="border border-verdant-cream/20 bg-verdant-dark p-4 flex flex-col gap-3">
                        <header className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          4. Global Heading Text Casing (All Caps Toggle)
                        </header>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { name: "ALL CAPITALIZED LETTERS", val: "uppercase", sample: "PROJECT PORTFOLIO" },
                            { name: "Preserve Input Casing (Standard)", val: "normal-case", sample: "Project Portfolio" }
                          ].map((c) => (
                            <button
                              key={c.val}
                              onClick={() => {
                                setPTextCasingStyle(c.val);
                                handleStyleChange("textCasingStyle", c.val);
                              }}
                              className={`p-3 border text-xs text-left cursor-pointer transition-all flex flex-col justify-between ${
                                pTextCasingStyle === c.val
                                  ? "border-2 border-verdant-yellow bg-verdant-yellow/10"
                                  : "border-verdant-cream/20 hover:border-verdant-mint bg-verdant-charcoal"
                              }`}
                            >
                              <span className="text-[9px] text-zinc-500 font-mono tracking-tight leading-none mb-2 block uppercase">
                                {c.name}
                              </span>
                              <span className="text-[11px] text-verdant-cream leading-none font-bold block">
                                {c.sample}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Color palette customization (Right panel) */}
                    <div className="flex flex-col gap-6">
                      
                      {/* Primary colors & interactive paint bubbles */}
                      <div className="border border-verdant-cream/20 bg-verdant-dark p-4 flex flex-col gap-3">
                        <header className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          5. Brand Theme Primary Accent (Borders, Main Buttons)
                        </header>
                        <div className="grid grid-cols-5 gap-1.5 mb-2">
                          {[
                            { name: "Cypress Moss (Default)", hex: "#306634" },
                            { name: "Midnight Navy", hex: "#1E3A8A" },
                            { name: "Royal Amethyst", hex: "#7C3AED" },
                            { name: "Crimson Pepper", hex: "#DC2626" },
                            { name: "Deep Charcoal", hex: "#1E293B" }
                          ].map((col) => (
                            <button
                              key={col.hex}
                              type="button"
                              onClick={() => {
                                setPThemeColorPrimary(col.hex);
                                handleStyleChange("themeColorPrimary", col.hex);
                              }}
                              style={{ backgroundColor: col.hex }}
                              className={`aspect-square border-4 cursor-pointer relative ${
                                pThemeColorPrimary === col.hex ? "border-white scale-110 shadow-sm" : "border-transparent hover:scale-105"
                              }`}
                              title={col.name}
                            >
                              {pThemeColorPrimary === col.hex && (
                                <span className="absolute inset-0 flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest block">
                            Or dial any custom HEX color
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={pThemeColorPrimary}
                              onChange={(e) => {
                                setPThemeColorPrimary(e.target.value);
                                handleStyleChange("themeColorPrimary", e.target.value);
                              }}
                              className="w-10 h-10 border-2 border-verdant-cream bg-transparent cursor-pointer shrink-0"
                            />
                            <input
                              type="text"
                              value={pThemeColorPrimary}
                              onChange={(e) => {
                                setPThemeColorPrimary(e.target.value);
                                handleStyleChange("themeColorPrimary", e.target.value);
                              }}
                              className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-3 border-2 border-verdant-cream focus:outline-none"
                              placeholder="#306634"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Secondary Color accent */}
                      <div className="border border-verdant-cream/20 bg-verdant-dark p-4 flex flex-col gap-3">
                        <header className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          6. Brand Tones Secondary Accent (Highlighters, Golden Badges)
                        </header>
                        <div className="grid grid-cols-5 gap-1.5 mb-2">
                          {[
                            { name: "Oat Sunflower (Default)", hex: "#DCA221" },
                            { name: "Bright Coral Red", hex: "#F43F5E" },
                            { name: "Classic Ocean Blue", hex: "#3B82F6" },
                            { name: "Vivid Emerald Teal", hex: "#10B981" },
                            { name: "Amber Harvest", hex: "#F59E0B" }
                          ].map((col) => (
                            <button
                              key={col.hex}
                              type="button"
                              onClick={() => {
                                setPThemeColorSecondary(col.hex);
                                handleStyleChange("themeColorSecondary", col.hex);
                              }}
                              style={{ backgroundColor: col.hex }}
                              className={`aspect-square border-4 cursor-pointer relative ${
                                pThemeColorSecondary === col.hex ? "border-white scale-110 shadow-sm" : "border-transparent hover:scale-105"
                              }`}
                              title={col.name}
                            >
                              {pThemeColorSecondary === col.hex && (
                                <span className="absolute inset-0 flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest block">
                            Or dial custom HEX code
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={pThemeColorSecondary}
                              onChange={(e) => {
                                setPThemeColorSecondary(e.target.value);
                                handleStyleChange("themeColorSecondary", e.target.value);
                              }}
                              className="w-10 h-10 border-2 border-verdant-cream bg-transparent cursor-pointer shrink-0"
                            />
                            <input
                              type="text"
                              value={pThemeColorSecondary}
                              onChange={(e) => {
                                setPThemeColorSecondary(e.target.value);
                                handleStyleChange("themeColorSecondary", e.target.value);
                              }}
                              className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-3 border-2 border-verdant-cream focus:outline-none"
                              placeholder="#DCA221"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Backdrop Canvas Canvas color settings */}
                      <div className="border border-verdant-cream/20 bg-verdant-dark p-4 flex flex-col gap-3">
                        <header className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          7. Desktop Base Canvas Color (Page Backdrop)
                        </header>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {[
                            { name: "Bleached Linen (Ivory Cream)", hex: "#FAF8F5" },
                            { name: "Parchment Oatmeal", hex: "#EFECE5" },
                            { name: "Modernist Absolute Off-White", hex: "#F9FAF9" },
                            { name: "Classic Noir Dark Theme", hex: "#0E170F" }
                          ].map((col) => (
                            <button
                              key={col.hex}
                              type="button"
                              onClick={() => {
                                setPCustomCanvasBg(col.hex);
                                handleStyleChange("customCanvasBg", col.hex);
                              }}
                              className={`p-2.5 border text-left cursor-pointer transition-all flex items-center gap-2 bg-verdant-charcoal ${
                                pCustomCanvasBg === col.hex ? "border-2 border-verdant-yellow" : "border-verdant-cream/20 hover:border-verdant-mint"
                              }`}
                            >
                              <span style={{ backgroundColor: col.hex }} className="w-5 h-5 border border-verdant-cream inline-block shrink-0" />
                              <span className="text-[10px] text-verdant-cream font-mono leading-none font-bold">
                                {col.name.split(" ")[0]} ({col.hex})
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={pCustomCanvasBg}
                            onChange={(e) => {
                              setPCustomCanvasBg(e.target.value);
                              handleStyleChange("customCanvasBg", e.target.value);
                            }}
                            className="w-10 h-10 border-2 border-verdant-cream bg-transparent cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={pCustomCanvasBg}
                            onChange={(e) => {
                              setPCustomCanvasBg(e.target.value);
                              handleStyleChange("customCanvasBg", e.target.value);
                            }}
                            className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-3 border-2 border-verdant-cream focus:outline-none"
                            placeholder="#FAF8F5"
                          />
                        </div>
                      </div>

                      {/* Card components background color */}
                      <div className="border border-verdant-cream/20 bg-verdant-dark p-4 flex flex-col gap-3">
                        <header className="font-mono text-[9px] font-black text-[#306634] uppercase tracking-widest">
                          8. Component Cards Background Color
                        </header>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {[
                            { name: "Soft Oats Oatmeal", hex: "#F2EEE3" },
                            { name: "Lighter Parchment", hex: "#EBE7DB" },
                            { name: "Zine Pure White", hex: "#FCFDFD" },
                            { name: "Deep Charcoal Card Dark", hex: "#1D261E" }
                          ].map((col) => (
                            <button
                              key={col.hex}
                              type="button"
                              onClick={() => {
                                setPCustomCardBg(col.hex);
                                handleStyleChange("customCardBg", col.hex);
                              }}
                              className={`p-2.5 border text-left cursor-pointer transition-all flex items-center gap-2 bg-verdant-charcoal ${
                                pCustomCardBg === col.hex ? "border-2 border-verdant-yellow" : "border-verdant-cream/20 hover:border-verdant-mint"
                              }`}
                            >
                              <span style={{ backgroundColor: col.hex }} className="w-5 h-5 border border-verdant-cream inline-block shrink-0" />
                              <span className="text-[10px] text-verdant-cream font-mono leading-none font-bold">
                                {col.name.split(" ")[0]} ({col.hex})
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={pCustomCardBg}
                            onChange={(e) => {
                              setPCustomCardBg(e.target.value);
                              handleStyleChange("customCardBg", e.target.value);
                            }}
                            className="w-10 h-10 border-2 border-verdant-cream bg-transparent cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={pCustomCardBg}
                            onChange={(e) => {
                              setPCustomCardBg(e.target.value);
                              handleStyleChange("customCardBg", e.target.value);
                            }}
                            className="w-full bg-verdant-dark text-verdant-cream font-mono text-xs px-3 border-2 border-verdant-cream focus:outline-none"
                            placeholder="#F2EEE3"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Synchronize state button */}
                  <div className="border-t border-verdant-cream/20 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <span className="font-mono text-[9px] uppercase font-bold text-verdant-lime tracking-wider flex items-center gap-1.5 animate-pulse">
                      <span className="w-2.5 h-2.5 bg-verdant-lime rounded-full" />
                      <span>Live interactive clicks automatically compile onto the preview</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: ProfileSettings = {
                          ...profileSettings,
                          fullName: pFullName,
                          lastNameHighlight: pLastNameHighlight,
                          headline: pHeadline,
                          biography: pBiography,
                          aboutParagraphs: [pPara1, pPara2, pPara3].filter(p => p.trim() !== ""),
                          contactEmail: pContactEmail,
                          instagramUrl: pInstagramUrl,
                          linkedinUrl: pLinkedinUrl,
                          websiteUrl: pWebsiteUrl,
                          profileImageBase64: pProfileImageBase64,
                          fontFamilyHeader: pFontFamilyHeader,
                          fontFamilyBody: pFontFamilyBody,
                          bgAccentStyle: pBgAccentStyle,
                          textCasingStyle: pTextCasingStyle,
                          themeColorPrimary: pThemeColorPrimary,
                          themeColorSecondary: pThemeColorSecondary,
                          customCanvasBg: pCustomCanvasBg,
                          customCardBg: pCustomCardBg
                        };
                        onUpdateProfile(updated);
                        setProfileSuccess("WIX LIVE DESIGN WORKSPACE FULLY SYNCHRONIZED.");
                        setTimeout(() => setProfileSuccess(null), 3000);
                      }}
                      className="cursor-pointer bg-verdant-yellow text-white border-2 border-verdant-cream font-mono text-xs font-black px-6 py-3 uppercase tracking-widest hover:bg-verdant-cream hover:text-white transition-colors shadow-yellow-offset"
                    >
                      PUBLISH & SAVE THEME
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
