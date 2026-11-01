const API_BASE_URL = 'https://krushisevak-deployment.onrender.com/api';

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
      const error = new Error(
        data.message || `HTTP Error ${response.status}: ${response.statusText}`
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Cannot connect to KrushiSevak backend. Please try again.');
    }
    throw error;
  }
}

export const api = {
  // Authentication
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request('/auth/me'),

  // User Profile
  getProfile: () => request('/users/profile'),

  updateProfile: (profileData) =>
    request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // Crops and Area Data
  getMyCrops: () => request('/crops/my-crops'),

  addCrop: (cropData) =>
    request('/crops', {
      method: 'POST',
      body: JSON.stringify(cropData),
    }),

  updateCrop: (id, cropData) =>
    request(`/crops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cropData),
    }),

  deleteCrop: (id) =>
    request(`/crops/${id}`, { method: 'DELETE' }),

  getAreaData: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/crops/area-data${query ? `?${query}` : ''}`);
  },

  // Disease Detection
  analyzeDisease: (imageFile) => {
    const token = localStorage.getItem('krushisevak_token');
    const formData = new FormData();
    formData.append('image', imageFile);

    return fetch(`${API_BASE_URL}/disease/analyze`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Disease analysis failed');
      }
      return data;
    });
  },

  getDiseaseHistory: () => request('/disease/history'),

  // Products and Store Inventory
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },

  getMyInventory: () => request('/products/my-inventory'),

  addProduct: (productData) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  updateProduct: (id, productData) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  uploadProductImage: (id, imageFile) => {
    const token = localStorage.getItem('krushisevak_token');
    const fd = new FormData();
    fd.append('image', imageFile);

    return fetch(`${API_BASE_URL}/products/${id}/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Image upload failed');
      return d;
    });
  },

  updateStock: (id, stockData) =>
    request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(stockData),
    }),

  deleteProduct: (id) =>
    request(`/products/${id}`, { method: 'DELETE' }),

  // Farmer-to-Customer Crop Marketplace
  getCropListings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/crop-listings${query ? `?${query}` : ''}`);
  },

  getMyCropListings: () => request('/crop-listings/my-listings'),

  createCropListing: (listingData) =>
    request('/crop-listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    }),

  updateCropListing: (id, listingData) =>
    request(`/crop-listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    }),

  deleteCropListing: (id) =>
    request(`/crop-listings/${id}`, { method: 'DELETE' }),

  uploadCropListingImage: (id, imageFile) => {
    const token = localStorage.getItem('krushisevak_token');
    const fd = new FormData();
    fd.append('image', imageFile);

    return fetch(`${API_BASE_URL}/crop-listings/${id}/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Crop photo upload failed');
      return d;
    });
  },

  uploadCropListingImages: (id, imageFiles) => {
    const token = localStorage.getItem('krushisevak_token');
    const fd = new FormData();
    imageFiles.forEach((file) => fd.append('images', file));

    return fetch(`${API_BASE_URL}/crop-listings/${id}/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Crop photos upload failed');
      return d;
    });
  },

  // Orders
  getMyOrders: () => request('/orders/my-orders'),

  getStoreOrders: () => request('/orders/store-orders'),

  updateStoreOrderStatus: (id, orderStatus) =>
    request(`/orders/store-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ orderStatus }),
    }),

  createOrder: (orderData) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  // AI Assistant and Feedback
  chat: (question, lang = 'en', imageData = '') =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ question, lang, imageData }),
    }),

  getKendras: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users/kendras${query ? `?${query}` : ''}`);
  },

  getChatHistory: () => request('/chat/history'),

  sendFeedback: (feedback) =>
    request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    }),

  getMyFeedback: () => request('/feedback/my'),

  // Notifications
  getNotifications: () => request('/notifications'),

  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    request('/notifications/read-all', { method: 'PATCH' }),

  // Weather
  getWeather: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/weather${query ? `?${query}` : ''}`);
  },
};