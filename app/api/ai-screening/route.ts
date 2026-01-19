import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { analyzeApplication, extractTextFromPDF, extractTextFromImage } from "@/lib/gemini";
import type { AIScreeningResult } from "@/lib/types";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const stream = url.searchParams.get("stream") === "true";

  try {
    const body = await request.json();
    const { applicationId } = body as { applicationId: string };

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // If streaming is requested, use Server-Sent Events
    if (stream) {
      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          const sendUpdate = (message: string, data?: any) => {
            const payload = { message, data, timestamp: new Date().toISOString() };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          };

          try {
            sendUpdate("Fetching application data...");

            // Fetch application data
            const appResult = await query<any>(
              `SELECT * FROM job_application WHERE id = $1`,
              [applicationId]
            );

            if (appResult.length === 0) {
              sendUpdate("Error: Application not found");
              controller.close();
              return;
            }

            const application = appResult[0];

            sendUpdate("Loading job requirements...");

            // Fetch job posting
            const jobResult = await query<any>(
              `SELECT * FROM job_posting WHERE id = $1`,
              [application.job_posting_id]
            );

            if (jobResult.length === 0) {
              sendUpdate("Error: Job posting not found");
              controller.close();
              return;
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

            // Fetch job requirements (expected document labels)
            const requirementsResult = await query<{ name: string }>(
              `SELECT DISTINCT jr.name
              FROM job_requirement jr
              INNER JOIN application_attachment aa ON aa.job_requirement_id = jr.id
              WHERE aa.job_application_id = $1`,
              [applicationId]
            );
            const expectedDocuments = requirementsResult.map((row) => row.name);

            // Fetch all attachments with requirement names
            const attachmentsResult = await query<{ 
              file_url: string; 
              file_name: string | null;
              requirement_name: string | null;
            }>(
              `SELECT 
                aa.file_url, 
                aa.file_name,
                jr.name as requirement_name
              FROM application_attachment aa
              LEFT JOIN job_requirement jr ON aa.job_requirement_id = jr.id
              WHERE aa.job_application_id = $1`,
              [applicationId]
            );

            sendUpdate(`Found ${attachmentsResult.length} document(s) to analyze`);
            console.log(`[AI Screening] Found ${attachmentsResult.length} attachments for application ${applicationId}`);

            // Extract text from all documents
            const documents: { text: string; fileName: string }[] = [];
            
            for (let i = 0; i < attachmentsResult.length; i++) {
              const attachment = attachmentsResult[i];
              const fileUrl = attachment.file_url;
              // Use requirement name (e.g., "Resume", "Diploma") or fall back to filename
              const fileName = attachment.requirement_name || attachment.file_name || fileUrl.split('/').pop() || "Document";
              
              sendUpdate(`Analyzing document ${i + 1}/${attachmentsResult.length}: ${fileName}`);
              console.log(`[AI Screening] Processing document ${i + 1}: ${fileName}, URL: ${fileUrl}`);
              
              let text = "";
              
              try {
                // For UploadThing URLs without extensions, check Content-Type header
                const headResponse = await fetch(fileUrl, { method: 'HEAD' });
                const contentType = headResponse.headers.get('content-type') || '';
                console.log(`[AI Screening] Content-Type for ${fileName}: ${contentType}`);
                
                const isPDF = contentType.includes('pdf');
                const isImage = contentType.startsWith('image/');
                
                if (isPDF) {
                  console.log(`[AI Screening] Extracting from PDF: ${fileName}`);
                  text = await extractTextFromPDF(fileUrl);
                  console.log(`[AI Screening] PDF extraction result: ${text.length} characters`);
                } else if (isImage) {
                  console.log(`[AI Screening] Extracting from image: ${fileName}`);
                  text = await extractTextFromImage(fileUrl);
                  console.log(`[AI Screening] Image extraction result: ${text.length} characters`);
                } else {
                  // Unknown type - try both
                  console.log(`[AI Screening] Unknown content type, trying both methods for: ${fileName}`);
                  text = await extractTextFromPDF(fileUrl);
                  if (!text || text.trim().length === 0) {
                    console.log(`[AI Screening] PDF failed, trying image extraction...`);
                    text = await extractTextFromImage(fileUrl);
                  }
                  console.log(`[AI Screening] Fallback extraction result: ${text.length} characters`);
                }
              } catch (error) {
                console.error(`[AI Screening] Error extracting text from ${fileName}:`, error);
                sendUpdate(`⚠ Error extracting text from: ${fileName}`);
              }
              
              if (text && text.trim()) {
                documents.push({ text, fileName });
                sendUpdate(`✓ Completed analyzing: ${fileName}`);
                console.log(`[AI Screening] Successfully added document: ${fileName} (${text.length} chars)`);
              } else {
                sendUpdate(`⚠ Could not extract text from: ${fileName}`);
                console.warn(`[AI Screening] No text extracted from: ${fileName}`);
              }
            }

            console.log(`[AI Screening] Extracted text from ${documents.length} documents`);
            console.log(`[AI Screening] Document labels:`, documents.map(d => d.fileName));

            sendUpdate("Running AI screening analysis...");

            // Prepare applicant data for analysis
            const applicantData = {
              personalInfo: {
                firstName: application.first_name,
                middleName: application.middle_initial,
                lastName: application.last_name,
                email: application.email,
                phone: application.phone,
              },
              documents,
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
              expectedDocuments,
              applicantData,
            });

            sendUpdate("Saving analysis results...");

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

            sendUpdate("✓ Analysis complete!", { analysis });
            controller.close();
          } catch (error) {
            console.error("Streaming AI screening error:", error);
            sendUpdate("Error: Failed to perform AI screening", { error: String(error) });
            controller.close();
          }
        },
      });

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Non-streaming mode (original behavior)
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

    // Fetch job requirements (expected document labels)
    const requirementsResult = await query<{ name: string }>(
      `SELECT DISTINCT jr.name
      FROM job_requirement jr
      INNER JOIN application_attachment aa ON aa.job_requirement_id = jr.id
      WHERE aa.job_application_id = $1`,
      [applicationId]
    );
    const expectedDocuments = requirementsResult.map((row) => row.name);

    // Fetch all attachments with requirement names
    const attachmentsResult = await query<{ 
      file_url: string; 
      file_name: string | null;
      requirement_name: string | null;
    }>(
      `SELECT 
        aa.file_url, 
        aa.file_name,
        jr.name as requirement_name
      FROM application_attachment aa
      LEFT JOIN job_requirement jr ON aa.job_requirement_id = jr.id
      WHERE aa.job_application_id = $1`,
      [applicationId]
    );

    // Extract text from all documents
    const documents: { text: string; fileName: string }[] = [];
    
    for (const attachment of attachmentsResult) {
      const fileUrl = attachment.file_url;
      // Use requirement name (e.g., "Resume", "Diploma") or fall back to filename
      const fileName = attachment.requirement_name || attachment.file_name || fileUrl.split('/').pop() || "Document";
      let text = "";
      
      try {
        // For UploadThing URLs without extensions, check Content-Type header
        const headResponse = await fetch(fileUrl, { method: 'HEAD' });
        const contentType = headResponse.headers.get('content-type') || '';
        
        const isPDF = contentType.includes('pdf');
        const isImage = contentType.startsWith('image/');
        
        if (isPDF) {
          text = await extractTextFromPDF(fileUrl);
        } else if (isImage) {
          text = await extractTextFromImage(fileUrl);
        } else {
          // Unknown type - try both
          text = await extractTextFromPDF(fileUrl);
          if (!text || text.trim().length === 0) {
            text = await extractTextFromImage(fileUrl);
          }
        }
      } catch (error) {
        console.error(`[AI Screening] Error extracting text from ${fileName}:`, error);
      }
      
      if (text && text.trim()) {
        documents.push({ text, fileName });
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
      documents,
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
      expectedDocuments,
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
