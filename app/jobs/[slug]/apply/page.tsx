import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import type { JobPosting } from "@/lib/types";
import ApplicationForm from "@/components/ApplicationForm";

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
    WHERE slug = $1 AND status = $2`,
    [slug, "ACTIVE"]
  );

  const job = jobs[0];

  if (!job) {
    notFound();
  }

  // Check if deadline has passed
  if (job.deadline && new Date(job.deadline) < new Date()) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Application Closed
          </h1>
          <p className="text-gray-600 mb-6">
            The application deadline for this position has passed.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Other Positions
          </a>
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
