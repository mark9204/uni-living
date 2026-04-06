const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5200';

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

  async getPropertiesPaged(filter) {
    const params = new URLSearchParams();

    if (filter) {
      if (filter.city) params.append('city', filter.city);
      if (filter.minPrice) params.append('minPrice', filter.minPrice);
      if (filter.maxPrice) params.append('maxPrice', filter.maxPrice);
      if (filter.hasBalcony !== undefined && filter.hasBalcony !== null) params.append('hasBalcony', filter.hasBalcony);
      if (filter.hasElevator !== undefined && filter.hasElevator !== null) params.append('hasElevator', filter.hasElevator);
      if (filter.sortBy) params.append('sortBy', filter.sortBy);
      if (filter.sortDirection) params.append('sortDirection', filter.sortDirection);
      if (filter.pageNumber) params.append('pageNumber', filter.pageNumber);
      if (filter.pageSize) params.append('pageSize', filter.pageSize);
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/property/paged${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
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

  async getPropertyImages(propertyId) {
    const response = await fetch(`${API_BASE_URL}/api/property/${propertyId}/images`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch property images');
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

  // Chat Room API methods
  async createOrGetChatRoom(propertyId) {
    console.log('🔧 Creating/getting chat room for property:', propertyId);
    
    // Use the correct endpoint: POST /api/Chat/rooms/{propertyId}
    const response = await fetch(`${API_BASE_URL}/api/Chat/rooms/${propertyId}`, {
      method: 'POST',
      headers: this.getHeaders(true)
      // No body needed - backend gets user info from JWT
    });

    console.log('🔧 Chat room API response:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔧 Chat room API error:', errorText);
      throw new Error(`Failed to create chat room: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const roomData = await response.json();
    console.log('🔧 Chat room created/retrieved:', roomData);
    return roomData;
  }

  async getUserChatRooms() {
    console.log('🔧 Getting user chat rooms...');
    const response = await fetch(`${API_BASE_URL}/api/Chat/rooms`, {
      method: 'GET',
      headers: this.getHeaders(true)
    });

    console.log('🔧 User chat rooms API response:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔧 User chat rooms API error:', errorText);
      throw new Error(`Failed to get user chat rooms: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const roomsData = await response.json();
    console.log('🔧 User chat rooms retrieved:', roomsData);
    return roomsData;
  }

  async getChatRoom(roomId) {
    const response = await fetch(`${API_BASE_URL}/api/Chat/rooms/${roomId}`, {
      method: 'GET',
      headers: this.getHeaders(true)
    });

    if (!response.ok) {
      throw new Error('Failed to get chat room');
    }
    
    return response.json();
  }

  async getChatMessages(roomId, take = 50) {
    const response = await fetch(`${API_BASE_URL}/api/Chat/rooms/${roomId}/messages?take=${take}`, {
      method: 'GET',
      headers: this.getHeaders(true)
    });

    if (!response.ok) {
      throw new Error('Failed to get messages');
    }
    
    return response.json();
  }

  // --- DASHBOARD API ENDPOINTS ---

  async getLandlordStats() {
    const response = await fetch(`${API_BASE_URL}/api/Dashboard/landlord-stats`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch landlord stats');
    return response.json();
  }

  async getTenantStats() {
    const response = await fetch(`${API_BASE_URL}/api/Dashboard/tenant-stats`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch tenant stats');
    return response.json();
  }

  async trackPropertyView(propertyId) {
    try {
      await fetch(`${API_BASE_URL}/api/Property/${propertyId}/view`, {
        method: 'POST',
        headers: this.getHeaders(false),
      });
    } catch (error) {
      console.error('Failed to track property view', error);
    }
  }

  // --- Notifications & Preferences ---

  async getMyPreferences() {
    const response = await fetch(`${API_BASE_URL}/api/preferences`, {
      method: 'GET',
      headers: this.getHeaders(true)
    });
    if (!response.ok) throw new Error('Failed to fetch preferences');
    return response.json();
  }

  async addPreference(preferenceDto) {
    const response = await fetch(`${API_BASE_URL}/api/preferences`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(preferenceDto)
    });
    if (!response.ok) throw new Error('Failed to create preference');
    return response.json();
  }

  async deletePreference(id) {
    const response = await fetch(`${API_BASE_URL}/api/preferences/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true)
    });
    if (!response.ok) throw new Error('Failed to delete preference');
  }

  async getNotifications() {
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'GET',
      headers: this.getHeaders(true)
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  }

  async markNotificationRead(id) {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getHeaders(true)
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
  }
}

export const apiClient = new ApiClient();
