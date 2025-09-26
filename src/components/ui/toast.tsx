"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success"
  duration?: number
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", children, onClose, duration = 4000, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => onClose?.(), 150) // 延迟关闭以完成动画
        }, duration)

        return () => clearTimeout(timer)
      }
    }, [duration, onClose])

    if (!isVisible) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-4 right-4 z-50 flex w-full max-w-sm items-center justify-between rounded-lg border p-4 shadow-lg transition-all",
          "animate-in slide-in-from-top-2 fade-in-0",
          {
            "border-border bg-background text-foreground": variant === "default",
            "border-destructive/50 bg-destructive text-destructive-foreground": variant === "destructive",
            "border-green-500/50 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100": variant === "success",
          },
          className
        )}
        {...props}
      >
        <div className="flex-1">{children}</div>
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onClose(), 150)
            }}
            className="ml-2 rounded-sm opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast }