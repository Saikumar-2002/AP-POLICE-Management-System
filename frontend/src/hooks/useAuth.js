import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export function useAuth() {
  const { user, isAuthenticated, token, loading, error, login, logout, clearError } = useAuthStore();

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canEdit = isAdmin || isManager;

  return { user, isAuthenticated, token, loading, error, login, logout, clearError, isAdmin, isManager, canEdit };
}
