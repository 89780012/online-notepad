import { Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface FloatingHomeButtonProps {
  className?: string;
}

export default function FloatingHomeButton({ className = '' }: FloatingHomeButtonProps) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Link href="/">
        <Button
          size="lg"
          className="h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white group relative overflow-hidden border-2 border-white/20 hover:border-white/30 animate-pulse hover:animate-none"
          aria-label="Back to Home"
          title="Back to Home"
        >
          {/* 光晕效果 */}
          <div className="absolute -inset-2 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-25 group-hover:opacity-40 blur-lg transition-all duration-300" />
          
          {/* 背景动画效果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
          
          {/* 脉冲环效果 */}
          <div className="absolute inset-0 rounded-full border-2 border-red-300/40 animate-ping" />
          
          {/* 图标 */}
          <Home className="h-7 w-7 transition-all duration-200 group-hover:scale-125 relative z-10 drop-shadow-lg" />
          
          {/* 悬浮时显示的文字提示 */}
          <span className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-600 to-rose-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap border border-red-400/30 backdrop-blur-sm">
            🏠 Back to Home
          </span>
        </Button>
      </Link>
    </div>
  );
}
