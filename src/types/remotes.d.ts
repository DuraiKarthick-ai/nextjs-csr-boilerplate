/**
 * Module Federation remote type declarations.
 * Tells TypeScript about modules exposed by the Portal host.
 */
declare module "portal/AuthContext" {
  import type { Context } from "react";
  import type { AuthContextType } from "@/types";

  export const AuthContext: Context<AuthContextType>;
  export function useAuth(): AuthContextType;
  export function getAuth(): AuthContextType;
}

declare module "portal/AuthProvider" {
  import type { ComponentType, ReactNode } from "react";

  interface AuthProviderProps {
    children: ReactNode;
  }
  export const AuthProvider: ComponentType<AuthProviderProps>;
}

declare module "portal/AuthTokenService" {
  /**
   * Returns a valid access token, refreshing transparently if expired.
   * Concurrent callers coalesce onto a single refresh request.
   * @throws {Error} 'SESSION_EXPIRED' when re-authentication is required.
   */
  export function getToken(): Promise<string>;

  /** Seed the in-memory cache (called by Portal after OIDC login). */
  export function setToken(token: string, expiresIn: number): void;

  /** Clear cached token (logout). */
  export function clearToken(): void;

  /** Check if a valid token is currently cached (no network call). */
  export function hasValidToken(): boolean;
}
