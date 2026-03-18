/**
 * Module Federation remote type declarations.
 * Tells TypeScript about modules exposed by the Portal host.
 */
declare module "portal/AuthContext" {
  import type { Context } from "react";
  import type { AuthContextType } from "@/types";

  export const AuthContext: Context<AuthContextType>;
  export function useAuth(): AuthContextType;
}

declare module "portal/AuthProvider" {
  import type { ComponentType, ReactNode } from "react";

  interface AuthProviderProps {
    children: ReactNode;
  }
  export const AuthProvider: ComponentType<AuthProviderProps>;
}
