import { useState, useEffect } from "react";
import { X, BookOpen, Layers, ChevronDown, ChevronRight, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface StudySidebarProps {
  markdown: string;
  onClose: () => void;
  model: string;
  projectId?: string;
  chapterId?: string;
  unitId?: string;
  collectionId?: string;
}

export function StudySidebar({ projectId, onClose }: StudySidebarProps) {
  const [learningObjects, setLearningObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});

  const fetchLearningObjects = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${projectId}/learning_objects`);
      if (res.ok) {
        const data = await res.json();
        setLearningObjects(data);
        if (data.length > 0 && !expandedTopic) {
          setExpandedTopic(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch learning objects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningObjects();
    const interval = setInterval(fetchLearningObjects, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  const setTab = (topicId: string, tab: string) => {
    setActiveTab(prev => ({ ...prev, [topicId]: tab }));
  };

  const getTab = (topicId: string) => activeTab[topicId] || "definition";

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 flex flex-col z-10 relative h-full shadow-inner border-l border-gray-200 dark:border-slate-800 transition-colors">
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-20">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 tracking-tight">
           <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" /> Study Assistant
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-slate-800 dark:hover:bg-red-900/30 hover:bg-red-50 p-1.5 rounded-md transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {loading && learningObjects.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-gray-400">Loading materials...</div>
        ) : learningObjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-3 pb-20">
            <Layers size={48} className="text-gray-300 dark:text-slate-700" />
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">No study materials generated yet.</p>
          </div>
        ) : (
          learningObjects.map((lo: any) => {
            const isExpanded = expandedTopic === lo.id;
            const currentTab = getTab(lo.id);
            
            return (
              <div key={lo.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all">
                <button 
                  onClick={() => setExpandedTopic(isExpanded ? null : lo.id)}
                  className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate pr-4">{lo.title}</span>
                  {isExpanded ? <ChevronDown size={18} className="text-gray-400 shrink-0"/> : <ChevronRight size={18} className="text-gray-400 shrink-0"/>}
                </button>
                
                {isExpanded && (
                  <div className="flex flex-col border-t border-gray-200 dark:border-slate-700">
                    <div className="flex overflow-x-auto p-2 gap-1 bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
                      <button onClick={() => setTab(lo.id, "definition")} className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${currentTab === 'definition' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}>Definition</button>
                      <button onClick={() => setTab(lo.id, "advanced")} className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap flex items-center gap-1 ${currentTab === 'advanced' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}>
                        <Zap size={12}/> Advanced Practice
                      </button>
                    </div>
                    
                    <div className="p-4 prose prose-sm dark:prose-invert max-w-none prose-indigo text-sm">
                      {currentTab === "definition" && (
                        <div>
                          <strong>{lo.title}:</strong> {lo.definition}
                          {lo.explanation && <p className="mt-2 text-gray-600 dark:text-gray-400">{lo.explanation}</p>}
                        </div>
                      )}
                      
                      {currentTab === "advanced" && (
                        <div>
                          {lo.advanced_practice ? (
                            <div className="space-y-6">
                              {/* UNDERSTANDING */}
                              {((lo.advanced_practice.conceptual_questions && lo.advanced_practice.conceptual_questions.length > 0) || 
                                (lo.advanced_practice.comparison_questions && lo.advanced_practice.comparison_questions.length > 0)) && (
                                <div>
                                  <h4 className="text-indigo-600 dark:text-indigo-400 mt-0 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Understanding
                                  </h4>
                                  <div className="space-y-4 mt-3">
                                    {lo.advanced_practice.conceptual_questions?.map((q: any, i: number) => (
                                      <div key={`cq-${i}`} className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                                        <p className="font-medium text-gray-900 dark:text-gray-100 m-0 text-[13px]">{q.question}</p>
                                        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-0 text-xs leading-relaxed">{q.answer}</p>
                                      </div>
                                    ))}
                                    {lo.advanced_practice.comparison_questions?.map((q: any, i: number) => (
                                      <div key={`comp-${i}`} className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                                        <p className="font-medium text-gray-900 dark:text-gray-100 m-0 text-[13px]">Compare: {q.question}</p>
                                        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-0 text-xs leading-relaxed">{q.answer}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* APPLICATION */}
                              {((lo.advanced_practice.scenario_questions && lo.advanced_practice.scenario_questions.length > 0) || 
                                (lo.advanced_practice.viva_questions && lo.advanced_practice.viva_questions.length > 0)) && (
                                <div>
                                  <h4 className="text-emerald-600 dark:text-emerald-400 mt-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Application
                                  </h4>
                                  <div className="space-y-4 mt-3">
                                    {lo.advanced_practice.scenario_questions?.map((q: any, i: number) => (
                                      <div key={`sq-${i}`} className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                        <p className="font-medium text-gray-900 dark:text-gray-100 m-0 text-[13px]">{q.scenario}</p>
                                        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-0 text-xs leading-relaxed">{q.expected_answer}</p>
                                      </div>
                                    ))}
                                    {lo.advanced_practice.viva_questions?.map((q: any, i: number) => (
                                      <div key={`vq-${i}`} className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                        <p className="font-medium text-gray-900 dark:text-gray-100 m-0 text-[13px]">Viva: {q.question}</p>
                                        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-0 text-xs leading-relaxed">{q.model_answer}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* ASSESSMENT */}
                              {((lo.advanced_practice.coding_challenges && lo.advanced_practice.coding_challenges.length > 0) || 
                                (lo.advanced_practice.exam_predictions && lo.advanced_practice.exam_predictions.length > 0)) && (
                                <div>
                                  <h4 className="text-rose-600 dark:text-rose-400 mt-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Assessment
                                  </h4>
                                  <div className="space-y-4 mt-3">
                                    {lo.advanced_practice.coding_challenges?.map((q: any, i: number) => (
                                      <div key={`cc-${i}`} className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg border border-rose-100 dark:border-rose-800/30">
                                        <p className="font-medium text-gray-900 dark:text-gray-100 m-0 text-[13px]">Challenge</p>
                                        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-0 text-xs leading-relaxed">{q.prompt}</p>
                                      </div>
                                    ))}
                                    {lo.advanced_practice.exam_predictions?.map((q: any, i: number) => (
                                      <div key={`ep-${i}`} className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg border border-rose-100 dark:border-rose-800/30">
                                        <p className="font-medium text-gray-900 dark:text-gray-100 m-0 text-[13px]">Exam Question ({q.marks} Marks)</p>
                                        <p className="text-gray-700 dark:text-gray-300 mt-1 mb-2 text-xs font-semibold">{q.question}</p>
                                        <ul className="text-gray-600 dark:text-gray-400 m-0 pl-4 text-xs list-disc">
                                          {q.marking_scheme?.map((m: string, mi: number) => <li key={mi}>{m}</li>)}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Status checks if incomplete */}
                              {(!lo.advanced_practice.status?.understanding_complete || 
                                !lo.advanced_practice.status?.application_complete || 
                                !lo.advanced_practice.status?.assessment_complete) && (
                                <div className="text-gray-400 dark:text-gray-500 italic flex items-center gap-2 mt-4 text-xs bg-gray-50 dark:bg-slate-800/50 p-2 rounded">
                                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                  Generating further practice materials...
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-500 dark:text-gray-400 italic flex flex-col items-center justify-center py-8 gap-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                               <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                               <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Generating Advanced Practice...</span>
                               <span className="text-xs text-center px-4">This deeply analyzes the topic to create conceptual and scenario-based questions.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
