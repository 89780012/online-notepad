'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Mail, User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import ForgotPasswordDialog from './ForgotPasswordDialog';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export default function AuthDialog({ isOpen, onClose, defaultTab = 'login' }: AuthDialogProps) {
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // 登录表单状态
  const [loginData, setLoginData] = useState({
    emailOrUsername: '',
    password: ''
  });
  
  // 注册表单状态
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    name: ''
  });

  // 错误状态
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setLoginData({ emailOrUsername: '', password: '' });
    setRegisterData({ email: '', username: '', password: '', name: '' });
    setErrors({});
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // 基本验证
    const newErrors: Record<string, string> = {};
    if (!loginData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Email or username is required';
    }
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(loginData.emailOrUsername, loginData.password);
      
      if (result.success) {
        toast({
          title: 'Login successful!',
          description: 'Welcome back!',
          variant: 'default',
        });
        handleClose();
      } else {
        setErrors({ general: result.error || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // 验证
    const newErrors: Record<string, string> = {};
    
    if (!registerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(registerData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!registerData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (registerData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (registerData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    }
    
    if (!registerData.password) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(
        registerData.email,
        registerData.username,
        registerData.password,
        registerData.name || undefined
      );
      
      if (result.success) {
        toast({
          title: 'Registration successful!',
          description: 'Welcome to Mini Notepad!',
          variant: 'default',
        });
        handleClose();
      } else {
        setErrors({ general: result.error || 'Registration failed' });
      }
    } catch (error) {
      console.error('Register error:', error);
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to Mini Notepad
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {errors.general && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  {errors.general}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="login-email">Email or Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="text"
                    placeholder="Enter your email or username"
                    className={`pl-10 ${errors.emailOrUsername ? 'border-red-500' : ''}`}
                    value={loginData.emailOrUsername}
                    onChange={(e) => setLoginData({ ...loginData, emailOrUsername: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                {errors.emailOrUsername && (
                  <p className="text-red-600 text-sm">{errors.emailOrUsername}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm">{errors.password}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4 mt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              {errors.general && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  {errors.general}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Choose a username"
                    className={`pl-10 ${errors.username ? 'border-red-500' : ''}`}
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-600 text-sm">{errors.username}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-name">Display Name (Optional)</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Your display name"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm">{errors.password}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      <ForgotPasswordDialog
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => {
          setShowForgotPassword(false);
          // AuthDialog 已经是打开的，不需要额外操作
        }}
      />
    </Dialog>
  );
}
