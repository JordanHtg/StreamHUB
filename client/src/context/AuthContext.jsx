import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance } from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('streamhub_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('streamhub_access_token') || null;
  });

  const [mockMode, setMockMode] = useState(() => {
    return localStorage.getItem('streamhub_mock_mode') === 'true'; // Default false (Real-Time Live API Mode)
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('streamhub_mock_mode', mockMode);
  }, [mockMode]);

  const login = async (email, password) => {
    setLoading(true);
    if (mockMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let role = 'Member Basic';
          let name = 'Alex Rivera (Member Basic)';
          let username = 'alex_rivera';
          let avatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80';

          if (email.includes('developer') || email.includes('gurse') || email.includes('uploader') || email.includes('studio') || email.includes('admin')) {
            role = 'Uploader';
            name = email.includes('gurse') || email.includes('developer') ? 'Developer Studio Admin' : 'StreamHUB Official Studio';
            username = email.includes('gurse') ? 'gurse_dev' : 'developer_studio';
            avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
          } else if (email.includes('premium') || email.includes('vip') || email.includes('langganan')) {
            role = 'Member Premium';
            name = 'VIP Premium Subscriber';
            username = 'vip_subscriber';
          }

          const mockUser = {
            id: role === 'Uploader' ? 2 : role === 'Member Premium' ? 3 : 1,
            name,
            username,
            email,
            role,
            avatar,
          };

          const mockToken = `mock_jwt_token_${Date.now()}`;
          setUser(mockUser);
          setToken(mockToken);
          localStorage.setItem('streamhub_user', JSON.stringify(mockUser));
          localStorage.setItem('streamhub_access_token', mockToken);
          setLoading(false);
          resolve({ success: true, user: mockUser });
        }, 350);
      });
    }

    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      if (res.data.success) {
        let loggedUser = res.data.user;
        if (loggedUser?.email?.includes('developer') || loggedUser?.email?.includes('gurse')) {
          loggedUser.role = 'Uploader';
        } else if (loggedUser?.role === 'User' || !loggedUser?.role) {
          loggedUser.role = 'Member Basic';
        }
        setUser(loggedUser);
        setToken(res.data.accessToken);
        localStorage.setItem('streamhub_user', JSON.stringify(loggedUser));
        localStorage.setItem('streamhub_access_token', res.data.accessToken);
        setLoading(false);
        return { success: true, user: loggedUser };
      }
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Try switching to Hybrid Mock Mode if backend is disconnected.',
      };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    if (mockMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockUser = {
            id: Date.now(),
            name: userData.name,
            username: userData.username,
            email: userData.email,
            phone: userData.phone,
            birthDate: userData.birthDate,
            gender: userData.gender,
            role: 'Member Basic',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          };
          setUser(mockUser);
          setToken(`mock_reg_token_${Date.now()}`);
          localStorage.setItem('streamhub_user', JSON.stringify(mockUser));
          localStorage.setItem('streamhub_access_token', `mock_reg_token_${Date.now()}`);
          setLoading(false);
          resolve({ success: true, otpDemo: '849201', user: mockUser });
        }, 350);
      });
    }

    try {
      const res = await axiosInstance.post('/auth/register', userData);
      if (res.data.success) {
        let regUser = res.data.user;
        if (regUser?.role === 'User' || !regUser?.role) {
          regUser.role = 'Member Basic';
        }
        setUser(regUser);
        setToken(res.data.accessToken);
        localStorage.setItem('streamhub_user', JSON.stringify(regUser));
        localStorage.setItem('streamhub_access_token', res.data.accessToken);
        setLoading(false);
        return res.data;
      }
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration error occurred.',
      };
    }
  };

  const socialLogin = async (provider = 'Google') => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: Date.now(),
          name: `${provider} Member Basic`,
          username: `${provider.toLowerCase()}_member`,
          email: `${provider.toLowerCase()}.basic@streamhub.com`,
          role: 'Member Basic',
          avatar: provider === 'Google'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
        };
        setUser(mockUser);
        setToken(`social_jwt_${Date.now()}`);
        localStorage.setItem('streamhub_user', JSON.stringify(mockUser));
        localStorage.setItem('streamhub_access_token', `social_jwt_${Date.now()}`);
        setLoading(false);
        resolve({ success: true, user: mockUser });
      }, 350);
    });
  };

  const forgotPassword = async (email) => {
    if (mockMode) {
      return { success: true, message: 'OTP sent to your email.', otpDemo: '592018', expiresInSeconds: 900 };
    }
    try {
      const res = await axiosInstance.post('/auth/forgot-password', { email });
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error processing forgot password request.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('streamhub_user');
    localStorage.removeItem('streamhub_access_token');
  };

  const toggleMockMode = () => {
    setMockMode(!mockMode);
  };

  const updateProfile = (updatedFields) => {
    if (user) {
      const newUser = { ...user, ...updatedFields };
      setUser(newUser);
      localStorage.setItem('streamhub_user', JSON.stringify(newUser));
      return newUser;
    }
    return null;
  };

  const upgradeToPremium = (months = 1) => {
    if (user) {
      const newUser = {
        ...user,
        role: 'Member Premium',
        subscription: `Premium (${months} Bulan)`,
      };
      setUser(newUser);
      localStorage.setItem('streamhub_user', JSON.stringify(newUser));
      return newUser;
    }
    return null;
  };

  const computeRole = (usr) => {
    if (!usr) return 'Guest';
    const r = usr.role || 'Member Basic';
    if (usr.email?.includes('developer') || usr.email?.includes('gurse') || r === 'Uploader') {
      return 'Uploader';
    }
    if (r === 'Member Premium' || r === 'Premium' || usr.subscription?.includes('Premium')) {
      return 'Member Premium';
    }
    return 'Member Basic';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: computeRole(user),
        mockMode,
        loading,
        login,
        register,
        socialLogin,
        forgotPassword,
        logout,
        toggleMockMode,
        updateProfile,
        upgradeToPremium,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
