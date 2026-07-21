import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export function fetchErrorMessage(err: unknown): string | null {
  if (err && typeof err === 'object' && 'data' in err) {
    const d = (err as FetchBaseQueryError).data
    if (d && typeof d === 'object' && 'message' in d && typeof (d as { message: unknown }).message === 'string') {
      return (d as { message: string }).message
    }
    if (typeof d === 'string' && d.length) {
      return d
    }
  }
  if (err instanceof Error) {
    return err.message
  }
  return null
}
