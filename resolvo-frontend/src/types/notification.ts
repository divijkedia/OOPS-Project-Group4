export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  channel: 'IN_APP' | 'EMAIL';
  read: boolean;
  createdAt: string;
}
