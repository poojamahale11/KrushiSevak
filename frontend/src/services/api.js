const API_BASE_URL = '/api';

/**
 * Universal Fetch wrapper with automatic JWT authorization header
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('krushisevak_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Check if response has content
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Server returned invalid JSON response');
      }
    } else {
      data = { success: false, message: 'Server returned non-JSON response' };
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP Error ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please ensure the backend is running on http://localhost:5000');
    }
    throw error;
  }
}

export const api = {
  // Auth API
  login: (credentials) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: (userData) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: () => {
    return request('/auth/me', {
      method: 'GET',
    });
  },

  // User Profile API
  getProfile: () => {
    return request('/users/profile', {
      method: 'GET',
    });
  },

  updateProfile: (profileData) => {
    return request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Crop & Area Data API
  getMyCrops: () => {
    return request('/crops/my-crops', {
      method: 'GET',
    });
  },

  addCrop: (cropData) => {
    return request('/crops', {
      method: 'POST',
      body: JSON.stringify(cropData),
    });
  },

  updateCrop: (id, cropData) => {
    return request(`/crops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cropData),
    });
  },

  deleteCrop: (id) => {
    return request(`/crops/${id}`, {
      method: 'DELETE',
    });
  },

  getAreaData: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/crops/area-data${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  // Crop Disease Detection API
  analyzeDisease: (imageFile) => {
    const token = localStorage.getItem('krushisevak_token');
    const formData = new FormData();
    formData.append('image', imageFile);
    return fetch('/api/disease/analyze', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.message || 'Disease analysis failed');
        error.status = response.status;
        throw error;
      }
      return data;
    });
  },

  getDiseaseHistory: () => request('/disease/history', { method: 'GET' }),

  // Product & Store Inventory API
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  getMyInventory: () => {
    return request('/products/my-inventory', {
      method: 'GET',
    });
  },

  addProduct: (productData) => {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: (id, productData) => {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  uploadProductImage: (id, imageFile) => { const token = localStorage.getItem('krushisevak_token'); const fd = new FormData(); fd.append('image', imageFile); return fetch(`/api/products/${id}/image`, { method:'POST', headers: token ? { Authorization:`Bearer ${token}` } : {}, body:fd }).then(async r => { const d=await r.json(); if(!r.ok) throw new Error(d.message || 'Image upload failed'); return d; }); },

  updateStock: (id, stockData) => {
    return request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(stockData),
    });
  },

  deleteProduct: (id) => {
    return request(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Farmer-to-Customer Crop Marketplace API
  getCropListings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/crop-listings${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  getMyCropListings: () => request('/crop-listings/my-listings', { method: 'GET' }),
  createCropListing: (listingData) => request('/crop-listings', { method: 'POST', body: JSON.stringify(listingData) }),
  updateCropListing: (id, listingData) => request(`/crop-listings/${id}`, { method: 'PUT', body: JSON.stringify(listingData) }),
  deleteCropListing: (id) => request(`/crop-listings/${id}`, { method: 'DELETE' }),
  uploadCropListingImage: (id, imageFile) => { const token = localStorage.getItem('krushisevak_token'); const fd = new FormData(); fd.append('image', imageFile); return fetch(`/api/crop-listings/${id}/image`, { method:'POST', headers: token ? { Authorization:`Bearer ${token}` } : {}, body:fd }).then(async r => { const d=await r.json(); if(!r.ok) throw new Error(d.message || 'Crop photo upload failed'); return d; }); },
  uploadCropListingImages: (id, imageFiles) => { 
    const token = localStorage.getItem('krushisevak_token'); 
    const fd = new FormData(); 
    imageFiles.forEach(file => fd.append('images', file)); 
    return fetch(`/api/crop-listings/${id}/images`, { 
      method:'POST', 
      headers: token ? { Authorization:`Bearer ${token}` } : {}, 
      body:fd 
    }).then(async r => { 
      const d=await r.json(); 
      if(!r.ok) throw new Error(d.message || 'Crop photos upload failed'); 
      return d; 
    }); 
  },

  // Orders API
  getMyOrders: () => {
    return request('/orders/my-orders', {
      method: 'GET',
    });
  },

  getStoreOrders: () => request('/orders/store-orders', { method: 'GET' }),

  updateStoreOrderStatus: (id, orderStatus) => request(`/orders/store-orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ orderStatus }) }),

  createOrder: (orderData) => {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Phase 5 AI Assistant & Feedback
  chat: (question, lang = 'en', imageData = '') => request('/chat', { method: 'POST', body: JSON.stringify({ question, lang, imageData }) }),
  getKendras: (params = {}) => { const query = new URLSearchParams(params).toString(); return request(`/users/kendras${query ? `?${query}` : ''}`, { method: 'GET' }); },
  getChatHistory: () => request('/chat/history', { method: 'GET' }),
  sendFeedback: (feedback) => request('/feedback', { method: 'POST', body: JSON.stringify(feedback) }),
  getMyFeedback: () => request('/feedback/my', { method: 'GET' }),

  // Notifications API
  getNotifications: () => request('/notifications', { method: 'GET' }),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  // Weather API
  getWeather: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/weather${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },
};
