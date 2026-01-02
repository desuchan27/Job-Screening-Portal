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
      WHERE status = $1 
      ORDER BY created_at DESC`,
      ['ACTIVE']
    );

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job postings' },
      { status: 500 }
    );
  }
}
