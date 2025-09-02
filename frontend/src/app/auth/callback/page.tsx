'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const userParam = searchParams.get('user')

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        
        // Store authentication data
        localStorage.setItem('terve_token', token)
        localStorage.setItem('terve_user', JSON.stringify(user))
        
        // Redirect based on onboarding status
        if (user.hasCompletedOnboarding) {
          router.push('/')
        } else {
          router.push('/onboarding')
        }
      } catch (error) {
        console.error('Error processing authentication:', error)
        router.push('/auth/error')
      }
    } else {
      router.push('/auth/error')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing your login...</p>
      </div>
    </div>
  )
}
