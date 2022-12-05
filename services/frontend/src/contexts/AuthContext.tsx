import { fetch } from '@/utils/Fetch';
import { RequiredNotNull } from '@/utils/Types';
import { PublicUser } from '@codern/external';
import { ComponentChildren, createContext } from 'preact';
import { route } from 'preact-router';
import { useCallback, useContext, useEffect, useMemo, useState } from 'preact/hooks';

export enum AuthStatus {
  AUTHENTICATING = 'AUTHENTICATING',
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
};

type AuthContextType = {
  user: PublicUser | null,
  authStatus: AuthStatus,
  auth: () => void,
  logout: () => void,
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  authStatus: AuthStatus.AUTHENTICATING,
  auth: () => {},
  logout: () => {},
});

export type AuthProviderProps = {
  children: ComponentChildren,
};

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.AUTHENTICATING);

  const auth = useCallback(() => {
    // TODO: ux on error
    fetch
      .get<PublicUser>('/auth/me')
      .then((response) => {
        setAuthStatus(AuthStatus.AUTHENTICATED);
        setUser(response.data);
      })
      .catch(() => {
        setAuthStatus(AuthStatus.UNAUTHENTICATED);
      })
  }, []);

  const logout = useCallback(() => {
    fetch
      .get('/auth/logout')
      .finally(() => {
        setAuthStatus(AuthStatus.UNAUTHENTICATED);
        route('/');
      });
  }, []);

  useEffect(auth, []);

  const contextValue = useMemo(() => ({
    user,
    authStatus,
    auth,
    logout,
  }), [authStatus]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context.user) {
    throw new Error(`Reached logged-in only component with null in 'user' context`);
  }
  return context as RequiredNotNull<AuthContextType>;
};

export const usePreAuth = () => {
  return useContext(AuthContext);
};