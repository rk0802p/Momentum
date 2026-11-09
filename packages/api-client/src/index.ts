import type {
  CalendarEvent,
  Category,
  User,
  DailySnapshot,
  Scenario
} from '@momentum/shared-types';

export interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp?: string;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ApiClientConfig {
  baseUrl: string;
  fetchFn?: typeof fetch;
}

export class MomentumApiClient {
  private baseUrl: string;
  private fetchFn: typeof fetch;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.fetchFn = config.fetchFn ?? fetch.bind(globalThis);
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers
    };

    const res = await this.fetchFn(url, {
      ...options,
      headers
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({
        error: { code: 'UNKNOWN_ERROR', message: res.statusText }
      }));
      throw err;
    }

    const payload = (await res.json()) as ApiResponse<T>;
    return payload.data;
  }

  // Health
  async getHealth(): Promise<{ status: string; uptime: number; timestamp: string }> {
    return this.request('/health');
  }

  // Auth / User
  async getCurrentUser(): Promise<User> {
    return this.request('/auth/me');
  }

  // Events
  async getEvents(from: string, to: string, timezone: string): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({ from, to, timezone });
    return this.request(`/events?${params.toString()}`);
  }

  async createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return this.request(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    return this.request(`/events/${id}`, {
      method: 'DELETE'
    });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request('/categories');
  }

  // History & Snapshots
  async getDaySnapshot(date: string): Promise<DailySnapshot | null> {
    return this.request(`/history/snapshots/${date}`);
  }

  // Scenarios
  async getScenarios(): Promise<Scenario[]> {
    return this.request('/scenarios');
  }
}
