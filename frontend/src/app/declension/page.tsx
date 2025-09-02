import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function DeclensionPage() {
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
            Noun Declension
          </h1>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-purple-900 mb-2">
              🚧 Coming Soon in Stage 4
            </h3>
            <p className="text-purple-800 text-sm">
              Learn Finnish noun cases with progressive difficulty based on your CEFR level.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Finnish Cases to Master
            </h2>
            
            <div className="grid gap-3">
              {[
                { case: 'Nominatiivi', use: 'Subject form', example: 'kissa (cat)' },
                { case: 'Genetiivi', use: 'Possession, object', example: 'kissan (cat\'s)' },
                { case: 'Partitiivi', use: 'Partial object', example: 'kissaa (cat, partial)' },
                { case: 'Akkusatiivi', use: 'Total object', example: 'kissan (cat, total)' },
                { case: 'Inessiivi', use: 'In something', example: 'kissassa (in the cat)' },
                { case: 'Elatiivi', use: 'Out of something', example: 'kissasta (out of the cat)' },
                { case: 'Illatiivi', use: 'Into something', example: 'kissaan (into the cat)' },
              ].map((item) => (
                <div key={item.case} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.case}</h3>
                      <p className="text-gray-600 text-sm">{item.use}</p>
                    </div>
                    <code className="text-sm bg-white px-2 py-1 rounded">
                      {item.example}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
