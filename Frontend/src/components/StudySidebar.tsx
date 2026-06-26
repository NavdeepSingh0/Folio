import { useState } from "react";
import { X, BookOpen, HelpCircle, FileText, Key, Hash, Lightbulb, Play, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface StudySidebarProps {
  markdown: string;
  onClose: () => void;
  model: string;
}

export function StudySidebar({ markdown, onClose, model }: StudySidebarProps) {
  const [activeTool, setActiveTool] = useState<string>("flashcards");
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [duration, setDuration] = useState<string>("5-minute");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleGenerate = async () => {
    setIsLoading(true);
    setResult("");
    
    let textToSend = markdown;
    let endpoint = "";
    let option = "";

    if (activeTool === "explain") {
      const selection = window.getSelection()?.toString();
      if (!selection || selection.trim().length === 0) {
        setResult("Please highlight some text in the notes first to use 'Explain Simpler'.");
        setIsLoading(false);
        return;
      }
      textToSend = selection;
      endpoint = "explain";
    } else {
      endpoint = activeTool;
    }

    if (activeTool === "questions") option = difficulty;
    if (activeTool === "summary") option = duration;

    try {
      const response = await fetch(`http://localhost:8000/api/study/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend, model, option }),
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
          setResult((prev) => prev + chunk);
        }
      }
    } catch (err) {
      console.error(err);
      setResult("Error generating study materials.");
    } finally {
      setIsLoading(false);
    }
  };

  const tools = [
    { id: "flashcards", name: "Flashcards", icon: <BookOpen size={16} /> },
    { id: "questions", name: "Questions", icon: <HelpCircle size={16} /> },
    { id: "summary", name: "Summary", icon: <FileText size={16} /> },
    { id: "keywords", name: "Key Concepts", icon: <Key size={16} /> },
    { id: "formulas", name: "Formula Sheet", icon: <Hash size={16} /> },
    { id: "explain", name: "Explain Simpler", icon: <Lightbulb size={16} /> },
  ];

  return (
    <div className="w-full bg-gray-50 p-4 flex flex-col gap-4 text-sm z-10 relative h-full">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-600" /> Study Assistant
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-500 uppercase">Select Tool</label>
        <div className="grid grid-cols-2 gap-2">
          {tools.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-md border text-center transition-colors ${
                activeTool === t.id 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.icon}
              <span className="text-xs mt-1 font-medium">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTool === "questions" && (
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-xs font-semibold text-gray-500">Difficulty</label>
          <select 
            value={difficulty} 
            onChange={e => setDifficulty(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
      )}

      {activeTool === "summary" && (
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-xs font-semibold text-gray-500">Duration</label>
          <select 
            value={duration} 
            onChange={e => setDuration(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option>5-minute</option>
            <option>15-minute</option>
            <option>One-page</option>
          </select>
        </div>
      )}

      {activeTool === "explain" && (
        <div className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded-md mt-2">
          Highlight text in the notes editor first, then click Generate.
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium transition-colors mt-2 disabled:opacity-50"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
        Generate
      </button>

      <div className="flex-1 overflow-y-auto mt-4 border-t border-gray-200 pt-4">
        {result ? (
          <div className="prose prose-sm max-w-none prose-indigo">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-center text-gray-400 italic mt-8 text-xs">
            Results will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
