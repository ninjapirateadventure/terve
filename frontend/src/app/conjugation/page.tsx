'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Book, Play, Target, RotateCcw, CheckCircle, XCircle, Lightbulb, Library } from 'lucide-react';
import VerbLibrary from '../../components/conjugation/VerbLibrary';

interface VerbConjugation {
  verb: string;
  verbType: number;
  stem: string;
  conjugations: Record<string, string>;
  translation?: string;
  examples?: string[];
}

interface ConjugationExercise {
  id: string;
  verb: string;
  person: number;
  tense: number;
  voice: number;
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

interface ConjugationTypes {
  verbTypes: Record<string, string>;
  tenses: Record<string, string>;
  voices: Record<string, string>;
  persons: Record<string, string>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ConjugationPage() {
  const [mode, setMode] = useState<'learn' | 'practice'>('learn');
  const [currentVerb, setCurrentVerb] = useState('');
  const [selectedTense, setSelectedTense] = useState(1); // Present
  const [selectedVoice, setSelectedVoice] = useState(1); // Active
  const [conjugationResult, setConjugationResult] = useState<VerbConjugation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Exercise state
  const [currentExercise, setCurrentExercise] = useState<ConjugationExercise | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [exerciseResult, setExerciseResult] = useState<ExerciseResult | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  // Info state
  const [conjugationTypes, setConjugationTypes] = useState<ConjugationTypes | null>(null);

  useEffect(() => {
    fetchConjugationTypes();
  }, []);

  const fetchConjugationTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conjugation/types`);
      if (response.ok) {
        const data = await response.json();
        setConjugationTypes(data);
      }
    } catch (err) {
      console.error('Error fetching conjugation types:', err);
    }
  };

  const handleConjugateVerb = async () => {
    if (!currentVerb.trim()) {
      setError('Please enter a verb');
      return;
    }

    await conjugateSpecificVerb(currentVerb);
  };

  const conjugateSpecificVerb = async (verb: string) => {
    if (!verb.trim()) {
      setError('Please enter a verb');
      return;
    }

    setLoading(true);
    setError('');
    setConjugationResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/conjugation/conjugate/${encodeURIComponent(verb)}?tense=${selectedTense}&voice=${selectedVoice}`
      );

