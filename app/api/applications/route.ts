import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, step1, step2, step3 } = body;

    // Generate unique ID for application
    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare data for job_application table
    const willingToBeAssignedInButuan =
      step3.willingToBeAssignedInButuan === "Other"
        ? step3.willingToBeAssignedInButuanDetails
        : step3.willingToBeAssignedInButuan;

    const willingToStartASAP =
      step3.willingToStartASAP === "Other"
        ? step3.willingToStartASAPDetails
        : step3.willingToStartASAP;

    // Find resume URL from requirements (assuming there's a requirement named "Resume")
    let resumeUrl = "";
    for (const [reqId, value] of Object.entries(step1.requirements)) {
      if (typeof value === "string" && value) {
        resumeUrl = value; // Use first single file as resume
        break;
      }
    }

    // Insert job application
    await query(
      `INSERT INTO job_application (
        id,
        job_posting_id,
        status,
        first_name,
        middle_initial,
        last_name,
        email,
        phone,
        applicant_image,
        willing_to_be_assigned_in_butuan,
        willing_to_start_asap,
        why_should_we_hire_you,
        data_privacy_consent,
        resume_url,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())`,
      [
        applicationId,
        jobId,
        "PENDING",
        step2.firstName,
        step2.middleName || null,
        step2.lastName,
        step2.email,
        step2.phone,
        step1.applicantImage || null,
        willingToBeAssignedInButuan,
        willingToStartASAP,
        step3.whyShouldWeHireYou,
        step3.dataPrivacyConsent,
        resumeUrl,
      ]
    );

    // Insert application attachments dynamically
    for (const [requirementId, value] of Object.entries(step1.requirements)) {
      if (!value) continue;

      if (Array.isArray(value)) {
        // Multiple files
        for (const fileUrl of value) {
          const attachmentId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await query(
            `INSERT INTO application_attachment (
              id,
              job_application_id,
              job_requirement_id,
              file_url,
              created_at,
              updated_at
            ) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [attachmentId, applicationId, requirementId, fileUrl]
          );
        }
      } else if (typeof value === "string") {
        // Single file
        const attachmentId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await query(
          `INSERT INTO application_attachment (
            id,
            job_application_id,
            job_requirement_id,
            file_url,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [attachmentId, applicationId, requirementId, value]
        );
      }
    }

    // Trigger AI screening asynchronously (don't wait for it)
    fetch(`${request.url.replace('/applications', '/ai-screening')}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId }),
    }).catch((error) => {
      console.error("AI screening failed:", error);
      // Don't fail the application submission if AI screening fails
    });

    return NextResponse.json({
      success: true,
      applicationId,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit application",
      },
      { status: 500 }
    );
  }
}

