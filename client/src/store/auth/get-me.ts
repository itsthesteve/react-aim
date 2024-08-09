import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthState } from ".";

type User = { username: string };
type UserResponse = { ok: boolean; user: User };

const options: RequestInit = {
  method: "GET",
  credentials: "include",
};

export const getMeAction = createAsyncThunk(
  "auth/me",
  async (signal?: AbortSignal): Promise<User | null> => {
    if (signal) {
      options.signal = signal;
    }

    const response = await fetch("http://localhost:9000/auth/me", options);

    if (!response.ok) {
      return null;
    }
    const result: UserResponse = await response.json();

    return result.user;
  }
);

export const getMeExtras = (builder: ActionReducerMapBuilder<AuthState>) => {
  builder.addCase(getMeAction.pending, (state) => {
    state.loading = true;
    state.error = null;
  });

  builder.addCase(getMeAction.fulfilled, (state, { payload }) => {
    state.loading = false;
    if (payload) {
      state.user = payload;
    }
  });

  builder.addCase(getMeAction.rejected, (state, { payload }) => {
    state.loading = false;
    state.user = null;
    state.error = payload;
  });
};
