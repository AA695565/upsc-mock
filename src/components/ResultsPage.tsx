'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  Target, 
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  BookOpen,
  Award
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  subject: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  date: string;
  answers: { [key: number]: number };
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    subject: string;
    difficulty: string;
    userAnswer?: number;
  }[];
}

export function ResultsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId');
  
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [selectedView, setSelectedView] = useState<'current' | 'all' | 'analysis'>('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    loadResults();
  }, [user, router, testId]);

  const loadResults = () => {
    const userTests = JSON.parse(localStorage.getItem(`upsc_tests_${user?.id}`) || '[]');
    setAllResults(userTests);

    if (testId) {
      const currentTest = userTests.find((test: TestResult) => test.id === testId);
      setTestResult(currentTest || null);
    }

    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeFromScore = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'bg-green-100 text-green-800' };
    if (score >= 80) return { grade: 'A', color: 'bg-green-100 text-green-800' };
    if (score >= 70) return { grade: 'B+', color: 'bg-blue-100 text-blue-800' };
    if (score >= 60) return { grade: 'B', color: 'bg-blue-100 text-blue-800' };
    if (score >= 50) return { grade: 'C+', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 40) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800' };
    return { grade: 'D', color: 'bg-red-100 text-red-800' };
  };

  const getSubjectAnalysis = () => {
    if (!testResult) return [];
    
    const subjects: { [key: string]: { correct: number; total: number } } = {};
    
    testResult.questions.forEach((question, index) => {
      if (!subjects[question.subject]) {
        subjects[question.subject] = { correct: 0, total: 0 };
      }
      subjects[question.subject].total++;
      
      if (question.userAnswer === question.correctAnswer) {
        subjects[question.subject].correct++;
      }
    });

    return Object.entries(subjects).map(([subject, data]) => ({
      subject,
      correct: data.correct,
      total: data.total,
      percentage: Math.round((data.correct / data.total) * 100)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 p-2 rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Test Results</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedView('current')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedView === 'current'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Current Test
              </button>
              <button
                onClick={() => setSelectedView('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedView === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Tests
              </button>
              <button
                onClick={() => setSelectedView('analysis')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedView === 'analysis'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Analysis
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === 'current' && testResult && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Trophy className={`h-16 w-16 ${getScoreColor(testResult.score)}`} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{testResult.name}</h2>
                <div className="flex justify-center items-center space-x-4 mb-6">
                  <div className={`text-6xl font-bold ${getScoreColor(testResult.score)}`}>
                    {testResult.score}%
                  </div>
                  <div className="text-left">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeFromScore(testResult.score).color}`}>
                      {getGradeFromScore(testResult.score).grade}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {testResult.correctAnswers} / {testResult.totalQuestions} correct
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="text-center">
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Accuracy</p>
                    <p className="text-lg font-semibold">{testResult.score}%</p>
                  </div>
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Time Taken</p>
                    <p className="text-lg font-semibold">{formatTime(testResult.timeTaken)}</p>
                  </div>
                  <div className="text-center">
                    <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="text-lg font-semibold">{testResult.subject}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject-wise Analysis */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getSubjectAnalysis().map((subject) => (
                  <div key={subject.subject} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                      <span className={`font-semibold ${getScoreColor(subject.percentage)}`}>
                        {subject.percentage}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Correct: {subject.correct}</span>
                      <span>Total: {subject.total}</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          subject.percentage >= 80 ? 'bg-green-500' :
                          subject.percentage >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${subject.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question Review */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h3>
              <div className="space-y-6">
                {testResult.questions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 mr-2">Q{index + 1}.</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          question.userAnswer === question.correctAnswer
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {question.userAnswer === question.correctAnswer ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {question.subject}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-900 mb-3">{question.question}</p>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded border ${
                            optionIndex === question.correctAnswer
                              ? 'bg-green-50 border-green-200'
                              : optionIndex === question.userAnswer && question.userAnswer !== question.correctAnswer
                              ? 'bg-red-50 border-red-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center">
                            {optionIndex === question.correctAnswer && (
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            )}
                            {optionIndex === question.userAnswer && question.userAnswer !== question.correctAnswer && (
                              <XCircle className="h-4 w-4 text-red-600 mr-2" />
                            )}
                            <span className="text-sm">{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'all' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Test Results</h3>
            {allResults.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tests completed yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{result.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Subject: {result.subject}</span>
                          <span>Date: {new Date(result.date).toLocaleDateString()}</span>
                          <span>Time: {formatTime(result.timeTaken)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeFromScore(result.score).color}`}>
                          {getGradeFromScore(result.score).grade}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedView === 'analysis' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Tests</span>
                  <span className="text-lg font-semibold">{allResults.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Score</span>
                  <span className="text-lg font-semibold">
                    {allResults.length > 0 
                      ? Math.round(allResults.reduce((sum, test) => sum + test.score, 0) / allResults.length)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Best Score</span>
                  <span className="text-lg font-semibold">
                    {allResults.length > 0 ? Math.max(...allResults.map(test => test.score)) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Questions</span>
                  <span className="text-lg font-semibold">
                    {allResults.reduce((sum, test) => sum + test.totalQuestions, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Keep practicing regularly</p>
                    <p className="text-xs text-gray-600">Consistent practice improves performance</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Focus on weak subjects</p>
                    <p className="text-xs text-gray-600">Identify and improve low-scoring areas</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Time management</p>
                    <p className="text-xs text-gray-600">Practice with time constraints</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}