"use client";

import { Input } from "@/components/forms/input";
import type { Step2Data } from "@/lib/types";

interface Step2Props {
  data: Step2Data;
  updateData: (data: Partial<Step2Data>) => void;
}

export default function Step2PersonalDetails({ data, updateData }: Step2Props) {
  const educationalOptions = [
    "High School Graduate",
    "Vocational",
    "College Level",
    "College Graduate",
    "Completed Master's Degree",
    "Vocational/TVET",
  ];

  const hearAboutUsOptions = [
    "Manuel J. Santos Hospital Careers",
    "Referred by a family/friend",
    "School",
    "Review Center",
    "Other",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600">
          Please provide your personal details accurately.
        </p>
      </div>

      {/* Name Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Full Name</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Last Name"
            isMandatory
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
            placeholder="Enter last name"
          />
          <Input
            label="First Name"
            isMandatory
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
            placeholder="Enter first name"
          />
          <Input
            label="Middle Name"
            value={data.middleName}
            onChange={(e) => updateData({ middleName: e.target.value })}
            placeholder="Enter middle name"
          />
          <Input
            label="Suffix"
            value={data.suffix}
            onChange={(e) => updateData({ suffix: e.target.value })}
            placeholder="e.g., Jr., Sr., III"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Address"
            isMandatory
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
            placeholder="Complete address"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              isMandatory
              type="text"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
              placeholder="+63 XXX XXX XXXX"
            />
            <Input
              label="Email Address"
              isMandatory
              type="email"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              placeholder="your.email@example.com"
            />
          </div>
        </div>
      </div>

      {/* Educational Background */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Educational Background
        </h3>

        {/* Educational Attainment - Radio */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Highest Educational Attainment
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="space-y-2">
            {educationalOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="educationalAttainment"
                  value={option}
                  checked={data.educationalAttainment === option}
                  onChange={(e) =>
                    updateData({ educationalAttainment: e.target.value })
                  }
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Course/Degree"
            isMandatory
            value={data.courseDegree}
            onChange={(e) => updateData({ courseDegree: e.target.value })}
            placeholder="e.g., Bachelor of Science in Medical Technology"
          />
          <Input
            label="School Graduated"
            isMandatory
            value={data.schoolGraduated}
            onChange={(e) => updateData({ schoolGraduated: e.target.value })}
            placeholder="Name of school/university"
          />
        </div>
      </div>

      {/* How did you hear about us */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          How did you hear about us?
        </h3>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Referral Source
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="space-y-2">
            {hearAboutUsOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="hearAboutUs"
                  value={option}
                  checked={data.hearAboutUs === option}
                  onChange={(e) => updateData({ hearAboutUs: e.target.value })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {data.hearAboutUs === "Other" && (
          <Input
            label="Please specify"
            isMandatory
            value={data.hearAboutUsDetails}
            onChange={(e) => updateData({ hearAboutUsDetails: e.target.value })}
            placeholder="Enter details"
          />
        )}
      </div>

      {/* Confirmation */}
      <div className="pt-4 border-t border-gray-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.confirmCorrect}
            onChange={(e) => updateData({ confirmCorrect: e.target.checked })}
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
