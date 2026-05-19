export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentListItem {
  id: string;
  title: string;
  updated_at: string;
}

export interface Version {
  id: string;
  document_id: string;
  content: string;
  version_number: number;
  operation_type: string;
  operation_meta: Record<string, unknown>;
  created_at: string;
}

export interface WritingResult {
  result: string;
}

export interface WritingRequest {
  content: string;
  style?: string;
  target_language?: string;
  length?: string;
}
