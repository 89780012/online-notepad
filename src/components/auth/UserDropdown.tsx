'use client';

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { generateAvatarUrl } from '@/lib/auth';

interface UserDropdownProps {
  className?: string;
}

export default function UserDropdown({ className }: UserDropdownProps) {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const avatarUrl = user.avatar || generateAvatarUrl(user.name || user.username);
  const displayName = user.name || user.username;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`flex items-center gap-2 px-2 py-1 h-auto hover:bg-accent/80 ${className}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-sm font-medium leading-none">{displayName}</span>
            <span className="text-xs text-muted-foreground leading-none mt-0.5">
              @{user.username}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-3 py-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-sm font-semibold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground">@{user.username}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* 统计信息 */}
        <DropdownMenuLabel className="py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Notes created</span>
            <span className="font-semibold text-foreground">{user.notesCount || 0}</span>
          </div>
        </DropdownMenuLabel>
        
        {/* <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <User className="h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          <span>My Notes</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <Crown className="h-4 w-4" />
          <span>Upgrade to Pro</span>
        </DropdownMenuItem> 
        
        <DropdownMenuSeparator />*/}
        
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4" />
          <span>{isLoading ? 'Logging out...' : 'Log out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
