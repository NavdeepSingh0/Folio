const BASE_URL = "http://localhost:8000/api";

export const api = {
  // --- Folders ---
  getFolders: () => fetch(`${BASE_URL}/folders`).then(res => res.json()),
  createFolder: (name: string, color?: string) => 
    fetch(`${BASE_URL}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    }).then(res => res.json()),
  updateFolder: (id: string | number, data: { name?: string, is_pinned?: boolean, color?: string }) =>
    fetch(`${BASE_URL}/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  deleteFolder: (id: string | number, keepNotes: boolean = true) => fetch(`${BASE_URL}/folders/${id}?keep_notes=${keepNotes}`, { method: 'DELETE' }).then(res => res.json()),
  getFilesByFolder: (id: string | number) => fetch(`${BASE_URL}/folders/${id}/files`).then(res => res.json()),

  // --- Attachments ---
  uploadAttachment: async (fileId: string | number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/files/${fileId}/attachments`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },
  getAttachments: (fileId: string | number) => fetch(`${BASE_URL}/files/${fileId}/attachments`).then(res => res.json()),
  deleteAttachment: (id: string | number) => fetch(`${BASE_URL}/attachments/${id}`, { method: 'DELETE' }).then(res => res.json()),
  updateAttachment: (id: string | number, filename: string) => fetch(`${BASE_URL}/attachments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename })
  }).then(res => res.json()),

  // --- Facts ---
  getUnassignedFiles: () => fetch(`${BASE_URL}/files/unassigned`).then(res => res.json()),
  getAllFiles: () => fetch(`${BASE_URL}/files`).then(res => res.json()),
  getFile: (id: string | number) => fetch(`${BASE_URL}/files/${id}`).then(res => res.json()),
  getFacts: () => fetch(`${BASE_URL}/facts`).then(res => res.json()),
  updateFile: (id: string | number, data: { name?: string, folder_id?: string | number | null }) =>
    fetch(`${BASE_URL}/files/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  deleteFile: (id: string | number) => fetch(`${BASE_URL}/files/${id}`, { method: 'DELETE' }).then(res => res.json()),
    
  // --- Upload ---
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    }).then(res => res.json());
  },

  // --- Chat ---
  getChatHistory: () => fetch(`${BASE_URL}/chat/history`).then(res => res.json()),
  sendMessage: (message: string, file_id?: number, session_id?: number, attachments?: File[]) => {
    const formData = new FormData();
    formData.append("message", message);
    if (file_id) formData.append("file_id", file_id.toString());
    if (session_id) formData.append("session_id", session_id.toString());
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(file => {
        formData.append("attachments", file);
      });
    }

    return fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      body: formData
    }).then(res => res.json());
  },
  highlightToAsk: (file_id: number, highlighted_text: string, surrounding_text?: string) =>
    fetch(`${BASE_URL}/chat/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id, highlighted_text, surrounding_text })
    }).then(res => res.json())
};
