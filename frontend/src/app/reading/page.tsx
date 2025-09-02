import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ReadingPage() {
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
        
        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Reading Comprehension
          </h1>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-orange-900 mb-2">
              🚧 Coming Soon in Stage 5
            </h3>
            <p className="text-orange-800 text-sm">
              Practice with AI-generated stories tailored to your level and interests.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              How It Will Work
            </h2>
            
            <div className="grid gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Customizable Stories</h3>
                <p className="text-gray-600 text-sm">
                  Set your desired story length and provide up to 3 keywords. 
                  Claude AI will generate stories matching your CEFR level and interests.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Vocabulary Integration</h3>
                <p className="text-gray-600 text-sm">
                  Click on unknown words to add them directly to your flashcard categories 
                  for focused learning.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Level Progression</h3>
                <p className="text-gray-600 text-sm">
                  Stories adapt to your CEFR level, from simple A1 narratives to 
                  complex C2 literary texts.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Example Story Prompt</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Level:</strong> B1 Intermediate</p>
                <p><strong>Length:</strong> 200 words</p>
                <p><strong>Keywords:</strong> kissa, sieni, metsä</p>
                <p><strong>Result:</strong> A story about a cat finding mushrooms in the forest, 
                using B1-level vocabulary and grammar structures.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
