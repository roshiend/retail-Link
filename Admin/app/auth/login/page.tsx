"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { AuthHeader } from "../components/auth-header"
import { api } from "@/lib/api"

interface LoginResponse {
  user: {
    id: number
    email: string
    full_name: string
    shop: {
      id: number
      name: string
    }
  }
  token: string
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await api.login({ email, password })

      if (response.error) {
        setError(response.error)
        return
      }

      if (!response.data?.token || !response.data?.user?.shop?.id) {
        setError("Invalid response from server")
        return
      }

      // Store the token
      localStorage.setItem("token", response.data.token)
      
      // Redirect to shop dashboard
      router.push(`/shop/${response.data.user.shop.id}/dashboard`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AuthHeader activePage="login" />
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <div className="mb-6 text-left">
          <h1 className="text-xl font-semibold text-gray-900">Log in to Retail-Link</h1>
          <p className="mt-1 text-sm text-gray-600">Enter your email and password below</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
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
          </div>
          <div className="flex items-center justify-between text-xs">
            <Label htmlFor="remember-me" className="flex items-center font-normal text-gray-600">
              <Checkbox id="remember-me" className="mr-2 h-3.5 w-3.5" />
              Remember me
            </Label>
            <Link href="/auth/forgot-password" className="font-medium text-primary hover:text-green-700">
              Forgot your password?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-green-700 text-white h-10 text-sm font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-primary hover:text-green-700">
            Sign up
          </Link>
        </p>
      </div>
      <p className="mt-8 text-center text-xs text-gray-500 max-w-sm">
        By continuing, you agree to Retail-Link&apos;s{" "}
        <Link href="/terms" className="text-gray-600 hover:text-gray-800 underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-gray-600 hover:text-gray-800 underline">
          Privacy Policy
        </Link>
        .
      </p>
    </>
  )
}
