'use client';

import { useState, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  File, 
  FileText, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Download,
  AlertCircle
} from 'lucide-react';
import Papa from 'papaparse';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface UploadResult {
  success: boolean;
  questions: Question[];
  errors: string[];
  warnings: string[];
}

export function FileUpload() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const file = files[0];
      const result = await processFile(file);
      
      if (result.success) {
        // Save questions to localStorage
        const existingQuestions = JSON.parse(localStorage.getItem(`upsc_questions_${user?.id}`) || '[]');
        const allQuestions = [...existingQuestions, ...result.questions];
        localStorage.setItem(`upsc_questions_${user?.id}`, JSON.stringify(allQuestions));
      }
      
      setUploadResult(result);
    } catch (error) {
      setUploadResult({
        success: false,
        questions: [],
        errors: ['Failed to process file. Please check the format and try again.'],
        warnings: []
      });
    } finally {
      setIsUploading(false);
    }
  };

  const processFile = async (file: File): Promise<UploadResult> => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      return await processCSV(file);
    } else if (fileName.endsWith('.pdf')) {
      return await processPDF(file);
    } else {
      return {
        success: false,
        questions: [],
        errors: ['Unsupported file format. Please upload CSV or PDF files.'],
        warnings: []
      };
    }
  };

  const processCSV = async (file: File): Promise<UploadResult> => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const questions: Question[] = [];
          const errors: string[] = [];
          const warnings: string[] = [];

          results.data.forEach((row: any, index) => {
            try {
              // Expected CSV format: question, option1, option2, option3, option4, correctAnswer, explanation, subject, difficulty
              if (!row.question || !row.option1 || !row.option2 || !row.option3 || !row.option4) {
                errors.push(`Row ${index + 1}: Missing required fields`);
                return;
              }

              const correctAnswer = parseInt(row.correctAnswer) - 1; // Convert to 0-based index
              if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
                errors.push(`Row ${index + 1}: Invalid correct answer (must be 1-4)`);
                return;
              }

              const question: Question = {
                id: `csv_${Date.now()}_${index}`,
                question: row.question.trim(),
                options: [
                  row.option1.trim(),
                  row.option2.trim(),
                  row.option3.trim(),
                  row.option4.trim()
                ],
                correctAnswer,
                explanation: row.explanation?.trim() || 'No explanation provided',
                subject: row.subject?.trim() || 'General',
                difficulty: (row.difficulty?.toLowerCase() === 'easy' || row.difficulty?.toLowerCase() === 'medium' || row.difficulty?.toLowerCase() === 'hard') 
                  ? row.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
                  : 'medium'
              };

              questions.push(question);
            } catch (error) {
              errors.push(`Row ${index + 1}: Error processing row - ${error}`);
            }
          });

          resolve({
            success: errors.length === 0,
            questions,
            errors,
            warnings: warnings.concat(errors.length > 0 ? [`${errors.length} rows could not be processed`] : [])
          });
        },
        error: (error) => {
          resolve({
            success: false,
            questions: [],
            errors: [`CSV parsing error: ${error.message}`],
            warnings: []
          });
        }
      });
    });
  };

  const processPDF = async (file: File): Promise<UploadResult> => {
    // This is a simplified PDF processing - in a real app, you'd use a proper PDF parsing library
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // For now, we'll show a message that PDF processing is not fully implemented
          // In a real implementation, you would use pdf-parse or similar library
          resolve({
            success: false,
            questions: [],
            errors: [],
            warnings: ['PDF processing is not fully implemented yet. Please use CSV format with columns: question, option1, option2, option3, option4, correctAnswer, explanation, subject, difficulty']
          });
        } catch (error) {
          resolve({
            success: false,
            questions: [],
            errors: ['Failed to process PDF file'],
            warnings: []
          });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      {
        question: "What is the capital of India?",
        option1: "Mumbai",
        option2: "Delhi",
        option3: "Kolkata",
        option4: "Chennai",
        correctAnswer: "2",
        explanation: "Delhi is the capital of India and houses the seat of the Indian government.",
        subject: "Geography",
        difficulty: "easy"
      },
      {
        question: "Who was the first President of India?",
        option1: "Jawaharlal Nehru",
        option2: "Mahatma Gandhi",
        option3: "Dr. Rajendra Prasad",
        option4: "Sardar Patel",
        correctAnswer: "3",
        explanation: "Dr. Rajendra Prasad was the first President of India, serving from 1950 to 1962.",
        subject: "History",
        difficulty: "medium"
      }
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_questions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    router.push('/');
    return null;
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
              <h1 className="text-xl font-semibold text-gray-900">Upload Questions</h1>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Sample CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Question Files</h2>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Supports CSV and PDF files (max 10MB)
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Select Files
                </>
              )}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.pdf"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {/* Format Instructions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">File Format Instructions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-3">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">CSV Format</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Required columns:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• question</li>
                  <li>• option1, option2, option3, option4</li>
                  <li>• correctAnswer (1-4)</li>
                  <li>• explanation</li>
                  <li>• subject</li>
                  <li>• difficulty (easy/medium/hard)</li>
                </ul>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-3">
                <File className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="font-medium text-gray-900">PDF Format</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">PDF processing features:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Automatic question extraction</li>
                  <li>• Multiple choice detection</li>
                  <li>• Subject classification</li>
                  <li>• Note: Currently in development</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Results */}
        {uploadResult && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              {uploadResult.success ? (
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 mr-2" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {uploadResult.success ? 'Upload Successful' : 'Upload Failed'}
              </h3>
            </div>

            {uploadResult.questions.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Successfully processed {uploadResult.questions.length} questions
                </p>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    Questions have been added to your question bank and are ready for testing.
                  </p>
                </div>
              </div>
            )}

            {uploadResult.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                <div className="bg-red-50 rounded-lg p-3">
                  <ul className="text-sm text-red-700 space-y-1">
                    {uploadResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {uploadResult.warnings.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {uploadResult.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {uploadResult.success && (
              <div className="flex justify-end">
                <button
                  onClick={() => router.push('/test')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start Test
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}