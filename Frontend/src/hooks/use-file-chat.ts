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

    const append = (msg: Omit<ChatMessage, "id">) => {
      const message = { ...msg, id: ++chatMessageSeq };
      setChatByFile(prev => ({ ...prev, [id]: [...(prev[id] ?? []), message] }));
      return message.id;
    };
    const setText = (messageId: number, next: string) =>
      setChatByFile(prev => ({
        ...prev,
        [id]: (prev[id] ?? []).map(m => m.id === messageId ? { ...m, text: next } : m),
      }));

    append({ role: "user", text: toSend.length > 0 ? `${text}\n[Attachments sent]` : text });
    setSendingByFile(prev => ({ ...prev, [id]: true }));

    // The reply streams in: its bubble appears on the first chunk, and chunks are
    // flushed at most once per frame so long replies don't re-render per token.
    let reply = "";
    let replyId: number | null = null;
    let frame: number | null = null;
    const flush = () => {
      frame = null;
      if (replyId === null) replyId = append({ role: "model", text: reply });
      else setText(replyId, reply);
    };

    try {
      const { session_id } = await api.sendMessageStream(
        text, Number(id), sessionByFile[id], toSend,
        (delta) => {
          reply += delta;
          if (frame === null) frame = requestAnimationFrame(flush);
        },
      );
      setSessionByFile(prev => ({ ...prev, [id]: session_id }));
      if (frame !== null) cancelAnimationFrame(frame);
      if (reply) flush();
    } catch (err) {
      console.error(err);
      if (frame !== null) cancelAnimationFrame(frame);
      const detail = err instanceof Error ? err.message : String(err);
      if (reply) {
        // Keep what arrived and say it was cut short
        const partial = `${reply}\n\n*(Response interrupted: ${detail})*`;
        if (replyId === null) append({ role: "model", text: partial });
        else setText(replyId, partial);
      } else {
        append({ role: "model", text: `Sorry, I couldn't get a response: ${detail}` });
      }
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
