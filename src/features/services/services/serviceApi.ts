import { baseApi } from "@/services/baseApi";
import type { Service, ServicePackage } from "@/types/api";
import type { UserRole } from "@/features/auth/types/authTypes";

const listTag = { type: "Services" as const, id: "LIST" as const };

export type CreateServiceInput = {
  title: string;
  description: string;
  packages: {
    basic: ServicePackage;
    standard: ServicePackage;
    premium: ServicePackage;
  };
};

export type CreateServiceProviderBody = {
  title: string;
  category: string;
  description: string;
  services: string[];
  technologies: string[];
  image: string;
  pricingType: "hourly" | "fixed";
  price: number;
  packageDetails: string[];
  deliveryTime: string;
  allCountries: boolean;
  countries: string[];
  role: Extract<UserRole, "service">;
};

export type GetMyServicesResponse = {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: Service[];
};

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<any, void>({
      query: () => "/categories",
    }),
    getMyServices: build.query<
      GetMyServicesResponse,
      { searchTerm?: string } | void
    >({
      query: (arg) => ({
        url: "/services/mine",
        params: arg ? { searchTerm: arg.searchTerm } : undefined,
      }),
      providesTags: (r) =>
        r?.data
          ? [
              listTag,
              ...r.data.map((s) => ({ type: "Services" as const, id: s._id })),
            ]
          : [listTag],
    }),
    getServiceById: build.query<Service, string>({
      query: (id) => `/services/${id}/mine`,
      transformResponse: (res: any) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Services", id }],
    }),
    createService: build.mutation<any, FormData>({
      query: (body) => ({
        url: "/services/",
        method: "POST",
        body,
      }),
      invalidatesTags: [listTag],
    }),
    updateService: build.mutation<any, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/services/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_r, _e, arg) => [
        listTag,
        { type: "Services" as const, id: arg.id },
      ],
    }),
    deleteService: build.mutation<any, string>({
      query: (id) => ({
        url: `/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [listTag],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useGetMyServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi;
