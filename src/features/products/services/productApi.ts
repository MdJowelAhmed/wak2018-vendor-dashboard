import { baseApi } from "@/services/baseApi";
import type { Product } from "@/types/api";
import { getImageUrl } from "@/utils/utils";

export type GetProductsParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: "stock" | "category" | "price" | "createdAt" | string;
  sortOrder?: "asc" | "desc";
  sort?: string;
  category?: string;
  status?: "active" | "inactive" | string;
};

export type ProductPagination = {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
};

export type GetProductsResponse = {
  success?: boolean;
  message?: string;
  data: Product[];
  pagination?: ProductPagination;
};

const listTag = { type: "Products" as const, id: "LIST" as const };

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<GetProductsResponse, GetProductsParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.searchTerm) queryParams.searchTerm = params.searchTerm;
        if (params?.sortBy) queryParams.sortBy = params.sortBy;
        if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;
        if (params?.sort) queryParams.sort = params.sort;
        if (params?.category) queryParams.category = params.category;
        if (params?.status) queryParams.status = params.status;

        return {
          url: "/products/mine",
          params: queryParams,
        };
      },
      transformResponse: (response: any): GetProductsResponse => {
        const rawItems = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.products)
          ? response.data.products
          : Array.isArray(response)
          ? response
          : [];

        const pagination =
          response?.pagination ||
          response?.meta ||
          response?.data?.pagination ||
          response?.data?.meta ||
          undefined;

        const mappedProducts = rawItems.map((p: any) => ({
          id: p._id,
          name: p.name,
          category: typeof p.category === "object" ? p.category?.name || p.category?._id : p.category,
          categoryId: typeof p.category === "object" ? p.category?._id : p.category,
          brand: p.brand,
          description: p.description || "",
          productDetails: p.productDetails || "",
          price: p.price,
          discount: p.discountPrice,
          discountPrice: p.discountPrice,
          stock: p.stock,
          weight: p.weight,
          dimensions: p.dimensions,
          localDeliveryFee: p.localDeliveryFee ?? 0,
          variants: Array.isArray(p.variants)
            ? p.variants.map((v: any) => ({
                _id: v._id,
                id: v._id || v.id,
                color: v.color || "",
                stock: typeof v.stock === "number" ? v.stock : Number(v.stock) || 0,
                sizes: Array.isArray(v.sizes) ? v.sizes : [],
                image: v.image ? getImageUrl(v.image) : undefined,
              }))
            : [],
          colors: Array.isArray(p.colors) ? p.colors : [],
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
          active: p.status === "active",
          status: p.status,
          imageUrls: (p.images || []).map((img: string) => getImageUrl(img)),
          highlights: (p.topHighlights || []).map((h: any) => ({
            title: h.name,
            value: h.value,
          })),
          topHighlights: p.topHighlights || [],
          _id: p._id,
          sku: p.sku,
          lowStockThreshold: p.lowStockThreshold,
          ratingAverage: p.ratingAverage ?? 0,
          ratingCount: p.ratingCount ?? 0,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          slug: p.slug,
        })) as Product[];

        return {
          success: response?.success ?? true,
          message: response?.message ?? "",
          data: mappedProducts,
          pagination,
        };
      },
      providesTags: (r) => {
        const items = r?.data || [];
        return items.length
          ? [
              listTag,
              ...items.map((p) => ({ type: "Products" as const, id: p.id })),
            ]
          : [listTag];
      },
    }),
    getProduct: build.query<Product, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (response: any) => {
        const p = response?.data;
        if (!p) return {} as Product;
        return {
          id: p._id,
          name: p.name,
          category: p.category,
          brand: p.brand,
          description: p.description || "",
          productDetails: p.productDetails || "",
          price: p.price,
          discount: p.discountPrice,
          discountPrice: p.discountPrice,
          stock: p.stock,
          weight: p.weight,
          dimensions: p.dimensions,
          localDeliveryFee: p.localDeliveryFee ?? 0,
          variants: Array.isArray(p.variants)
            ? p.variants.map((v: any) => ({
                _id: v._id,
                id: v._id || v.id,
                color: v.color || "",
                stock: typeof v.stock === "number" ? v.stock : Number(v.stock) || 0,
                sizes: Array.isArray(v.sizes) ? v.sizes : [],
                image: v.image ? getImageUrl(v.image) : undefined,
              }))
            : [],
          colors: Array.isArray(p.colors) ? p.colors : [],
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
          active: p.status === "active",
          status: p.status,
          imageUrls: (p.images || []).map((img: string) => getImageUrl(img)),
          highlights: (p.topHighlights || []).map((h: any) => ({
            title: h.name,
            value: h.value,
          })),
          topHighlights: p.topHighlights || [],
          _id: p._id,
          sku: p.sku,
          lowStockThreshold: p.lowStockThreshold,
          ratingAverage: p.ratingAverage ?? 0,
          ratingCount: p.ratingCount ?? 0,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          slug: p.slug,
        } as Product;
      },
      providesTags: (_r, _e, id) => [{ type: "Products", id }],
    }),
    createProduct: build.mutation<Product, FormData>({
      query: (formData) => ({
        url: "/products",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [listTag],
    }),
    updateProduct: build.mutation<Product, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_r, _e, arg) => [
        listTag,
        { type: "Products" as const, id: arg.id },
      ],
    }),
    patchProduct: build.mutation<
      Product,
      { id: string; partial: Partial<Product> }
    >({
      query: ({ id, partial }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: partial,
      }),
      invalidatesTags: (_r, _e, arg) => [
        listTag,
        { type: "Products" as const, id: arg.id },
      ],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        listTag,
        { type: "Products" as const, id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  usePatchProductMutation,
  useDeleteProductMutation,
} = productApi;
