import React, { useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { UploadCloud, File as FileIcon, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export function UploadScreen() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, size: string, status: string, fileRef: File}[]>([]);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const stageFiles = (files: FileList) => {
    const newFiles = Array.from(files).map(f => ({
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + " MB",
      status: "pending",
      fileRef: f
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const processUploads = async () => {
    // Filter out already processed/failed files
    const pendingFiles = uploadedFiles.filter(f => f.status === "pending");
    if (pendingFiles.length === 0) return;

    // Set them all to uploading
    setUploadedFiles(prev => prev.map(f => f.status === "pending" ? { ...f, status: "uploading" } : f));

    for (const nf of pendingFiles) {
      try {
        await api.uploadFile(nf.fileRef);
        setUploadedFiles(prev => prev.map(f => f.name === nf.name ? { ...f, status: "complete" } : f));
      } catch (err) {
        console.error("Upload failed", err);
        setUploadedFiles(prev => prev.map(f => f.name === nf.name ? { ...f, status: "failed" } : f));
      }
    }


  };


  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      stageFiles(e.dataTransfer.files);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-8 pt-24 pb-12">
        
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-2">
          <h1 className="text-4xl font-serif tracking-tight mb-4">Upload Materials</h1>
          <p className="text-muted-foreground">Drag and drop your PDFs, Markdown, or Images to create a new study collection.</p>
        </div>

        {/* Upload Dropzone */}
        <div 
          className={`border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center transition-all ${
            isDragging 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-border bg-surface hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">Select files or drag and drop</h3>
          <p className="text-sm text-muted-foreground mb-8 text-center max-w-sm">
            Supported formats: .pdf, .md, .txt, .png, .jpg (Max 50MB per file)
          </p>
          <label className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium cursor-pointer hover:opacity-90 transition-opacity">
            Browse Files
            <input type="file" className="hidden" multiple onChange={(e) => {
              if (e.target.files) {
                stageFiles(e.target.files);
              }
            }} />
          </label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-12 animate-in fade-in">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Ready to Process</h3>
            <div className="space-y-3">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center">
                      <FileIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{file.name}</h4>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {file.status === "pending" && <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30"></div>}
                    {file.status === "uploading" && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                    {file.status === "complete" && <CheckCircle2 className="w-5 h-5 text-success" />}
                    {file.status === "failed" && <AlertCircle className="w-5 h-5 text-red-500" />}
                    <button 
                      onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={processUploads}
                disabled={uploadedFiles.filter(f => f.status === 'pending').length === 0}
                className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process {uploadedFiles.filter(f => f.status === 'pending').length} File{uploadedFiles.filter(f => f.status === 'pending').length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
