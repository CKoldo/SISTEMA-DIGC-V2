import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/app/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Inicializar usuarios por defecto si no existen
    const users = localStorage.getItem('users');
    if (!users) {
      const defaultUsers: User[] = [
        { id: '1', username: 'admin', password: 'admin123', role: 'admin' },
        { id: '2', username: 'usuario', password: 'usuario123', role: 'user' },
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    // Verificar si hay sesión activa
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const userWithoutPassword = { ...foundUser };
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
