/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WelcomeView from "./components/WelcomeView";
import JournalView from "./components/JournalView";
import WorkView from "./components/WorkView";
import SayHiView from "./components/SayHiView";
import AdminView from "./components/AdminView";
import ScrapbookToolbar from "./components/ScrapbookToolbar";
import StickersOverlay from "./components/StickersOverlay";
import { DEFAULT_PROJECTS } from "./data/initialProjects";
import { DEFAULT_PROFILE_SETTINGS } from "./data/initialProfile";
import { ActiveTab, Project, ProfileSettings } from "./types";
import { db, OperationType, handleFirestoreError } from "./lib/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, getDoc, updateDoc, increment } from "firebase/firestore";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("HOME");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem("portfolio_admin_auth") === "true";
  });

  // Initialize dynamic project catalog from standard client-side storage as a quick local baseline
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem("portfolio_projects_ledger");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse localized projects ledger:", e);
    }
    return DEFAULT_PROJECTS;
  });

  // Initialize dynamic profile settings from standard client-side storage as a quick local or default baseline
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(() => {
    try {
      const saved = localStorage.getItem("portfolio_profile_settings");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse localized profile settings:", e);
    }
    return DEFAULT_PROFILE_SETTINGS;
  });

  // 1. Synchronize Firebase Firestore database with real-time stream
  useEffect(() => {
    // A. Sync projects collection
    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      if (snapshot.empty) {
        // If Firestore projects are completely vacant, automatically seed it with default portfolio data
        DEFAULT_PROJECTS.forEach((proj) => {
          setDoc(doc(db, "projects", proj.id), proj).catch((err) => {
            console.error("Error seeding default project to Firebase:", err);
          });
        });
      } else {
        const loaded: Project[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as Project);
        });
        // Sort descending or maintain order
        const sorted = loaded.sort((a, b) => {
          const aIdStr = String(a.id);
          const bIdStr = String(b.id);
          return bIdStr.localeCompare(aIdStr);
        });
        setProjects(sorted);
        localStorage.setItem("portfolio_ledger_synced", "true");
        localStorage.setItem("portfolio_projects_ledger", JSON.stringify(sorted));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "projects");
    });

    // B. Sync profile document
    const unsubProfile = onSnapshot(doc(db, "profile", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ProfileSettings;
        // Migrate any legacy palette defaults or old copy
        const hasLegacyGrid = data.bgAccentStyle === "grid-mesh" || data.bgAccentStyle === "checker-grid" || data.bgAccentStyle === "dot-matrix" || data.bgAccentStyle === "tech-blueprint" || data.bgAccentStyle === "carbon-mesh";
        const hasLegacyColor = data.themeColorPrimary === "#306634" || data.themeColorSecondary === "#DCA221" || data.customCanvasBg === "#FAF8F5" || hasLegacyGrid;
        // Only migrate specific field if that field contains legacy template words
        const needsBioMigration = Boolean(data.biography && data.biography.includes("limits of what's computable"));
        const needsDedicationMigration = Boolean(data.dedicationText && data.dedicationText.includes("pixel harmony"));
        const needsParagraphMigration = Boolean(data.aboutParagraphs && data.aboutParagraphs.some(p => p.includes("limits of what's computable")));
        const hasStudentBio = Boolean(data.biography && data.biography.includes("Computer Science student"));
        const hasStudentParagraphs = Boolean(data.aboutParagraphs && data.aboutParagraphs.some(p => p.includes("Computer Science student")));

        const cleanedBio = needsBioMigration 
          ? DEFAULT_PROFILE_SETTINGS.biography 
          : (data.biography ? data.biography.replaceAll("Computer Science student", "Computer Science graduate") : DEFAULT_PROFILE_SETTINGS.biography);
        const cleanedParagraphs = needsParagraphMigration 
          ? DEFAULT_PROFILE_SETTINGS.aboutParagraphs 
          : (data.aboutParagraphs && data.aboutParagraphs.length > 0 
              ? data.aboutParagraphs.map(p => p.replaceAll("Computer Science student", "Computer Science graduate")) 
              : DEFAULT_PROFILE_SETTINGS.aboutParagraphs);

        const sanitized: ProfileSettings = {
          ...data,
          themeColorPrimary: (!data.themeColorPrimary || data.themeColorPrimary === "#306634" || data.themeColorPrimary.includes("3066")) ? "#0A0A0A" : data.themeColorPrimary,
          themeColorSecondary: (!data.themeColorSecondary || data.themeColorSecondary === "#DCA221") ? "#D5001C" : data.themeColorSecondary,
          customCanvasBg: (!data.customCanvasBg || data.customCanvasBg === "#FAF8F5") ? "#F8F9FA" : data.customCanvasBg,
          customCardBg: (!data.customCardBg || data.customCardBg === "#F2EEE3") ? "#FFFFFF" : data.customCardBg,
          bgAccentStyle: hasLegacyGrid || !data.bgAccentStyle ? "solid-plain" : data.bgAccentStyle,
          fontFamilyHeader: (!data.fontFamilyHeader || data.fontFamilyHeader === "Syne") ? "Plus Jakarta Sans" : data.fontFamilyHeader,
          fontFamilyBody: (!data.fontFamilyBody) ? "Plus Jakarta Sans" : data.fontFamilyBody,
          headline: data.headline ? data.headline.replaceAll("STUDENT", "GRADUATE") : DEFAULT_PROFILE_SETTINGS.headline,
          biography: cleanedBio,
          aboutParagraphs: cleanedParagraphs,
          dedicationTitle: data.dedicationTitle || DEFAULT_PROFILE_SETTINGS.dedicationTitle,
          dedicationText: needsDedicationMigration ? DEFAULT_PROFILE_SETTINGS.dedicationText : (data.dedicationText || DEFAULT_PROFILE_SETTINGS.dedicationText),
          projectCategories: (data.projectCategories && data.projectCategories.length > 0) ? data.projectCategories : DEFAULT_PROFILE_SETTINGS.projectCategories,
        };
        setProfileSettings(sanitized);
        localStorage.setItem("portfolio_profile_settings", JSON.stringify(sanitized));

        // If legacy colors existed in Firestore, update remote database so it stays updated
        if (hasLegacyColor || needsBioMigration || needsDedicationMigration || needsParagraphMigration || hasStudentBio || hasStudentParagraphs) {
          setDoc(doc(db, "profile", "settings"), sanitized, { merge: true }).catch((e) => {
            console.error("Auto-migrated legacy theme colors in Firestore:", e);
          });
        }
      } else {
        // Automatically seed/bootstrap default profile settings if vacant
        setDoc(doc(db, "profile", "settings"), DEFAULT_PROFILE_SETTINGS).catch((err) => {
          console.error("Error seeding default profile to Firebase:", err);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "profile/settings");
    });

    // C. Increment page view analytics (debounced to once per session)
    const trackPageView = async () => {
      if (!sessionStorage.getItem("portfolio_page_viewed")) {
        try {
          const viewsRef = doc(db, "analytics", "views");
          const viewsSnap = await getDoc(viewsRef);
          if (viewsSnap.exists()) {
            await updateDoc(viewsRef, {
              count: increment(1)
            });
          } else {
            await setDoc(viewsRef, {
              count: 1
            });
          }
          sessionStorage.setItem("portfolio_page_viewed", "true");
        } catch (err) {
          console.error("Error tracking page view:", err);
        }
      }
    };
    trackPageView();

    return () => {
      unsubProjects();
      unsubProfile();
    };
  }, []);

  // Navigate tabs with back-to-top fluid triggers
  const handleChangeTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Safe callback when selecting projects in Gallery to boot them in the Lab
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    handleChangeTab("PROJECTS");
  };

  const handleClearSelectedProject = () => {
    setSelectedProjectId(null);
  };

  // State Mutators passed to Admin Dashboard - now syncing seamlessly to Firebase!
  const handleAddProject = async (newProj: Project) => {
    try {
      // Local state is optimistic, but we also save directly to Firebase
      // Sanitizing undefined properties ensures 100% compatibility with Firestore
      const cleaned = JSON.parse(JSON.stringify(newProj));
      await setDoc(doc(db, "projects", newProj.id), cleaned);
      setProjects((prev) => {
        const updated = [newProj, ...prev].filter((p, i, self) => self.findIndex((x) => x.id === p.id) === i);
        localStorage.setItem("portfolio_projects_ledger", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `projects/${newProj.id}`);
    }
  };

  const handleUpdateProject = async (updatedProj: Project) => {
    try {
      const cleaned = JSON.parse(JSON.stringify(updatedProj));
      await setDoc(doc(db, "projects", updatedProj.id), cleaned);
      setProjects((prev) => {
        const updated = prev.map((p) => p.id === updatedProj.id ? updatedProj : p);
        localStorage.setItem("portfolio_projects_ledger", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${updatedProj.id}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projects", id));
      setProjects((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        localStorage.setItem("portfolio_projects_ledger", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
    }
  };

  const handleUpdateProfile = async (updatedSettings: ProfileSettings) => {
    try {
      const cleaned = JSON.parse(JSON.stringify(updatedSettings));
      await setDoc(doc(db, "profile", "settings"), cleaned);
      setProfileSettings(updatedSettings);
      localStorage.setItem("portfolio_profile_settings", JSON.stringify(updatedSettings));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "profile/settings");
    }
  };

  const handleResetProjects = async () => {
    try {
      // Reset locally
      setProjects(DEFAULT_PROJECTS);
      setProfileSettings(DEFAULT_PROFILE_SETTINGS);
      localStorage.removeItem("portfolio_projects_ledger");
      localStorage.removeItem("portfolio_profile_settings");

      // Reset on Firebase database synchronously
      await setDoc(doc(db, "profile", "settings"), DEFAULT_PROFILE_SETTINGS);

      // Clean live Firestore collection projects (retrieve active docs and delete sequentially)
      const q = await getDocs(collection(db, "projects"));
      const deletePromises = q.docs.map((d) => deleteDoc(doc(db, "projects", d.id)));
      await Promise.all(deletePromises);

      // Re-seed original default projects into database
      const seedPromises = DEFAULT_PROJECTS.map((proj) => setDoc(doc(db, "projects", proj.id), proj));
      await Promise.all(seedPromises);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "reset_baseline");
    }
  };

  const appStyles = {
    "--color-verdant-dark": profileSettings.customCanvasBg || "#F8F9FA",
    "--color-verdant-charcoal": profileSettings.customCardBg || "#FFFFFF",
    "--color-verdant-mint": profileSettings.themeColorPrimary || "#0A0A0A",
    "--color-verdant-yellow": profileSettings.themeColorSecondary || "#D5001C",
    "--color-verdant-cream": profileSettings.themeColorTextHeader || "#0A0A0A",
    "--color-verdant-gray": profileSettings.themeColorTextBody || "#52525B",
    "--text-casing-transform": profileSettings.textCasingStyle || "uppercase",
    "--font-syne": profileSettings.fontFamilyHeader === "Space Grotesk" 
                   ? "'Space Grotesk', sans-serif" 
                   : profileSettings.fontFamilyHeader === "JetBrains Mono"
                   ? "'JetBrains Mono', monospace"
                   : profileSettings.fontFamilyHeader === "Playfair Display"
                   ? "'Playfair Display', serif"
                   : "'Plus Jakarta Sans', sans-serif",
    "--font-sans": profileSettings.fontFamilyBody === "JetBrains Mono"
                   ? "'JetBrains Mono', monospace"
                   : "'Plus Jakarta Sans', sans-serif",
  } as any;

  return (
    <div 
      style={appStyles}
      className={`min-h-screen bg-verdant-dark text-verdant-cream flex flex-col font-sans border-t-2 border-verdant-yellow relative overflow-x-hidden selection:bg-red-50 selection:text-red-900`}
    >
      
      {/* Global Peaceful Nature Video Wallpaper */}
      {profileSettings.customBgVideoUrl && (
        <video
          key={profileSettings.customBgVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          referrerPolicy="no-referrer"
          className="fixed inset-0 w-full h-full object-cover opacity-10 pointer-events-none z-0"
        />
      )}

      {/* Universal Sticky Header (Images 1-4) */}
      <Header 
        activeTab={activeTab} 
        onChangeTab={handleChangeTab} 
        profileSettings={profileSettings} 
        isAdmin={isAdmin}
      />

      {/* Main View Transition Container */}
      <main className="flex-grow flex flex-col relative z-10" id="main-view-container">
        
        {/* Render interactive scrapbook stickers overlay inside scroll wrapper */}
        {activeTab !== "ADMIN" && activeTab !== "CONNECT" && (
          <StickersOverlay 
            stickers={profileSettings.stickers || []}
            activeTab={activeTab}
            isAdmin={isAdmin}
            profileSettings={profileSettings}
            onUpdateStickers={(updatedStickers) => {
              const updated = {
                ...profileSettings,
                stickers: updatedStickers
              };
              setProfileSettings(updated);
              handleUpdateProfile(updated).catch(err => console.error("Error auto-saving stickers:", err));
            }}
          />
        )}
        <AnimatePresence mode="wait">
          {activeTab === "HOME" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-grow flex flex-col"
            >
              <WelcomeView 
                onChangeTab={handleChangeTab} 
                onSelectProject={handleSelectProject} 
                projects={projects}
                profileSettings={profileSettings}
                isAdmin={isAdmin}
                onUpdateSettings={(updated) => {
                  setProfileSettings(updated);
                  handleUpdateProfile(updated).catch(err => console.error("Auto-saving profile:", err));
                }}
              />
            </motion.div>
          )}

          {activeTab === "PROJECTS" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-grow flex flex-col"
            >
              <WorkView 
                onChangeTab={handleChangeTab} 
                selectedProjectId={selectedProjectId}
                onClearSelectedProject={handleClearSelectedProject}
                projects={projects}
                profileSettings={profileSettings}
                isAdmin={isAdmin}
                onUpdateSettings={(updated) => {
                  setProfileSettings(updated);
                  handleUpdateProfile(updated).catch(err => console.error("Auto-saving profile:", err));
                }}
              />
            </motion.div>
          )}

          {activeTab === "ABOUT" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-grow flex flex-col"
            >
              <JournalView 
                onChangeTab={handleChangeTab} 
                profileSettings={profileSettings}
                isAdmin={isAdmin}
                onUpdateSettings={(updated) => {
                  setProfileSettings(updated);
                  handleUpdateProfile(updated).catch(err => console.error("Auto-saving profile:", err));
                }}
              />
            </motion.div>
          )}

          {activeTab === "CONNECT" && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-grow flex flex-col"
            >
              <SayHiView profileSettings={profileSettings} />
            </motion.div>
          )}

          {activeTab === "ADMIN" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-grow flex flex-col"
            >
              <AdminView
                onChangeTab={handleChangeTab}
                projects={projects}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                onResetProjects={handleResetProjects}
                profileSettings={profileSettings}
                onUpdateProfile={handleUpdateProfile}
                isAdmin={isAdmin}
                onAuthChange={setIsAdmin}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Responsive Global Footer (Images 1-4) with hidden link inside */}
      <Footer onChangeTab={handleChangeTab} profileSettings={profileSettings} isAdmin={isAdmin} />

      {/* Persistent Admin Quick-Return & Control Bar when logged in */}
      {isAdmin && (
        <div 
          className="fixed bottom-5 left-6 z-50 flex items-center gap-3 bg-neutral-950/95 text-white border border-neutral-700/80 px-4 py-2.5 shadow-2xl backdrop-blur-md font-mono select-none"
          id="admin-persistent-dock"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D5001C] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">ADMIN MODE ACTIVE</span>
          </div>

          <div className="h-3 w-px bg-neutral-700" />

          {activeTab !== "ADMIN" ? (
            <button
              onClick={() => handleChangeTab("ADMIN")}
              className="bg-[#D5001C] hover:bg-[#b00017] text-white px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Return to the full Admin Management Dashboard"
            >
              <span>RETURN TO DASHBOARD</span>
              <span>➔</span>
            </button>
          ) : (
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              VIEWING DASHBOARD
            </span>
          )}

          <button
            onClick={() => {
              setIsAdmin(false);
              localStorage.removeItem("portfolio_admin_auth");
            }}
            className="text-neutral-400 hover:text-white text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 border border-transparent hover:border-neutral-600 transition-colors cursor-pointer"
            title="Log out of admin session"
          >
            LOGOUT
          </button>
        </div>
      )}

      {/* Floating Scrapbook Designer Toolbar if administrator is authorized */}
      {isAdmin && (
        <ScrapbookToolbar
          profileSettings={profileSettings}
          activeTab={activeTab}
          onChangeTab={handleChangeTab}
          onUpdateSettings={(updated) => {
            setProfileSettings(updated);
          }}
          onSaveDatabase={async (latest) => {
            await handleUpdateProfile(latest || profileSettings);
          }}
          onCloseAdmin={() => {
            setIsAdmin(false);
            localStorage.removeItem("portfolio_admin_auth");
          }}
        />
      )}
    </div>
  );
}
