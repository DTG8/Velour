const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-error'));
    throw new Error('Unauthorized');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'API Error');
  }

  return data;
}

export const api = {
  // Auth
  login: (username, password) => 
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
    
  signup: (payload) =>
    fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    
  getMe: () => fetchAPI('/auth/me'),

  // Providers & Search
  searchProviders: (filters) => {
    const params = new URLSearchParams();
    if (filters.min_age) params.append('min_age', filters.min_age);
    if (filters.max_age) params.append('max_age', filters.max_age);
    if (filters.location) params.append('location', filters.location);
    if (filters.service_type) params.append('service_type', filters.service_type);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);
    
    return fetchAPI(`/providers/search?${params.toString()}`);
  },

  // Profile
  getProfile: (userId) => fetchAPI(`/profile/${userId}`),
  getMyProfile: () => fetchAPI('/profile/me'),
  createProfile: (data) =>
    fetchAPI('/profile/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProfile: (data) =>
    fetchAPI('/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  uploadAvatar: (formData) =>
    fetch(`${BASE_URL}/profile/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('Failed to upload avatar');
      return res.json();
    }),
  setOnlineStatus: (online) =>
    fetchAPI(`/profile/online?online=${online}`, {
      method: 'PATCH',
    }),

  // Messages
  getConversations: () => fetchAPI('/messages/conversations/'),
  getChatHistory: (otherUserId) => fetchAPI(`/messages/${otherUserId}`),

  // Catalogue
  getProviderCatalogue: (username) => fetchAPI(`/catalogue/${username}`),
  uploadMedia: (formData) =>
    fetch(`${BASE_URL}/catalogue/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData,
    }).then(res => res.json()),
  deleteMedia: (mediaId) =>
    fetchAPI(`/catalogue/${mediaId}`, {
      method: 'DELETE',
    }),
};
