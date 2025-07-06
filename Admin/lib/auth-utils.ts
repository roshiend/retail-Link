import { useRouter } from 'next/navigation'

export const handleAuthError = (error: any, router: any) => {
  if (error?.message?.includes('401') || error?.status === 401) {
    // Clear the token
    localStorage.removeItem('token')
    
    // Show a brief toast message
    // Note: We'll need to import toast here or pass it as a parameter
    
    // Redirect to home page
    router.push('/')
    return true // Indicates this was an auth error
  }
  return false // Not an auth error
}

export const handleApiResponse = async (response: Response, router: any) => {
  if (response.status === 401) {
    // Clear the token
    localStorage.removeItem('token')
    
    // Redirect to home page
    router.push('/')
    return { isAuthError: true }
  }
  
  return { isAuthError: false, response }
} 