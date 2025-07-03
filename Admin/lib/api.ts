const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface Shop {
  id: number;
  name: string;
  role?: string;
}

interface User {
  id: number;
  email: string;
  full_name: string;
  shops: Shop[];
  shop?: {
    id: number;
    name: string;
  };
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  sku: string;
  stock_quantity: number;
  image_url?: string;
  active: boolean;
  shop_id: number;
  created_at: string;
  updated_at: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  password_confirmation: string;
  full_name: string;
  store_name: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const api = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/login`);
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login error response:', errorText);
        throw new Error(errorText || 'Login failed');
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Login error:', error);
      return { error: error instanceof Error ? error.message : 'Login failed' };
    }
  },

  async signup(data: SignupData): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      console.log('Attempting signup to:', `${API_BASE_URL}/signup`);
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Signup error response:', errorText);
        throw new Error(errorText || 'Signup failed');
      }

      const responseData = await response.json();
      return { data: responseData };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error instanceof Error ? error.message : 'Signup failed' };
    }
  },

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        const errorText = await response.text();
        console.error('Get current user error response:', errorText);
        throw new Error(errorText || 'Failed to fetch user data');
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Get current user error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to fetch user data' };
    }
  },

  async createShop(token: string, name: string): Promise<ApiResponse<{ shop: Shop }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/shops`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create shop error response:', errorText);
        throw new Error(errorText || 'Failed to create shop');
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Create shop error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to create shop' };
    }
  },

  async getProducts(shopId: number): Promise<ApiResponse<{ products: Product[] }>> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/shops/${shopId}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        const errorText = await response.text();
        console.error('Get products error response:', errorText);
        throw new Error(errorText || 'Failed to fetch products');
      }

      const products = await response.json();
      // The API returns an array directly, so we wrap it in the expected format
      return { data: { products: Array.isArray(products) ? products : [] } };
    } catch (error) {
      console.error('Get products error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to fetch products' };
    }
  },

  async deleteProduct(shopId: number, productId: number): Promise<ApiResponse<void>> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/shops/${shopId}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        const errorText = await response.text();
        console.error('Delete product error response:', errorText);
        throw new Error(errorText || 'Failed to delete product');
      }

      return { data: undefined };
    } catch (error) {
      console.error('Delete product error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to delete product' };
    }
  },

  async bulkDeleteProducts(shopId: number, productIds: number[]): Promise<ApiResponse<void>> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/shops/${shopId}/products/bulk_delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ product_ids: productIds })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        const errorText = await response.text();
        console.error('Bulk delete products error response:', errorText);
        throw new Error(errorText || 'Failed to delete products');
      }

      return { data: undefined };
    } catch (error) {
      console.error('Bulk delete products error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to delete products' };
    }
  },
}; 