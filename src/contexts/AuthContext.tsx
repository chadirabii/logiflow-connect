import React, { createContext, useContext, useState, useCallback } from 'react';
import { users, type User, type UserRole } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (data: { email: string; password: string; fullName: string; company?: string; phone?: string; rneFile?: string; patenteFile?: string }) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('logistics_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((email: string, password: string) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem('logistics_user', JSON.stringify(found));
      return { success: true };
    }
    return { success: false, error: 'Email ou mot de passe incorrect' };
  }, []);

  const register = useCallback((data: { email: string; password: string; fullName: string; company?: string; phone?: string; rneFile?: string; patenteFile?: string }) => {
    if (users.find(u => u.email === data.email)) {
      return { success: false, error: 'Cet email est déjà utilisé' };
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      email: data.email,
      password: data.password,
      role: 'client',
      fullName: data.fullName,
      company: data.company,
      phone: data.phone,
      rneFile: data.rneFile,
      patenteFile: data.patenteFile,
      createdAt: new Date().toISOString().split('T')[0],
    };
    users.push(newUser);
    setUser(newUser);
    localStorage.setItem('logistics_user', JSON.stringify(newUser));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('logistics_user');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isClient: user?.role === 'client',
      isManager: user?.role === 'manager',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
