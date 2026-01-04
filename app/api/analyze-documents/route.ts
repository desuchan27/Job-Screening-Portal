import { NextResponse } from "next/server";
import { extractTextFromPDF, extractTextFromImage, extractPersonalDataFromText } from "@/lib/gemini";
import type { ExtractedPersonalData } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileUrls } = body as { fileUrls: string[] };

    if (!fileUrls || fileUrls.length === 0) {
      return NextResponse.json(
        { error: "No file URLs provided" },
        { status: 400 }
      );
    }

    console.log(`[Document Analysis] Processing ${fileUrls.length} files`);

    // Extract text from all documents
    const documentTexts: string[] = [];
    
    for (const fileUrl of fileUrls) {
      let text = "";
      
      console.log(`[Document Analysis] Processing file: ${fileUrl.substring(0, 100)}...`);
      
      try {
        // First, try to determine file type from Content-Type header
        const headResponse = await fetch(fileUrl, { method: 'HEAD' });
        const contentType = headResponse.headers.get('content-type') || '';
        
        console.log(`[Document Analysis] Content-Type: ${contentType}`);
        
        // Determine file type from URL extension or Content-Type
        const lowerUrl = fileUrl.toLowerCase();
        const isPDF = lowerUrl.endsWith(".pdf") || contentType.includes('pdf');
        const isImage = lowerUrl.match(/\.(jpg|jpeg|png|gif|webp)$/) || contentType.startsWith('image/');
        
        if (isPDF) {
          console.log(`[Document Analysis] Extracting text from PDF...`);
          text = await extractTextFromPDF(fileUrl);
          console.log(`[Document Analysis] PDF text extracted: ${text.length} characters`);
        } else if (isImage) {
          console.log(`[Document Analysis] Extracting text from image...`);
          text = await extractTextFromImage(fileUrl);
          console.log(`[Document Analysis] Image text extracted: ${text.length} characters`);
        } else {
          // If we can't determine type, try PDF first, then image
          console.log(`[Document Analysis] Unknown file type, trying PDF first...`);
          text = await extractTextFromPDF(fileUrl);
          
          if (!text || text.length === 0) {
            console.log(`[Document Analysis] PDF extraction failed, trying image...`);
            text = await extractTextFromImage(fileUrl);
          }
          
          console.log(`[Document Analysis] Fallback extraction: ${text.length} characters`);
        }
      } catch (error) {
        console.error(`[Document Analysis] Error processing file:`, error);
      }
      
      if (text && text.trim()) {
        documentTexts.push(text);
      }
    }

    // Combine all document texts
    const combinedText = documentTexts.join("\n\n---\n\n");
    
    console.log(`[Document Analysis] Total extracted text: ${combinedText.length} characters`);

    if (!combinedText.trim()) {
      console.error(`[Document Analysis] No text could be extracted from any document`);
      return NextResponse.json(
        { error: "Could not extract text from documents" },
        { status: 400 }
      );
    }

    // Extract personal data using AI
    const extractedData: ExtractedPersonalData = await extractPersonalDataFromText(combinedText);

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
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
