'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorErrorBoundaryProps {
  children: React.ReactNode;
  onFallbackToPlainText?: () => void;
}

export default function EditorErrorBoundary({ 
  children, 
  onFallbackToPlainText 
}: EditorErrorBoundaryProps) {
  const editorFallback = (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card border border-border rounded-lg h-64">
      <AlertTriangle className="h-8 w-8 text-yellow-500 mb-3" />
      <h3 className="text-md font-medium text-foreground mb-2">
        Editor Loading Error
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        The markdown editor failed to load. You can try again or switch to plain text mode.
      </p>
      <div className="flex gap-2">
        <Button 
          onClick={() => window.location.reload()} 
          variant="default" 
          size="sm"
        >
          Reload Editor
        </Button>
        {onFallbackToPlainText && (
          <Button 
            onClick={onFallbackToPlainText} 
            variant="outline" 
            size="sm"
          >
            Use Plain Text
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={editorFallback}
      onError={(error, errorInfo) => {
        console.error('Editor Error:', error, errorInfo);
        // 可以在这里添加错误上报逻辑
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
