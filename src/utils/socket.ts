import type { Socket } from 'socket.io-client'

export function getSocket(): Socket | null {
  return null
}

export function disconnectSocket() {
  // no connection in static demo
}

/**
 * Static demo mode: no real WebSocket — all data is local via RTK + `static-api-data`.
 */
export function connectSocket() {
  return null
}
