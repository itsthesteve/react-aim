import { createContext, useState, type ReactNode } from "react";

export interface User {
  username: string;
}

export interface UserRow extends User {
  hashedPassword: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface SignUpAuthCredentials extends AuthCredentials {
  verifyPassword: string;
}

export type AuthContextType = {
  signUp: (creds: SignUpAuthCredentials) => Promise<boolean>;
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
    const res = await fetch("http://localhost:9000/auth/login", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(creds),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resJson = await res.json();

    if (resJson.ok) {
      return { username: creds.username };
    }

    throw new Error("Unable to login: " + resJson.reason);
  };

  const logout = async () => {
    throw new Error("Not yet implemented");
  };

  const signUp = async (creds: SignUpAuthCredentials) => {
    const response = await fetch("http://localhost:9000/auth/create", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(creds),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    console.log("sign up result", result);

    return result.ok;
  };

  return (
    <>
      <AuthContext.Provider value={{ login, logout, signUp, user }}>
        {children}
      </AuthContext.Provider>
    </>
  );
};
