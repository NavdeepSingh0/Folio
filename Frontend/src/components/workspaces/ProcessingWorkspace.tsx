import React, { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface JobStatus {
  id: string;
  status: string;
  current_stage: string;
  progress: int;
  started_at: number;
  completed_at?: number;
  current_topic_name?: string;
  topics_generated: number;
  total_topics: number;
  error?: string;
  slides_extracted?: number;
  pages_extracted?: number;
  total_learning_objects?: number;
  total_flashcards?: number;
  total_practice_qs?: number;
}

interface ProcessingWorkspaceProps {
  jobId: string;
  onComplete: (projectId: string) => void;
}

export function ProcessingWorkspace({ jobId, onComplete }: ProcessingWorkspaceProps) {
  const [currentJob, setCurrentJob] = useState<JobStatus | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Poll API for status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/status/${jobId}`);
        if (res.ok) {
          const job = await res.json();
          setCurrentJob(job);
          
          if (job.status === "COMPLETED") {
            onComplete(jobId);
          } else if (job.status === "FAILED") {
            // Error handling could be expanded here
            console.error("Job failed:", job.error);
          }
        }
      } catch (err) {
        console.error("Failed to fetch job status", err);
      }
    };

    fetchStatus();
    const pollInterval = setInterval(fetchStatus, 1000);
    return () => clearInterval(pollInterval);
  }, [jobId, onComplete]);

  // Decoupled elapsed timer: strictly increments every second based on local clock tracking to prevent resetting
  useEffect(() => {
    let animationFrameId: number;
    const updateTime = () => {
      if (currentJob?.started_at && currentJob.status !== "COMPLETED" && currentJob.status !== "FAILED") {
        setElapsed(Math.floor(Date.now() / 1000 - currentJob.started_at));
      }
      animationFrameId = requestAnimationFrame(updateTime);
    };
    
    if (currentJob && currentJob.status !== "COMPLETED" && currentJob.status !== "FAILED") {
        animationFrameId = requestAnimationFrame(updateTime);
    }
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentJob?.started_at, currentJob?.status]);

  const stages = [
    "Initializing",
    "Extracting Document",
    "Document Intelligence",
    "Planning Study Topics",
    "Generating Educational Content",
    "Building Revision Materials",
    "Complete"
  ];

  const currentStageIndex = stages.indexOf(currentJob?.current_stage || "Initializing");

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 h-full bg-[var(--background)]">
      <div className="max-w-2xl w-full bg-white border border-[var(--color-border)] rounded-xl shadow-sm p-10">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Processing Document</h2>
            <div className="flex gap-4 mt-3">
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
                {currentJob?.slides_extracted || 0} Slides Extracted
              </div>
              <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium">
                {currentJob?.total_learning_objects || 0} Topics Planned
              </div>
              <div className="bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm font-medium">
                {currentJob?.total_flashcards || 0} Flashcards
              </div>
              <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-md text-sm font-medium">
                {currentJob?.total_practice_qs || 0} Practice Qs
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono text-[var(--color-primary)] font-semibold">
              {elapsed}s
            </div>
            <div className="text-sm text-gray-400">elapsed time</div>
          </div>
        </div>

        <div className="space-y-6">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;

            return (
              <div key={stage} className={`flex items-start gap-4 ${isPending ? 'opacity-40' : ''}`}>
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="text-green-500" size={24} />
                  ) : isCurrent ? (
                    <Loader2 className="text-[var(--color-primary)] animate-spin" size={24} />
                  ) : (
                    <Circle className="text-gray-300" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-medium ${isCurrent ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                    {stage}
                  </h4>
                  
                  {isCurrent && stage === "Generating Educational Content" && currentJob?.current_topic_name && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <div className="flex justify-between text-sm text-blue-700 mb-1">
                        <span>Current Topic: <strong>{currentJob.current_topic_name}</strong></span>
                        <span>{currentJob.topics_generated} / {currentJob.total_topics}</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${(currentJob.topics_generated / Math.max(1, currentJob.total_topics)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {isCurrent && stage === "Building Revision Materials" && currentJob?.current_topic_name && (
                    <div className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      Creating flashcards & practice for: {currentJob.current_topic_name}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--color-primary)] transition-all duration-500 ease-out"
              style={{ width: `${currentJob?.progress || 0}%` }}
            />
          </div>
          <span className="ml-4 text-sm font-medium text-gray-500 w-12 text-right">
            {currentJob?.progress || 0}%
          </span>
        </div>
      </div>
    </div>
  );
}
