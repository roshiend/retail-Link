import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to signup page by default for this example
  redirect("/auth/signup")
  return null
}
