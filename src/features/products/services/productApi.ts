import { baseApi } from "@/services/baseApi";
import type { Product } from "@/types/api";
import { getImageUrl } from "@/utils/utils";

const listTag = { type: "Products" as const, id: "LIST" as const };

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<Product[], void>({
      query: () => "/products/mine",
      transformResponse: (response: any) => {
        const items = response?.data || [];
        return items.map((p: any) => ({
          id: p._id,
          name: p.name,
          category: p.category,
          description: p.description || p.productDetails || "",
          price: p.price,
          discount:
            p.discountPrice && p.price > p.discountPrice
              ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
              : 0,
          stock: p.stock,
          active: p.status === "active",
          imageUrls: (p.images || []).map((img: string) => getImageUrl(img)),
          highlights: (p.topHighlights || []).map((h: any) => ({
            title: h.name,
            value: h.value,
          })),
          _id: p._id,
          status: p.status,
          sku: p.sku,
        })) as Product[];
      },
      providesTags: (r) =>
        r
          ? [
              listTag,
              ...r.map((p) => ({ type: "Products" as const, id: p.id })),
            ]
          : [listTag],
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
          description: p.description || p.productDetails || "",
          price: p.price,
          discount:
            p.discountPrice && p.price > p.discountPrice
              ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
              : 0,
          stock: p.stock,
          active: p.status === "active",
          imageUrls: (p.images || []).map((img: string) => getImageUrl(img)),
          highlights: (p.topHighlights || []).map((h: any) => ({
            title: h.name,
            value: h.value,
          })),
          _id: p._id,
          status: p.status,
          sku: p.sku,
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
