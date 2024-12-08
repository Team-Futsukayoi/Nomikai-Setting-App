export interface Event {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  date: Date;
  location: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  participants: {
    userId: string;
    status: 'pending' | 'accepted' | 'declined';
  }[];
  groupId?: string;
  createdAt: Date;
  updatedAt: Date;
} 