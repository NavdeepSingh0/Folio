import React, { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { Database, Search, Filter, Hash, ExternalLink, Loader2 } from "lucide-react";
import { api } from "../api";

export function KnowledgeBaseScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [facts, setFacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFacts()
      .then(data => setFacts(Array.isArray(data) ? data : []))
      .catch(err => console.error("Failed to load facts:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = facts.filter(f =>
    f.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-8 pt-12 pb-16 h-full flex flex-col">
        
        <div className="flex items-end justify-between mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-serif tracking-tight mb-2 flex items-center gap-3">
              <Database className="w-8 h-8 text-primary" />
              Knowledge Base
            </h1>
            <p className="text-muted-foreground text-sm">Your extracted facts, definitions, and core concepts synthesized from your notes.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <input
                type="text"
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-9 pl-9 pr-4 rounded-md bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center text-muted-foreground">
              <Database className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-foreground mb-1">No facts yet</p>
              <p className="text-sm">Upload and process files to populate your knowledge base.<br/>Facts are extracted automatically when a Gemini API key is configured.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((fact) => (
                <div key={fact.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-sm hover:border-primary/40 transition-all group flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg text-foreground leading-tight">{fact.concept}</h3>
                    <button className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                    {fact.description}
                  </p>

                  {fact.tags && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {fact.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                          <Hash className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
