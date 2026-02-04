"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showLabel?: boolean
  color?: 'primary' | 'accent' | 'success'
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, color = 'primary', ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
    
    const colorClasses = {
      primary: 'gradient-primary',
      accent: 'gradient-accent',
      success: 'bg-success',
    }
    
    return (
      <div className="w-full">
        <div
          ref={ref}
          className={cn(
            "relative h-3 w-full overflow-hidden rounded-full bg-secondary",
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out animate-progress-fill",
              colorClasses[color]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{value} / {max}</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
