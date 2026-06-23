// Protects all /admin/* routes except /admin/login.
// useSupabaseUser() works in both SSR/prerender and client contexts
// (the module supports SSR). During `nuxi generate`, there's no logged-in
// user at build time, so protected routes prerender as a redirect to
// /admin/login — harmless, since this middleware re-runs client-side on
// every navigation (including the initial hydration), so a real logged-in
// session is correctly picked up in the browser regardless of what the
// static HTML shell contained.
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  const isLoginPage = to.path === '/admin/login'

  // Redirect to login if not authenticated and not already on the login page
  if (!user.value && !isLoginPage) {
    return navigateTo('/admin/login')
  }

  // Redirect authenticated admin away from the login page
  if (user.value && isLoginPage) {
    return navigateTo('/admin/slots')
  }
})