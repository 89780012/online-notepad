'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordDialog({ 
  isOpen, 
  onClose, 
  onBackToLogin 
}: ForgotPasswordDialogProps) {
  const { forgotPassword } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setEmail('');
    setError('');
    setIsSubmitted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBackToLogin = () => {
    resetForm();
    onBackToLogin();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 基本验证
    if (!email.trim()) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setIsSubmitted(true);
        
        // 在开发环境中显示预览链接
        if (result.previewUrl) {
          toast({
            title: 'Development Mode',
            description: `Email sent! Reset link: ${result.previewUrl}`,
            variant: 'default',
          });
          console.log('Reset link for testing:', result.previewUrl);
        }
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {isSubmitted ? 'Check Your Email' : 'Forgot Password'}
          </DialogTitle>
        </DialogHeader>
        
        {!isSubmitted ? (
          <div className="space-y-4 mt-6">
            <div className="text-center text-muted-foreground">
              <p>Enter your email address and we&apos;ll send you a link to reset your password.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email address"
                    className={`pl-10 ${error ? 'border-red-500' : ''}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
            
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={handleBackToLogin}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Email Sent!</h3>
              <p className="text-muted-foreground">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Check your email and follow the instructions to reset your password. 
                The link will expire in 1 hour.
              </p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={handleBackToLogin} className="w-full">
                Back to Login
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setIsSubmitted(false)}
                className="w-full text-sm"
              >
                Didn&apos;t receive email? Try again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
