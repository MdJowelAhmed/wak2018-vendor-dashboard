import { baseApi } from '@/services/baseApi'
import type { Product } from '@/types/api'

const listTag = { type: 'Products' as const, id: 'LIST' as const }

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<Product[], void>({
      query: () => '/vendor/products',
      providesTags: (r) =>
        r
          ? [listTag, ...r.map((p) => ({ type: 'Products' as const, id: p.id }))]
          : [listTag],
    }),
    getProduct: build.query<Product, string>({
      query: (id) => `/vendor/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Products', id }],
    }),
    createProduct: build.mutation<Product, FormData>({
      query: (formData) => ({
        url: '/vendor/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [listTag],
    }),
    updateProduct: build.mutation<Product, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/vendor/products/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, arg) => [listTag, { type: 'Products' as const, id: arg.id }],
    }),
    patchProduct: build.mutation<Product, { id: string; partial: Partial<Product> }>({
      query: ({ id, partial }) => ({
        url: `/vendor/products/${id}`,
        method: 'PATCH',
        body: partial,
      }),
      invalidatesTags: (_r, _e, arg) => [listTag, { type: 'Products' as const, id: arg.id }],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (id) => ({ url: `/vendor/products/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [listTag, { type: 'Products' as const, id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  usePatchProductMutation,
  useDeleteProductMutation,
} = productApi
