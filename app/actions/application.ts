"use server";

import { query } from "@/lib/db";

export async function checkExistingApplication(email: string, jobId: string) {
  try {
    const existing = await query<{ id: string }>(
      `SELECT id FROM job_application WHERE email = $1 AND job_posting_id = $2 LIMIT 1`,
      [email, jobId]
    );
    return existing.length > 0;
  } catch (error) {
    console.error("Error checking existing application:", error);
    throw new Error("Failed to check existing application");
  }
}
