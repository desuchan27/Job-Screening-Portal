"use client";

import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { AIScreeningResult } from "@/lib/types";

interface AIAnalysisCardProps {
  analysis: AIScreeningResult;
}

export function AIAnalysisCard({ analysis }: AIAnalysisCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "QUALIFIED":
        return "bg-green-100 text-green-800 border-green-300";
      case "UNQUALIFIED":
        return "bg-red-100 text-red-800 border-red-300";
      case "WAITLISTED":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "QUALIFIED":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "UNQUALIFIED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "WAITLISTED":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold">AI Screening Analysis</h3>
          <div
            className={`px-4 py-2 rounded-full border-2 ${getStatusColor(
              analysis.status
            )} flex items-center gap-2`}
          >
            {getStatusIcon(analysis.status)}
            <span className="font-semibold">{analysis.status}</span>
          </div>
        </div>
        <p className="text-blue-100 text-sm">
          Automated evaluation based on job criteria
        </p>
      </div>

      {/* Score */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Score
          </span>
          <span className="text-3xl font-bold text-gray-900">
            {analysis.score}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all ${
              analysis.score >= 70
                ? "bg-green-500"
                : analysis.score >= 40
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${analysis.score}%` }}
          />
        </div>
      </div>

      {/* Title & Description */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          {analysis.title}
        </h4>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {analysis.description}
        </p>
      </div>

      {/* Mandatory Criteria */}
      {analysis.criteriaAnalysis.mandatoryCriteria.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Mandatory Criteria
          </h4>
          <div className="space-y-3">
            {analysis.criteriaAnalysis.mandatoryCriteria.map(
              (criterion, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    criterion.matched
                      ? "bg-green-50 border-green-300"
                      : "bg-red-50 border-red-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {criterion.matched ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        {criterion.criteria}
                      </p>
                      <p className="text-sm text-gray-700">
                        {criterion.evidence}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Confidence: {Math.round(criterion.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Soft Skills */}
      {analysis.criteriaAnalysis.softSkills.length > 0 && (
        <div className="p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Soft Skills Evaluation
          </h4>
          <div className="space-y-4">
            {analysis.criteriaAnalysis.softSkills.map((skill, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {skill.skill}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {skill.score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-full rounded-full ${
                      skill.score >= 70
                        ? "bg-green-500"
                        : skill.score >= 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
                <p className="text-sm text-gray-700">{skill.evidence}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
