import React, { useState, useEffect } from "react";
import { Search, Folder, FileText, Clock, TrendingUp, Calendar, ChevronRight, History, Activity } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { api } from "../api";
import { cache } from "../lib/cache";
import { useNavigate } from "react-router-dom";

export function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeWidget, setActiveWidget] = useState(0);
  const [pinnedFolders, setPinnedFolders] = useState<any[]>(() => cache.get<any[]>('home_pinned') || []);
  const [recentNotes, setRecentNotes] = useState<any[]>(() => cache.get<any[]>('home_recent') || []);


  useEffect(() => {
    loadDashboardData();
    const timer = setInterval(() => {
      setActiveWidget((prev) => (prev + 1) % 3);
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      const folders = await api.getFolders();
      const pinned = folders.filter((f: any) => f.is_pinned);
      setPinnedFolders(pinned);
      cache.set('home_pinned', pinned);

      const files = await api.getAllFiles();
      const recent = files.slice(0, 6); // Top 6 most recent files
      setRecentNotes(recent);
      cache.set('home_recent', recent);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto px-8 pt-12 pb-8 h-full flex flex-col relative">

        {/* Top Navbar for Home Screen */}
        <header className="absolute top-6 right-8 z-10">
          <a href="/folio.apk" download className="text-[15px] font-medium text-primary hover:text-foreground transition-colors flex items-center gap-1 hover:underline underline-offset-4 decoration-border">
            Install App <span className="text-[13px] ml-0.5">↗</span>
          </a>
        </header>

        {/* Hero Search Section (Fixed at top) */}
        <div className="flex flex-col items-center mt-6 mb-12 shrink-0 animate-in fade-in slide-in-from-bottom-4">
          <h1 className="text-[44px] font-serif tracking-tight mb-8 text-center text-foreground">
            What are we studying today?
          </h1>
          <div className="w-full max-w-2xl relative group">
            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search subjects, notes, or chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[52px] pl-14 pr-6 rounded-[14px] bg-card border border-border focus:border-ring focus:ring-4 focus:ring-ring/10 outline-none transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-lg placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

        {/* Main Content Split Layout (Takes remaining height, scrolls internally) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 min-h-0">

          {/* Left Column: Library & Recent */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">

            {/* Library Grid (Fixed height based on content) */}
            <section className="shrink-0 mb-8">
              <h2 className="text-sm font-medium tracking-wide text-foreground mb-4">Pinned to Home</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {pinnedFolders.length > 0 ? (
                  pinnedFolders.map((folder) => (
                    <button key={folder.id} onClick={() => navigate(`/library?folder=${folder.id}`)} className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all text-left group">
                      <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                        <Folder className="w-[18px] h-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-medium text-foreground truncate text-[14px]">{folder.name}</h3>
                        <p className="text-[12px] text-muted-foreground mt-0.5">{folder.notes_count || 0} notes</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-sm text-muted-foreground bg-card border border-dashed border-border rounded-xl">
                    No pinned folders yet. Pin them from the Library!
                  </div>
                )}
              </div>
            </section>

            {/* Recently Opened (Scrollable list) */}
            <section className="flex flex-col flex-1 min-h-0">
              <h2 className="text-sm font-medium tracking-wide text-foreground mb-4 flex items-center gap-2 shrink-0">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Recently Opened
              </h2>
              <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-3 scroll-smooth overscroll-y-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                {recentNotes.length > 0 ? (
                  recentNotes.map((note) => (
                    <button key={note.id} onClick={() => navigate(`/study?file=${note.id}`)} className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all text-left group">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-medium text-foreground text-[15px] truncate">{note.name}</h4>
                          <p className="text-[13px] text-muted-foreground mt-0.5 truncate">{new Date(note.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="text-[12px] text-muted-foreground whitespace-nowrap ml-4">{note.status}</span>
                    </button>
                  ))
                ) : (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No recent notes found.
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* Right Column: Widgets */}
          <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-sm font-medium tracking-wide text-foreground">Study Overview</h2>
              {/* Carousel Indicators */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveWidget(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${activeWidget === idx ? "bg-foreground w-4" : "bg-border hover:bg-muted-foreground"}`}
                  />
                ))}
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-[20px] bg-card border border-border">
              <div
                className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeWidget * 100}%)` }}
              >

                {/* Widget 1: Weekly Activity */}
                <div className="w-full shrink-0 h-full p-8 flex flex-col justify-center items-center text-center">
                  <div className="w-full flex items-center justify-between mb-auto">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-foreground" />
                      <span className="font-medium text-[15px]">Weekly Activity</span>
                    </div>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="mt-auto text-muted-foreground text-sm flex flex-col items-center">
                    <Activity className="w-10 h-10 mb-4 opacity-20" />
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Study stats coming soon!</h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed max-w-[250px] mx-auto">We'll track your weekly activity here once it's built.</p>
                  </div>
                </div>

                {/* Widget 2: Calendar */}
                <div className="w-full shrink-0 h-full p-6 flex flex-col justify-start">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-secondary" />
                      <span className="font-medium text-[15px]">July 2026</span>
                    </div>
                    <div className="flex gap-1">
                      <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground">&lt;</button>
                      <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground">&gt;</button>
                    </div>
                  </div>
                  {/* Minimal Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground mb-2">
                    <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
                  </div>
                  <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-[13px]">
                    {/* Mock empty days for offset */}
                    <div className="py-1"></div><div className="py-1"></div>
                    {/* Mock days */}
                    {[...Array(31)].map((_, i) => {
                      const day = i + 1;
                      const isToday = day === new Date().getDate();
                      const isStudied = false;

                      return (
                        <div key={day} className="flex justify-center">
                          <div className={`w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground font-medium shadow-sm' :
                              isStudied ? 'bg-primary/10 text-primary font-medium' :
                                'text-foreground hover:bg-muted cursor-pointer transition-colors'
                            }`}>
                            {day}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Widget 3: History Timeline */}
                <div className="w-full shrink-0 h-full p-8 flex flex-col justify-start">
                  <div className="flex items-center gap-3 mb-10">
                    <History className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold text-lg text-foreground tracking-tight">Recent Milestones</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex flex-col gap-8 relative before:absolute before:inset-0 before:mx-auto before:h-full before:w-[2px] before:bg-surface">

                      {recentNotes.slice(0,2).map((note, idx) => (
                        <div key={note.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-surface shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                          </div>
                          <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-[14px] border border-border bg-card hover:border-muted-foreground/30 transition-colors">
                            <div className="text-[12px] font-medium text-muted-foreground/70 mb-1.5">{new Date(note.created_at).toLocaleDateString()}</div>
                            <div className="text-[14px] text-foreground font-medium leading-snug">Uploaded "{note.name}"</div>
                          </div>
                        </div>
                      ))}
                      {recentNotes.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center bg-card p-4 rounded-xl border border-border">No recent milestones yet. Upload notes to see activity!</div>
                      )}

                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
