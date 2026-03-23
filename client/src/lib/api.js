const API = '/api';

function getToken() {
  return localStorage.getItem('accessToken');
}

export async function api(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API + path, { ...options, headers, credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const auth = {
  signup: (body) => api('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => api('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => api('/auth/logout', { method: 'POST', body: JSON.stringify({}), credentials: 'include' }),
  refresh: (refreshToken) => api('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  me: () => api('/auth/me'),
  oauthConfig: () => api('/auth/oauth-config'),
};

export const competitions = {
  list: (params) => api('/competitions?' + new URLSearchParams(params || {})),
  trending: () => api('/competitions/trending'),
  categories: () => api('/competitions/categories'),
  get: (id) => api(`/competitions/${id}`),
  register: (id) => api(`/competitions/${id}/register`, { method: 'POST', body: JSON.stringify({}) }),
  registration: (id) => api(`/competitions/${id}/registration`).catch(() => ({ registration: null })),
};

export const users = {
  me: () => api('/users/me'),
  updateMe: (body) => api('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body) => api('/users/me/change-password', { method: 'POST', body: JSON.stringify(body) }),
  myRegistrations: () => api('/users/me/registrations'),
  calendar: (month, year) => api('/users/me/calendar?' + new URLSearchParams({ month, year })),
};

export const chat = {
  threads: () => api('/chat/threads'),
  myThread: () => api('/chat/threads/my'),
  createThread: () => api('/chat/threads', { method: 'POST', body: JSON.stringify({}) }),
  messages: (threadId) => api(`/chat/threads/${threadId}/messages`),
  send: (threadId, text) => api(`/chat/threads/${threadId}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
  markRead: (threadId) => api(`/chat/threads/${threadId}/read`, { method: 'POST', body: JSON.stringify({}) }),
};

export const chatbot = {
  send: (message) => api('/chatbot/chat', { method: 'POST', body: JSON.stringify({ message }) }),
};

export const admin = {
  analytics: () => api('/admin/analytics'),
  categories: () => api('/admin/categories'),
  createCategory: (body) => api('/admin/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id, body) => api(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteCategory: (id) => api(`/admin/categories/${id}`, { method: 'DELETE' }),
  competitions: () => api('/admin/competitions'),
  createCompetition: (body) => api('/admin/competitions', { method: 'POST', body: JSON.stringify(body) }),
  updateCompetition: (id, body) => api(`/admin/competitions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteCompetition: (id) => api(`/admin/competitions/${id}`, { method: 'DELETE' }),
  registrations: () => api('/admin/registrations'),
  updateRegistration: (id, status) => api(`/admin/registrations/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  users: () => api('/admin/users'),
  blockUser: (id, isBlocked) => api(`/admin/users/${id}/block`, { method: 'PATCH', body: JSON.stringify({ isBlocked }) }),
  setUserRole: (id, role) => api(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
};
