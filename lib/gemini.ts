import { GoogleGenAI } from "@google/genai";
import type { AIScreeningResult } from "./types";

// Initialize Gemini client
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Extract structured personal information from document text
 */
export async function extractPersonalDataFromText(
  documentText: string
): Promise<{
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  educationalAttainment?: string;
  courseDegree?: string;
  schoolGraduated?: string;
  confidence: number;
}> {
  const prompt = `You are an expert at extracting structured information from resumes and CVs.

Analyze the following document text and extract personal information. Return ONLY a valid JSON object with the following structure:

{
  "firstName": "extracted first name or null",
  "middleName": "extracted middle name or null",
  "lastName": "extracted last name or null",
  "email": "extracted email or null",
  "phone": "extracted phone number or null",
  "address": "extracted complete address or null",
  "educationalAttainment": "highest educational level (e.g., 'College Graduate', 'High School Graduate', 'Completed Master's Degree') or null",
  "courseDegree": "course or degree name (e.g., 'Bachelor of Science in Medical Technology') or null",
  "schoolGraduated": "name of school/university or null",
  "confidence": 0.0 to 1.0 (overall confidence in extraction)
}

Important:
- Extract only what is clearly present in the document
- Use null for missing information
- For educationalAttainment, choose from: "High School Graduate", "Vocational", "College Level", "College Graduate", "Completed Master's Degree", "Vocational/TVET"
- Confidence should reflect how clear and complete the information is
- Return ONLY the JSON object, no additional text

Document text:
${documentText}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp", 
      contents: prompt,
    });
    
    const text = response.text || "";
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }
    
    const extracted = JSON.parse(jsonText);
    
    // Ensure confidence is present
    if (typeof extracted.confidence !== "number") {
      extracted.confidence = 0.5;
    }
    
    return extracted;
  } catch (error) {
    console.error("Error extracting personal data:", error);
    return { confidence: 0 };
  }
}

/**
 * Analyze a job application and provide screening results
 */
export async function analyzeApplication(params: {
  jobDescription: string;
  mandatoryCriteria: string[];
  softSkills: string[];
  expectedDocuments: string[];
  applicantData: {
    personalInfo: any;
    documents: { text: string; fileName: string }[];
    screeningAnswers: any;
  };
}): Promise<AIScreeningResult> {
  const prompt = `You are an expert HR recruiter analyzing job applications.

JOB DESCRIPTION:
${params.jobDescription}

MANDATORY CRITERIA (All must be met for qualification):
${params.mandatoryCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

SOFT SKILLS TO EVALUATE:
${params.softSkills.map((s, i) => `${i + 1}. ${s}`).join("\n")}

EXPECTED DOCUMENTS FOR THIS JOB:
${params.expectedDocuments.length > 0 
  ? params.expectedDocuments.map((doc, i) => `${i + 1}. "${doc}"`).join("\n")
  : "No specific document requirements defined."}

APPLICANT INFORMATION:
${JSON.stringify(params.applicantData.personalInfo, null, 2)}

SCREENING ANSWERS:
${JSON.stringify(params.applicantData.screeningAnswers, null, 2)}

SUBMITTED DOCUMENTS:
${params.applicantData.documents.length > 0 
  ? params.applicantData.documents.map(d => `--- DOCUMENT LABEL: "${d.fileName}" ---\n${d.text}\n--- END OF DOCUMENT ---`).join("\n\n")
  : "No documents were uploaded by the applicant."}

Analyze this application and return ONLY a valid JSON object with this exact structure:

{
  "intro": "A brief introduction acknowledging the applicant and the role.",
  "score": 0-100 (overall score),
  "title": "Brief title summarizing the decision",
  "status": "QUALIFIED" | "UNQUALIFIED" | "WAITLISTED",
  "description": "Short summary (1-2 sentences) of the decision",
  "documentAnalysis": [
    {
      "fileName": "Exact document label from input (e.g., 'Resume', 'Application Letter Addressed to: Dr. Terrence Anthony S. Vesagas')",
      "analysis": "Detailed analysis covering: (1) Does the submitted document match what's expected based on the label from the EXPECTED DOCUMENTS list? (2) What relevant information does it contain? (3) How does it support or fail to support the job requirements? For documents with specific addressees in the label, verify proper addressing."
    }
  ],
  "criteriaAnalysis": {
    "mandatoryCriteria": [
      {
        "criteria": "exact criteria text",
        "matched": true/false,
        "evidence": "specific evidence from documents (cite document labels when referencing)",
        "confidence": 0.0-1.0
      }
    ],
    "softSkills": [
      {
        "skill": "exact skill text",
        "score": 0-100,
        "evidence": "specific evidence from documents or answers (cite document labels when referencing)"
      }
    ]
  },
  "overallAnalysis": "A comprehensive paragraph analyzing the entire application. Combine insights from ALL documents and screening answers. Evaluate: (1) Whether all expected documents were submitted, (2) Whether submitted documents match their expected types based on the labels, (3) Consistency across all materials, (4) How well the applicant meets job requirements, (5) Document quality and professionalism. If documents are missing or don't match expectations, explicitly mention this.",
  "conclusion": "A concluding summary of the applicant's suitability."
}

IMPORTANT RULES FOR DOCUMENT ANALYSIS:
- **documentAnalysis**: MUST include an entry for EACH document submitted. Use the exact document label as the fileName.
- **Expected Documents Validation**: Compare the submitted documents against the EXPECTED DOCUMENTS list. Check if all required documents were submitted and if they match their expected types based on the labels.
- **Document Content Validation**: For each submitted document, verify the content matches what the label suggests it should contain. Use the label text itself to determine expectations.
- **Addressee Validation**: If a document label explicitly mentions who it should be addressed to (e.g., "Addressed to: Dr. John Doe"), verify the document is properly addressed to that specific person or entity.
- **Quality Assessment**: Evaluate professionalism, completeness, clarity, and relevance of each document.
- **Evidence Citation**: When referencing documents in criteriaAnalysis, always cite using the document label (e.g., "As shown in the Resume..." or "The Transcript of Records confirms...").
- **Missing Documents**: If any expected documents are missing, note this in the overallAnalysis and reduce the score accordingly.

QUALIFICATION RULES:
- Status is "QUALIFIED" ONLY if ALL mandatory criteria are matched with strong evidence AND all expected documents are submitted and match their types
- Status is "UNQUALIFIED" if any mandatory criteria is not matched OR if critical expected documents are missing OR if submitted documents don't match their expected types
- Status is "WAITLISTED" if criteria are borderline or need clarification
- Score should reflect overall fit (mandatory criteria + soft skills + screening answers + document completeness + document quality + document type matching)
- Provide specific evidence from the documents/answers, citing document labels when relevant
- Be thorough but fair in your assessment
- Return ONLY the JSON object, no additional text

SCORING SCALE (0-100):
- 0-35 (Poor Match): Missing primary mandatory requirements OR missing expected documents OR submitted documents don't match their expected types
- 36-60 (Partial Match): Has some mandatory requirements but lacks critical documentation, relevant experience, or required soft skills OR some expected documents are missing or don't match their labels
- 61-85 (Good Fit): Meets all mandatory requirements with proper documentation, all expected documents submitted and match their types, demonstrates solid professional competence
- 86-100 (Strong Match): Exceptional alignment; applicant provides comprehensive, high-quality documentation that perfectly matches all expected document types, with specific evidence of high-level performance or unique relevant skills`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });
    
    const text = response.text || "";
    
    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }
    
    const analysis = JSON.parse(jsonText);
    
    // Validate and ensure required fields
    return {
      score: analysis.score || 0,
      status: analysis.status || "WAITLISTED",
      title: analysis.title || "Analysis Complete",
      description: analysis.description || "",
      intro: analysis.intro || "Analysis of application.",
      documentAnalysis: analysis.documentAnalysis || [],
      overallAnalysis: analysis.overallAnalysis || "No overall analysis provided.",
      conclusion: analysis.conclusion || "Review completed.",
      criteriaAnalysis: analysis.criteriaAnalysis || {
        mandatoryCriteria: [],
        softSkills: [],
      },
    };
  } catch (error) {
    console.error("Error analyzing application:", error);
    throw new Error("Failed to analyze application");
  }
}

/**
 * Extract text from a PDF file URL using Gemini Vision
 */
export async function extractTextFromPDF(fileUrl: string): Promise<string> {
  try {
    // Fetch the PDF file
    const fetchResponse = await fetch(fileUrl);
    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64PDF = buffer.toString("base64");
    
    const prompt = "Extract all text from this PDF document. Return only the extracted text, preserving the structure and formatting as much as possible. Include all personal information like names, addresses, phone numbers, emails, education details, and work experience.";

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        { text: prompt },
        {
          inlineData: {
            data: base64PDF,
            mimeType: "application/pdf",
          },
        },
      ],
    });

    const text = aiResponse.text || "";
    return text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "";
  }
}

/**
 * Extract text from an image using Gemini Vision
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    // Fetch the image
    const fetchResponse = await fetch(imageUrl);
    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    
    // Determine mime type from URL
    const mimeType = imageUrl.toLowerCase().endsWith(".png")
      ? "image/png"
      : "image/jpeg";

    const prompt = "Extract all text from this image. Return only the extracted text, preserving the structure and formatting as much as possible. Include all personal information like names, addresses, phone numbers, emails, and other details.";

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        { text: prompt },
        {
          inlineData: {
            data: base64Image,
            mimeType,
          },
        },
      ],
    });

    const text = aiResponse.text || "";
    return text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    return "";
  }
}
