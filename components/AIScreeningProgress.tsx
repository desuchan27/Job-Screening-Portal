"use client";

import { useAIScreeningProgress } from "@/hooks/useAIScreeningProgress";
import { useEffect } from "react";

interface AIScreeningProgressProps {
  applicationId: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export function AIScreeningProgress({
  applicationId,
  onComplete,
  onError,
}: AIScreeningProgressProps) {
  const { isAnalyzing, currentStep, progress, error, result, startAnalysis } =
    useAIScreeningProgress();

  useEffect(() => {
    if (applicationId) {
      startAnalysis(applicationId);
    }
  }, [applicationId, startAnalysis]);

  useEffect(() => {
    if (result && onComplete) {
      onComplete(result);
    }
  }, [result, onComplete]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  if (!isAnalyzing && !error && !result) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            {isAnalyzing && (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
            {error && (
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✕</span>
              </div>
            )}
            {result && !error && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            <h3 className="font-semibold text-lg">
              {isAnalyzing
                ? "AI Screening in Progress"
                : error
                ? "Screening Failed"
                : "Screening Complete"}
            </h3>
          </div>

          {/* Current Step */}
          {currentStep && (
            <div className="text-sm text-gray-700 font-medium">{currentStep}</div>
          )}

          {/* Progress Log */}
          <div className="max-h-64 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3">
            {progress.map((update, index) => (
              <div
                key={index}
                className="text-xs text-gray-600 flex items-start gap-2"
              >
                <span className="text-gray-400 font-mono">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </span>
                <span className="flex-1">{update.message}</span>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success Message */}
          {result && !error && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              Analysis completed successfully! Score: {result.score}/100
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
