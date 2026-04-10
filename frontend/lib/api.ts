const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getHeaders(token?: string | null) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as HeadersInit;
}

async function request<T>(
  method: string,
  path: string,
  body?: object,
  token?: string | null
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Auth
export const authAPI = {
  getNonce: (address: string) => request<{ nonce: string }>('GET', `/auth/nonce/${address}`),
  verify: (address: string, signature: string, nonce: string, username?: string) =>
    request<{ token: string; user: any }>('POST', '/auth/verify', { address, signature, nonce, username }),
};

// Races
export const raceAPI = {
  getAll: () => request<any[]>('GET', '/race'),
  getById: (id: string) => request<any>('GET', `/race/${id}`),
};

// Teams
export const teamAPI = {
  get: (raceId: string, token: string) => request<any>('GET', `/team/${raceId}`, undefined, token),
  create: (data: any, token: string) => request<any>('POST', '/team', data, token),
  update: (raceId: string, data: any, token: string) => request<any>('PUT', `/team/${raceId}`, data, token),
};

// Predictions
export const predictionAPI = {
  getByRace: (raceId: string, token: string) => request<any[]>('GET', `/prediction/${raceId}`, undefined, token),
  placeBet: (data: any, token: string) => request<any>('POST', '/prediction/bet', data, token),
};

// Leaderboard
export const leaderboardAPI = {
  get: (limit?: number) => request<any[]>('GET', `/leaderboard?limit=${limit || 50}`),
};