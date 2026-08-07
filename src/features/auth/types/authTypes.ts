export type UserRole = "vendor" | "service";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  /**
   * Future-safe: a single email can have multiple roles.
   * `role` is the currently active/selected role context for this session.
   */
  roles?: UserRole[];
  role: UserRole;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
