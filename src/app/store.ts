import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from '@/services/baseApi'
import authReducer from '@/features/auth/authSlice'
import '@/features/products'
import '@/features/services'
import '@/features/orders'
import '@/features/delivery'
import '@/features/dashboard'
import '@/features/chat'
import '@/features/admin'
import '@/features/customers'
import '@/features/settings'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
