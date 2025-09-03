'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import Header from '@/components/Header'
import SimpleLogin from '@/components/SimpleLogin'

export default function HomePage() {
  const { user, loading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terve! 👋
          </h1>
          {user ? (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Welcome back, {user.name}! Ready to continue your Finnish learning journey?
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Learn Finnish with personalized lessons, smart flashcards, and AI-generated stories.
              </p>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Learning Modules - Show only if authenticated */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Link
              href="/flashcards"
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 p-3 rounded-lg mr-4">
                  <span className="text-white text-xl">🃏</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Flashcards
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Practice vocabulary with smart categorization
              </p>
            </Link>

            <Link
              href="/conjugation"
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="bg-green-500 p-3 rounded-lg mr-4">
                  <span className="text-white text-xl">🌱</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Verb Conjugation
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Master Finnish verb forms and tenses
              </p>
            </Link>

            <Link
              href="/declension"
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="bg-purple-500 p-3 rounded-lg mr-4">
                  <span className="text-white text-xl">📚</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Noun Declension
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Learn Finnish noun cases and endings
              </p>
            </Link>

            <Link
              href="/test"
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-500 p-3 rounded-lg mr-4">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Skill Tests
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Test specific skills with focused practice
              </p>
            </Link>

            <Link
              href="/reading"
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="bg-orange-500 p-3 rounded-lg mr-4">
                  <span className="text-white text-xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Reading Comprehension
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Read stories tailored to your level
              </p>
            </Link>

            <Link
              href="/exam"
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="bg-red-500 p-3 rounded-lg mr-4">
                  <span className="text-white text-xl">🎓</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  CEFR Mock Exam
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Test your proficiency level
              </p>
            </Link>
          </div>
        )}

        {/* Features for non-authenticated users */}
        {!user && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              What You'll Learn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🃏</div>
                <h3 className="text-xl font-semibold mb-2">Smart Flashcards</h3>
                <p className="text-gray-600">
                  AI-powered vocabulary practice with adaptive learning
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold mb-2">Grammar Practice</h3>
                <p className="text-gray-600">
                  Master Finnish conjugations and noun declensions
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">Skill Tests</h3>
                <p className="text-gray-600">
                  Test your knowledge with focused practice tests
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">Reading Stories</h3>
                <p className="text-gray-600">
                  AI-generated stories tailored to your level and interests
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold mb-2">CEFR Testing</h3>
                <p className="text-gray-600">
                  Track your progress with standardized proficiency tests
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Development Notice */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Stage 2 Complete: Simple Authentication ✅
            </h3>
            <p className="text-blue-700 text-sm">
              Simple email-based authentication is now working! 
              {user ? 'You are signed in and ready for the next stages.' : 'Sign in with any name and email to access the learning modules.'}
            </p>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && !user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Get Started with Terve</h2>
              <button
                onClick={() => setShowLogin(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <SimpleLogin
                onSuccess={() => {
                  setShowLogin(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
