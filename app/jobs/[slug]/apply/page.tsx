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
    WHERE slug = $1 AND status IN ('ACTIVE', 'CLOSED')`,
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
  
  // Only close if we're past the deadline day (day after deadline) or status is CLOSED
  const isPastDeadline = deadlineDay && deadlineDay.getTime() < today.getTime();
  const isClosed = job.status === 'CLOSED' || isPastDeadline;
  
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
    `SELECT qualification FROM job_qualifications WHERE job_posting_id = $1 ORDER BY created_at`,
    [job.id]
  );

  // Fetch job requirements (document upload requirements)
  const requirements = await query<{
    id: string;
    name: string;
    is_mandatory: boolean;
    accepts_multiple: boolean;
    file_type: "image" | "pdf";
    order: number;
  }>(
    `SELECT id, name, is_mandatory, accepts_multiple, file_type, "order" 
     FROM job_requirement 
     ORDER BY "order" ASC, created_at ASC`
  );

  return (
    <ApplicationForm
      job={job}
      qualifications={qualifications.map((q) => q.qualification)}
      requirements={requirements}
    />
  );
}
