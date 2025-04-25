"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
  children: React.ReactNode
}

const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ open, onOpenChange, children }, ref) => {
    if (!open) return null

  return (
      <div ref={ref} className="fixed inset-0 z-50">
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
          onClick={() => onOpenChange?.(false)}
        />
        {children}
      </div>
  )
}
)
Sheet.displayName = "Sheet"

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => {
    const [isAnimating, setIsAnimating] = React.useState(true)

    React.useEffect(() => {
      const timer = setTimeout(() => setIsAnimating(false), 150)
      return () => clearTimeout(timer)
    }, [])

  return (
      <div
        ref={ref}
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
          {
            "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm": side === "right",
            "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm": side === "left",
            "inset-x-0 top-0 h-96 border-b": side === "top",
            "inset-x-0 bottom-0 h-96 border-t": side === "bottom",
          },
          isAnimating && {
            "animate-in slide-in-from-right": side === "right",
            "animate-in slide-in-from-left": side === "left",
            "animate-in slide-in-from-top": side === "top",
            "animate-in slide-in-from-bottom": side === "bottom",
          },
          className
        )}
        {...props}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
          onClick={() => {
            const event = new CustomEvent("sheet-close")
            window.dispatchEvent(event)
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    )
  }
)
SheetContent.displayName = "SheetContent"

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
      {...props}
    />
  )
SheetHeader.displayName = "SheetHeader"

const SheetTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
SheetTitle.displayName = "SheetTitle"

const SheetDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
}
