'use client';

import { useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  role: string;
  displayName: string;
  pictureUrl?: string;
  status: string;
  schoolId: string | null;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => setState({ user: data.user || null, loading: false }))
      .catch(() => setState({ user: null, loading: false }));
  }, []);

  return state;
}
