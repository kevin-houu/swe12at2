/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TUser = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  workplace_id: number;
};

type TAuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: TUser | null;
};

type TApiResponse<T = unknown> = {
  message: string;
  body?: T;
};

type TApiError = {
  error: string;
};

export function useAuth() {
  const [authState, setAuthState] = useState<TAuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/user", {
        credentials: "include",
      });

      if (!response.ok) {
        setAuthState({ isAuthenticated: false, isLoading: false, user: null });
        return;
      }

      const data = (await response.json()) as TApiResponse<TUser>;

      if ("body" in data && data.body) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: data.body,
        });
      } else {
        setAuthState({ isAuthenticated: false, isLoading: false, user: null });
      }
    } catch (error) {
      setAuthState({ isAuthenticated: false, isLoading: false, user: null });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  async function signup(
    email: string,
    password: string,
    confirmPassword: string,
    adminSecret: string
  ) {
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, confirmPassword, adminSecret }),
      });

      const data = (await response.json()) as
        | TApiResponse<{ user: TUser }>
        | TApiError;

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Signup failed");
      }

      if ("message" in data) {
        await checkAuthStatus();
        router.push("/onboarding/welcome");
      }
    } catch (error) {
      throw error;
    }
  }

  async function signin(email: string, password: string) {
    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as
        | TApiResponse<{ user: TUser }>
        | TApiError;

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Signin failed");
      }

      if ("message" in data) {
        await checkAuthStatus();
        router.push("/dashboard");
      }
    } catch (error) {
      throw error;
    }
  }

  async function signout() {
    try {
      const response = await fetch("/api/signout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Signout failed");
      }

      await checkAuthStatus();
      router.push("/");
    } catch (error) {
      console.error("Signout error:", error);
    }
  }

  return {
    ...authState,
    signup,
    signin,
    signout,
  };
}
