export type JobStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
export type ApplicationStatus = "PENDING" | "QUALIFIED" | "UNQUALIFIED" | "WAITLISTED" | "INTERVIEW";

export interface JobPosting {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: JobStatus;
  deadline: Date | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface JobRequirement {
  id: string;
  name: string;
  is_mandatory: boolean;
  accepts_multiple: boolean;
  order: number;
}

// Application Form Types - Dynamic structure
export interface Step1Data {
  applicantImage: string | null; // Profile photo - separate from dynamic requirements
  // Dynamic requirements: { [requirementId]: fileUrl or fileUrls[] }
  requirements: Record<string, string | string[]>;
}

export interface Step2Data {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  address: string;
  phone: string;
  email: string;
  educationalAttainment: string;
  courseDegree: string;
  schoolGraduated: string;
  hearAboutUs: string;
  hearAboutUsDetails: string;
  confirmCorrect: boolean;
}

export interface Step3Data {
  willingToBeAssignedInButuan: string;
  willingToBeAssignedInButuanDetails: string;
  willingToStartASAP: string;
  willingToStartASAPDetails: string;
  whyShouldWeHireYou: string;
  dataPrivacyConsent: boolean;
  confirmDetailsCorrect: boolean;
}

export interface ApplicationFormData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
}
