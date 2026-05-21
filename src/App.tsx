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
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from "firebase/firestore";

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
        setProfileSettings(data);
        localStorage.setItem("portfolio_profile_settings", JSON.stringify(data));
      } else {
        // Automatically seed/bootstrap default profile settings if vacant
        setDoc(doc(db, "profile", "settings"), DEFAULT_PROFILE_SETTINGS).catch((err) => {
          console.error("Error seeding default profile to Firebase:", err);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "profile/settings");
    });

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
      await setDoc(doc(db, "projects", newProj.id), newProj);
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
      await setDoc(doc(db, "projects", updatedProj.id), updatedProj);
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
      await setDoc(doc(db, "profile", "settings"), updatedSettings);
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
    "--color-verdant-dark": profileSettings.customCanvasBg || "#FAF8F5",
    "--color-verdant-charcoal": profileSettings.customCardBg || "#F2EEE3",
    "--color-verdant-mint": profileSettings.themeColorPrimary || "#306634",
    "--color-verdant-yellow": profileSettings.themeColorSecondary || "#DCA221",
    "--color-verdant-cream": profileSettings.themeColorTextHeader || "#142215",
    "--color-verdant-gray": profileSettings.themeColorTextBody || "#4B564A",
    "--text-casing-transform": profileSettings.textCasingStyle || "uppercase",
    "--font-syne": profileSettings.fontFamilyHeader === "Playfair Display" 
                   ? "'Playfair Display', serif" 
                   : profileSettings.fontFamilyHeader === "Space Grotesk"
                   ? "'Space Grotesk', sans-serif"
                   : profileSettings.fontFamilyHeader === "JetBrains Mono"
                   ? "'JetBrains Mono', monospace"
                   : profileSettings.fontFamilyHeader === "Plus Jakarta Sans"
                   ? "'Plus Jakarta Sans', sans-serif"
                   : "'Syne', sans-serif",
    "--font-sans": profileSettings.fontFamilyBody === "JetBrains Mono"
                   ? "'JetBrains Mono', monospace"
                   : profileSettings.fontFamilyBody === "Plus Jakarta Sans"
                   ? "'Plus Jakarta Sans', sans-serif"
                   : "'Plus Jakarta Sans', sans-serif",
  } as any;

  return (
    <div 
      style={appStyles}
      className={`min-h-screen bg-verdant-dark text-verdant-cream flex flex-col font-sans verdant-grain border-t-8 border-verdant-mint relative overflow-x-hidden`}
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
      <Header activeTab={activeTab} onChangeTab={handleChangeTab} profileSettings={profileSettings} />

      {/* Main View Transition Container */}
      <main className="flex-grow flex flex-col relative z-10" id="main-view-container">
        
        {/* Render interactive scrapbook stickers overlay inside scroll wrapper */}
        {activeTab !== "ADMIN" && activeTab !== "CONNECT" && (
          <StickersOverlay 
            stickers={profileSettings.stickers || []}
            activeTab={activeTab}
            isAdmin={isAdmin}
            onUpdateStickers={(updatedStickers) => {
              setProfileSettings(prev => ({
                ...prev,
                stickers: updatedStickers
              }));
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
                onUpdateSettings={(updated) => setProfileSettings(updated)}
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
                onUpdateSettings={(updated) => setProfileSettings(updated)}
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
      <Footer onChangeTab={handleChangeTab} profileSettings={profileSettings} />

      {/* Floating Scrapbook Designer Toolbar if administrator is authorized */}
      {isAdmin && (
        <ScrapbookToolbar
          profileSettings={profileSettings}
          activeTab={activeTab}
          onUpdateSettings={(updated) => {
            setProfileSettings(updated);
          }}
          onSaveDatabase={async () => {
            await handleUpdateProfile(profileSettings);
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
