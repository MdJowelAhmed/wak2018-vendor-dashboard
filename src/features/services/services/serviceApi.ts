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

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getServices: build.query<Service[], void>({
      query: () => "/vendor/services",
      providesTags: (r) =>
        r
          ? [
              listTag,
              ...r.map((s) => ({ type: "Services" as const, id: s.id })),
            ]
          : [listTag],
    }),
    getService: build.query<Service, string>({
      query: (id) => `/vendor/services/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Services", id }],
    }),
    createService: build.mutation<Service, CreateServiceInput | FormData>({
      query: (body) => ({
        url: "/vendor/services",
        method: "POST",
        body,
      }),
      invalidatesTags: [listTag],
    }),
    updateService: build.mutation<
      Service,
      { id: string; data: FormData | Partial<Service> }
    >({
      query: ({ id, data }) => ({
        url: `/vendor/services/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_r, _e, arg) => [
        listTag,
        { type: "Services" as const, id: arg.id },
      ],
    }),
    createServiceProviderService: build.mutation<
      Service,
      CreateServiceProviderBody
    >({
      query: (body) => ({ url: "/api/services", method: "POST", body }),
      invalidatesTags: [listTag],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useCreateServiceProviderServiceMutation,
} = serviceApi;
