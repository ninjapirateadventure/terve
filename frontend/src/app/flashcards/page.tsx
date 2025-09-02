import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function FlashcardsPage() {
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
            Flashcards
          </h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-900 mb-2">
              🚧 Coming Soon in Stage 3
            </h3>
            <p className="text-yellow-800 text-sm">
              The flashcard system will feature smart categorization with four categories:
            </p>
            <ul className="mt-2 text-sm text-yellow-800 space-y-1">
              <li>• <strong>Well Known</strong> - Words you've mastered</li>
              <li>• <strong>Learning</strong> - Words you're currently focusing on (target: 100 words)</li>
              <li>• <strong>TODO</strong> - Words queued for future learning</li>
              <li>• <strong>Not Interested</strong> - Words to exclude from practice</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Planned Features
            </h2>
            
            <div className="grid gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Smart Word Management</h3>
                <p className="text-gray-600 text-sm">
                  Automatic refilling of the Learning category when it drops below 90 words, 
                  adding 10 new words with similar complexity to your recent additions.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Category Switching</h3>
                <p className="text-gray-600 text-sm">
                  Easy movement of words between categories during practice sessions.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Import from Reading</h3>
                <p className="text-gray-600 text-sm">
                  Words discovered during reading comprehension can be added directly to flashcards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
