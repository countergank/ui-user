import { LoginPage } from "@/features/auth/login-page";

/**
 * Lazy-loaded route module for "/login" (bundle-001). A sibling of the shell route, not a
 * child: the shell renders the product navigation and the skip link, and a login gate has
 * neither.
 */
export function Component() {
  return <LoginPage />;
}
