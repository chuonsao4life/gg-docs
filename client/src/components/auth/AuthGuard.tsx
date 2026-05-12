"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { isPublicRoute } from "@/lib/auth-routes"
import { getStoredAccessToken, onSessionChange } from "@/services/auth.service"

function getCurrentUrlForRedirect() {
  if (typeof window === "undefined") return "/"
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

function buildLoginRedirect() {
  return `/login?redirect=${encodeURIComponent(getCurrentUrlForRedirect())}`
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const publicRoute = isPublicRoute(pathname)
  const [authChecked, setAuthChecked] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const syncAuthState = () => {
      const nextHasSession = Boolean(getStoredAccessToken())

      setHasSession(nextHasSession)
      setAuthChecked(true)

      if (!nextHasSession && !isPublicRoute(window.location.pathname)) {
        router.replace(buildLoginRedirect())
      }
    }

    syncAuthState()
    return onSessionChange(syncAuthState)
  }, [pathname, router])

  if (!publicRoute && (!authChecked || !hasSession)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return children
}
