"use client";

import { useState, useEffect, useCallback } from "react";
import { checkExistingApplication } from "@/app/actions/application";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import JobCard from "@/components/JobCard";

import { ChevronLeft, ChevronRight, Check, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/buttons/button";
import { SuccessModal } from "@/components/ui/success-modal";
import Step1Documents from "./application-steps/Step1Documents";
import DynamicStep from "./application-steps/DynamicStep";
import type {
  ApplicationFormData,
  ApplicationFormGroup,
  Step1Data,
  JobPosting,
  JobRequirement,
} from "@/lib/types";

interface ApplicationFormProps {
  job: JobPosting;
  qualifications: string[];
  requirements: JobRequirement[];
}

type DynamicResponseValue = string | number | boolean | string[] | null;

interface ExtractedApplicationData {
  data?: unknown;
  dynamicFormValues?: Record<string, DynamicResponseValue>;
}

function normalizeFieldKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\s-]/g, "")
    .replace(/[\s-]+/g, "_");
}

const BASIC_INFO_ITEMS: NonNullable<ApplicationFormGroup["items"]> = [
  {
    type: "text",
    fieldKey: "first_name",
    label: "First Name",
    isEnabled: true,
    isMandatory: true,
    order: 0,
    description: "Enter your first name.",
  },
  {
    type: "text",
    fieldKey: "middle_initial",
    label: "Middle Initial",
    isEnabled: true,
    isMandatory: false,
    order: 1,
    description: "Enter your middle initial (optional).",
  },
  {
    type: "text",
    fieldKey: "last_name",
    label: "Last Name",
    isEnabled: true,
    isMandatory: true,
    order: 2,
    description: "Enter your last name.",
  },
  {
    type: "email",
    fieldKey: "email",
    label: "Email",
    isEnabled: true,
    isMandatory: true,
    order: 3,
    description: "Enter a valid email address.",
  },
  {
    type: "tel",
    fieldKey: "phone",
    label: "Phone",
    isEnabled: true,
    isMandatory: true,
    order: 4,
    description: "Enter your active phone number.",
  },
];

function isItemEnabled(item: NonNullable<ApplicationFormGroup["items"]>[number]): boolean {
  return item.isEnabled !== false;
}