      if (response.ok) {
        const data = await response.json();
        setConjugationResult(data);
      } else {
        setError('Failed to conjugate verb. Please try again.');
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
        `${API_BASE_URL}/api/conjugation/exercise?cefrLevel=${selectedLevel}&difficulty=${selectedDifficulty}`
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
      const response = await fetch(`${API_BASE_URL}/api/conjugation/exercise/check`, {
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

  const handleMultipleChoiceAnswer = (answer: string) => {
    setUserAnswer(answer);
    setTimeout(() => {
      const tempExercise = currentExercise;
      if (tempExercise) {
        fetch(`${API_BASE_URL}/api/conjugation/exercise/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exercise: tempExercise,
            userAnswer: answer.trim(),
          }),
        })
        .then(response => response.json())
        .then(result => setExerciseResult(result))
        .catch(() => setError('Failed to check answer'));
      }
    }, 100);
  };

  const renderConjugationTable = () => {
    if (!conjugationResult) return null;

    const personLabels = [
      'minä (I)',
      'sinä (you, sg.)',
      'hän (he/she)',
      'me (we)',
      'te (you, pl.)',
      'he (they)'
    ];

    const personKeys = ['1s', '2s', '3s', '1p', '2p', '3p'];

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {conjugationResult.verb}
            {conjugationResult.translation && (
              <span className="text-gray-600 font-normal"> - {conjugationResult.translation}</span>
            )}
          </h3>
          <p className="text-sm text-gray-600">
            Type {conjugationResult.verbType} • Stem: {conjugationResult.stem}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedVoice === 1 ? (
            // Active voice conjugations
            personKeys.map((key, index) => (
              <div key={key} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <span className="text-gray-700">{personLabels[index]}:</span>
                <span className="font-medium text-blue-600">
                  {conjugationResult.conjugations[key]}
                </span>
              </div>
            ))
          ) : (
            // Passive voice
            <div className="col-span-2">
              <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <span className="text-gray-700">Passive:</span>
                <span className="font-medium text-blue-600">
                  {conjugationResult.conjugations.passive}
                </span>
              </div>
            </div>
          )}
        </div>

        {conjugationResult.examples && conjugationResult.examples.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
            <ul className="space-y-1">
              {conjugationResult.examples.slice(0, 3).map((example, index) => (
                <li key={index} className="text-gray-600 text-sm italic">
                  "{example}"
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderExercise = () => {
    if (!currentExercise) return null;

    const personLabels = ['minä', 'sinä', 'hän', 'me', 'te', 'he'];
    const tenseLabels = conjugationTypes?.tenses || {};
    const voiceLabels = conjugationTypes?.voices || {};

    const personLabel = personLabels[currentExercise.person - 1];
    const tenseLabel = tenseLabels[currentExercise.tense.toString()];
    const voiceLabel = voiceLabels[currentExercise.voice.toString()];

    return (
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
            Conjugate <strong>{currentExercise.verb}</strong> for{' '}
            <strong>{personLabel}</strong> in <strong>{tenseLabel?.toLowerCase()}</strong>{' '}
            ({voiceLabel?.toLowerCase()})
          </p>
        </div>

        {currentExercise.options ? (
          // Multiple choice
          <div className="space-y-3">
            {currentExercise.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleMultipleChoiceAnswer(option)}
                disabled={!!exerciseResult}
                className={`w-full p-3 text-left rounded-lg border transition-colors ${
                  exerciseResult
                    ? option === currentExercise.expectedAnswer
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : option === userAnswer && !exerciseResult.correct
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                    : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          // Text input
          <div className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkExerciseAnswer()}
              placeholder="Type your answer..."
              disabled={!!exerciseResult}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {!exerciseResult && (
              <button
                onClick={checkExerciseAnswer}
                disabled={loading || !userAnswer.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check Answer
              </button>
            )}
          </div>
        )}

        {exerciseResult && (
          <div className={`mt-6 p-4 rounded-lg ${
            exerciseResult.correct 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {exerciseResult.correct ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">Incorrect</span>
                </>
              )}
            </div>
            
            {!exerciseResult.correct && (
              <p className="text-gray-700 text-sm mb-2">
                Correct answer: <strong>{exerciseResult.correctAnswer}</strong>
              </p>
            )}
            
            {exerciseResult.explanation && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 rounded">
                <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-blue-800 text-sm">{exerciseResult.explanation}</p>
              </div>
            )}
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
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finnish Verb Conjugation
          </h1>
          <p className="text-gray-600">
            Master Finnish verb conjugations with interactive exercises and comprehensive conjugation tables.
          </p>
        </div>

        {/* Mode Selector */}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Verb Input and Controls */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Conjugate a Verb
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verb (infinitive)
                    </label>
                    <input
                      type="text"
                      value={currentVerb}
                      onChange={(e) => setCurrentVerb(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleConjugateVerb()}
                      placeholder="e.g., olla, sanoa, tehdä"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tense
                    </label>
                    <select
                      value={selectedTense}
                      onChange={(e) => setSelectedTense(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>Present</option>
                      <option value={2}>Past (Imperfect)</option>
                      <option value={5}>Conditional</option>
                      <option value={7}>Imperative</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voice
                    </label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>Active</option>
                      <option value={2}>Passive</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={handleConjugateVerb}
                  disabled={loading || !currentVerb.trim()}
                  className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Conjugating...' : 'Conjugate Verb'}
                </button>
              </div>

              {/* Conjugation Results */}
              {renderConjugationTable()}

              {/* Quick Examples */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-medium text-blue-900 mb-3">Try these common verbs:</h3>
                <div className="flex flex-wrap gap-2">
                  {['olla', 'sanoa', 'tehdä', 'mennä', 'tulla', 'antaa', 'ottaa', 'nähdä'].map((verb) => (
                    <button
                      key={verb}
                      onClick={() => {
                        setCurrentVerb(verb);
                        setError('');
                        // Use the verb directly instead of relying on state update
                        conjugateSpecificVerb(verb);
                      }}
                      className="px-3 py-1 bg-white text-blue-700 rounded border border-blue-200 hover:bg-blue-100 text-sm"
                    >
                      {verb}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar with Verb Library */}
            <div className="lg:col-span-1">
              <VerbLibrary 
                onVerbSelect={(verb) => {
                  setCurrentVerb(verb);
                  conjugateSpecificVerb(verb);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Exercise Settings */}
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

            {/* Current Exercise */}
            {renderExercise()}
          </div>
        )}
      </div>
    </div>
  );
}
