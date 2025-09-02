import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ConjugationPage() {
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
            Verb Conjugation
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">
              🚧 Coming Soon in Stage 4
            </h3>
            <p className="text-blue-800 text-sm">
              Master Finnish verb conjugations with exercises scaled to your CEFR level.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Planned Features
            </h2>
            
            <div className="grid gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">CEFR-Scaled Difficulty</h3>
                <p className="text-gray-600 text-sm">
                  Exercises adapt to your proficiency level, starting with basic present tense 
                  and progressing to complex conditional and subjunctive forms.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Common Verbs First</h3>
                <p className="text-gray-600 text-sm">
                  Focus on high-frequency verbs like "olla" (to be), "tehdä" (to do), 
                  and "mennä" (to go) before moving to specialized vocabulary.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Multiple Tenses</h3>
                <p className="text-gray-600 text-sm">
                  Practice present, past, perfect, pluperfect, conditional, and imperative forms 
                  with contextual examples.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
