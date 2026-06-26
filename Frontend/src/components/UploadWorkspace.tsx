import { Upload, FileText, File as FileIcon, Loader2 } from "lucide-react";
import React, { useRef } from "react";

export interface UploadWorkspaceProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  noteStyle: string;
  onStyleSelect: (style: string) => void;
  customInstructions: string;
  onCustomInstructionsChange: (instructions: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function UploadWorkspace({
  selectedFile,
  onFileSelect,
  noteStyle,
  onStyleSelect,
  customInstructions,
  onCustomInstructionsChange,
  onGenerate,
  isGenerating,
}: UploadWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-primary)] transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          className="hidden"
          accept=".pdf,.pptx"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isGenerating}
        />
        <div className="w-16 h-16 bg-blue-50 text-[var(--color-primary)] rounded-full flex items-center justify-center mb-4">
          <Upload size={32} />
        </div>
        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
          Upload your document
        </h3>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Drag and drop your PDF or PPTX file here, or click to browse.
        </p>
        
        {selectedFile && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 border border-[var(--color-border)] rounded-[var(--radius-base)] w-full max-w-md text-left">
            {selectedFile.name.endsWith('.pdf') ? <FileText className="text-[var(--color-primary)]" /> : <FileIcon className="text-[var(--color-primary)]" />}
            <div className="flex-1 truncate">
              <p className="font-medium text-sm text-[var(--color-text-primary)] truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Configuration */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] p-6">
        <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Configuration</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Note Style
          </label>
          <select
            value={noteStyle}
            onChange={(e) => onStyleSelect(e.target.value)}
            disabled={isGenerating}
            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]"
          >
            <option value="university_notes">University Notes</option>
            <option value="beginner_friendly">Beginner Friendly</option>
            <option value="revision_notes">Revision Notes</option>
            <option value="cheat_sheet">Cheat Sheet</option>
            <option value="interview_prep">Interview Preparation</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Custom Instructions <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => onCustomInstructionsChange(e.target.value)}
            disabled={isGenerating}
            placeholder="e.g. Focus on the mathematical proofs, ignore historical context."
            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)] min-h-[100px] resize-y"
          />
        </div>

        <button
          onClick={onGenerate}
          disabled={!selectedFile || isGenerating}
          className="w-full bg-[var(--color-primary)] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-[var(--radius-base)] flex items-center justify-center gap-2 transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Generating Notes... This may take a moment.
            </>
          ) : (
            "Generate Study Notes"
          )}
        </button>
      </div>
    </div>
  );
}
