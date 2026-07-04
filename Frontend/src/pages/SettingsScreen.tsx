import React, { useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { User, Bell, Shield, Paintbrush, Bot } from "lucide-react";

export function SettingsScreen() {
  const [activeTab, setActiveTab] = useState("general");
  const [highlightToAsk, setHighlightToAsk] = useState(true);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-8 pt-12 pb-16 h-full flex flex-col">
        
        <div className="mb-10 shrink-0">
          <h1 className="text-3xl font-serif tracking-tight mb-2">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account preferences and application settings.</p>
        </div>

        <div className="flex flex-1 overflow-hidden gap-12">
          
          {/* Settings Sidebar */}
          <div className="w-64 shrink-0 space-y-1">
            {[
              { id: "general", label: "General", icon: User },
              { id: "ai", label: "AI Assistant", icon: Bot },
              { id: "appearance", label: "Appearance", icon: Paintbrush },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "privacy", label: "Privacy & Security", icon: Shield }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id 
                    ? "bg-secondary text-secondary-foreground font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto pr-4">
            
            {activeTab === "ai" && (
              <div className="animate-in fade-in">
                <h2 className="text-lg font-medium mb-6">AI Assistant Preferences</h2>
                
                <div className="space-y-8">
                  {/* Context Awareness Setting */}
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground mb-1">Highlight-to-Ask Context</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          When enabled, highlighting text in your markdown notes will show a tooltip allowing you to instantly pipe the selected text into the chat assistant.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer mt-1">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={highlightToAsk}
                          onChange={() => setHighlightToAsk(!highlightToAsk)}
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-foreground after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>

                  {/* AI Model Setting */}
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="font-medium text-foreground mb-1">Default AI Model</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select the primary model used for generating summaries and answering study questions.
                    </p>
                    <select className="w-full max-w-xs h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary">
                      <option>Gemini 1.5 Pro</option>
                      <option>Gemini 1.5 Flash</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "general" && (
              <div className="animate-in fade-in">
                <h2 className="text-lg font-medium mb-6">General Profile</h2>
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Display Name</label>
                    <input type="text" defaultValue="Student" className="w-full max-w-md h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                    <input type="email" defaultValue="student@example.com" className="w-full max-w-md h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="animate-in fade-in">
                <h2 className="text-lg font-medium mb-6">Appearance</h2>
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-8">
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Application Theme</h3>
                    <p className="text-sm text-muted-foreground mb-4">Choose how Folio looks to you. Select a single theme, or sync with your system.</p>
                    <div className="flex gap-4">
                      <button className="flex-1 p-4 border-2 border-primary rounded-xl bg-background flex flex-col items-center gap-2 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">☀️</div>
                        <span className="text-sm font-medium">Light</span>
                      </button>
                      <button className="flex-1 p-4 border-2 border-transparent hover:border-border rounded-xl bg-background flex flex-col items-center gap-2 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">🌙</div>
                        <span className="text-sm font-medium">Dark</span>
                      </button>
                      <button className="flex-1 p-4 border-2 border-transparent hover:border-border rounded-xl bg-background flex flex-col items-center gap-2 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-[#121212] border border-border shadow-sm"></div>
                        <span className="text-sm font-medium">System</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="animate-in fade-in">
                <h2 className="text-lg font-medium mb-6">Notifications</h2>
                <div className="bg-card border border-border rounded-xl shadow-sm divide-y divide-border">
                  <div className="p-6 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Study Reminders</h3>
                      <p className="text-sm text-muted-foreground max-w-md">Receive weekly summaries and gentle nudges to keep your study streak active.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-foreground after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="p-6 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground mb-1">AI Assistant Mentions</h3>
                      <p className="text-sm text-muted-foreground max-w-md">Get notified when your AI assistant finishes processing a large document upload.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-foreground after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="animate-in fade-in">
                <h2 className="text-lg font-medium mb-6">Privacy & Security</h2>
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground mb-1">Local Storage Mode</h3>
                        <p className="text-sm text-muted-foreground max-w-md">Keep all notes and chat logs strictly on your device. Syncing across devices will be disabled.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer mt-1">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-foreground after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-red-50/50 border border-red-200 rounded-xl p-6">
                    <h3 className="font-medium text-red-700 mb-1">Danger Zone</h3>
                    <p className="text-sm text-red-600/80 mb-4 max-w-md">Permanently delete your account and all associated study materials. This action cannot be undone.</p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </AppLayout>
  );
}
