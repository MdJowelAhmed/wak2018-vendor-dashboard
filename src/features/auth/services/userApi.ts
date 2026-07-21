import { baseApi } from '@/services/baseApi'
import type { UserProfile } from '@/types/api'

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<UserProfile, void>({
      query: () => '/user/profile',
      providesTags: (result) =>
        result
          ? [{ type: 'User' as const, id: result.id }, { type: 'User' as const, id: 'ME' }]
          : [{ type: 'User' as const, id: 'ME' }],
    }),
    updateProfile: build.mutation<UserProfile, { fullName: string; email?: string; phone?: string; address?: string }>({
      query: (body) => ({
        url: '/user/update-profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r) => [{ type: 'User' as const, id: 'ME' }],
    }),
    changePassword: build.mutation<{ ok: true }, { currentPassword: string; newPassword: string }>({
      query: (body) => ({
        url: '/user/change-password',
        method: 'PUT',
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const { useGetProfileQuery, useLazyGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } = userApi
