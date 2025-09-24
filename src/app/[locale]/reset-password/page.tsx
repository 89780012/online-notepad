'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const { resetPassword, validateResetToken } = useAuth();
  const { toast } = useToast();
  
  const [token, setToken] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [userInfo, setUserInfo] = useState<{ email: string; username: string } | null>(null);

  // 验证重置令牌
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setTokenError('No reset token provided.');
      setIsValidating(false);
      return;
    }

    setToken(tokenParam);
    
    const validateToken = async () => {
      try {
        const result = await validateResetToken(tokenParam);
        if (result.valid) {
          setIsValidToken(true);
          setUserInfo(result.user || null);
        } else {
          setTokenError(result.error || 'Invalid reset token.');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setTokenError('Failed to validate reset token.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [searchParams, validateResetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 基本验证
    if (!password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPassword(token, password);
      
      if (result.success) {
        setIsSuccess(true);
        toast({
          title: 'Password Reset Successfully',
          description: 'You can now log in with your new password.',
          variant: 'default',
        });
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // 加载中状态
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Validating reset token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 令牌无效
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              Invalid Reset Link
            </CardTitle>
            <CardDescription>
              {tokenError}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              The reset link may have expired or been used already. Please request a new password reset.
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/" className="w-full">
                <Button className="w-full">
                  Go to Home Page
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  Request New Reset
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 重置成功
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
              Password Reset Successfully
            </CardTitle>
            <CardDescription>
              Your password has been updated successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              You can now log in to your account using your new password.
            </p>
            <Link href="/" className="w-full block">
              <Button className="w-full">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 重置密码表单
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            {userInfo && (
              <>Enter a new password for <strong>{userInfo.email}</strong></>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  className={`pl-10 pr-10 ${error ? 'border-red-500' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  className={`pl-10 ${error ? 'border-red-500' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
            
            <div className="text-center">
              <Link 
                href="/" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
