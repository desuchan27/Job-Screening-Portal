import { NextResponse } from "next/server";
import { extractTextFromPDF, extractTextFromImage, extractPersonalDataFromText } from "@/lib/gemini";
import type { ExtractedPersonalData } from "@/lib/types";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const stream = url.searchParams.get("stream") === "true";

  try {
    const body = await request.json();
    const { fileData, jobId } = body as { 
      fileData: { url: string; requirementId: string }[];
      jobId?: string;
    };

    if (!fileData || fileData.length === 0) {
      return NextResponse.json(
        { error: "No file data provided" },
        { status: 400 }
      );
    }

    // Fetch requirement names for all requirement IDs
    const requirementIds = [...new Set(fileData.map(f => f.requirementId).filter(id => id !== 'applicant-image'))];
    const requirementLabels = new Map<string, string>();
    
    if (requirementIds.length > 0) {
      const placeholders = requirementIds.map((_, i) => `$${i + 1}`).join(',');
      const requirementsResult = await query<{ id: string; name: string }>(
        `SELECT id, name FROM job_requirement WHERE id IN (${placeholders})`,
        requirementIds
      );
      requirementsResult.forEach(req => requirementLabels.set(req.id, req.name));
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
            sendUpdate(`Found ${fileData.length} document(s) to analyze`);

            const documents: { text: string; fileName: string }[] = [];
            
            // Analyze each document
            for (let i = 0; i < fileData.length; i++) {
              const { url: fileUrl, requirementId } = fileData[i];
              // Use requirement label or "Applicant Photo" for applicant image
              const fileName = requirementId === 'applicant-image' 
                ? 'Applicant Photo'
                : requirementLabels.get(requirementId) || fileUrl.split('/').pop() || `Document ${i + 1}`;
              
              sendUpdate(`Analyzing document ${i + 1}/${fileData.length}: ${fileName}`);

              let text = "";

              try {
                // Determine file type
                const headResponse = await fetch(fileUrl, { method: 'HEAD' });
                const contentType = headResponse.headers.get('content-type') || '';

                const lowerUrl = fileUrl.toLowerCase();
                const isPDF = lowerUrl.endsWith(".pdf") || contentType.includes('pdf');
                const isImage = lowerUrl.match(/\.(jpg|jpeg|png|gif|webp)$/) || contentType.startsWith('image/');

                if (isPDF) {
                  text = await extractTextFromPDF(fileUrl);
                } else if (isImage) {
                  text = await extractTextFromImage(fileUrl);
                } else {
                  // Try PDF first, then image
                  text = await extractTextFromPDF(fileUrl);
                  if (!text || text.length === 0) {
                    text = await extractTextFromImage(fileUrl);
                  }
                }
              } catch (error) {
                console.error(`Error processing file:`, error);
                sendUpdate(`⚠ Could not extract text from: ${fileName}`);
              }

              if (text && text.trim()) {
                documents.push({ text, fileName });
                sendUpdate(`✓ Completed analyzing: ${fileName}`);
              } else {
                sendUpdate(`⚠ No text found in: ${fileName}`);
              }
            }

            sendUpdate("Extracting personal information...");

            // Combine all document texts
            const combinedText = documents.map(d => d.text).join("\n\n---\n\n");

            if (!combinedText.trim()) {
              sendUpdate("Error: Could not extract text from any document");
              controller.close();
              return;
            }

            // Extract personal data using AI
            const extractedData: ExtractedPersonalData = await extractPersonalDataFromText(combinedText);

            const responseData = {
              ...extractedData,
            };

            sendUpdate("✓ Analysis complete!", responseData);
            controller.close();
          } catch (error) {
            console.error("Streaming document analysis error:", error);
            sendUpdate("Error: Failed to analyze documents", { error: String(error) });
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

    return NextResponse.json(
      { error: "Please use stream=true for this endpoint" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Document analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze documents",
      },
      { status: 500 }
    );
  }
}
