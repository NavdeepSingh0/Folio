import { useState, useRef, useEffect } from "react";
import { X, Play, Loader2, StopCircle, Copy, Save, FileText, CheckCircle2, BookOpen, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Custom Dropdown Component
function CustomSelect({ value, onChange, options, label }: { value: string, onChange: (v: string) => void, options: {value: string, label: string}[], label: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <label className="text-[11px] font-bold text-indigo-900/60 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full text-sm bg-gray-50 hover:bg-gray-100 border ${isOpen ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-gray-200'} rounded-lg p-2.5 text-gray-800 shadow-sm outline-none transition-all flex items-center justify-between`}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-1">
            {options.map(opt => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`p-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${value === opt.value ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {opt.label}
                {value === opt.value && <CheckCircle2 size={14} className="text-indigo-500" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface StudySidebarProps {
  markdown: string;
  onClose: () => void;
  model: string;
  projectId?: string;
  chapterId?: string;
  unitId?: string;
  collectionId?: string;
}

interface GenerationResult {
  id: string;
  type: string;
  content: string;
  isStreaming: boolean;
  contextUsed: string;
}

export function StudySidebar({ 
  markdown, 
  onClose, 
  model,
  projectId,
  chapterId,
  unitId,
  collectionId
}: StudySidebarProps) {
  const [type, setType] = useState<string>("flashcards");
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [quantity, setQuantity] = useState<string>("5");
  const [length, setLength] = useState<string>("Medium");
  const [language, setLanguage] = useState<string>("English");
  const [contextType, setContextType] = useState<string>("file");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Track selection for "explain" type
  const [selectedText, setSelectedText] = useState("");
  
  useEffect(() => {
    const handleSelectionChange = () => {
      if (type === "explain" || type === "custom" || contextType === "selection") {
        const text = window.getSelection()?.toString() || "";
        if (text) setSelectedText(text);
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [type, contextType]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Create new result entry
    const newId = Date.now().toString();
    
    let contextLabel = contextType;
    let actualContextId = null;
    
    if (contextType === "file") {
      actualContextId = projectId;
      contextLabel = "Current File";
    } else if (contextType === "chapter") {
      actualContextId = chapterId;
      contextLabel = "Current Chapter";
    } else if (contextType === "unit") {
      actualContextId = unitId;
      contextLabel = "Current Unit";
    } else if (contextType === "collection") {
      actualContextId = collectionId;
      contextLabel = "Entire Collection";
    } else if (contextType === "workspace") {
      contextLabel = "Entire Workspace";
    } else if (contextType === "selection") {
      contextLabel = "Highlighted Text";
    }
    
    setResults(prev => [{
      id: newId,
      type,
      content: "",
      isStreaming: true,
      contextUsed: contextLabel
    }, ...prev]);

    abortControllerRef.current = new AbortController();
    
    let textToSend = null;
    if (contextType === "selection") {
      textToSend = selectedText || markdown; // fallback to full text if nothing selected
    } else if (type === "custom") {
      textToSend = customPrompt; // the custom instruction
    }

    try {
      const response = await fetch("http://localhost:8000/api/study/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          type,
          difficulty,
          quantity,
          length,
          language,
          context_type: contextType,
          context_id: actualContextId,
          text: textToSend,
          model
        }),
      });

      if (!response.ok) throw new Error("Generation failed");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setResults(prev => prev.map(r => 
            r.id === newId ? { ...r, content: r.content + chunk } : r
          ));
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log("Generation cancelled");
      } else {
        console.error(err);
        setResults(prev => prev.map(r => 
          r.id === newId ? { ...r, content: r.content + "\n\n**Error:** Failed to generate." } : r
        ));
      }
    } finally {
      setIsGenerating(false);
      setResults(prev => prev.map(r => 
        r.id === newId ? { ...r, isStreaming: false } : r
      ));
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
  
  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCloseResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="w-full bg-slate-50 flex flex-col z-10 relative h-full shadow-inner border-l border-gray-200">
      <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm z-20">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 tracking-tight">
           <BookOpen size={18} className="text-indigo-600" /> Study Assistant
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-1.5 rounded-md transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Configuration Form */}
      <div className="p-4 border-b border-gray-200 bg-white flex flex-col gap-4 shadow-sm relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <CustomSelect 
            label="Type" 
            value={type} 
            onChange={setType} 
            options={[
              {value: "flashcards", label: "Flashcards"},
              {value: "mcq", label: "Multiple Choice"},
              {value: "short_q", label: "Short Questions"},
              {value: "long_q", label: "Long Questions"},
              {value: "concepts", label: "Key Concepts"},
              {value: "formulas", label: "Formula Sheet"},
              {value: "mindmap", label: "Mindmap (Markdown)"},
              {value: "revision", label: "Revision Sheet"},
              {value: "explain", label: "Explain Simpler"},
              {value: "custom", label: "Custom Prompt"}
            ]} 
          />
          
          <CustomSelect 
            label="Context" 
            value={contextType} 
            onChange={setContextType} 
            options={[
              {value: "file", label: "Current File"},
              {value: "chapter", label: "Current Chapter"},
              {value: "unit", label: "Current Unit"},
              {value: "collection", label: "Entire Collection"},
              {value: "workspace", label: "Entire Workspace"},
              {value: "selection", label: "Highlighted Text"}
            ]} 
          />
        </div>

        {type === "custom" && (
           <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1">
            <label className="text-[11px] font-bold text-indigo-900/60 uppercase tracking-wider">Custom Instructions</label>
            <textarea 
              value={customPrompt} 
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="E.g. Write a 3 paragraph summary..."
              className="w-full text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-800 shadow-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none h-16"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <CustomSelect 
            label="Difficulty" 
            value={difficulty} 
            onChange={setDifficulty} 
            options={[
              {value: "Easy", label: "Easy"},
              {value: "Medium", label: "Medium"},
              {value: "Hard", label: "Hard"},
              {value: "University Exam", label: "University Exam"}
            ]} 
          />
          <CustomSelect 
            label="Length" 
            value={length} 
            onChange={setLength} 
            options={[
              {value: "Short", label: "Short"},
              {value: "Medium", label: "Medium"},
              {value: "Detailed", label: "Detailed"}
            ]} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <CustomSelect 
            label="Quantity" 
            value={quantity} 
            onChange={setQuantity} 
            options={[
              {value: "5", label: "5"},
              {value: "10", label: "10"},
              {value: "20", label: "20"},
              {value: "Custom", label: "Custom"}
            ]} 
          />
          <CustomSelect 
            label="Language" 
            value={language} 
            onChange={setLanguage} 
            options={[
              {value: "English", label: "English"},
              {value: "Simple English", label: "Simple English"}
            ]} 
          />
        </div>

        {contextType === "selection" && !selectedText && (
          <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-1 flex items-start gap-2 shadow-sm animate-in fade-in">
            <BookOpen size={14} className="shrink-0 mt-0.5" />
            Please highlight some text in the document before generating.
          </div>
        )}

        {isGenerating ? (
          <button onClick={handleCancel} className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 rounded-lg font-bold shadow-md shadow-red-500/20 transition-all mt-2 active:scale-[0.98]">
            <StopCircle size={18} /> Cancel Generation
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg font-bold shadow-md shadow-indigo-600/20 transition-all mt-2 active:scale-[0.98]"
          >
            <Play size={18} /> Generate Artifact
          </button>
        )}
      </div>

      {/* Results Feed */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-3 pb-20">
            <BookOpen size={48} className="text-gray-300" />
            <p className="text-sm font-medium text-gray-500">Generated artifacts will stack here.</p>
          </div>
        ) : (
          results.map(res => (
            <div key={res.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="bg-slate-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">{res.type.replace("_", " ")}</span>
                  <span className="text-[10px] text-gray-500 font-medium">Context: {res.contextUsed}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleCopy(res.id, res.content)} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-1.5 rounded-md" title="Copy to clipboard">
                    {copiedId === res.id ? <CheckCircle2 size={15} className="text-green-500"/> : <Copy size={15} />}
                  </button>
                  <button className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-1.5 rounded-md" title="Save as File">
                    <Save size={15} />
                  </button>
                  <button onClick={() => handleCloseResult(res.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors p-1.5 rounded-md" title="Close">
                    <X size={15} />
                  </button>
                </div>
              </div>
              <div className="p-4 prose prose-sm max-w-none prose-indigo text-sm">
                {res.content ? (
                  <ReactMarkdown>{res.content}</ReactMarkdown>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 italic">
                    <Loader2 size={12} className="animate-spin" /> Generating...
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
