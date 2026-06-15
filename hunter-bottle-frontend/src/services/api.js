import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      if (window.location.pathname.startsWith('/admin')) window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const getProducts = (params) => api.get('/products', { params });
export const getProductRecommendations = () => api.get('/products/recommendations');
export const getProduct = (id) => api.get(`/products/${id}`);
export const getBanners = () => api.get('/banners');
export const getProvinces = () => api.get('/shipping/provinces');
export const getCities = (provinceId) => api.get('/shipping/cities', { params: { province_id: provinceId } });
export const getSubdistricts = (cityId) => api.get('/shipping/subdistricts', { params: { city_id: cityId } });
export const getShippingCost = (payload) => api.post('/shipping/cost', payload);
export const createOrder = (payload) => api.post('/orders', payload);
export const getOrder = (orderNumber) => api.get(`/orders/${orderNumber}`);
export const trackOrder = (orderNumber) => api.get(`/orders/track/${orderNumber}`);
export const getSnapToken = (payload) => api.post('/orders/snap-token', payload);

export const adminLogin = (credentials) => api.post('/admin/login', credentials);
export const adminLogout = () => api.post('/admin/logout');
export const getAdminMe = () => api.get('/admin/me');

export const adminGetProducts = (params) => api.get('/admin/products', { params });
export const adminCreateProduct = (formData) => api.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateProduct = (id, formData) => { formData.append('_method', 'PUT'); return api.post(`/admin/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); };
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`);
export const adminToggleProductTag = (productId, field) => api.patch(`/admin/products/${productId}/tags`, { field });

export const adminGetOrders = (params) => api.get('/admin/orders', { params });
export const adminUpdateOrderStatus = (id, status) => api.patch(`/admin/orders/${id}/status`, { order_status: status });
export const adminMarkOrderPaid = (id) => api.patch(`/admin/orders/${id}/mark-paid`);
export const adminUpdateTracking = (id, data) => api.patch(`/admin/orders/${id}/tracking`, data);
export const adminToggleItemCheck = (orderId, itemId) => api.patch(`/admin/orders/${orderId}/items/${itemId}/check`);
export const adminMarkOrderReady = (id) => api.patch(`/admin/orders/${id}/mark-ready`);

export const adminGetBanners = () => api.get('/admin/banners');
export const adminCreateBanner = (formData) => api.post('/admin/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateBanner = (id, formData) => { formData.append('_method', 'PUT'); return api.post(`/admin/banners/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); };
export const adminDeleteBanner = (id) => api.delete(`/admin/banners/${id}`);

export const adminGetAnalytics = (params) => api.get('/admin/analytics', { params });
export const adminCalculateBestsellers = () => api.post('/admin/analytics/calculate-bestsellers');

export default api;
