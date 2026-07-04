import React, { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { MessageSquare, Search, Clock, ChevronRight } from "lucide-react";
import { api } from "../api";

export function StudyChatsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const data = await api.getChatHistory();
      setChats(data);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-8 pt-12 pb-16 h-full flex flex-col">
        
        <div className="flex items-end justify-between mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-serif tracking-tight mb-2 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              Study Chats
            </h1>
            <p className="text-muted-foreground text-sm">Review your past conversations with the AI study assistant.</p>
          </div>
          
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-9 pl-9 pr-4 rounded-md bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            
            {chats.length > 0 ? (
              chats.map((chat) => (
                <button 
                  key={chat.id} 
                  onClick={() => alert("Chat session replay is coming in Phase 7!")}
                  className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors border-b border-border last:border-0 group text-left"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-base mb-1">{chat.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {chat.subject && <span className="bg-surface px-2 py-0.5 rounded text-xs font-medium border border-border">{chat.subject}</span>}
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {chat.messages_count || 0} msgs</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(chat.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all translate-x-2 group-hover:translate-x-0" />
                </button>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                No chat history found. Open a note to start a new chat!
              </div>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
