import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { analyzeApplication, extractTextFromPDF, extractTextFromImage } from "@/lib/gemini";
import type { AIScreeningResult } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicationId } = body as { applicationId: string };

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // Fetch application data
    const appResult = await query<any>(
      `SELECT * FROM job_application WHERE id = $1`,
      [applicationId]
    );

    if (appResult.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const application = appResult[0];

    // Fetch job posting
    const jobResult = await query<any>(
      `SELECT * FROM job_posting WHERE id = $1`,
      [application.job_posting_id]
    );

    if (jobResult.length === 0) {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }

    const job = jobResult[0];

    // Fetch mandatory criteria
    const criteriaResult = await query<{ criteria: string }>(
      `SELECT criteria FROM mandatory_criteria WHERE job_posting_id = $1`,
      [job.id]
    );
    const mandatoryCriteria = criteriaResult.map((row) => row.criteria);

    // Fetch soft skills
    const skillsResult = await query<{ skill: string }>(
      `SELECT skill FROM soft_skills WHERE job_posting_id = $1`,
      [job.id]
    );
    const softSkills = skillsResult.map((row) => row.skill);

    // Fetch all attachments
    const attachmentsResult = await query<{ file_url: string }>(
      `SELECT file_url FROM application_attachment WHERE job_application_id = $1`,
      [applicationId]
    );

    // Extract text from all documents
    const documentTexts: string[] = [];
    
    for (const attachment of attachmentsResult) {
      const fileUrl = attachment.file_url;
      let text = "";
      
      const lowerUrl = fileUrl.toLowerCase();
      
      if (lowerUrl.endsWith(".pdf")) {
        text = await extractTextFromPDF(fileUrl);
      } else if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        text = await extractTextFromImage(fileUrl);
      }
      
      if (text) {
        documentTexts.push(text);
      }
    }

    // Prepare applicant data for analysis
    const applicantData = {
      personalInfo: {
        firstName: application.first_name,
        middleName: application.middle_initial,
        lastName: application.last_name,
        email: application.email,
        phone: application.phone,
      },
      documents: documentTexts,
      screeningAnswers: {
        willingToBeAssignedInButuan: application.willing_to_be_assigned_in_butuan,
        willingToStartASAP: application.willing_to_start_asap,
        whyShouldWeHireYou: application.why_should_we_hire_you,
      },
    };

    // Analyze application using AI
    const analysis: AIScreeningResult = await analyzeApplication({
      jobDescription: job.description,
      mandatoryCriteria,
      softSkills,
      applicantData,
    });

    // Store AI analysis in database
    const analysisId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await query(
      `INSERT INTO ai_analysis (
        id, job_application_id, result_json, analysis, score, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        analysisId,
        applicationId,
        JSON.stringify(analysis),
        analysis.description,
        analysis.score,
      ]
    );

    // Note: Application status remains "PENDING" for HR manual review
    // AI analysis and score are stored but don't auto-update the status

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("AI screening error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform AI screening",
      },
      { status: 500 }
    );
  }
}
