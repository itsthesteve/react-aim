import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthCredentials, AuthState, User } from ".";

export const signInAction = createAsyncThunk(
  "auth/login",
  async (creds: AuthCredentials, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/login", {
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

export const logoutAction = createAsyncThunk("auth/logout", async () => {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    console.log("Logged out result:", res.ok);
  } catch (e) {
    console.warn("Error fetching /auth/logout", e);
  }
});

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

export const logoutExtras = (builder: ActionReducerMapBuilder<AuthState>) => {
  builder.addCase(logoutAction.pending, (state) => {
    state.loading = true;
    state.error = null;
  });

  builder.addCase(logoutAction.fulfilled, (state) => {
    state.loading = false;
    state.user = null;
  });

  builder.addCase(logoutAction.rejected, (state, { payload }) => {
    console.warn("Error logging out:", payload);
    state.loading = false;
    state.error = payload as string;
  });
};
