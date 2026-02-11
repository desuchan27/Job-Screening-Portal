import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { JobPosting } from '@/lib/types';

export async function GET() {
  try {
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
      WHERE status IN ('ACTIVE', 'CLOSED') 
      ORDER BY created_at DESC`
    );

    // Fetch qualifications for each job
    const jobsWithQualifications = await Promise.all(
      jobs.map(async (job) => {
        const qualifications = await query<{ qualification: string }>(
          `SELECT qualification FROM job_qualifications WHERE job_posting_id = $1 ORDER BY created_at`,
          [job.id]
        );
        
        return {
          ...job,
          qualifications: qualifications.map(q => q.qualification)
        };
      })
    );

    return NextResponse.json(jobsWithQualifications);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job postings' },
      { status: 500 }
    );
  }
}
