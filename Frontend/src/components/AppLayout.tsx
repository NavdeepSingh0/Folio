import React, { useState, useEffect } from "react";
import { BookOpen, Home, MessageSquare, Plus, Settings, ChevronLeft, Menu, Database, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Sidebar - z.ai theme */}
      <aside 
        className={`border-r border-border flex flex-col bg-surface transition-all duration-300 relative z-20 ${
          sidebarOpen ? "w-64" : "w-[68px]"
        }`}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-center shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center justify-between w-full px-4">
              <span className="text-xl font-semibold tracking-tight px-2">Folio</span>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div 
              className="relative w-10 h-10 group cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <div className="absolute inset-0 bg-primary text-primary-foreground rounded-[10px] flex items-center justify-center font-bold text-xl transition-opacity group-hover:opacity-0 shadow-sm">
                F
              </div>
              <div className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                <Menu className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Group (Floating Card Style when collapsed) */}
        <div className={`flex-1 py-4 flex flex-col ${sidebarOpen ? 'px-3 space-y-2' : 'items-center space-y-6'}`}>
          
          <div className={sidebarOpen ? "" : "bg-card border border-border rounded-2xl shadow-sm p-1.5 flex flex-col gap-2"}>
            <Link 
              to="/" 
              className={sidebarOpen 
                ? `w-full flex items-center justify-start gap-3 px-3 py-2.5 text-sm rounded-md font-medium transition-colors ${isActive("/") ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
                : `w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${isActive("/") ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
              }
              title="Home"
            >
              <Home className="w-[18px] h-[18px] shrink-0" />
              {sidebarOpen && <span>Home</span>}
            </Link>
            
            <Link 
              to="/library" 
              className={sidebarOpen 
                ? `w-full flex items-center justify-start gap-3 px-3 py-2.5 text-sm rounded-md font-medium transition-colors ${isActive("/library") ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
                : `w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${isActive("/library") ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
              }
              title="Library"
            >
              <BookOpen className="w-[18px] h-[18px] shrink-0" />
              {sidebarOpen && <span>Library</span>}
            </Link>
          </div>

          {/* Action Buttons (Circular style when collapsed) */}
          <div className={sidebarOpen ? "pt-4" : "flex flex-col gap-3"}>
            <Link 
              to="/upload" 
              className={sidebarOpen 
                ? "w-full flex items-center justify-start gap-3 px-3 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                : "w-10 h-10 flex items-center justify-center bg-secondary text-secondary-foreground rounded-full hover:bg-muted transition-colors"
              } 
              title="New Upload"
            >
              <Plus className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>New Upload</span>}
            </Link>

            <Link 
              to="/chats"
              className={sidebarOpen 
                ? "w-full flex items-center justify-start gap-3 px-3 py-2.5 text-sm rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mt-2"
                : "w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
              }
              title="Study Chats"
            >
              <MessageSquare className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>Study Chats</span>}
            </Link>
            
            <Link 
              to="/knowledge-base"
              className={sidebarOpen 
                ? "w-full flex items-center justify-start gap-3 px-3 py-2.5 text-sm rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                : "w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
              }
              title="Knowledge Base"
            >
              <Database className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>Knowledge Base</span>}
            </Link>
          </div>

        </div>

        <div className={`p-4 shrink-0 flex ${sidebarOpen ? "flex-row justify-between" : "flex-col gap-3"} items-center`}>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`flex items-center ${sidebarOpen ? "justify-center px-3" : "justify-center w-10 h-10"} py-2 text-sm rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors`}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
          </button>
          
          <Link to="/settings" className={`flex items-center ${sidebarOpen ? "justify-start gap-3 px-3" : "justify-center w-10 h-10"} py-2 text-sm rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors`} title="Settings">
            <Settings className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0 h-full bg-background">
        <div className="flex-1 overflow-y-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
