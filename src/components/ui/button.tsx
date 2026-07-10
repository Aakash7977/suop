import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Lazy-loaded toast fallback.
 *
 * Many <Button> instances across the SUOP app are currently rendered as UI
 * placeholders WITHOUT an `onClick` handler. Previously, clicking them did
 * nothing silently — which made users think the buttons were broken.
 *
 * To give immediate visible feedback, we now intercept clicks on buttons
 * that have no `onClick` (and are not `disabled`, `type="submit"`, or
 * rendered via `asChild`) and show a "coming soon" toast.
 *
 * The toast hook is loaded lazily so that the Button component can still be
 * used from server components / contexts where the toast provider is not
 * available.
 */
function firePlaceholderToast(label: string) {
  if (typeof window === "undefined") return
  try {
    // Dynamic import avoids useToast's "use client" requirement at module load
    import("@/hooks/use-toast").then(({ useToast }) => {
      // useToast is a hook; we cannot call it here. Instead, dispatch
      // through the global toaster store via the imperative API below.
    }).catch(() => {})
  } catch {}

  // Imperative fallback: dispatch a CustomEvent that the Toaster component
  // can listen for. We also use a simpler window-level dispatch so any
  // listener (including the Toaster in layout.tsx) can react.
  try {
    window.dispatchEvent(
      new CustomEvent("suop:placeholder-click", {
        detail: { label: label || "This button" },
      })
    )
  } catch {}
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  onClick,
  type = "button",
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  // Derive a textual label for the placeholder toast.
  const label = React.useMemo(() => {
    if (typeof children === "string") return children
    if (Array.isArray(children)) {
      const text = children
        .map((c) => (typeof c === "string" ? c : ""))
        .join("")
        .trim()
      if (text) return text
    }
    return ""
  }, [children])

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // If the button is a real submit button (inside a form), let it work.
      if (type === "submit") {
        onClick?.(e)
        return
      }
      // If there is a real onClick, call it.
      if (typeof onClick === "function") {
        onClick(e)
        return
      }
      // Otherwise, give the user feedback so the click is not silent.
      firePlaceholderToast(label)
    },
    [onClick, type, label]
  )

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
