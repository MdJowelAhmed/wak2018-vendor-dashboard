import { baseApi } from "@/services/baseApi";

export type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  type: string;
  parent?: string | null;
  isFeatured: boolean;
  status: string;
};

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProductCategories: build.query<Category[], void>({
      query: () => "/categories/active?type=product",
      transformResponse: (response: any) => {
        return response?.data || [];
      },
    }),
  }),
});

export const { useGetProductCategoriesQuery } = categoryApi;
