import { createSlice } from "@reduxjs/toolkit";
import { signInExtras } from "./sign-in";
import { getMeExtras } from "./get-me";

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
export interface AuthState {
  // signUp: (creds: SignUpAuthCredentials) => Promise<boolean>;
  // login: (creds: AuthCredentials) => Promise<User>;
  // logout: () => Promise<void>;
  user: User | null;
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    signInExtras(builder);
    getMeExtras(builder);
  },
});

// export const { signIn } = authSlice.actions;
export default authSlice.reducer;