function sortItemsByOrder(items: NonNullable<ApplicationFormGroup["items"]>): NonNullable<ApplicationFormGroup["items"]> {
  return [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function mergeBasicInfoIntoFirstGroup(schema: ApplicationFormGroup[]): ApplicationFormGroup[] {
  const sorted = [...schema]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((group) => ({
      ...group,
      items: sortItemsByOrder((group.items || []).filter(isItemEnabled)),
    }));

  if (sorted.length === 0) {
    return [
      {
        id: "application-form-1",
        title: "Application Form 1",
        description: "Provide your basic contact information.",
        order: 0,
        items: [...BASIC_INFO_ITEMS],
      },
    ];
  }

  return sorted.map((group, index) => {
    if (index !== 0) return group;

    const existingItems = sortItemsByOrder((group.items || []).filter(isItemEnabled));
    const existingByKey = new Map(
      existingItems
        .map((item) => [normalizeFieldKey(item.fieldKey || item.label || ""), item] as const)
        .filter(([key]) => Boolean(key)),
    );

    const basicKeys = new Set(
      BASIC_INFO_ITEMS.map((item) => normalizeFieldKey(item.fieldKey || item.label || "")).filter(Boolean),
    );

    const basicItems = BASIC_INFO_ITEMS.map((item) => {
      const key = normalizeFieldKey(item.fieldKey || item.label || "");
      const existing = key ? existingByKey.get(key) : undefined;

      if (!existing) return item;

      return {
        ...existing,
        ...item,
        id: existing.id,
        isEnabled: true,
      };
    });

    const restItems = existingItems.filter((item) => {
      const key = normalizeFieldKey(item.fieldKey || item.label || "");
      return key ? !basicKeys.has(key) : true;
    });

    return {
      ...group,
      items: [...basicItems, ...restItems],
    };
  });
}

export default function ApplicationForm({
  job,
  qualifications,
  requirements,
}: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedApplicationData | null>(null);
  const [activePrefillRequests, setActivePrefillRequests] = useState(0);
  const [pendingNextAfterPrefill, setPendingNextAfterPrefill] = useState(false);
  
  const [showResubmitConfirmation, setShowResubmitConfirmation] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [showGoBackConfirmation, setShowGoBackConfirmation] = useState(false);

  const isPrefillLoading = activePrefillRequests > 0;
  const isWaitingForPrefillBeforeNext = pendingNextAfterPrefill && currentStep === 1;

  const handlePrefillLoadingEvent = (event: "start" | "end") => {
    setActivePrefillRequests((prev) =>
      event === "start" ? prev + 1 : Math.max(0, prev - 1),
    );
  };

  useEffect(() => {
    if (isWaitingForPrefillBeforeNext && !isPrefillLoading) {
      setPendingNextAfterPrefill(false);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isWaitingForPrefillBeforeNext, isPrefillLoading]);

  const dynamicGroups = mergeBasicInfoIntoFirstGroup(job.applicationFormSchema || []);

  const [formData, setFormData] = useState<ApplicationFormData>({
    step1: {
      applicantImage: null,
      requirements: {},
    },
    step2: { firstName: "", middleName: "", lastName: "", suffix: "", address: "", phone: "", email: "", educationalAttainment: "", courseDegree: "", schoolGraduated: "", hearAboutUs: "", hearAboutUsDetails: "", confirmCorrect: false },
    step3: { willingToBeAssignedInButuan: "", willingToBeAssignedInButuanDetails: "", willingToStartASAP: "", willingToStartASAPDetails: "", whyShouldWeHireYou: "", dataPrivacyConsent: false, confirmDetailsCorrect: false },
    applicationFormResponses: {},
  });

  const updateStep1 = (data: Partial<Step1Data>) => {
    setFormData((prev) => ({
      ...prev,
      step1: { ...prev.step1, ...data },
    }));
  };

  const updateDynamicResponses = (updates: Record<string, DynamicResponseValue>) => {
    setFormData((prev) => ({
      ...prev,
      applicationFormResponses: { ...prev.applicationFormResponses, ...updates },
    }));
  };

  const hasFormProgress = useCallback((): boolean => {
    const { step1, applicationFormResponses } = formData;
    if (step1.applicantImage) return true;
    if (Object.keys(step1.requirements).length > 0) return true;
    if (Object.keys(applicationFormResponses).length > 0) return true;
    return false;
  }, [formData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasFormProgress() && !showSuccessModal) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasFormProgress, showSuccessModal]);

  const handleGoBack = () => {
    if (hasFormProgress()) {
      setShowGoBackConfirmation(true);
    } else {
      window.location.href = "/";
    }
  };

  const validateStep1 = (): boolean => {
    const { step1 } = formData;
    if (!step1.applicantImage) return false;
    return requirements.every((req) => {
      const value = step1.requirements[req.id];
      if (!req.is_mandatory) return true;
      if (req.accepts_multiple) {
        return Array.isArray(value) && value.length > 0;
      } else {
        return typeof value === "string" && value.length > 0;
      }
    });
  };

  const validateDynamicStep = (groupIndex: number): boolean => {
    const group = dynamicGroups[groupIndex];
    if (!group || !group.items) return true;
    const enabledItems = group.items.filter((item) => item.isEnabled !== false);
    
    for (const item of enabledItems) {
      if (item.isMandatory) {
        const fieldKey = normalizeFieldKey(item.fieldKey || item.label || "");
        const value = formData.applicationFormResponses[fieldKey];
        if (item.type === 'multiCheckbox') {
            if (!Array.isArray(value) || value.length === 0) return false;
        } else if (item.type === 'consent') {
            if (!value) return false;
        } else {
            if (value === undefined || value === null || String(value).trim() === "") return false;
        }
      }
    }
    return true;
  };

  const canProceed = (): boolean => {
    if (currentStep === 1) return validateStep1();
    if (currentStep > 1 && currentStep <= dynamicGroups.length + 1) {
       return validateDynamicStep(currentStep - 2);
    }
    return false;
  };

  const totalSteps = dynamicGroups.length + 1;

  const handleNext = () => {
    if (!canProceed() || currentStep >= totalSteps) return;

    // If extraction is still running from step 1, wait there and move only when prefill is done.
    if (currentStep === 1 && isPrefillLoading) {
      setPendingNextAfterPrefill(true);
      return;
    }

    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getMappedValue = (keys: string[]) => {
      const responseEntries = Object.entries(formData.applicationFormResponses || {});
      const normalizedMap = new Map<string, DynamicResponseValue>();

      for (const [key, value] of responseEntries) {
        const normalized = normalizeFieldKey(key);
        if (!normalized) continue;
        if (!normalizedMap.has(normalized)) {
          normalizedMap.set(normalized, value);
        }
      }

      for (const k of keys) {
          if (formData.applicationFormResponses[k] !== undefined) {
              return formData.applicationFormResponses[k];
          }

          const normalized = normalizeFieldKey(k);
          if (!normalized) continue;

          if (normalizedMap.has(normalized)) {
            return normalizedMap.get(normalized);
          }
      }
      return "";
  };

  const submitApplication = async () => {
    setIsSubmitting(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_AI_SCREENING_API_URL || "http://localhost:3000";

      const getMappedString = (keys: string[]) => {
        const value = getMappedValue(keys);
        if (typeof value !== "string") return "";
        return value.trim();
      };

      const middleInitial = getMappedString(["middle_initial", "middle_name", "middleName"]);

      const step2 = {
        firstName: getMappedString(["first_name", "firstName"]),
        middleName: middleInitial,
        middleInitial,
        lastName: getMappedString(["last_name", "lastName"]),
        suffix: getMappedString(["suffix"]),
        email: getMappedString(["email"]),
        phone: getMappedString(["phone", "contact_number", "contactNumber"]),
        address: getMappedString(["address", "home_address"]),
        educationalAttainment: getMappedString(["educationalAttainment", "educational_attainment"]),
        courseDegree: getMappedString(["courseDegree", "course_degree"]),
        schoolGraduated: getMappedString(["schoolGraduated", "school_graduated", "school"]),
        hearAboutUs: getMappedString(["hearAboutUs", "hear_about_us"]),
        hearAboutUsDetails: getMappedString(["hearAboutUsDetails", "hear_about_us_details", "please_specify"]),
        confirmCorrect: true, 
      };

      const step3 = {
        willingToBeAssignedInButuan: getMappedString(["willingToBeAssignedInButuan", "willing_to_be_assigned_in_butuan"]),
        willingToBeAssignedInButuanDetails: getMappedString(["willingToBeAssignedInButuanDetails", "willing_to_be_assigned"]),
        willingToStartASAP: getMappedString(["willingToStartASAP", "willing_to_start_asap"]),
        willingToStartASAPDetails: getMappedString(["willingToStartASAPDetails"]),
        whyShouldWeHireYou: getMappedString(["whyShouldWeHireYou", "why_should_we_hire_you"]),
        dataPrivacyConsent: true,
        confirmDetailsCorrect: true,
      };

      const response = await fetch(`${API_BASE_URL}/api/external/submit-application`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          step1: formData.step1,
          step2,
          step3,
          applicationFormResponses: formData.applicationFormResponses,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      setShowSuccessModal(true);
      setShowResubmitConfirmation(false);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateDynamicStep(currentStep - 2)) return;

    if (showResubmitConfirmation) {
      await submitApplication();
      return;
    }

    setIsSubmitting(true);
    try {
      const email = getMappedValue(["email"]);
      const exists = email ? await checkExistingApplication(email, job.id) : false;

      if (exists) {
        setIsSubmitting(false);
        setShowResubmitConfirmation(true);
        return;
      }
      await submitApplication();
    } catch (error) {
      console.error("Error checking existing application:", error);
      await submitApplication();
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    window.location.href = "/";
  };

  const stepsHeader = [
    { number: 1, title: "Documents" },
    ...dynamicGroups.map((g, idx) => ({
       number: idx + 2, 
       title: g.title || g.id || `Step ${idx + 2}`,
       groupIndex: idx 
    }))
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center lg:hidden">
          <h1 className="text-[1rem] xl:text-[1.5rem] font-bold text-gray-900 mb-2">Apply for {job.title}</h1>
          <p className="text-[0.875rem] text-gray-600 mb-4">Complete all steps to submit your application</p>
          <button onClick={() => setShowJobDetailsModal(true)} className="text-sm text-blue-600 hover:underline font-medium">View Job Details</button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 lg:max-w-2xl">
            <button onClick={handleGoBack} className="inline-block text-black font-bold text-[0.875rem] mb-8">
              <ArrowLeft className="inline-block mr-2 w-4 h-4" /> Go Back
            </button>
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3">
                {stepsHeader.map((step) => {
                   const isPastAllowed = step.number === 1 || 
                     (step.number > 1 && validateStep1() && (step.number === 2 || validateDynamicStep(step.number - 3)));

                   return (
                     <button
                       key={step.number}
                       onClick={() => {
                         if (step.number <= currentStep || isPastAllowed) {
                           setCurrentStep(step.number);
                         }
                       }}
                       className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                         currentStep === step.number
                           ? "bg-black text-white"
                           : currentStep > step.number
                             ? "bg-accent text-white hover:scale-110 cursor-pointer"
                             : isPastAllowed ? "bg-gray-200 text-gray-700 cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                       }`}
                       disabled={step.number > currentStep && !isPastAllowed}
                     >
                       {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                     </button>
                   );
                })}
              </div>
            </div>

            <div className="bg-white md:rounded-2xl md:border border-slate-200 hover:border-black transition-all hover:shadow-md md:p-8 mb-6 relative">
              {currentStep === 1 && (
                <Step1Documents
                  data={formData.step1}
                  updateData={updateStep1}
                  requirements={requirements}
                  jobId={job.id}
                  onExtractedData={setExtractedData}
                  onPrefillLoadingEvent={handlePrefillLoadingEvent}
                />
              )}
              {currentStep > 1 && currentStep <= totalSteps && (
                <DynamicStep
                  group={dynamicGroups[currentStep - 2]}
                  responses={formData.applicationFormResponses}
                  updateResponses={updateDynamicResponses}
                  extractedData={extractedData}
                  isPrefillLoading={isPrefillLoading}
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <Button variant="outlined" onClick={handlePrev} disabled={currentStep === 1 || isWaitingForPrefillBeforeNext} rightIcon={<ChevronLeft className="w-5 h-5" />}>Previous</Button>
              {currentStep < totalSteps ? (
                <Button variant="primary" onClick={handleNext} disabled={!canProceed() || isWaitingForPrefillBeforeNext} isLoading={isWaitingForPrefillBeforeNext} rightIcon={<ChevronRight className="w-5 h-5" />}>
                  {isWaitingForPrefillBeforeNext ? "Preparing form" : "Next"}
                </Button>
              ) : (
                <Button variant="accent" onClick={handleSubmit} disabled={!canProceed()} isLoading={isSubmitting}>Submit Application</Button>
              )}
            </div>

            {isWaitingForPrefillBeforeNext && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm text-slate-700 mb-2">
                  Preparing your next form with auto-filled details...
                </p>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-linear-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse" />
                </div>
              </div>
            )}

            {!canProceed() && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">Please fill in all required fields before proceeding.</p>
              </div>
            )}
          </div>

          <div className="hidden lg:block lg:w-96 shrink-0">
            <div className="sticky top-8 space-y-6">
              <JobCard job={{ ...job, qualifications }} showApplyButton={false} showDescription={true} qualifications={qualifications} />
            </div>
          </div>
        </div>
      </div>

      <SuccessModal isOpen={showSuccessModal} onClose={handleSuccessClose} title="Application Submitted!" message={`Thank you for applying for ${job.title}. We have received your application and will review it shortly. You will be notified via email about the next steps.`} buttonText="Back to Home" />

      <ConfirmationModal isOpen={showResubmitConfirmation} onClose={() => { setShowResubmitConfirmation(false); window.location.href = "/"; }} onConfirm={handleSubmit} title="Existing Application Found" description={`We found an existing application for ${getMappedValue(["email"])} for this position. Do you want to resubmit your application?`} confirmText="Yes, Resubmit" cancelText="Cancel" variant="warning" isLoading={isSubmitting} />

      {showJobDetailsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 lg:hidden">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Job Details</h2>
              <button onClick={() => setShowJobDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-black" /></button>
            </div>
            <div className="overflow-hidden">
              <JobCard job={{ ...job, qualifications }} showApplyButton={false} showDescription={true} qualifications={qualifications} />
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal isOpen={showGoBackConfirmation} onClose={() => setShowGoBackConfirmation(false)} onConfirm={() => window.location.href = "/"} title="Leave Application?" description="You have unsaved progress. Are you sure you want to leave?" confirmText="Yes, Leave" cancelText="Stay" variant="warning" />
    </div>
  );
}
