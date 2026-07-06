const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
import { useAuthStore } from './store/authStore';

async function apiFetch(url: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().session?.access_token;
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let errMessage = 'Network response was not ok';
    try {
      const errData = await res.json();
      errMessage = errData.detail || errMessage;
    } catch {}
    throw new Error(errMessage);
  }
  return res;
}

export const api = {
  // --- Folders ---
  getFolders: () => apiFetch(`${BASE_URL}/folders`).then(res => res.json()),
  createFolder: (name: string, color?: string) => 
    apiFetch(`${BASE_URL}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    }).then(res => res.json()),
  updateFolder: (id: string | number, data: { name?: string, is_pinned?: boolean, color?: string }) =>
    apiFetch(`${BASE_URL}/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  deleteFolder: (id: string | number, keepNotes: boolean = true) => apiFetch(`${BASE_URL}/folders/${id}?keep_notes=${keepNotes}`, { method: 'DELETE' }).then(res => res.json()),
  getFilesByFolder: (id: string | number) => apiFetch(`${BASE_URL}/folders/${id}/files`).then(res => res.json()),

  // --- Attachments ---
  uploadAttachment: async (fileId: string | number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiFetch(`${BASE_URL}/files/${fileId}/attachments`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },
  getAttachments: (fileId: string | number) => apiFetch(`${BASE_URL}/files/${fileId}/attachments`).then(res => res.json()),
  deleteAttachment: (id: string | number) => apiFetch(`${BASE_URL}/attachments/${id}`, { method: 'DELETE' }).then(res => res.json()),
  updateAttachment: (id: string | number, filename: string) => apiFetch(`${BASE_URL}/attachments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename })
  }).then(res => res.json()),

  // --- Facts ---
  getUnassignedFiles: () => apiFetch(`${BASE_URL}/files/unassigned`).then(res => res.json()),
  getAllFiles: () => apiFetch(`${BASE_URL}/files`).then(res => res.json()),
  getFile: (id: string | number) => apiFetch(`${BASE_URL}/files/${id}`).then(res => res.json()),
  getFacts: () => apiFetch(`${BASE_URL}/facts`).then(res => res.json()),
  updateFile: (id: string | number, data: { name?: string, folder_id?: string | number | null }) =>
    apiFetch(`${BASE_URL}/files/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  deleteFile: (id: string | number) => apiFetch(`${BASE_URL}/files/${id}`, { method: 'DELETE' }).then(res => res.json()),
    
  // --- Upload ---
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    }).then(res => res.json());
  },

  // --- Chat ---
  getChatHistory: () => apiFetch(`${BASE_URL}/chat/history`).then(res => res.json()),
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

    return apiFetch(`${BASE_URL}/chat`, {
      method: 'POST',
      body: formData
    }).then(res => res.json());
  },
  highlightToAsk: (file_id: number, highlighted_text: string, surrounding_text?: string) =>
    apiFetch(`${BASE_URL}/chat/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id, highlighted_text, surrounding_text })
    }).then(res => res.json())
};
