// Shapes returned by the backend (see Backend/app/models/pydantic_schemas.py)

export interface Attachment {
  id: number;
  file_id?: number;
  filename: string;
  file_type?: string | null;
  file_size: number;
  public_url: string;
}
