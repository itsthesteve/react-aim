import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { RootState } from "..";
import { getMeExtras } from "./get-me";
import { signInExtras } from "./sign-in";

export interface User {
  username: string;
}

// Used in the sign in form
export interface AuthCredentials {
  username: string;
  password: string;
}

// Used in the sign up form,ß adds the verification field to the AuthCredentials interface
export interface SignUpAuthCredentials extends AuthCredentials {
  verifyPassword: string;
}

// Provider context type
export interface AuthState {
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

export default authSlice.reducer;

// Shortcut to avoid typing all this when accessing the auth slice
// eslint-disable-next-line
export const getAuthState = () => useSelector<RootState, AuthState>((state) => state.auth);
