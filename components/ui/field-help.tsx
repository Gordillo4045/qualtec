"use client"

import * as React from "react"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface FieldHelpProps {
  description: string
  className?: string
  id?: string
}

export function FieldHelp({ description, className, id }: FieldHelpProps) {
  const helpId = id || `field-help-${React.useId()}`
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          id={helpId}
          aria-label={`Información sobre este campo: ${description}`}
          className={cn(
            "inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Información de ayuda</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p>{description}</p>
      </TooltipContent>
    </Tooltip>
  )
}

