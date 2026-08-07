import { baseApi } from "@/services/baseApi";

export type Staff = {
  _id: string;
  staffName: string;
  staffEmail: string;
  permissions: string[];
  staffType: string;
  status: string;
};

const tag = { type: "Staff" as const, id: "LIST" as const };

export const staffApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStaffs: build.query<Staff[], void>({
      query: () => "/staffs/",
      transformResponse: (res: any) => res.data || [],
      providesTags: [tag],
    }),
    createStaff: build.mutation<
      Staff,
      { name: string; email: string; permissions: string[] }
    >({
      query: (body) => ({
        url: "/staffs/",
        method: "POST",
        body,
      }),
      invalidatesTags: [tag],
    }),
    updateStaff: build.mutation<
      Staff,
      { id: string; data: { staffName?: string; permissions?: string[] } }
    >({
      query: ({ id, data }) => ({
        url: `/staffs/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tag],
    }),
    deleteStaff: build.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/staffs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tag],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStaffsQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} = staffApi;
