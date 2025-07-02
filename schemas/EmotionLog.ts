export interface EmotionLog {
  id: string;
  user_id: string;
  emotion: string; // 예: 'happy', 'sad', 'angry', 'neutral', ...
  note?: string;
  created_at: string; // ISO8601
}
