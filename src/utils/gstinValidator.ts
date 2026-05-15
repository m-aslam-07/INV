const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;

export function validateGSTIN(gstin: string): { valid: boolean; error?: string } {
  if (!gstin) return { valid: true };
  const trimmed = gstin.trim().toUpperCase();
  if (trimmed.length === 0) return { valid: true };
  if (trimmed.length !== 15) {
    return { valid: false, error: 'GSTIN must be 15 characters' };
  }
  if (!GSTIN_REGEX.test(trimmed)) {
    return { valid: false, error: 'Invalid GSTIN format' };
  }
  return { valid: true };
}
