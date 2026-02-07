"use client";

import { Input } from "@/components/forms/input";
import type { Step3Data } from "@/lib/types";

interface Step3Props {
  data: Step3Data;
  updateData: (data: Partial<Step3Data>) => void;
}

export default function Step3Screening({ data, updateData }: Step3Props) {
  const butuanOptions = ["Yes", "No", "Nasipit", "Other"];
  const asapOptions = ["Yes", "No", "Other"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-md md:text-2xl font-bold text-gray-900 mb-2">
          Screening Questions
        </h2>
        <p className="text-gray-600">
          Please answer the following questions to help us understand your
          preferences.
        </p>
      </div>

      {/* Question 1: Willing to be assigned in Butuan */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Are you willing to be assigned in Butuan City?
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="space-y-2">
            {butuanOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="willingToBeAssignedInButuan"
                  value={option}
                  checked={data.willingToBeAssignedInButuan === option}
                  onChange={(e) =>
                    updateData({ willingToBeAssignedInButuan: e.target.value })
                  }
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {data.willingToBeAssignedInButuan === "Other" && (
          <Input
            label="Please specify"
            isMandatory
            value={data.willingToBeAssignedInButuanDetails}
            onChange={(e) =>
              updateData({ willingToBeAssignedInButuanDetails: e.target.value })
            }
            placeholder="Enter your preferred location"
          />
        )}
      </div>

      {/* Question 2: Willing to start ASAP */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Are you willing to start ASAP?
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="space-y-2">
            {asapOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="willingToStartASAP"
                  value={option}
                  checked={data.willingToStartASAP === option}
                  onChange={(e) =>
                    updateData({ willingToStartASAP: e.target.value })
                  }
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {data.willingToStartASAP === "Other" && (
          <Input
            label="Please specify"
            isMandatory
            value={data.willingToStartASAPDetails}
            onChange={(e) =>
              updateData({ willingToStartASAPDetails: e.target.value })
            }
            placeholder="Enter your preferred start date"
          />
        )}
      </div>

      {/* Question 3: Why should we hire you */}
      <div className="space-y-4">
        <Input
          label="Why should we hire you?"
          isMandatory
          variant="textarea"
          rows={6}
          value={data.whyShouldWeHireYou}
          onChange={(e) => updateData({ whyShouldWeHireYou: e.target.value })}
          placeholder="Tell us why you're the best candidate for this position..."
        />
        <p className="text-xs text-gray-500">
          This is your opportunity to showcase your skills, experience, and what
          makes you unique.
        </p>
      </div>

      {/* Data Privacy Consent */}
      <div className="pt-6 border-t border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Data Privacy Consent
        </h3>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            Our Privacy Notice explains how we use and process your personal
            information and sensitive personal information, what kind of
            personal information and sensitive personal information about you we
            process, why we process the same (including when and why we share it
            with others), your rights under the Data Privacy Act of 2012, and
            how we protect, store, and retain your information. By signing this
            form, you consent to our use and processing of your personal
            information and sensitive personal information in accordance with
            the terms of our Privacy Notice.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.dataPrivacyConsent}
            onChange={(e) =>
              updateData({ dataPrivacyConsent: e.target.checked })
            }
            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
          />
          <span className="text-sm text-gray-700">
            I have read and agree to the Data Privacy Consent
            <span className="text-red-500 ml-1">*</span>
          </span>
        </label>
      </div>

      {/* Final Confirmation */}
      <div className="pt-4 border-t border-gray-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.confirmDetailsCorrect}
            onChange={(e) =>
              updateData({ confirmDetailsCorrect: e.target.checked })
            }
            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
          />
          <span className="text-sm text-gray-700">
            I agree that the details I provided are correct
            <span className="text-red-500 ml-1">*</span>
          </span>
        </label>
      </div>
    </div>
  );
}
