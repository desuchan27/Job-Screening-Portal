"use client";

import { useState, useEffect } from "react";
import { checkExistingApplication } from "@/app/actions/application";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import JobCard from "@/components/JobCard";

import { ChevronLeft, ChevronRight, Check, ArrowLeft, X } from "lucide-react";
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
import Link from "next/link";

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
  const [analysisProgress, setAnalysisProgress] = useState<string[]>([]);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState("");
  const [showResubmitConfirmation, setShowResubmitConfirmation] =
    useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [showGoBackConfirmation, setShowGoBackConfirmation] = useState(false);

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

  // Check if form has any progress
  const hasFormProgress = (): boolean => {
    const { step1, step2, step3 } = formData;
    
    // Check step1
    if (step1.applicantImage) return true;
    if (Object.keys(step1.requirements).length > 0) return true;
    
    // Check step2
    if (step2.firstName || step2.lastName || step2.email || step2.phone || step2.address) return true;
    
    // Check step3
    if (step3.whyShouldWeHireYou || step3.willingToBeAssignedInButuan || step3.willingToStartASAP) return true;
    
    return false;
  };

  // Handle browser beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasFormProgress() && !showSuccessModal) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, showSuccessModal]);

  // Handle Go Back click
  const handleGoBack = () => {
    if (hasFormProgress()) {
      setShowGoBackConfirmation(true);
    } else {
      window.location.href = "/";
    }
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

    // Proceed to next step immediately
    // Note: Document analysis is now handled during file upload in Step 1
    proceedToNextStep();
  };

  const proceedToNextStep = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submitApplication = async () => {
    setIsSubmitting(true);
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_AI_SCREENING_API_URL || "http://localhost:3000";
      const response = await fetch(
        `${API_BASE_URL}/api/external/submit-application`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: job.id,
            ...formData, // Structure matches requirements: step1, step2, step3 keys are already in formData
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      // Success! Show success modal
      setShowSuccessModal(true);
      setShowResubmitConfirmation(false); // Close confirmation if open
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    // Check if we already confirmed resubmission
    if (showResubmitConfirmation) {
      await submitApplication();
      return;
    }

    setIsSubmitting(true);
    try {
      // Check for existing application
      const exists = await checkExistingApplication(
        formData.step2.email,
        job.id,
      );

      if (exists) {
        setIsSubmitting(false);
        setShowResubmitConfirmation(true);
        return;
      }

      // No existing application, proceed directly
      await submitApplication();
    } catch (error) {
      console.error("Error checking existing application:", error);
      // If check fails, we might want to proceed or alert.
      // For now, let's proceed to attempt submission (api will handle duplicates if strict,
      // but here we want to warn).
      // Or safer: alert user.
      // Let's proceed to submitApplication as fallback or alert?
      // The user prompt implies we want to ASK. checking failed means we don't know.
      // Let's assume false and try to submit, usually better UX than blocking.
      await submitApplication();
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

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Mobile Only */}
        <div className="mb-8 text-center lg:hidden">
          <h1 className="text-[1rem] xl:text-[1.5rem] font-bold text-gray-900 mb-2">
            Apply for {job.title}
          </h1>
          <p className="text-[0.875rem] text-gray-600 mb-4">
            Complete all steps to submit your application
          </p>
          <button
            onClick={() => setShowJobDetailsModal(true)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            View Job Details
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Form (Mobile: full width, Desktop: 60%) */}
          <div className="flex-1 lg:max-w-2xl">
            {/* Progress Indicator */}
            <button
              onClick={handleGoBack}
              className="inline-block text-black font-bold text-[0.875rem] mb-8"
            >
              <ArrowLeft className="inline-block mr-2 w-4 h-4" />
              Go Back
            </button>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                          currentStep > step.number
                            ? "bg-accent text-white"
                            : currentStep === step.number
                              ? "bg-black text-white"
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
                        className={`mt-2 text-sm font-medium text-nowrap ${
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
                            ? "bg-accent"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white md:rounded-2xl md:border border-slate-200 hover:border-black transition-all hover:shadow-md md:p-[2rem] mb-6 relative">
              {/* Loading Overlay with Real-time Progress */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white bg-opacity-95 z-50 rounded-2xl flex items-center justify-center">
                  <div className="text-center max-w-md px-6 w-full">
                    {/* Animated Spinner */}
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                      <div
                        className="absolute inset-2 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"
                        style={{ animationDuration: "1.5s" }}
                      ></div>
                    </div>

                    {/* Current Step */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Analyzing Your Documents
                    </h3>
                    <p className="text-sm font-medium text-blue-600 mb-4">
                      {currentAnalysisStep || "Preparing..."}
                    </p>

                    {/* Progress Log */}
                    {analysisProgress.length > 0 && (
                      <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3 mb-4 text-left">
                        <div className="space-y-1">
                          {analysisProgress.map((step, index) => (
                            <div
                              key={index}
                              className="text-xs text-gray-600 flex items-start gap-2"
                            >
                              <span className="text-green-500 mt-0.5">✓</span>
                              <span className="flex-1">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mb-4">
                      This usually takes 5-10 seconds
                    </p>

                    {/* Cancel Button */}
                    <button
                      onClick={() => {
                        setIsAnalyzing(false);
                        setAnalysisProgress([]);
                        setCurrentAnalysisStep("");
                      }}
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
              <JobCard
                job={{ ...job, qualifications }}
                showApplyButton={false}
                showDescription={true}
                qualifications={qualifications}
              />
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

      {/* Resubmit Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResubmitConfirmation}
        onClose={() => {
          setShowResubmitConfirmation(false);
          window.location.href = "/";
        }}
        onConfirm={handleSubmit}
        title="Existing Application Found"
        description={`We found an existing application for ${formData.step2.email} for this position. Do you want to resubmit your application?`}
        confirmText="Yes, Resubmit"
        cancelText="Cancel"
        variant="warning"
        isLoading={isSubmitting}
      />

      {/* Job Details Modal - Mobile Only */}
      {showJobDetailsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 lg:hidden">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Job Details</h2>
              <button
                onClick={() => setShowJobDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
            <div className="overflow-hidden">
              <JobCard
                job={{ ...job, qualifications }}
                showApplyButton={false}
                showDescription={true}
                qualifications={qualifications}
              />
            </div>
          </div>
        </div>
      )}

      {/* Go Back Confirmation Modal */}
      <ConfirmationModal
        isOpen={showGoBackConfirmation}
        onClose={() => setShowGoBackConfirmation(false)}
        onConfirm={() => window.location.href = "/"}
        title="Leave Application?"
        description="You have unsaved progress. Are you sure you want to leave?"
        confirmText="Yes, Leave"
        cancelText="Stay"
        variant="warning"
      />
    </div>
  );
}
