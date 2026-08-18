import { profileApi } from "@/services/profileApi";
import { authApi } from "@/services/authApi";

/**
 * @deprecated Use `profileApi` (useGetUserProfileQuery) or `authApi` (useChangePasswordMutation) directly.
 */
export const usersApi = profileApi;

export const useGetProfileQuery = profileApi.useGetUserProfileQuery;
export const useLazyGetProfileQuery = profileApi.useLazyGetUserProfileQuery;
export const useUpdateProfileMutation = profileApi.useUpdateUserProfileMutation;
export const useChangePasswordMutation = authApi.useChangePasswordMutation;
