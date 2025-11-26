import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground transition-[color,box-shadow,border-color] focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-blue-600/90 focus-visible:ring-[4px] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_4px_rgba(37,99,235,0.2)] disabled:cursor-not-allowed disabled:opacity-50",
                    "dark:focus-visible:border-blue-400 dark:focus-visible:ring-blue-400/90 dark:focus-visible:shadow-[0_0_0_4px_rgba(96,165,250,0.3)]",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
