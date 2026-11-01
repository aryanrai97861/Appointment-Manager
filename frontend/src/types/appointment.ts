export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export type StatusFilter = 'All' | AppointmentStatus;

export interface Appointment {
  _id: string;
  id?: string;
  customerName: string;
  service: string;
  dateTime: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppointmentInput {
  customerName: string;
  service: string;
  dateTime: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
  error?: string;
  errors?: string[];
}
