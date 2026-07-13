/**
 * Shared validation utilities — reused across ALL sections.
 * Promoted from src/sections/03-master-data/utils/helpers.ts
 */

export function validateGSTIN(value: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)
}

export function validatePAN(value: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)
}

export function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function validatePhone(value: string): boolean {
  return /^[+]?[0-9]{10,15}$/.test(value.replace(/[\s-]/g, ''))
}

export function validatePincode(value: string): boolean {
  return /^[0-9]{6}$/.test(value)
}

// Regex constants for direct use in zod schemas or pattern attributes
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
export const PINCODE_REGEX = /^[0-9]{6}$/
export const PHONE_REGEX = /^[+]?[0-9]{10,15}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
