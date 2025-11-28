'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser } from '@/lib/auth';

const AUTH_SESSION_KEY = 'notepad-auth-session';

const hasAuthSession = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(AUTH_SESSION_KEY) === 'true';
};

const setAuthSession = (isAuthenticated: boolean) => {
  if (typeof window === 'undefined') {
    return;
  }
  if (isAuthenticated) {
    localStorage.setItem(AUTH_SESSION_KEY, 'true');
  } else {
    localStorage.removeItem(AUTH_SESSION_KEY);
  }
};

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, username: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string; previewUrl?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  validateResetToken: (token: string) => Promise<{ valid: boolean; error?: string; user?: { email: string; username: string } }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查用户认证状态
  const checkAuthStatus = async () => {
    if (!hasAuthSession()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setAuthSession(true);
      } else {
        setUser(null);
        setAuthSession(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setAuthSession(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 登录
  const login = async (emailOrUsername: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          emailOrUsername,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setAuthSession(true);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // 注册
  const register = async (email: string, username: string, password: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          username,
          password,
          name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setAuthSession(true);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // 登出
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAuthSession(false);
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    await checkAuthStatus();
  };

  // 忘记密码
  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { 
          success: true, 
          previewUrl: data.previewUrl // 仅在开发环境中返回
        };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // 重置密码
  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // 修改密码
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // 验证重置令牌
  const validateResetToken = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok) {
        return { 
          valid: data.valid, 
          user: data.user 
        };
      } else {
        return { 
          valid: false, 
          error: data.error 
        };
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return { 
        valid: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    forgotPassword,
    resetPassword,
    changePassword,
    validateResetToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
