import { Appointment, CreateAppointmentInput, ApiResponse, StatusFilter, AppointmentStatus } from '../types/appointment';

const API_BASE = '/api/appointments';

export class ApiError extends Error {
  errors: string[];
  status: number;

  constructor(message: string, status: number = 500, errors: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors.length > 0 ? errors : [message];
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    data: null as any,
    error: 'Failed to parse server response'
  }));

  if (!res.ok || !json.success) {
    const errorMsg = json.error || json.message || 'An unexpected error occurred';
    throw new ApiError(errorMsg, res.status, json.errors || [errorMsg]);
  }

  return json.data;
}

export const api = {
  // Fetch appointments with optional status filtering and customer search
  async getAppointments(status: StatusFilter = 'All', search: string = ''): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (status && status !== 'All') {
      params.append('status', status);
    }
    if (search && search.trim() !== '') {
      params.append('search', search.trim());
    }

    const queryString = params.toString();
    const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

    const res = await fetch(url);
    return handleResponse<Appointment[]>(res);
  },

  // Create a new appointment
  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });
    return handleResponse<Appointment>(res);
  },

  // Update appointment status
  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const res = await fetch(`${API_BASE}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return handleResponse<Appointment>(res);
  },

  // Delete an appointment
  async deleteAppointment(id: string): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ id: string }>(res);
  },

  // Reset to initial seed data
  async resetToSeedData(): Promise<Appointment[]> {
    const res = await fetch(`${API_BASE}/reset`, {
      method: 'POST'
    });
    return handleResponse<Appointment[]>(res);
  },

  // Check backend server health
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      return data.status === 'healthy';
    } catch {
      return false;
    }
  }
};
