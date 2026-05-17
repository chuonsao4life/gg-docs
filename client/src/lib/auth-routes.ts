export const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"] as const

export function normalizePathname(pathname: string | null | undefined) {
  if (!pathname) return "/"

  const [pathOnly] = pathname.split(/[?#]/)
  if (pathOnly === "/") return "/"

  return pathOnly.replace(/\/+$/, "")
}

export function isPublicRoute(pathname: string | null | undefined) {
  const normalized = normalizePathname(pathname)

  return PUBLIC_ROUTES.some((route) => normalized === route || normalized.startsWith(`${route}/`))
}

export function getSafeRedirectPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback
  }

  try {
    const url = new URL(value, "http://localhost")
    const path = normalizePathname(url.pathname)

    if (isPublicRoute(path)) {
      return fallback
    }

    return `${url.pathname}${url.search}${url.hash}` || fallback
  } catch {
    return fallback
  }
}
