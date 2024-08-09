import { configureStore } from "@reduxjs/toolkit";
import { getMeAction } from "./auth/get-me";
import auth from "./auth";

export const store = configureStore({
  reducer: {
    auth,
  },
});

store.dispatch(getMeAction());

// https://redux.js.org/usage/usage-with-typescript
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
