'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Target, BookOpen, CheckCircle, XCircle, RotateCcw, Play } from 'lucide-react';

interface TestQuestion {
  id: string;
  type: 'multiple_choice' | 'text_input' | 'drag_drop';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  skill: string;
  cefrLevel: string;
}

interface TestResult {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  points: number;
  timeTaken?: number;
}

interface TestSession {
  id: string;
  testType: string;
  cefrLevel: string;
  questions: TestQuestion[];
  results: TestResult[];
  startTime: string;
  endTime?: string;
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  passed: boolean;
}

interface TestType {
  type: string;
  name: string;
  description: string;
  estimatedTime: string;
  skills: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function TestPage() {
  const [currentTest, setCurrentTest] = useState<TestSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // Test setup state
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [selectedTestType, setSelectedTestType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(() => {
    fetchAvailableTestTypes();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentTest && timeLeft !== null && timeLeft > 0 && !showResults) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleCompleteTest();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, currentTest, showResults]);

  const fetchAvailableTestTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tests/types/available`);
      if (response.ok) {
        const data = await response.json();
        setTestTypes(data.testTypes);
        if (data.testTypes.length > 0) {
          setSelectedTestType(data.testTypes[0].type);
        }
      }
    } catch (err) {
      console.error('Error fetching test types:', err);
    }
  };

  const startTest = async () => {
    if (!selectedTestType) {
      setError('Please select a test type');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType: selectedTestType,
          cefrLevel: selectedLevel,
          questionCount: questionCount,
          difficulty: selectedDifficulty,
          timeLimitMinutes: 30 // Set a 30-minute time limit
        }),
      });

      if (response.ok) {
        const test = await response.json();
        setCurrentTest(test);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setShowResults(false);
        setTimeLeft(30 * 60); // 30 minutes in seconds
      } else {
        setError('Failed to create test. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionId: string, answer: string) => {
    if (!currentTest) return;

    try {
      const startTime = Date.now();
      await fetch(`${API_BASE_URL}/api/tests/${currentTest.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          userAnswer: answer,
          timeTaken: Math.floor((Date.now() - startTime) / 1000)
        }),
      });

      setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    submitAnswer(questionId, answer);
  };

  const goToNextQuestion = () => {
    if (currentTest && currentQuestionIndex < currentTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleCompleteTest = async () => {
    if (!currentTest) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tests/${currentTest.id}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        const completedTest = await response.json();
        setCurrentTest(completedTest);
        setShowResults(true);
      } else {
        setError('Failed to complete test. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTest = () => {
    setCurrentTest(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setTimeLeft(null);
    setError('');
  };

  if (showResults && currentTest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                currentTest.passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {currentTest.passed ? (
                  <CheckCircle className="w-10 h-10 text-green-600" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-600" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Test {currentTest.passed ? 'Passed!' : 'Not Passed'}
              </h1>
              <p className="text-gray-600">
                {currentTest.passed 
                  ? 'Congratulations! You have successfully completed the test.'
                  : 'Keep practicing! You can retake the test to improve your score.'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {currentTest.percentageScore}%
                </div>
                <div className="text-sm text-gray-600">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {currentTest.totalScore}/{currentTest.maxScore}
                </div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600 mb-1">
                  {currentTest.questions.length}
                </div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={resetTest}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Take Another Test
              </button>
              <Link
                href="/"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentTest && !showResults) {
    const currentQuestion = currentTest.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentTest.questions.length) * 100;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Test Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Question {currentQuestionIndex + 1} of {currentTest.questions.length}
                </h1>
                <p className="text-gray-600">{currentTest.testType.replace('_', ' ')} • {currentTest.cefrLevel}</p>
              </div>
              {timeLeft !== null && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className={timeLeft < 300 ? 'text-red-600 font-semibold' : ''}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {currentQuestion.question}
              </h2>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Target className="w-4 h-4" />
                <span>{currentQuestion.skill}</span>
                <span>•</span>
                <span>{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerChange(currentQuestion.id, option)}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      userAnswers[currentQuestion.id] === option
                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        userAnswers[currentQuestion.id] === option
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {userAnswers[currentQuestion.id] === option && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentQuestionIndex === currentTest.questions.length - 1 ? (
              <button
                onClick={handleCompleteTest}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Complete Test'}
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Test setup screen
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
            Skill-Specific Tests
          </h1>
          <p className="text-gray-600">
            Test your knowledge in specific areas of Finnish grammar and vocabulary.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Create Your Test
          </h2>

          <div className="space-y-6">
            {/* Test Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Test Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testTypes.map((testType) => (
                  <div
                    key={testType.type}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedTestType === testType.type
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTestType(testType.type)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                        selectedTestType === testType.type
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedTestType === testType.type && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{testType.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{testType.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {testType.estimatedTime}
                          </span>
                          <span>{testType.skills.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5 questions</option>
                  <option value={10}>10 questions</option>
                  <option value={15}>15 questions</option>
                  <option value={20}>20 questions</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={startTest}
                disabled={loading || !selectedTestType}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {loading ? 'Creating Test...' : 'Start Test'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
