import { createContext, type ReactNode, useEffect } from "react";

export interface User {
  id: string;
  username: string;
}

export interface UserRow extends User {
  hashedPassword: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
  verifyPassword: string;
}

export type AuthContextType = {
  loading: boolean;
  login: (creds: AuthCredentials) => Promise<User | null>;
  logout: () => Promise<void>;
  user: User;
};

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const login = async (creds: AuthCredentials): Promise<User | null> => {};

  return <>{children}</>;
};
