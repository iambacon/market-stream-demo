"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      className={cn(
        "shrink-0 bg-border h-px w-full",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
