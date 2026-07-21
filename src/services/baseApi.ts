import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import { createApi } from '@reduxjs/toolkit/query/react'
import { getStaticRequestResult } from '@/utils/static-api-data'

const unwrap = (body: unknown): unknown => {
  if (body && typeof body === 'object' && 'data' in (body as object)) {
    return (body as { data: unknown }).data
  }
  return body
}

/**
 * In-memory static demo: no `fetch` / `VITE_API_BASE_URL` — all RTK endpoints are served from `static-api-data.ts`.
 */
const baseQueryWithEnvelope: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args) => {
  const result = await getStaticRequestResult(args)
  if ('error' in result) {
    return { error: result.error }
  }
  return { data: unwrap((result as { data: unknown }).data) } as { data: unknown }
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithEnvelope,
  tagTypes: [
    'Product',
    'Service',
    'Order',
    'Delivery',
    'Customer',
    'Settings',
    'Analytics',
    'Dashboard',
    'Message',
    'Conversation',
    'User',
    'Milestone',
  ],
  endpoints: () => ({}),
})
