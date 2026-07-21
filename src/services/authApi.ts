import { baseApi } from "@/services/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<
      {
        success: boolean;
        message: string;
        data: { accessToken: string; role: string };
      },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    forgotPassword: build.mutation<
      { success: boolean; message: string },
      { email: string }
    >({
      query: (data) => ({
        url: "/auth/forget-password",
        method: "POST",
        body: data,
      }),
    }),
    verifyEmail: build.mutation<
      { success: boolean; message: string },
      { email: string; oneTimeCode: number }
    >({
      query: (data) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: data,
      }),
    }),
    resendOtp: build.mutation<
      { success: boolean; message: string },
      { email: string }
    >({
      query: (data) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: data,
      }),
    }),
    changePassword: build.mutation<
      { success: boolean; message: string },
      { currentPassword: string; newPassword: string; confirmPassword: string }
    >({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
    }),
    register: build.mutation<{ success: boolean; message: string; data?: any }, { name: string; email: string; phone: string; password: string; role: string }>({
      query: (body) => ({ url: "/users/", method: "POST", body }),
    }),
    verifyOtp: build.mutation<{ ok: true }, { email: string; otp: string }>({
      query: (body) => ({ url: "/auth/verify-otp", method: "POST", body }),
      transformResponse: () => ({ ok: true as const }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
  useChangePasswordMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
} = authApi;
