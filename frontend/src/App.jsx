import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, Award, FileText, TrendingUp, Users, BarChart3, Download, AlertCircle, Sparkles } from 'lucide-react';

export default function PremiumAnswerValidator() {
  const [solvedFile, setSolvedFile] = useState(null);
  const [studentFile, setStudentFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ solved: false, students: false });
  const [error, setError] = useState('');
  const [processingStage, setProcessingStage] = useState('');
  const [stats, setStats] = useState(null);

  const API_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    if (results) {
      calculateStats(results);
    }
  }, [results]);

  const calculateStats = (data) => {
    const scores = data.results.map(r => r.percentage);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passing = scores.filter(s => s >= 50).length;
    
    setStats({
      average: avg.toFixed(1),
      highest: highest.toFixed(1),
      lowest: lowest.toFixed(1),
      passingRate: ((passing / scores.length) * 100).toFixed(1)
    });
  };

  const handleSolvedUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSolvedFile(file);
    setLoading(true);
    setError('');
    setProcessingStage('Uploading answer key...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload/solved`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.status === 'ok') {
        setUploadStatus(prev => ({ ...prev, solved: true }));
        setProcessingStage('');
      }
    } catch (err) {
      setError('Failed to upload answer key. Ensure backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStudentFile(file);
    setLoading(true);
    setError('');
    setProcessingStage('Uploading student responses...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload/students`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.status === 'ok') {
        setUploadStatus(prev => ({ ...prev, students: true }));
        setProcessingStage('AI is grading... This may take 10-20 seconds');
        setTimeout(() => fetchResults(), 3000);
      }
    } catch (err) {
      setError('Failed to upload student responses.');
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch(`${API_URL}/results`);
      const data = await response.json();
      
      if (data.status !== 'no_results') {
        setResults(data);
        setProcessingStage('');
        setLoading(false);
      } else {
        setTimeout(() => fetchResults(), 2000);
      }
    } catch (err) {
      setError('Failed to fetch results.');
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grading-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-400 to-blue-600';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getPerformanceLabel = (percentage) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 75) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 60) return { label: 'Satisfactory', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 50) return { label: 'Pass', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Answer Validator</h1>
                <p className="text-sm text-gray-500">Automated Grading System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">System Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Answer Key Upload */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center text-white">
                <FileText className="w-6 h-6 mr-3" />
                <div>
                  <h2 className="text-xl font-bold">Step 1: Answer Key</h2>
                  <p className="text-blue-100 text-sm">Upload correct answers</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <label className="block">
                <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  uploadStatus.solved 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                }`}>
                  {uploadStatus.solved ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mb-3 animate-bounce" />
                      <p className="text-green-700 font-bold text-lg">✓ Answer Key Loaded</p>
                      <p className="text-gray-600 text-sm mt-2">{solvedFile?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(solvedFile?.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-16 h-16 text-gray-400 mb-3" />
                      <p className="text-gray-700 font-semibold text-lg">Drop file or click to upload</p>
                      <p className="text-gray-500 text-sm mt-2">Supported formats:</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">.txt</span>
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">.pdf</span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">.docx</span>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.pdf,.docx"
                    onChange={handleSolvedUpload}
                    disabled={loading}
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Student Answers Upload */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4">
              <div className="flex items-center text-white">
                <Users className="w-6 h-6 mr-3" />
                <div>
                  <h2 className="text-xl font-bold">Step 2: Student Responses</h2>
                  <p className="text-green-100 text-sm">Upload student answers</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <label className="block">
                <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  uploadStatus.students 
                    ? 'border-green-400 bg-green-50' 
                    : uploadStatus.solved 
                    ? 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
                    : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                }`}>
                  {uploadStatus.students ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mb-3 animate-bounce" />
                      <p className="text-green-700 font-bold text-lg">✓ Responses Uploaded</p>
                      <p className="text-gray-600 text-sm mt-2">{studentFile?.name}</p>
                      {loading && (
                        <div className="mt-3 flex items-center text-blue-600">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                          <span className="text-sm font-medium">AI Processing...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className={`w-16 h-16 mb-3 ${uploadStatus.solved ? 'text-gray-400' : 'text-gray-300'}`} />
                      <p className={`font-semibold text-lg ${uploadStatus.solved ? 'text-gray-700' : 'text-gray-400'}`}>
                        {uploadStatus.solved ? 'Drop file or click to upload' : 'Upload answer key first'}
                      </p>
                      <p className="text-gray-500 text-sm mt-2">Supported formats:</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">.csv</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">.xlsx</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">.xls</span>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleStudentUpload}
                    disabled={loading || !uploadStatus.solved}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Processing Stage */}
        {processingStage && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-blue-800 font-medium">{processingStage}</p>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <>
            {/* Statistics Dashboard */}
            {stats && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BarChart3 className="w-7 h-7 mr-3 text-blue-600" />
                    Performance Analytics
                  </h2>
                  <button
                    onClick={exportResults}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span className="font-medium">Export Results</span>
                  </button>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium mb-1">Total Students</p>
                    <p className="text-4xl font-bold text-blue-900">{results.total_students}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-green-700 font-medium mb-1">Class Average</p>
                    <p className="text-4xl font-bold text-green-900">{stats.average}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                    <p className="text-sm text-yellow-700 font-medium mb-1">Top Score</p>
                    <p className="text-4xl font-bold text-yellow-900">{stats.highest}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <p className="text-sm text-purple-700 font-medium mb-1">Pass Rate</p>
                    <p className="text-4xl font-bold text-purple-900">{stats.passingRate}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Student Rankings */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                <div className="flex items-center text-white">
                  <Award className="w-6 h-6 mr-3" />
                  <h2 className="text-xl font-bold">Student Rankings & Detailed Results</h2>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {results.results.map((student, idx) => {
                  const perf = getPerformanceLabel(student.percentage);
                  return (
                    <div
                      key={idx}
                      className="border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                    >
                      {/* Student Header */}
                      <div className={`bg-gradient-to-r ${getRankColor(student.rank)} px-6 py-4`}>
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center space-x-4">
                            <span className="text-5xl">{getRankBadge(student.rank)}</span>
                            <div>
                              <h3 className="text-2xl font-bold">{student.student_id}</h3>
                              <p className="text-sm opacity-90">Rank #{student.rank}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-4xl font-bold">{student.total_score}/{student.total_possible}</p>
                            <p className="text-xl font-semibold">{student.percentage}%</p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${perf.bg} ${perf.color}`}>
                              {perf.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Question Breakdown */}
                      <div className="p-6 bg-gray-50">
                        <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Question-wise Performance</h4>
                        <div className="space-y-3">
                          {student.per_question.map((q, qIdx) => (
                            <div key={qIdx} className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-gray-800">{q.question}</span>
                                <span className="font-bold text-lg">{q.marks_obtained}/{q.max_marks}</span>
                              </div>
                              <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500 rounded-full"
                                  style={{ width: `${q.percentage}%` }}
                                >
                                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                    {q.percentage}%
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">AI Similarity: {(q.similarity * 100).toFixed(1)}%</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">
            22K-4056, 22K-4008, 22K-8723 - AI Answer Validator - MLOps Project
          </p>
          <p className="text-xs text-gray-500 mt-2">
            AI Answer Validator © 2025 • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}