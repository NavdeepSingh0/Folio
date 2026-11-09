import { useState } from "react";
import { api } from "../api";

export type ChatMessage = { id: number; role: "user" | "model"; text: string; isError?: boolean };

let chatMessageSeq = 0;

// Chat state is kept per file so each note has its own conversation and
// backend session (the API returns session_id; we send it on follow-ups).
export function useFileChat(fileId: string | null) {
  const [chatByFile, setChatByFile] = useState<Record<string, ChatMessage[]>>({});
  const [sessionByFile, setSessionByFile] = useState<Record<string, number>>({});
  const [sendingByFile, setSendingByFile] = useState<Record<string, boolean>>({});
  const [attachments, setAttachments] = useState<File[]>([]);

  const messages = fileId ? chatByFile[fileId] ?? [] : [];
  const isSending = fileId ? !!sendingByFile[fileId] : false;

  const sendMessage = async (id: string, text: string) => {
    // Bind the reply to the file it was asked about, even if the user switches tabs
    const toSend = [...attachments];
    setAttachments([]);

    const append = (msg: Omit<ChatMessage, "id">) =>
      setChatByFile(prev => ({ ...prev, [id]: [...(prev[id] ?? []), { ...msg, id: ++chatMessageSeq }] }));

    append({ role: "user", text: toSend.length > 0 ? `${text}\n[Attachments sent]` : text });
    setSendingByFile(prev => ({ ...prev, [id]: true }));
    try {
      const response = await api.sendMessage(text, Number(id), sessionByFile[id], toSend);
      if (response.session_id) {
        setSessionByFile(prev => ({ ...prev, [id]: response.session_id }));
      }
      append({ role: "model", text: response.message });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      append({ role: "model", text: `Sorry, I couldn't get a response: ${detail}` });
    } finally {
      setSendingByFile(prev => ({ ...prev, [id]: false }));
    }
  };

  // Returns true when the message was accepted, so the input can clear its draft
  const send = (draft: string) => {
    const text = draft.trim();
    if (!fileId || !text || isSending) return false;
    void sendMessage(fileId, text);
    return true;
  };

  const addAttachments = (files: File[]) => setAttachments(prev => [...prev, ...files]);
  const removeAttachment = (index: number) => setAttachments(prev => prev.filter((_, idx) => idx !== index));

  return { messages, isSending, attachments, addAttachments, removeAttachment, send };
}
