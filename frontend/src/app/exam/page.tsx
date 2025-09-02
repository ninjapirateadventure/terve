import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ExamPage() {
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
            CEFR Mock Exam
          </h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-red-900 mb-2">
              🚧 Coming Soon in Stage 6
            </h3>
            <p className="text-red-800 text-sm">
              Test your Finnish proficiency with standardized CEFR-based assessments.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              CEFR Levels
            </h2>
            
            <div className="grid gap-3">
              {[
                { level: 'A1', name: 'Beginner', desc: 'Basic phrases and simple sentences' },
                { level: 'A2', name: 'Elementary', desc: 'Simple conversations on familiar topics' },
                { level: 'B1', name: 'Intermediate', desc: 'Handle most travel situations' },
                { level: 'B2', name: 'Upper Intermediate', desc: 'Complex texts and abstract topics' },
                { level: 'C1', name: 'Advanced', desc: 'Fluent and spontaneous expression' },
                { level: 'C2', name: 'Proficient', desc: 'Near-native understanding and expression' },
              ].map((level) => (
                <div key={level.level} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-3">
                          {level.level}
                        </span>
                        <h3 className="font-medium text-gray-900">{level.name}</h3>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{level.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Planned Features
              </h2>
              
              <div className="grid gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Comprehensive Testing</h3>
                  <p className="text-gray-600 text-sm">
                    Tests covering reading, listening, grammar, and vocabulary 
                    with standardized CEFR scoring.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Progress Tracking</h3>
                  <p className="text-gray-600 text-sm">
                    Track your improvement over time with detailed score history 
                    and performance analytics.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Placement Testing</h3>
                  <p className="text-gray-600 text-sm">
                    Initial assessment to determine your starting level and 
                    personalize your learning experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
