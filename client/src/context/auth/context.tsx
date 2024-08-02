import { createContext, useState, type ReactNode } from "react";

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
  login: (creds: AuthCredentials) => Promise<User | null>;
  logout: () => Promise<void>;
  user: User | null;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (creds: AuthCredentials): Promise<User | null> => {
    throw new Error("Not yet implemented");
  };

  const logout = async () => {
    throw new Error("Not yet implemented");
  };

  return (
    <>
      <AuthContext.Provider value={{ login, logout, user }}>{children}</AuthContext.Provider>
    </>
  );
};
