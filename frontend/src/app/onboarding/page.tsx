'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const cefrLevels = [
  { level: 'A1', name: 'Beginner', desc: 'Basic phrases and simple sentences' },
  { level: 'A2', name: 'Elementary', desc: 'Simple conversations on familiar topics' },
  { level: 'B1', name: 'Intermediate', desc: 'Handle most travel situations' },
  { level: 'B2', name: 'Upper Intermediate', desc: 'Complex texts and abstract topics' },
  { level: 'C1', name: 'Advanced', desc: 'Fluent and spontaneous expression' },
  { level: 'C2', name: 'Proficient', desc: 'Near-native understanding and expression' },
]

export default function OnboardingPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>('A1')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    setLoading(true)
    
    try {
      const token = localStorage.getItem('terve_token')
      const userdata = localStorage.getItem('terve_user')
      
      if (!token || !userdata) {
        router.push('/')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          cefrLevel: selectedLevel,
          hasCompletedOnboarding: true,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        localStorage.setItem('terve_user', JSON.stringify(updatedUser))
        router.push('/')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Onboarding error:', error)
      alert('There was an error completing your setup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Terve! 🇫🇮
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Let's set up your learning profile to get started
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              What's your current Finnish level?
            </h3>
            <div className="space-y-3">
              {cefrLevels.map((level) => (
                <button
                  key={level.level}
                  onClick={() => setSelectedLevel(level.level)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedLevel === level.level
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-3">
                          {level.level}
                        </span>
                        <span className="font-medium text-gray-900">{level.name}</span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{level.desc}</p>
                    </div>
                    {selectedLevel === level.level && (
                      <div className="text-blue-500">
                        <span className="text-xl">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting up...
                </div>
              ) : (
                'Complete Setup'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Don't worry, you can change your level anytime in your profile settings
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
