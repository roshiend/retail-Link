"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { AuthHeader } from "../components/auth-header"
import { type PasswordStrengthResult, checkPasswordStrength } from "@/lib/password-strength"
import { api } from "@/lib/api"

interface SignupResponse {
  user: {
    id: number
    email: string
    full_name: string
    shop: {
      id: number
    }
  }
  token: string
}

interface ApiResponse<T> {
  data?: T
  error?: string
}

const initialPasswordStrength: PasswordStrengthResult = {
  score: 0,
  level: "Too Short",
  criteria: {
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  },
}

export default function SignupPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult>(initialPasswordStrength)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const strength = checkPasswordStrength(password)
    setPasswordStrength(strength)
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword)
    } else {
      setPasswordsMatch(true)
    }
  }, [password, confirmPassword])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      password_confirmation: formData.get("confirm-password") as string,
      full_name: formData.get("full-name") as string,
      store_name: formData.get("store-name") as string,
    }

    try {
      const response = await api.signup(data) as ApiResponse<SignupResponse>

      if (response.error) {
        setError(response.error)
        return
      }

      if (!response.data) {
        setError("No data received from server")
        return
      }

      const { user, token } = response.data

      if (!user || !token) {
        setError("Invalid response format from server")
        return
      }

      // Store the token
      localStorage.setItem("token", token)

      // Redirect to shop dashboard
      if (user.shop?.id) {
        router.push(`/shop/${user.shop.id}/dashboard`)
      } else {
        setError("Shop information not found in response")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getStrengthLevelTextColor = (level: PasswordStrengthResult["level"]) => {
    if (level === "Very Strong") return "text-green-600"
    if (level === "Strong") return "text-green-500"
    if (level === "Medium") return "text-yellow-500"
    if (level === "Weak") return "text-orange-500"
    return "text-red-500"
  }

  const getStrengthBarColor = (level: PasswordStrengthResult["level"]) => {
    if (level === "Very Strong") return "bg-green-600"
    if (level === "Strong") return "bg-green-500"
    if (level === "Medium") return "bg-yellow-500"
    if (level === "Weak") return "bg-orange-500"
    return "bg-red-500"
  }

  const progressPercentage = password.length > 0 ? (passwordStrength.score / 5) * 100 : 0

  return (
    <>
      <AuthHeader activePage="signup" />
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <div className="mb-6 text-left">
          <h1 className="text-xl font-semibold text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-600">Start your 14-day free trial</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <div>
            <Label htmlFor="full-name" className="text-xs font-medium text-gray-700">
              Full name
            </Label>
            <Input
              id="full-name"
              name="full-name"
              type="text"
              placeholder="Enter your full name"
              required
              className="mt-1 h-10"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-xs font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              className="mt-1 h-10"
            />
          </div>
          <div>
            <Label htmlFor="store-name" className="text-xs font-medium text-gray-700">
              Store name
            </Label>
            <Input
              id="store-name"
              name="store-name"
              type="text"
              placeholder="Enter your store name"
              required
              className="mt-1 h-10"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Password strength:</span>
                  <span className={`text-xs font-medium ${getStrengthLevelTextColor(passwordStrength.level)}`}>
                    {passwordStrength.level}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ease-in-out ${getStrengthBarColor(passwordStrength.level)}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm-password" className="text-xs font-medium text-gray-700">
              Confirm password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`h-10 pr-10 ${!passwordsMatch && confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!passwordsMatch && confirmPassword && <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>}
          </div>

          <div className="pt-1">
            <div className="flex items-start space-x-2">
              <Checkbox id="terms" required className="mt-0.5 h-3.5 w-3.5" />
              <Label htmlFor="terms" className="text-xs font-normal text-gray-600 leading-snug">
                I agree to the Retail-Link{" "}
                <Link href="/terms" className="font-medium text-primary hover:text-green-700 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-primary hover:text-green-700 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-green-700 text-white h-10 text-sm font-semibold"
            disabled={isLoading || passwordStrength.score < 3 || !passwordsMatch || !password || !confirmPassword}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
      <p className="mt-8 text-center text-xs text-gray-600">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:text-green-700">
          Log in
        </Link>
      </p>
    </>
  )
}
