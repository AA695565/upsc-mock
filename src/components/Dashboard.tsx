'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Upload, 
  Play, 
  BarChart3, 
  Settings, 
  LogOut, 
  FileText, 
  Clock, 
  Target,
  TrendingUp,
  Award,
  Calendar
} from 'lucide-react';

interface Stats {
  totalTests: number;
  averageScore: number;
  totalQuestions: number;
  timeSpent: number;
  strongSubjects: string[];
  weakSubjects: string[];
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalTests: 0,
    averageScore: 0,
    totalQuestions: 0,
    timeSpent: 0,
    strongSubjects: [],
    weakSubjects: []
  });
  const [recentTests, setRecentTests] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Load user stats
    const userStats = JSON.parse(localStorage.getItem(`upsc_stats_${user.id}`) || '{}');
    const userTests = JSON.parse(localStorage.getItem(`upsc_tests_${user.id}`) || '[]');
    
    setStats(userStats);
    setRecentTests(userTests.slice(-5).reverse());
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const subjects = [
    { name: 'History', icon: '🏛️', color: 'bg-amber-100 text-amber-800' },
    { name: 'Geography', icon: '🌍', color: 'bg-green-100 text-green-800' },
    { name: 'Polity', icon: '⚖️', color: 'bg-blue-100 text-blue-800' },
    { name: 'Economy', icon: '💰', color: 'bg-purple-100 text-purple-800' },
    { name: 'Science & Tech', icon: '🔬', color: 'bg-pink-100 text-pink-800' },
    { name: 'Environment', icon: '🌱', color: 'bg-teal-100 text-teal-800' },
    { name: 'Current Affairs', icon: '📰', color: 'bg-orange-100 text-orange-800' },
    { name: 'Ethics', icon: '🎯', color: 'bg-indigo-100 text-indigo-800' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">UPSC Mock Test</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">{(stats.averageScore || 0).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Spent</p>
                <p className="text-2xl font-semibold text-gray-900">{Math.floor(stats.timeSpent / 60)}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions Solved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalQuestions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push('/test')}
                    className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Play className="h-8 w-8 text-blue-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Start Mock Test</p>
                      <p className="text-sm text-gray-500">Take a practice test</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/upload')}
                    className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-green-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Upload Questions</p>
                      <p className="text-sm text-gray-500">Add PDF or CSV files</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/results')}
                    className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  >
                    <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">View Analytics</p>
                      <p className="text-sm text-gray-500">Check your progress</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/settings')}
                    className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-8 w-8 text-gray-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Settings</p>
                      <p className="text-sm text-gray-500">Customize your experience</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Subjects</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {subjects.map((subject) => (
                    <div
                      key={subject.name}
                      className={`p-4 rounded-lg text-center cursor-pointer hover:scale-105 transition-transform ${subject.color}`}
                    >
                      <div className="text-2xl mb-2">{subject.icon}</div>
                      <p className="text-sm font-medium">{subject.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tests */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Tests</h3>
            </div>
            <div className="p-6">
              {recentTests.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tests taken yet</p>
                  <button
                    onClick={() => router.push('/test')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Take Your First Test
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTests.map((test, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{test.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          test.score >= 75 ? 'bg-green-100 text-green-800' :
                          test.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {test.score}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Subject: {test.subject}</p>
                        <p>Date: {new Date(test.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}