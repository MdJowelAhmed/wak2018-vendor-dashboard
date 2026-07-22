import { baseApi } from "@/services/baseApi";
import type { UserProfile } from "@/types/api";

export type UserRole = "customer" | "vendor" | "driver";
export type UserStatus = "active" | "blocked";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  country: string;
  status: UserStatus;
};

export type UsersListResponse = {
  items: UserRow[];
  page: number;
  pageSize: number;
  total: number;
};

export type GetUsersParams = {
  q?: string;
  role?: UserRole | "all";
  status?: UserStatus | "all";
  page?: number;
  pageSize?: number;
};

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<UsersListResponse, GetUsersParams>({
      query: (params) => ({ url: "/admin/users", method: "GET", params }),
      providesTags: ["Users"],
    }),
    blockUser: build.mutation<void, { id: string; block: boolean }>({
      query: ({ id, block }) => ({
        url: `/admin/users/${id}/${block ? "block" : "unblock"}`,
        method: "POST",
      }),
      invalidatesTags: ["Users", "Dashboard"],
    }),
    changeUserRole: build.mutation<void, { id: string; role: UserRole }>({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Users"],
    }),
    getProfile: build.query<UserProfile, void>({
      query: () => "/user/profile",
      providesTags: (result) =>
        result
          ? [
              { type: "Users" as const, id: result.id },
              { type: "Users" as const, id: "ME" },
            ]
          : [{ type: "Users" as const, id: "ME" }],
    }),
    updateProfile: build.mutation<
      UserProfile,
      { fullName: string; email?: string; phone?: string; address?: string }
    >({
      query: (body) => ({
        url: "/user/update-profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r) => [{ type: "Users" as const, id: "ME" }],
    }),
    changePassword: build.mutation<
      { ok: true },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/user/change-password",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useBlockUserMutation,
  useChangeUserRoleMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = usersApi;
