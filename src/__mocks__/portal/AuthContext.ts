import { createContext } from "react";
import type { AuthContextType } from "@/types";

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true,
  isLoading: false,
  user: { sub: "test-user", email: "test@example.com", name: "Test User", roles: ["user"] },
  error: null,
  login: jest.fn(),
  logout: jest.fn(async () => {}),
  getAccessToken: jest.fn(async () => "mock-token"),
  refreshSession: jest.fn(async () => true),
});
