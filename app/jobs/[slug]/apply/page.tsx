import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import type { JobPosting } from "@/lib/types";
import ApplicationForm from "@/components/ApplicationForm";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ApplyPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch job posting by slug
  const jobs = await query<JobPosting>(
    `SELECT 
      id, 
      title, 
      slug, 
      description, 
      status, 
      deadline, 
      created_by, 
      created_at, 
      updated_at 
    FROM job_posting 
    WHERE slug = $1 AND status = 'ACTIVE'`,
    [slug]
  );

  const job = jobs[0];

  if (!job) {
    notFound();
  }

  // Check if job is closed or deadline has passed (using Philippine Time UTC+8)
  // Allow applications on the deadline day until midnight PHT
  const now = new Date();
  const phtOffset = 8 * 60; // PHT is UTC+8
  const localOffset = now.getTimezoneOffset();
  const phtTime = new Date(now.getTime() + (phtOffset + localOffset) * 60 * 1000);
  const today = new Date(phtTime.getFullYear(), phtTime.getMonth(), phtTime.getDate());
  
  const deadlineDate = job.deadline ? new Date(job.deadline) : null;
  const deadlineDay = deadlineDate ? new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate()) : null;
  
  // Only close if we're past the deadline day (day after deadline)
  const isPastDeadline = deadlineDay && deadlineDay.getTime() < today.getTime();
  const isClosed = isPastDeadline;
  
  if (isClosed) {
    return (
      <div className="min-h-screen bg-linear-to-br flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Application Closed
          </h1>
          <p className="text-gray-600 mb-6">
            The application deadline for this position has passed.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            View Other Positions
          </Link>
        </div>
      </div>
    );
  }

  // Fetch job qualifications
  const qualifications = await query<{ qualification: string }>(
    `SELECT name as qualification FROM job_qualification WHERE job_posting_id = $1 ORDER BY "order" ASC`,
    [job.id]
  );

  const API_BASE_URL = process.env.NEXT_PUBLIC_AI_SCREENING_API_URL || "http://localhost:3000";
  let documentRequirements = [];
  try {
    const configRes = await fetch(`${API_BASE_URL}/api/external/job-form-config?jobId=${job.id}`);
    const configData = await configRes.json();
    if (configData.success && configData.job) {
      job.applicationFormSchema = configData.job.applicationFormSchema;
      documentRequirements = configData.job.documentRequirements || [];
    }
  } catch (error) {
    console.error("Failed to fetch job config:", error);
  }

  return (
    <ApplicationForm
      job={job}
      qualifications={qualifications.map((q) => q.qualification)}
      requirements={documentRequirements}
    />
  );
}
