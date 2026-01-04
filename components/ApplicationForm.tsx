"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/buttons/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SuccessModal } from "@/components/ui/success-modal";
import Step1Documents from "./application-steps/Step1Documents";
import Step2PersonalDetails from "./application-steps/Step2PersonalDetails";
import Step3Screening from "./application-steps/Step3Screening";
import type {
  ApplicationFormData,
  Step1Data,
  Step2Data,
  Step3Data,
  JobPosting,
  JobRequirement,
  ExtractedPersonalData,
} from "@/lib/types";

interface ApplicationFormProps {
  job: JobPosting;
  qualifications: string[];
  requirements: JobRequirement[];
}

export default function ApplicationForm({
  job,
  qualifications,
  requirements,
}: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [extractedData, setExtractedData] =
    useState<ExtractedPersonalData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [formData, setFormData] = useState<ApplicationFormData>({
    step1: {
      applicantImage: null,
      requirements: {},
    },
    step2: {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      address: "",
      phone: "",
      email: "",
      educationalAttainment: "",
      courseDegree: "",
      schoolGraduated: "",
      hearAboutUs: "",
      hearAboutUsDetails: "",
      confirmCorrect: false,
    },
    step3: {
      willingToBeAssignedInButuan: "",
      willingToBeAssignedInButuanDetails: "",
      willingToStartASAP: "",
      willingToStartASAPDetails: "",
      whyShouldWeHireYou: "",
      dataPrivacyConsent: false,
      confirmDetailsCorrect: false,
    },
  });

  const updateStep1 = (data: Partial<Step1Data>) => {
    setFormData((prev) => ({
      ...prev,
      step1: { ...prev.step1, ...data },
    }));
  };

  const updateStep2 = (data: Partial<Step2Data>) => {
    setFormData((prev) => ({
      ...prev,
      step2: { ...prev.step2, ...data },
    }));
  };

  const updateStep3 = (data: Partial<Step3Data>) => {
    setFormData((prev) => ({
      ...prev,
      step3: { ...prev.step3, ...data },
    }));
  };

  // Validation functions
  const validateStep1 = (): boolean => {
    const { step1 } = formData;

    // Check applicant image is uploaded (mandatory)
    if (!step1.applicantImage) return false;

    // Check all mandatory requirements are filled
    return requirements.every((req) => {
      const value = step1.requirements[req.id];

      if (!req.is_mandatory) return true; // Optional requirements are always valid

      if (req.accepts_multiple) {
        // For multiple files, check if array exists and has at least one file
        return Array.isArray(value) && value.length > 0;
      } else {
        // For single file, check if string exists and is not empty
        return typeof value === "string" && value.length > 0;
      }
    });
  };

  const validateStep2 = (): boolean => {
    const { step2 } = formData;
    const basicFieldsValid =
      step2.firstName.trim() !== "" &&
      step2.lastName.trim() !== "" &&
      step2.address.trim() !== "" &&
      step2.phone.trim() !== "" &&
      step2.email.trim() !== "" &&
      step2.educationalAttainment !== "" &&
      step2.courseDegree.trim() !== "" &&
      step2.schoolGraduated.trim() !== "" &&
      step2.hearAboutUs !== "" &&
      step2.confirmCorrect;

    const hearAboutUsValid =
      step2.hearAboutUs !== "Other" || step2.hearAboutUsDetails.trim() !== "";

    return basicFieldsValid && hearAboutUsValid;
  };

  const validateStep3 = (): boolean => {
    const { step3 } = formData;
    const basicFieldsValid =
      step3.willingToBeAssignedInButuan !== "" &&
      step3.willingToStartASAP !== "" &&
      step3.whyShouldWeHireYou.trim() !== "" &&
      step3.dataPrivacyConsent &&
      step3.confirmDetailsCorrect;

    const butuanValid =
      step3.willingToBeAssignedInButuan !== "Other" ||
      step3.willingToBeAssignedInButuanDetails.trim() !== "";

    const asapValid =
      step3.willingToStartASAP !== "Other" ||
      step3.willingToStartASAPDetails.trim() !== "";

    return basicFieldsValid && butuanValid && asapValid;
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!canProceed() || currentStep >= 3) return;

    // Special handling for Step 1 - wait for AI analysis
    if (currentStep === 1) {
      setIsAnalyzing(true);

      // Collect all file URLs for analysis
      const fileUrls: string[] = [];
      if (formData.step1.applicantImage) {
        fileUrls.push(formData.step1.applicantImage);
      }
      Object.values(formData.step1.requirements).forEach((value) => {
        if (typeof value === "string" && value) {
          fileUrls.push(value);
        } else if (Array.isArray(value)) {
          fileUrls.push(...value);
        }
      });

      // Call AI analysis
      if (fileUrls.length > 0) {
        try {
          const response = await fetch("/api/analyze-documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileUrls }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setExtractedData(result.data);
            }
          }
        } catch (error) {
          console.error("Document analysis error:", error);
          // Continue anyway - don't block user
        }
      }

      setIsAnalyzing(false);
    }

    // Proceed to next step
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      // Success! Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    window.location.href = "/";
  };

  const steps = [
    { number: 1, title: "Documents" },
    { number: 2, title: "Personal Details" },
    { number: 3, title: "Screening" },
  ];

  const formattedDeadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No deadline";

  const daysRemaining = job.deadline
    ? Math.ceil(
        (new Date(job.deadline).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Mobile Only */}
        <div className="mb-8 text-center lg:hidden">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Apply for {job.title}
          </h1>
          <p className="text-gray-600">
            Complete all steps to submit your application
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Form (Mobile: full width, Desktop: 60%) */}
          <div className="flex-1 lg:max-w-2xl">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                          currentStep > step.number
                            ? "bg-green-500 text-white"
                            : currentStep === step.number
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {currentStep > step.number ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          step.number
                        )}
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${
                          currentStep >= step.number
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-2 transition-all ${
                          currentStep > step.number
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 relative">
              {/* Loading Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white bg-opacity-95 z-50 rounded-2xl flex items-center justify-center">
                  <div className="text-center max-w-md px-6">
                    {/* Animated Spinner */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <div className="absolute inset-0 border-8 border-blue-200 rounded-full"></div>
                      <div className="absolute inset-0 border-8 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                      <div
                        className="absolute inset-3 border-8 border-transparent border-t-purple-600 rounded-full animate-spin"
                        style={{ animationDuration: "1.5s" }}
                      ></div>
                    </div>

                    {/* Message */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Analyzing Your Documents
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Please wait while our AI reads and processes your uploaded
                      documents...
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      This usually takes 5-10 seconds
                    </p>

                    {/* Cancel Button */}
                    <button
                      onClick={() => setIsAnalyzing(false)}
                      className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel & Go Back
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <Step1Documents
                  data={formData.step1}
                  updateData={updateStep1}
                  requirements={requirements}
                  onExtractedData={setExtractedData}
                />
              )}
              {currentStep === 2 && (
                <Step2PersonalDetails
                  data={formData.step2}
                  updateData={updateStep2}
                  extractedData={extractedData}
                />
              )}
              {currentStep === 3 && (
                <Step3Screening
                  data={formData.step3}
                  updateData={updateStep3}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outlined"
                onClick={handlePrev}
                disabled={currentStep === 1}
                rightIcon={<ChevronLeft className="w-5 h-5" />}
              >
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  rightIcon={<ChevronRight className="w-5 h-5" />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="accent"
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                  isLoading={isSubmitting}
                >
                  Submit Application
                </Button>
              )}
            </div>

            {/* Validation Message */}
            {!canProceed() && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Please fill in all required fields before proceeding.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Job Details (Desktop Only) */}
          <div className="hidden lg:block lg:w-96 shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Job Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {job.title}
                  </h2>
                  <StatusBadge status={job.status} />
                </div>

                {/* Deadline */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {formattedDeadline}</span>
                  </div>
                  {daysRemaining !== null && daysRemaining > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {daysRemaining} {daysRemaining === 1 ? "day" : "days"}{" "}
                        remaining
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Job Description
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {/* Qualifications */}
                {qualifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Job Qualifications:
                    </h3>
                    <ul className="space-y-2">
                      {qualifications.map((qual, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Application Submitted!"
        message={`Thank you for applying for ${job.title}. We have received your application and will review it shortly. You will be notified via email about the next steps.`}
        buttonText="Back to Home"
      />
    </div>
  );
}
