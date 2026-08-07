import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "./types/authTypes";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

function readToken(): string | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

function readUser(): AuthUser | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

const initialState: AuthState = {
  token: readToken(),
  user: readUser(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem(TOKEN_KEY, action.payload.token);
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem(TOKEN_KEY, action.payload);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
