"use server";

import { query } from "@/lib/db";

export async function checkExistingApplication(
  email: string,
  jobId: string,
  batchId: string | null = null
) {
  try {
    const existing = await query<{ id: string }>(
      `SELECT id FROM job_application 
       WHERE email = $1 
       AND job_posting_id = $2 
       AND (batch_id = $3 OR ($3 IS NULL AND batch_id IS NULL))
       LIMIT 1`,
      [email, jobId, batchId]
    );
    return existing.length > 0;
  } catch (error) {
    console.error("Error checking existing application:", error);
    throw new Error("Failed to check existing application");
  }
}
