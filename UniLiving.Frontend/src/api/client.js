const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7177';

class ApiClient {
  constructor() {
    // Token mindig frissen lesz beolvasva a getAuthToken()-ből
  }

  setAuthToken(token) {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async register(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/register`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
          console.error('Registration error from backend:', error);
        } catch {
          error = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(error.message || JSON.stringify(error) || 'Registration failed');
      }

      const result = await response.json();
      // No longer setting token here, will be handled by AuthContext
      return result;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Backend nem elérhető: ${API_BASE_URL}`);
      }
      throw error;
    }
  }

  async login(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          error = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(error.message || 'Login failed');
      }

      const result = await response.json();
      // No longer setting token here, will be handled by AuthContext
      return result;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Backend nem elérhető: ${API_BASE_URL}`);
      }
      throw error;
    }
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      await fetch(`${API_BASE_URL}/api/Auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      // No longer removing tokens here, will be handled by AuthContext
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      const response = await fetch(`${API_BASE_URL}/api/Auth/refresh`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      if (!response.ok) {
        // Handled by AuthContext
        throw new Error('Token refresh failed');
      }

      const result = await response.json();
      // No longer setting token here, will be handled by AuthContext
      return result;
    } catch (error) {
      // Handled by AuthContext
      throw error;
    }
  }

  async getProperties() {
    const response = await fetch(`${API_BASE_URL}/api/property`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch properties');
    return response.json();
  }

  async getProperty(id) {
    const response = await fetch(`${API_BASE_URL}/api/property/${id}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch property');
    return response.json();
  }

  async createProperty(data) {
    const response = await fetch(`${API_BASE_URL}/api/property`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
        console.error('Property creation error from backend:', error);
      } catch {
        error = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error(error.message || JSON.stringify(error) || 'Failed to create property');
    }
    
    return response.json();
  }

  async updateProperty(id, data) {
    const response = await fetch(`${API_BASE_URL}/api/property/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update property');
    return response.json();
  }

  async deleteProperty(id) {
    const response = await fetch(`${API_BASE_URL}/api/property/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to delete property');
  }

  async uploadPropertyImage(propertyId, imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${API_BASE_URL}/api/property/${propertyId}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
        // NE add hozzá a Content-Type-ot! A FormData automatikusan beállítja
      },
      body: formData
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error(error.error || error.message || 'Image upload failed');
    }
    
    return response.json();
  }

  async setMainPropertyImage(propertyId, imageId) {
    const response = await fetch(
      `${API_BASE_URL}/api/property/images/${imageId}/set-main?propertyId=${propertyId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to set main image');
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();
