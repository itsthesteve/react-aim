import { createContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export interface User {
  username: string;
}

// Used in the sign in form
export interface AuthCredentials {
  username: string;
  password: string;
}

// Used in the sign up form, adds the verification field to the AuthCredentials interface
export interface SignUpAuthCredentials extends AuthCredentials {
  verifyPassword: string;
}

// Provider context type
export type AuthContextType = {
  signUp: (creds: SignUpAuthCredentials) => Promise<boolean>;
  login: (creds: AuthCredentials) => Promise<User>;
  logout: () => Promise<void>;
  user: User | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Make a quick call to make sure the user is still logged in, returns
  // a User object. Just call once on initialization.
  useEffect(() => {
    fetch("http://localhost:9000/auth/me", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.ok) {
          return null;
        }

        setUser(res.user);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (creds: AuthCredentials): Promise<User> => {
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
      const user = { username: creds.username };
      setUser(() => user);
      return user;
    }

    console.warn(resJson);
    throw new Error("Unable to log in");
  };

  const logout = async () => {
    await fetch("http://localhost:9000/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    navigate("/", { replace: true });
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
      <AuthContext.Provider value={{ login, logout, signUp, user, loading }}>
        {/* TODO: useQuery or other loading mech here when the user is being resolved? */}
        {children}
      </AuthContext.Provider>
    </>
  );
};
