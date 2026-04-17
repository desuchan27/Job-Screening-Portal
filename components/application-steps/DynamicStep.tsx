"use client";

import { Input } from "@/components/forms/input";
import type { ApplicationFormGroup, ApplicationFormItem } from "@/lib/types";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface DynamicStepProps {
  group: ApplicationFormGroup;
  responses: Record<string, any>;
  updateResponses: (updates: Record<string, any>) => void;
  isPrefillLoading?: boolean;
  extractedData?: {
     data?: any;
     dynamicFormValues?: Record<string, any>;
  } | null;
}

export default function DynamicStep({
  group,
  responses,
  updateResponses,
  isPrefillLoading = false,
  extractedData,
}: DynamicStepProps) {
  const [hasPrefilled, setHasPrefilled] = useState(false);

  const enabledItems = (group.items || []).filter((item) => item.isEnabled !== false);

  useEffect(() => {
    if (extractedData?.dynamicFormValues && !hasPrefilled) {
      const formUpdates: Record<string, any> = {};
      
      // Auto-fill fields if they are empty
      Object.entries(extractedData.dynamicFormValues).forEach(([key, value]) => {
        if (!responses[key] && value) {
          formUpdates[key] = value;
        }
      });

      if (Object.keys(formUpdates).length > 0) {
        updateResponses(formUpdates);
        setHasPrefilled(true);
      } else {
        setHasPrefilled(true);
      }
    }
  }, [extractedData, responses, updateResponses, hasPrefilled]);

  const handleInputChange = (fieldKey: string, value: any) => {
    updateResponses({ [fieldKey]: value });
  };

  const handleCheckboxChange = (fieldKey: string, option: string, checked: boolean) => {
    const currentValues = Array.isArray(responses[fieldKey]) ? [...responses[fieldKey]] : [];
    if (checked) {
      currentValues.push(option);
    } else {
      const index = currentValues.indexOf(option);
      if (index > -1) currentValues.splice(index, 1);
    }
    handleInputChange(fieldKey, currentValues);
  };

  // Helper to strictly match the API's normalizeFieldKey logic for correct mapping
  const getFieldKey = (item: ApplicationFormItem) => {
    const rawValue = item.fieldKey || item.label || "";
    return rawValue
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_\s-]/g, "")
      .replace(/[\s-]+/g, "_");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[1rem] xl:text-[1.5rem] font-bold text-gray-900 mb-2 xl:mb-4">
          {group.title || group.id}
        </h2>
        {group.description && (
          <p className="text-[0.875rem] text-slate-600">{group.description}</p>
        )}

        {isPrefillLoading && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-700 mb-2">
              Auto-filling fields from your uploaded document. Please wait...
            </p>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-linear-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse" />
            </div>
          </div>
        )}
        
        {extractedData?.dynamicFormValues && hasPrefilled && !isPrefillLoading && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-800">
              We've pre-filled some fields from your uploaded documents. Please review and edit as needed.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {enabledItems.map((item, idx) => {
          const fieldKey = getFieldKey(item);
          const value = responses[fieldKey] || '';

          if (item.type === "text" || item.type === "textarea" || item.type === "email" || item.type === "tel") {
            return (
              <div key={idx} className="space-y-2">
                <Input
                  label={item.label || "Text Field"}
                  isMandatory={item.isMandatory}
                  type={item.type === "textarea" || item.type === "tel" ? "text" : (item.type as any)}
                  variant={item.type === "textarea" ? "textarea" : "default"}
                  rows={item.type === "textarea" ? 4 : undefined}
                  value={value}
                  onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                  placeholder={item.description || `Enter ${item.label}`}
                />
              </div>
            );
          }

          if (item.type === "radio") {
            return (
              <div key={idx} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {item.label}
                  {item.isMandatory ? <span className="text-red-500 ml-1">*</span> : <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>}
                </label>
                {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                <div className="space-y-2">
                  {item.options?.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name={fieldKey}
                        value={option}
                        checked={value === option}
                        onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          }

          if (item.type === "multiCheckbox") {
            const currentArrayValue = Array.isArray(value) ? value : [];
            return (
              <div key={idx} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {item.label}
                  {item.isMandatory ? <span className="text-red-500 ml-1">*</span> : <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>}
                </label>
                {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                <div className="space-y-2">
                  {item.options?.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={option}
                        checked={currentArrayValue.includes(option)}
                        onChange={(e) => handleCheckboxChange(fieldKey, option, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          }

          if (item.type === "consent") {
            return (
              <div key={idx} className="pt-6 border-t border-gray-200 space-y-4">
                {item.label && <h3 className="text-lg font-semibold text-gray-800">{item.label}</h3>}
                {item.description && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => handleInputChange(fieldKey, e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    I agree and consent
                    {item.isMandatory ? <span className="text-red-500 ml-1">*</span> : <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>}
                  </span>
                </label>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
