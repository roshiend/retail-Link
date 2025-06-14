export interface PasswordStrengthResult {
  score: number // 0-4 or 0-5 based on criteria
  level: "Too Short" | "Weak" | "Medium" | "Strong" | "Very Strong"
  criteria: {
    minLength: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    specialChar: boolean
  }
}

const MIN_LENGTH = 8

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const criteria = {
    minLength: password.length >= MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password),
  }

  let score = 0
  if (criteria.minLength) score++
  if (criteria.uppercase) score++
  if (criteria.lowercase) score++
  if (criteria.number) score++
  if (criteria.specialChar) score++

  let level: PasswordStrengthResult["level"]

  if (password.length > 0 && !criteria.minLength) {
    level = "Too Short"
  } else if (score <= 2) {
    level = "Weak"
  } else if (score === 3) {
    level = "Medium"
  } else if (score === 4) {
    level = "Strong"
  } else {
    level = "Very Strong"
  }

  if (password.length === 0) {
    level = "Too Short" // Or some initial state
    score = 0
    Object.keys(criteria).forEach((key) => (criteria[key as keyof typeof criteria] = false))
  }

  return { score, level, criteria }
}
