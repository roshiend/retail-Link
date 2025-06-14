const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

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
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: any }>> {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/login`);
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
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

  async signup(data: SignupData): Promise<ApiResponse<{ user: any; token: string }>> {
    try {
      console.log('Attempting signup to:', `${API_BASE_URL}/signup`);
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(data),
        credentials: 'include',
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

  async getCurrentUser(token: string): Promise<ApiResponse<{ user: any }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
      });

      if (!response.ok) {
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

  async createShop(token: string, name: string): Promise<ApiResponse<{ shop: any }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/shops`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ name }),
        credentials: 'include',
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
}; 