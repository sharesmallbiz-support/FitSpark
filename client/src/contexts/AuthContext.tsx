import React, { createContext, useContext, useState, useEffect } from "react";
import type { ApiUser } from "@/types/api";

interface AuthContextType {
  user: ApiUser | null;
  login: (userData: ApiUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<ApiUser>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    // Try to restore user from localStorage
    const savedUser = localStorage.getItem("fitspark_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error("Failed to parse saved user data:", error);
        localStorage.removeItem("fitspark_user");
      }
    }
  }, []);

  const login = (userData: ApiUser) => {
    setUser(userData);
    localStorage.setItem("fitspark_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fitspark_user");
  };

  const updateUser = (updates: Partial<ApiUser>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("fitspark_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        updateUser, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
