import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthCredentials, AuthState, User } from ".";

export const signInAction = createAsyncThunk(
  "auth/login",
  async (creds: AuthCredentials, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:9000/auth/login", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(creds),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = (await res.json()) as { user: User; res: boolean; reason: string | null };
      if (!res.ok) {
        return rejectWithValue(json.reason);
      }

      return json.user;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const signInExtras = (builder: ActionReducerMapBuilder<AuthState>) => {
  builder.addCase(signInAction.pending, (state) => {
    state.loading = true;
    state.error = null;
  });

  builder.addCase(signInAction.fulfilled, (state, { payload }) => {
    state.loading = false;
    if (payload) {
      state.user = payload;
    }
  });

  builder.addCase(signInAction.rejected, (state, { payload }) => {
    console.log(payload);
    state.loading = false;
    state.error = payload as string;
  });
};
