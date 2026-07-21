import { useEffect } from 'react'
import { baseApi } from '@/services/baseApi'
import { useAppDispatch } from '@/app/hooks'
import { getSocket } from '@/utils/socket'

/**
 * Subscribes to delivery-related socket events and invalidates RTK Query caches.
 * In static demo mode, `getSocket()` returns null, so this becomes a no-op.
 */
export function useDeliveryRealtime(orderId?: string) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const invalidate = () => {
      dispatch(
        baseApi.util.invalidateTags(
          orderId
            ? [{ type: 'Delivery', id: orderId }, { type: 'Order', id: orderId }, { type: 'Order', id: 'LIST' }]
            : [{ type: 'Delivery', id: 'LIST' }, { type: 'Order', id: 'LIST' }],
        ),
      )
    }

    // Keep event names flexible: backend can emit either generic or typed events.
    const handlers: Array<[string, (...args: any[]) => void]> = [
      ['delivery:updated', invalidate],
      ['delivery:status', invalidate],
      ['driver:accepted', invalidate],
      ['shipment:tracking', invalidate],
      ['delivery:completed', invalidate],
    ]

    for (const [evt, fn] of handlers) socket.on(evt, fn)
    return () => {
      for (const [evt, fn] of handlers) socket.off(evt, fn)
    }
  }, [dispatch, orderId])
}

