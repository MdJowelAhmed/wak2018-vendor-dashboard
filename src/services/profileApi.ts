import { baseApi } from "@/services/baseApi";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateVendorProfile: build.mutation<
      { success: boolean; data: any },
      FormData
    >({
      query: (body) => ({
        url: "/vendors/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Vendors", "Users"],
    }),
    updateServiceProviderProfile: build.mutation<
      { success: boolean; data: any },
      {
        experienceLevel: string;
        yearsOfExperience: number;
        portfolioLink: string;
        skills: string[];
        languages: string[];
        availability: string;
      }
    >({
      query: (body) => ({
        url: "/service-providers/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Services", "Users"],
    }),
    updateUserProfile: build.mutation<
      { success: boolean; data: any },
      FormData
    >({
      query: (body) => ({
        url: "/users/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
    getUserProfile: build.query<{ success: boolean; data: any }, void>({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),
    getLanguages: build.query<{ success: boolean; data: string[] }, void>({
      query: () => ({
        url: "/meta/languages",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useUpdateVendorProfileMutation,
  useUpdateServiceProviderProfileMutation,
  useUpdateUserProfileMutation,
  useGetUserProfileQuery,
  useGetLanguagesQuery,
} = profileApi;
