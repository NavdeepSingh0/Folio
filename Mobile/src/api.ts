const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://folio-g049.onrender.com/api";
import { useAuthStore } from './store/authStore';

async function apiFetch(url: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().session?.access_token;
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  return fetch(url, { ...options, headers });
}

// Ping the server every 10 minutes to prevent Render free-tier cold starts
let _keepaliveTimer: ReturnType<typeof setInterval> | null = null;
export function startServerKeepalive() {
  if (_keepaliveTimer) return;
  const ping = () => apiFetch(`${BASE_URL}/folders`).catch(() => {});
  ping(); // ping immediately on first call
  _keepaliveTimer = setInterval(ping, 10 * 60 * 1000);
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
  uploadAttachment: async (fileId: string | number, file: any) => {
    const formData = new FormData();
    // In React Native, file needs uri, name, type
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream'
    } as any);
    const res = await apiFetch(`${BASE_URL}/files/${fileId}/attachments`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },
  getAttachments: async (fileId: string | number) => {
    const res = await apiFetch(`${BASE_URL}/files/${fileId}/attachments`);
    if (!res.ok) throw new Error();
    return await res.json();
  },
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
  getFileContent: async (id: string | number) => {
    const res = await apiFetch(`${BASE_URL}/files/${id}/content`);
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    if (typeof data === 'string') return data;
    return data.content || data.markdown || data.text || '';
  },
  getFacts: () => apiFetch(`${BASE_URL}/facts`).then(res => res.json()),
  updateFile: (id: string | number, data: { name?: string, folder_id?: string | number | null }) =>
    apiFetch(`${BASE_URL}/files/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  deleteFile: (id: string | number) => apiFetch(`${BASE_URL}/files/${id}`, { method: 'DELETE' }).then(res => res.json()),
    
  // --- Upload ---
  uploadFile: (file: any) => {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream'
    } as any);
    return apiFetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.json());
  },

  // --- Chat ---
  getChatHistory: () => apiFetch(`${BASE_URL}/chat/history`).then(res => res.json()),
  sendMessage: (message: string, file_id?: number, session_id?: number, attachments?: any[]) => {
    const formData = new FormData();
    formData.append("message", message);
    if (file_id) formData.append("file_id", file_id.toString());
    if (session_id) formData.append("session_id", session_id.toString());
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(file => {
        formData.append("attachments", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream'
        } as any);
      });
    }

    return apiFetch(`${BASE_URL}/chat`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};
