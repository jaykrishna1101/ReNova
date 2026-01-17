export const VALID_BUYER_PASSKEYS = [
  "1234567890",
  "9876543210",
  "5555555555",
  "1111111111",
  "9999999999",
] as const

export function isValidPasskey(passkey: string): boolean {
  if (!/^\d{10}$/.test(passkey)) {
    return false
  }
  return VALID_BUYER_PASSKEYS.includes(passkey as any)
}

export function getValidPasskeys(): readonly string[] {
  return VALID_BUYER_PASSKEYS
}
