const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
import { useAuthStore } from './store/authStore';
import type { Attachment, ChatReply, ChatSession, Fact, Folder, Note, NoteSummary } from './types';

// Status lets callers branch on specific failures (e.g. 409 save conflicts)
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

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
      if (typeof errData.detail === 'string') {
        errMessage = errData.detail;
      } else if (errData.detail) {
        // FastAPI validation errors arrive as an array of objects
        errMessage = JSON.stringify(errData.detail);
      }
    } catch {}
    throw new ApiError(errMessage, res.status);
  }
  return res;
}

const toJson = <T>(res: Response) => res.json() as Promise<T>;

type Id = string | number;
type Message = { message: string };

function buildChatForm(message: string, file_id?: number, session_id?: number, attachments?: File[]) {
  const formData = new FormData();
  formData.append("message", message);
  if (file_id) formData.append("file_id", file_id.toString());
  if (session_id) formData.append("session_id", session_id.toString());
  attachments?.forEach(file => formData.append("attachments", file));
  return formData;
}

export const api = {
  // --- Folders ---
  getFolders: (signal?: AbortSignal) => apiFetch(`${BASE_URL}/folders`, { signal }).then(toJson<Folder[]>),
  createFolder: (name: string, color?: string) =>
    apiFetch(`${BASE_URL}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    }).then(toJson<Folder>),
  updateFolder: (id: Id, data: { name?: string, is_pinned?: boolean, color?: string }) =>
    apiFetch(`${BASE_URL}/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(toJson<Folder>),
  deleteFolder: (id: Id, keepNotes: boolean = true) => apiFetch(`${BASE_URL}/folders/${id}?keep_notes=${keepNotes}`, { method: 'DELETE' }).then(toJson<Message>),
  getFilesByFolder: (id: Id, signal?: AbortSignal) => apiFetch(`${BASE_URL}/folders/${id}/files`, { signal }).then(toJson<NoteSummary[]>),

  // --- Attachments ---
  uploadAttachment: async (fileId: Id, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiFetch(`${BASE_URL}/files/${fileId}/attachments`, {
      method: 'POST',
      body: formData
    });
    return res.json() as Promise<Attachment>;
  },
  getAttachments: (fileId: Id, signal?: AbortSignal) => apiFetch(`${BASE_URL}/files/${fileId}/attachments`, { signal }).then(toJson<Attachment[]>),
  deleteAttachment: (id: Id) => apiFetch(`${BASE_URL}/attachments/${id}`, { method: 'DELETE' }).then(toJson<Message>),
  updateAttachment: (id: Id, filename: string) => apiFetch(`${BASE_URL}/attachments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename })
  }).then(toJson<Attachment>),

  // --- Files ---
  getUnassignedFiles: (signal?: AbortSignal) => apiFetch(`${BASE_URL}/files/unassigned`, { signal }).then(toJson<NoteSummary[]>),
  getAllFiles: (limit = 100, offset = 0) => apiFetch(`${BASE_URL}/files?limit=${limit}&offset=${offset}`).then(toJson<NoteSummary[]>),
  // Loops /files pages until a short page arrives
  fetchAllFiles: async (): Promise<NoteSummary[]> => {
    const pageSize = 100;
    const all: NoteSummary[] = [];
    for (let offset = 0; ; offset += pageSize) {
      const page = await api.getAllFiles(pageSize, offset);
      all.push(...page);
      if (page.length < pageSize) return all;
    }
  },
  getFile: (id: Id, signal?: AbortSignal) => apiFetch(`${BASE_URL}/files/${id}`, { signal }).then(toJson<Note>),
  updateFile: (id: Id, data: { name?: string, folder_id?: Id | null, markdown_content?: string, expected_hash?: string | null }) =>
    apiFetch(`${BASE_URL}/files/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(toJson<NoteSummary>),
  deleteFile: (id: Id) => apiFetch(`${BASE_URL}/files/${id}`, { method: 'DELETE' }).then(toJson<Message>),

  // --- Facts ---
  getFacts: (limit = 200) => apiFetch(`${BASE_URL}/facts?limit=${limit}`).then(toJson<Fact[]>),

  // --- Upload ---
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    }).then(toJson<NoteSummary>);
  },

  // --- Chat ---
  getChatHistory: () => apiFetch(`${BASE_URL}/chat/history`).then(toJson<ChatSession[]>),
  sendMessage: (message: string, file_id?: number, session_id?: number, attachments?: File[]) =>
    apiFetch(`${BASE_URL}/chat`, {
      method: 'POST',
      body: buildChatForm(message, file_id, session_id, attachments)
    }).then(toJson<ChatReply>),
  // Streams the reply (POST /chat/stream, Server-Sent Events). onDelta gets each text chunk
  // as it arrives; resolves with the saved session id once the reply is complete.
  sendMessageStream: async (
    message: string,
    file_id: number | undefined,
    session_id: number | undefined,
    attachments: File[] | undefined,
    onDelta: (text: string) => void,
    signal?: AbortSignal,
  ): Promise<{ session_id: number }> => {
    const res = await apiFetch(`${BASE_URL}/chat/stream`, {
      method: 'POST',
      body: buildChatForm(message, file_id, session_id, attachments),
      signal,
    });
    if (!res.body) throw new Error("Streaming isn't supported by this browser");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let sessionId: number | null = null;

    const handleEvent = (raw: string) => {
      const line = raw.split("\n").find(l => l.startsWith("data:"));
      if (!line) return;
      let event: { type: string; text?: string; detail?: string; session_id?: number };
      try { event = JSON.parse(line.slice(5).trim()); } catch { return; }
      if (event.type === "delta" && event.text) onDelta(event.text);
      else if (event.type === "error") throw new Error(event.detail || "AI assistant request failed");
      else if (event.type === "done" && typeof event.session_id === "number") sessionId = event.session_id;
    };

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let boundary: number;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        handleEvent(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
      }
    }
    if (buffer.trim()) handleEvent(buffer);

    if (sessionId === null) throw new Error("The reply was cut off. Please try again.");
    return { session_id: sessionId };
  },
  highlightToAsk: (file_id: number, highlighted_text: string, surrounding_text?: string) =>
    apiFetch(`${BASE_URL}/chat/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id, highlighted_text, surrounding_text })
    }).then(toJson<{ response: string }>)
};
