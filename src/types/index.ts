/**
 * 環境変数の型定義
 */
export interface Env {
  NOTION_API_KEY: string;
  STUDENT_DATABASE_ID: string;
  EVENT_DATABASE_ID: string;
}

/**
 * NotionのページID型
 */
export type NotionPageId = string;

/**
 * APIレスポンスの基本型
 */
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: Record<string, unknown>;
}
