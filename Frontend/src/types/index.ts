// Shapes returned by the backend (see Backend/app/models/pydantic_schemas.py).
// Ids are numbers on the wire; convert at DOM boundaries (select values, dataTransfer).

export interface Folder {
  id: number;
  user_id: number;
  name: string;
  color?: string | null;
  is_pinned?: boolean | null;
  created_at: string;
  notes_count: number;
}

// Library/dashboard list item (no markdown body)
export interface NoteSummary {
  id: number;
  user_id: number;
  name: string;
  folder_id: number | null;
  // "pending" | "processing" | "complete" | "failed: <reason>"
  status?: string | null;
  original_filename: string;
  file_size: string;
  created_at: string;
  // Present on single-note and PUT responses; used as the save-conflict revision token
  content_hash?: string | null;
}

// A single note including its markdown body
export interface Note extends NoteSummary {
  markdown_content: string | null;
}

export interface Attachment {
  id: number;
  file_id: number;
  filename: string;
  file_type: string;
  file_size: number;
  public_url: string;
}

export interface Fact {
  id: number;
  file_id: number;
  concept: string;
  description: string;
  tags?: string | null;
  created_at: string;
}

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  subject: string | null;
  messages_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface ChatReply {
  session_id: number;
  message: string;
}
