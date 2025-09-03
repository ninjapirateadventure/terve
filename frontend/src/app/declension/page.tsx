'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Book, Play, Target, RotateCcw, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface NounDeclension {
  noun: string;
  declensionType: number;
  stem: string;
  declensions: Record<string, string>;
  translation?: string;
  examples?: string[];
}

interface DeclensionExercise {
  id: string;
  noun: string;
  case: number;
  expectedAnswer: string;
  options?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  cefrLevel: string;
}

interface ExerciseResult {
  exerciseId: string;
  userAnswer: string;
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
}

interface CaseDescriptions {
  [key: string]: {
    english: string;
    finnish: string;
    description: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function DeclensionPage() {
  const [mode, setMode] = useState<'learn' | 'practice'>('learn');
  const [currentNoun, setCurrentNoun] = useState('');
  const [selectedCase, setSelectedCase] = useState('');
  const [declensionResult, setDeclensionResult] = useState<NounDeclension | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Exercise state
  const [currentExercise, setCurrentExercise] = useState<DeclensionExercise | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [exerciseResult, setExerciseResult] = useState<ExerciseResult | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  // Info state
  const [caseDescriptions, setCaseDescriptions] = useState<CaseDescriptions | null>(null);

  useEffect(() => {
    fetchCaseDescriptions();
  }, []);

  const fetchCaseDescriptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/declension/cases`);
      if (response.ok) {
        const data = await response.json();
        setCaseDescriptions(data);
      }
    } catch (err) {
      console.error('Error fetching case descriptions:', err);
    }
  };

  const handleDeclineNoun = async () => {
    if (!currentNoun.trim()) {
      setError('Please enter a noun');
      return;
    }

    await declineSpecificNoun(currentNoun);
  };

  const declineSpecificNoun = async (noun: string) => {
    setLoading(true);
    setError('');
    setDeclensionResult(null);

    try {
      let url = `${API_BASE_URL}/api/declension/decline/${encodeURIComponent(noun)}`;
      if (selectedCase) {
        url += `?case=${selectedCase}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDeclensionResult(data);
      } else {
        setError('Failed to decline noun. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const generateExercise = async () => {
    setLoading(true);
    setError('');
    setExerciseResult(null);
    setUserAnswer('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/declension/exercise?cefrLevel=${selectedLevel}&difficulty=${selectedDifficulty}`
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentExercise(data);
      } else {
        setError('Failed to generate exercise. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const checkExerciseAnswer = async () => {
    if (!currentExercise || !userAnswer.trim()) {
      setError('Please provide an answer');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/declension/exercise/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercise: currentExercise,
          userAnswer: userAnswer.trim(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setExerciseResult(result);
      } else {
        setError('Failed to check answer. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finnish Noun Declension
          </h1>
          <p className="text-gray-600">
            Learn Finnish noun cases with interactive exercises and comprehensive declension tables.
          </p>
        </div>

        <div className="mb-8">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setMode('learn')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === 'learn'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Book className="w-4 h-4 inline mr-2" />
              Learn
            </button>
            <button
              onClick={() => setMode('practice')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === 'practice'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Play className="w-4 h-4 inline mr-2" />
              Practice
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {mode === 'learn' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Decline a Noun
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Noun (nominative)
                  </label>
                  <input
                    type="text"
                    value={currentNoun}
                    onChange={(e) => setCurrentNoun(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDeclineNoun()}
                    placeholder="e.g., talo, katu, käsi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case (optional - leave empty for all cases)
                  </label>
                  <select
                    value={selectedCase}
                    onChange={(e) => setSelectedCase(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All cases</option>
                    <option value="1">Nominative</option>
                    <option value="2">Genitive</option>
                    <option value="3">Partitive</option>
                    <option value="5">Inessive</option>
                    <option value="6">Elative</option>
                    <option value="7">Illative</option>
                    <option value="8">Adessive</option>
                    <option value="9">Ablative</option>
                    <option value="10">Allative</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleDeclineNoun}
                disabled={loading || !currentNoun.trim()}
                className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Declining...' : 'Decline Noun'}
              </button>
            </div>

            {declensionResult && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {declensionResult.noun}
                    {declensionResult.translation && (
                      <span className="text-gray-600 font-normal"> - {declensionResult.translation}</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Type {declensionResult.declensionType} • Stem: {declensionResult.stem}
                  </p>
                </div>

                <div className="space-y-3">
                  {Object.entries(declensionResult.declensions).map(([caseKey, caseForm]) => {
                    const caseInfo = caseDescriptions?.[caseKey];
                    
                    return (
                      <div key={caseKey} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium text-gray-900">
                            {caseInfo?.english || caseKey}
                          </span>
                          {caseInfo && (
                            <span className="text-xs text-gray-500 ml-2">({caseInfo.description})</span>
                          )}
                        </div>
                        <span className="font-medium text-blue-600">
                          {caseForm}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {declensionResult.examples && declensionResult.examples.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                    <ul className="space-y-1">
                      {declensionResult.examples.slice(0, 3).map((example, index) => (
                        <li key={index} className="text-gray-600 text-sm italic">
                          "{example}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-medium text-blue-900 mb-3">Try these common nouns:</h3>
              <div className="flex flex-wrap gap-2">
                {['talo', 'katu', 'auto', 'käsi', 'lintu', 'nainen', 'mies', 'vesi'].map((noun) => (
                  <button
                    key={noun}
                    onClick={() => {
                      setCurrentNoun(noun);
                      setError('');
                      declineSpecificNoun(noun);
                    }}
                    className="px-3 py-1 bg-white text-blue-700 rounded border border-blue-200 hover:bg-blue-100 text-sm"
                  >
                    {noun}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Practice Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEFR Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="A1">A1 (Beginner)</option>
                    <option value="A2">A2 (Elementary)</option>
                    <option value="B1">B1 (Intermediate)</option>
                    <option value="B2">B2 (Upper Intermediate)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Easy (Multiple choice)</option>
                    <option value="medium">Medium (Multiple choice)</option>
                    <option value="hard">Hard (Text input)</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={generateExercise}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Start Exercise'}
              </button>
            </div>

            {currentExercise && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Exercise</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      currentExercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      currentExercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {currentExercise.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-600">
                    Decline <strong>{currentExercise.noun}</strong> to case #{currentExercise.case}
                  </p>
                </div>

                {currentExercise.options ? (
                  <div className="space-y-3">
                    {currentExercise.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setUserAnswer(option)}
                        className="w-full p-3 text-left rounded-lg border bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && checkExerciseAnswer()}
                      placeholder="Type your answer..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    <button
                      onClick={checkExerciseAnswer}
                      disabled={loading || !userAnswer.trim()}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Check Answer
                    </button>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={generateExercise}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    New Exercise
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
