'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, UserPlus } from 'lucide-react';
import AuthDialog from './AuthDialog';

interface LoginButtonProps {
  className?: string;
  variant?: 'login' | 'register';
  size?: 'default' | 'sm' | 'lg';
}

export default function LoginButton({ 
  className, 
  variant = 'login',
  size = 'sm'
}: LoginButtonProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const isLogin = variant === 'login';

  return (
    <>
      <Button
        variant="outline"
        size={size}
        className={className}
        onClick={() => setShowAuthDialog(true)}
      >
        {isLogin ? (
          <User className="h-4 w-4 mr-1" />
        ) : (
          <UserPlus className="h-4 w-4 mr-1" />
        )}
        <span className="hidden sm:inline">
          {isLogin ? 'Login' : 'Sign Up'}
        </span>
      </Button>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        defaultTab={variant}
      />
    </>
  );
}
