"use client";

import { useState } from "react";
import { AIScreeningProgress } from "@/components/AIScreeningProgress";

export default function TestAIScreeningPage() {
  const [applicationId, setApplicationId] = useState("");
  const [showProgress, setShowProgress] = useState(false);

  const handleStartScreening = () => {
    if (applicationId.trim()) {
      setShowProgress(true);
    }
  };

  const handleComplete = (result: any) => {
    console.log("Screening complete:", result);
    setTimeout(() => {
      setShowProgress(false);
      alert(`Screening complete! Score: ${result.score}/100`);
    }, 2000);
  };

  const handleError = (error: string) => {
    console.error("Screening error:", error);
    setTimeout(() => {
      setShowProgress(false);
      alert(`Error: ${error}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Test AI Screening Progress</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application ID
              </label>
              <input
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="Enter application ID (e.g., app_1234567890_abc123)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleStartScreening}
              disabled={!applicationId.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Start AI Screening
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">How to use:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Submit a job application first</li>
                <li>Copy the application ID from the response</li>
                <li>Paste it here and click "Start AI Screening"</li>
                <li>Watch the real-time progress updates!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {showProgress && (
        <AIScreeningProgress
          applicationId={applicationId}
          onComplete={handleComplete}
          onError={handleError}
        />
      )}
    </div>
  );
}
