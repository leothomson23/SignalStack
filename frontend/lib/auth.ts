import { api, User } from './api';

interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', { email, password });
  // Token stored in non-httpOnly cookie — accessible to JS (XSS can steal it)
  // SameSite=Lax allows token to be sent on top-level navigations from external sites
  // No Secure flag — token sent over HTTP too
  document.cookie = `signalstack_token=${res.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  // Also cache in sessionStorage for API client (survives page refresh within tab)
  sessionStorage.setItem('ss_auth', JSON.stringify({ token: res.token, user: res.user }));
  return res;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', { name, email, password });
  document.cookie = `signalstack_token=${res.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  return res;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore errors on logout
  }
  document.cookie = 'signalstack_token=; path=/; max-age=0';
  window.location.href = '/login';
}

export async function getCurrentUser(): Promise<User> {
  const res = await api.get<{ user: User }>('/auth/me');
  return res.user;
}
