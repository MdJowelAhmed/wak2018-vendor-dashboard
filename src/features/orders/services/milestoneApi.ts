import { baseApi } from '@/services/baseApi'
import type { Milestone, MilestoneStatus } from '@/types/api'

const listTag = { type: 'Milestones' as const, id: 'LIST' as const }

export type CreateMilestoneBody = {
  orderId: string
  title: string
  description: string
  amount: number
}

export const milestoneApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMilestonesByOrder: build.query<Milestone[], string>({
      query: (orderId) => `/milestones/${orderId}`,
      providesTags: (r, _e, orderId) =>
        r
          ? [listTag, { type: 'Milestones' as const, id: orderId }, ...r.map((m) => ({ type: 'Milestones' as const, id: m.id }))]
          : [listTag, { type: 'Milestones' as const, id: orderId }],
    }),
    createMilestone: build.mutation<Milestone, CreateMilestoneBody>({
      query: (body) => ({ url: '/milestones', method: 'POST', body }),
      invalidatesTags: (_r, _e, b) => [listTag, { type: 'Milestones' as const, id: b.orderId }],
    }),
    updateMilestoneStatus: build.mutation<Milestone, { id: string; status: MilestoneStatus; orderId: string }>({
      query: ({ id, status }) => ({ url: `/milestones/${id}/status`, method: 'PUT', body: { status } }),
      invalidatesTags: (_r, _e, arg) => [listTag, { type: 'Milestones' as const, id: arg.orderId }, { type: 'Milestones' as const, id: arg.id }],
    }),
    updateMilestone: build.mutation<Milestone, { id: string; orderId: string; title: string; description: string; amount: number }>({
      query: ({ id, ...body }) => ({ url: `/milestones/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [listTag, { type: 'Milestones' as const, id: arg.orderId }, { type: 'Milestones' as const, id: arg.id }],
    }),
    deleteMilestone: build.mutation<void, { id: string; orderId: string }>({
      query: ({ id }) => ({ url: `/milestones/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, arg) => [listTag, { type: 'Milestones' as const, id: arg.orderId }, { type: 'Milestones' as const, id: arg.id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMilestonesByOrderQuery,
  useCreateMilestoneMutation,
  useUpdateMilestoneStatusMutation,
  useUpdateMilestoneMutation,
  useDeleteMilestoneMutation,
} = milestoneApi

