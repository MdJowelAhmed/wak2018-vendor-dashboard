export function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export function isValidOtp6(s: string) {
  return /^\d{6}$/.test(s)
}

export const PASSWORD_MIN = 6
