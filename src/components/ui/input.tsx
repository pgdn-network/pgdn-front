import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-primary placeholder:text-secondary selection:bg-accent selection:text-white border-border flex h-9 w-full min-w-0 border bg-surface px-3 py-1 text-primary text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-accent focus-visible:ring-accent/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-danger/20 aria-invalid:border-danger",
        className
      )}
      {...props}
    />
  )
}

export { Input }
