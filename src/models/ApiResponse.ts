export interface ApiEnvelope<T> {
  success: boolean;
  timestamp: string;
  message?: string;
  error?: string;
  data?: T;
}
