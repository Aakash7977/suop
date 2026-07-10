"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts, toast } = useToast()

  // Listen for placeholder button clicks dispatched by the Button component
  // when a button without an `onClick` is pressed. This gives users visible
  // feedback that the click was registered, instead of silently doing nothing.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const label = detail.label || "This action"
      toast({
        title: "Feature coming soon",
        description: `"${label}" is not wired up yet. Connect an onClick handler in the source to enable it.`,
      })
    }
    window.addEventListener("suop:placeholder-click", handler as EventListener)
    return () =>
      window.removeEventListener(
        "suop:placeholder-click",
        handler as EventListener
      )
  }, [toast])

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
