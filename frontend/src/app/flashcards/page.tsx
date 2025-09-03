'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react'
import { useAuth } from '@/lib/auth'

interface Word {
  id: string
  finnish: string
  english: string
  phonetic?: string
  cefrLevel: string
  category?: string
}

interface UserFlashcard {
  id: string
  category: 'LEARNING' | 'WELL_KNOWN' | 'TODO' | 'NOT_INTERESTED'
  timesReviewed: number
  timesCorrect: number
  word: Word
}

interface CategoryCounts {
  LEARNING: number
  WELL_KNOWN: number
  TODO: number
  NOT_INTERESTED: number
}

export default function FlashcardsPage() {
  const { user } = useAuth()
  const [currentCard, setCurrentCard] = useState<UserFlashcard | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [counts, setCounts] = useState<CategoryCounts | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('LEARNING')
  const [isPlaying, setIsPlaying] = useState(false)

  const initializeFlashcards = async () => {
    if (!user) return
    
    console.log('Initializing flashcards for user:', user.id)
    
    try {
      const token = localStorage.getItem('terve_token')
      console.log('Token exists:', !!token)
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/flashcards/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      
      console.log('Initialize response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Initialize result:', result)
        setInitialized(true)
        loadCounts()
        loadPracticeCard()
      } else {
        const errorText = await response.text()
        console.error('Initialize failed:', response.status, errorText)
        alert(`Failed to initialize flashcards: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Failed to initialize flashcards:', error)
      alert(`Error initializing flashcards: ${error.message}`)
    }
  }

  const refillLearning = async () => {
    if (!user) return
    
    try {
      const token = localStorage.getItem('terve_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/flashcards/refill-learning`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Refill result:', result)
        alert(`Added ${result.added} new words! Learning category now has ${result.after} words.`)
        loadCounts()
        loadPracticeCard()
      } else {
        const errorText = await response.text()
        console.error('Refill failed:', errorText)
        alert('Failed to refill learning category')
      }
    } catch (error) {
      console.error('Failed to refill learning category:', error)
      alert('Error refilling learning category')
    }
  }

  const loadCounts = async () => {
    if (!user) return
    
    console.log('Loading counts for user:', user.id)
    
    try {
      const token = localStorage.getItem('terve_token')
      console.log('LoadCounts - Token exists:', !!token)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/flashcards/counts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      console.log('Counts response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Counts data:', data)
        setCounts(data)
      } else {
        const errorText = await response.text()
        console.error('Counts failed:', response.status, errorText)
        // Set empty counts so we show the init button
        setCounts({
          LEARNING: 0,
          WELL_KNOWN: 0,
          TODO: 0,
          NOT_INTERESTED: 0
        })
      }
    } catch (error) {
      console.error('Failed to load counts:', error)
      // Set empty counts so we show the init button
      setCounts({
        LEARNING: 0,
        WELL_KNOWN: 0,
        TODO: 0,
        NOT_INTERESTED: 0
      })
    }
  }

  const loadPracticeCard = async (category?: string) => {
    if (!user) return
    
    const categoryToUse = category || selectedCategory
    
    try {
      const token = localStorage.getItem('terve_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/flashcards?category=${categoryToUse}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          // Get a random card from the category
          const randomIndex = Math.floor(Math.random() * data.length)
          setCurrentCard(data[randomIndex])
        } else {
          setCurrentCard(null)
        }
        setShowAnswer(false)
      }
    } catch (error) {
      console.error('Failed to load practice card:', error)
    }
  }

  const moveToCategory = async (category: string) => {
    if (!currentCard) return
    
    try {
      const token = localStorage.getItem('terve_token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/flashcards/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          wordId: currentCard.word.id,
          category: category
        })
      })
      
      // Load next card and update counts
      loadCounts()
      loadPracticeCard()
    } catch (error) {
      console.error('Failed to move card:', error)
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentCard(null) // Clear current card while loading
    loadPracticeCard(category)
  }

  const playPronunciation = (text: string) => {
    if (!text || isPlaying) return
    
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      alert('Audio pronunciation is not supported in your browser')
      return
    }

    setIsPlaying(true)
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Try to use Finnish voice, fallback to default
    const voices = window.speechSynthesis.getVoices()
    const finnishVoice = voices.find(voice => 
      voice.lang.startsWith('fi') || 
      voice.lang.startsWith('fi-FI')
    )
    
    if (finnishVoice) {
      utterance.voice = finnishVoice
    } else {
      // Fallback settings for better Finnish pronunciation
      utterance.lang = 'fi-FI'
    }
    
    utterance.rate = 0.8 // Slightly slower for learning
    utterance.pitch = 1.0
    utterance.volume = 0.8
    
    utterance.onend = () => {
      setIsPlaying(false)
    }
    
    utterance.onerror = () => {
      setIsPlaying(false)
      console.error('Speech synthesis error')
    }
    
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (user) {
      loadCounts().then(() => {
        setLoading(false)
      })
    }
  }, [user])

  useEffect(() => {
    // Load voices for speech synthesis
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices()
      }
      
      // Load voices immediately
      loadVoices()
      
      // Also load when voices change (some browsers load them asynchronously)
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      }
    }
  }, [])

  useEffect(() => {
    if (counts && !initialized && counts.LEARNING === 0) {
      initializeFlashcards()
    } else if (counts && counts.LEARNING > 0) {
      setInitialized(true)
      loadPracticeCard()
    }
  }, [counts])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Please sign in to use flashcards</h1>
          <Link href="/" className="text-blue-600 hover:underline">Go to homepage</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Flashcards 🃏
          </h1>
          
          {/* Category Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Practice Category:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => handleCategoryChange('LEARNING')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'LEARNING'
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                📚 Learning ({counts?.LEARNING || 0})
              </button>
              <button
                onClick={() => handleCategoryChange('WELL_KNOWN')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'WELL_KNOWN'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                ✅ Well Known ({counts?.WELL_KNOWN || 0})
              </button>
              <button
                onClick={() => handleCategoryChange('TODO')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'TODO'
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                }`}
              >
                📋 TODO ({counts?.TODO || 0})
              </button>
              <button
                onClick={() => handleCategoryChange('NOT_INTERESTED')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'NOT_INTERESTED'
                    ? 'bg-red-500 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                ❌ Not Interested ({counts?.NOT_INTERESTED || 0})
              </button>
            </div>
          </div>
          
          {/* Category counts */}
          {counts && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 text-center">
                Currently viewing: <strong className="capitalize">{selectedCategory.toLowerCase().replace('_', ' ')}</strong> 
                {selectedCategory === 'LEARNING' && ' • Click cards to practice!'}
                {selectedCategory === 'WELL_KNOWN' && ' • Review your mastered words'}
                {selectedCategory === 'TODO' && ' • Words for future learning'}
                {selectedCategory === 'NOT_INTERESTED' && ' • Words you\'ve dismissed'}
                <br />
                <span className="text-xs text-gray-500 mt-1 inline-block">
                  🔊 Click the audio button to hear Finnish pronunciation
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Flashcard */}
        {currentCard ? (
          <div className="space-y-6">
            <div 
              className="bg-white border-2 border-gray-200 rounded-xl p-8 min-h-64 flex flex-col justify-center items-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {!showAnswer ? (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {currentCard.word.finnish}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent card flip
                        playPronunciation(currentCard.word.finnish)
                      }}
                      disabled={isPlaying}
                      className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                      title="Play pronunciation"
                    >
                      {isPlaying ? (
                        <VolumeX className="w-6 h-6" />
                      ) : (
                        <Volume2 className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                  {currentCard.word.phonetic && (
                    <div className="text-lg text-gray-500 mb-4">
                      [{currentCard.word.phonetic}]
                    </div>
                  )}
                  <div className="text-sm text-gray-400">
                    Click to reveal answer
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="text-3xl font-bold text-gray-900">
                      {currentCard.word.finnish}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent card flip
                        playPronunciation(currentCard.word.finnish)
                      }}
                      disabled={isPlaying}
                      className="ml-3 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                      title="Play pronunciation"
                    >
                      {isPlaying ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {currentCard.word.phonetic && (
                    <div className="text-lg text-gray-500 mb-4">
                      [{currentCard.word.phonetic}]
                    </div>
                  )}
                  <div className="text-2xl text-blue-600 font-semibold">
                    {currentCard.word.english}
                  </div>
                  {currentCard.word.category && (
                    <div className="text-sm text-gray-500 mt-2">
                      Category: {currentCard.word.category}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            {showAnswer && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => moveToCategory('WELL_KNOWN')}
                    className="bg-green-500 text-white py-4 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center"
                  >
                    <span className="mr-2">✅</span>
                    Well Known
                  </button>
                  <button
                    onClick={() => moveToCategory('LEARNING')}
                    className="bg-blue-500 text-white py-4 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center"
                  >
                    <span className="mr-2">📚</span>
                    Keep Learning
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => moveToCategory('TODO')}
                    className="bg-orange-500 text-white py-4 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center"
                  >
                    <span className="mr-2">📋</span>
                    TODO Later
                  </button>
                  <button
                    onClick={() => moveToCategory('NOT_INTERESTED')}
                    className="bg-red-500 text-white py-4 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center"
                  >
                    <span className="mr-2">❌</span>
                    Not Interested
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {counts && counts[selectedCategory as keyof CategoryCounts] === 0 ? (
                <>No words in {selectedCategory.toLowerCase().replace('_', ' ')} category</>
              ) : counts?.LEARNING === 0 ? (
                'Initializing your flashcards...'
              ) : (
                `No cards available in ${selectedCategory.toLowerCase().replace('_', ' ')} category`
              )}
            </div>
            
            {/* Always show initialize button if no cards */}
            {(!currentCard && (!counts || (counts.LEARNING === 0 && counts.WELL_KNOWN === 0 && counts.TODO === 0 && counts.NOT_INTERESTED === 0))) && (
              <div className="space-y-3">
                <button
                  onClick={initializeFlashcards}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  🎯 Initialize Flashcards
                </button>
                <p className="text-sm text-gray-500">
                  Click to create your first flashcards from Finnish vocabulary
                </p>
              </div>
            )}
            
            {selectedCategory === 'LEARNING' && counts?.LEARNING === 0 && counts && (counts.WELL_KNOWN > 0 || counts.TODO > 0 || counts.NOT_INTERESTED > 0) && (
              <button
                onClick={initializeFlashcards}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mr-3"
              >
                Initialize Flashcards
              </button>
            )}
            {selectedCategory === 'LEARNING' && counts && counts.LEARNING > 0 && counts.LEARNING < 90 && (
              <button
                onClick={refillLearning}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Refill Learning to 100 Words
              </button>
            )}
            {selectedCategory !== 'LEARNING' && counts && counts[selectedCategory as keyof CategoryCounts] === 0 && (
              <p className="text-sm text-gray-400 mt-2">
                Move some words to this category to practice them here!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
