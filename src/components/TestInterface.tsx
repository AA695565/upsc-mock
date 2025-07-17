'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface TestState {
  currentQuestion: number;
  answers: { [key: number]: number };
  flagged: Set<number>;
  timeLeft: number;
  isSubmitted: boolean;
  testStartTime: number;
}

export function TestInterface() {
  const { user } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testState, setTestState] = useState<TestState>({
    currentQuestion: 0,
    answers: {},
    flagged: new Set(),
    timeLeft: 7200, // 2 hours in seconds
    isSubmitted: false,
    testStartTime: Date.now()
  });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Load or generate sample questions
    loadQuestions();
  }, [user, router]);

  useEffect(() => {
    if (!testState.isSubmitted && testState.timeLeft > 0) {
      const timer = setInterval(() => {
        setTestState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);

      return () => clearInterval(timer);
    } else if (testState.timeLeft === 0 && !testState.isSubmitted) {
      handleSubmitTest();
    }
  }, [testState.timeLeft, testState.isSubmitted]);

  const loadQuestions = () => {
    // Load questions from localStorage or use sample questions
    const savedQuestions = JSON.parse(localStorage.getItem(`upsc_questions_${user?.id}`) || '[]');
    
    if (savedQuestions.length > 0) {
      setQuestions(savedQuestions.slice(0, 100)); // Limit to 100 questions
    } else {
      // Generate sample questions
      const sampleQuestions = generateSampleQuestions();
      setQuestions(sampleQuestions);
    }
    setLoading(false);
  };

  const generateSampleQuestions = (): Question[] => {
    const subjects = ['History', 'Geography', 'Polity', 'Economy', 'Science & Tech', 'Environment', 'Current Affairs', 'Ethics'];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    
    const sampleQuestions: Question[] = [];
    
    for (let i = 0; i < 50; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      sampleQuestions.push({
        id: `q_${i + 1}`,
        question: `Sample ${subject} question ${i + 1}. This is a ${difficulty} level question about ${subject}. Which of the following is correct?`,
        options: [
          'Option A - This is the first option',
          'Option B - This is the second option',
          'Option C - This is the third option',
          'Option D - This is the fourth option'
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `This is the explanation for the ${subject} question. The correct answer is explained here with proper reasoning.`,
        subject,
        difficulty
      });
    }
    
    return sampleQuestions;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setTestState(prev => ({
      ...prev,
      answers: { ...prev.answers, [prev.currentQuestion]: optionIndex }
    }));
  };

  const handleFlagToggle = () => {
    setTestState(prev => {
      const newFlagged = new Set(prev.flagged);
      if (newFlagged.has(prev.currentQuestion)) {
        newFlagged.delete(prev.currentQuestion);
      } else {
        newFlagged.add(prev.currentQuestion);
      }
      return { ...prev, flagged: newFlagged };
    });
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    setTestState(prev => ({
      ...prev,
      currentQuestion: direction === 'prev' 
        ? Math.max(0, prev.currentQuestion - 1)
        : Math.min(questions.length - 1, prev.currentQuestion + 1)
    }));
  };

  const handleSubmitTest = () => {
    const score = calculateScore();
    const timeTaken = Math.floor((Date.now() - testState.testStartTime) / 1000);
    
    const testResult = {
      id: `test_${Date.now()}`,
      name: `Mock Test ${new Date().toLocaleDateString()}`,
      subject: 'Mixed',
      score,
      totalQuestions: questions.length,
      correctAnswers: Object.keys(testState.answers).filter(q => 
        testState.answers[parseInt(q)] === questions[parseInt(q)]?.correctAnswer
      ).length,
      timeTaken,
      date: new Date().toISOString(),
      answers: testState.answers,
      questions: questions.map(q => ({ ...q, userAnswer: testState.answers[questions.indexOf(q)] }))
    };

    // Save test result
    const userTests = JSON.parse(localStorage.getItem(`upsc_tests_${user?.id}`) || '[]');
    userTests.push(testResult);
    localStorage.setItem(`upsc_tests_${user?.id}`, JSON.stringify(userTests));

    // Update user stats
    const userStats = JSON.parse(localStorage.getItem(`upsc_stats_${user?.id}`) || '{}');
    const newStats = {
      totalTests: (userStats.totalTests || 0) + 1,
      averageScore: userStats.averageScore 
        ? (userStats.averageScore * (userStats.totalTests || 0) + score) / ((userStats.totalTests || 0) + 1)
        : score,
      totalQuestions: (userStats.totalQuestions || 0) + questions.length,
      timeSpent: (userStats.timeSpent || 0) + timeTaken
    };
    localStorage.setItem(`upsc_stats_${user?.id}`, JSON.stringify(newStats));

    setTestState(prev => ({ ...prev, isSubmitted: true }));
    router.push(`/results?testId=${testResult.id}`);
  };

  const calculateScore = () => {
    const correctAnswers = Object.keys(testState.answers).filter(q => 
      testState.answers[parseInt(q)] === questions[parseInt(q)]?.correctAnswer
    ).length;
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index: number) => {
    if (testState.answers[index] !== undefined) return 'answered';
    if (testState.flagged.has(index)) return 'flagged';
    return 'unanswered';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-32 w-32 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Questions Available</h2>
          <p className="text-gray-600 mb-6">Please upload questions first to start taking tests.</p>
          <button
            onClick={() => router.push('/upload')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Upload Questions
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[testState.currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 p-2 rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Mock Test</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className={`font-mono ${testState.timeLeft < 300 ? 'text-red-600' : ''}`}>
                  {formatTime(testState.timeLeft)}
                </span>
              </div>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Question {testState.currentQuestion + 1} of {questions.length}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {currentQuestion.subject}
                  </span>
                  <button
                    onClick={handleFlagToggle}
                    className={`p-2 rounded-md ${
                      testState.flagged.has(testState.currentQuestion)
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-900 leading-relaxed">{currentQuestion.question}</p>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      testState.answers[testState.currentQuestion] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        testState.answers[testState.currentQuestion] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {testState.answers[testState.currentQuestion] === index && (
                          <div className="w-2 h-2 rounded-full bg-white mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={() => handleNavigation('prev')}
                  disabled={testState.currentQuestion === 0}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => handleNavigation('next')}
                  disabled={testState.currentQuestion === questions.length - 1}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Question Navigation */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium text-gray-900 mb-4">Questions</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <button
                    key={index}
                    onClick={() => setTestState(prev => ({ ...prev, currentQuestion: index }))}
                    className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                      testState.currentQuestion === index
                        ? 'bg-blue-600 text-white'
                        : status === 'answered'
                        ? 'bg-green-100 text-green-800'
                        : status === 'flagged'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-green-100 mr-2"></div>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-yellow-100 mr-2"></div>
                <span className="text-gray-600">Flagged</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-gray-100 mr-2"></div>
                <span className="text-gray-600">Unanswered</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 space-y-1">
                <p>Answered: {Object.keys(testState.answers).length}</p>
                <p>Flagged: {testState.flagged.size}</p>
                <p>Remaining: {questions.length - Object.keys(testState.answers).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-orange-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Submit Test</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to submit the test? You have answered {Object.keys(testState.answers).length} out of {questions.length} questions.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitTest}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}