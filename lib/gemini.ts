import { GoogleGenAI } from "@google/genai";

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
      model: "gemini-2.5-flash",
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
  applicantData: {
    personalInfo: any;
    documents: string[];
    screeningAnswers: any;
  };
}): Promise<{
  score: number;
  status: "QUALIFIED" | "UNQUALIFIED" | "WAITLISTED";
  title: string;
  description: string;
  criteriaAnalysis: {
    mandatoryCriteria: Array<{
      criteria: string;
      matched: boolean;
      evidence: string;
      confidence: number;
    }>;
    softSkills: Array<{
      skill: string;
      score: number;
      evidence: string;
    }>;
  };
}> {
  const prompt = `You are an expert HR recruiter analyzing job applications.

JOB DESCRIPTION:
${params.jobDescription}

MANDATORY CRITERIA (All must be met for qualification):
${params.mandatoryCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

SOFT SKILLS TO EVALUATE:
${params.softSkills.map((s, i) => `${i + 1}. ${s}`).join("\n")}

APPLICANT INFORMATION:
${JSON.stringify(params.applicantData, null, 2)}

APPLICANT'S DOCUMENTS:
${params.applicantData.documents.join("\n\n---\n\n")}

Analyze this application and return ONLY a valid JSON object with this exact structure:

{
  "score": 0-100 (overall score),
  "status": "QUALIFIED" | "UNQUALIFIED" | "WAITLISTED",
  "title": "Brief title summarizing the decision",
  "description": "Detailed explanation of why the applicant is qualified/unqualified",
  "criteriaAnalysis": {
    "mandatoryCriteria": [
      {
        "criteria": "exact criteria text",
        "matched": true/false,
        "evidence": "specific evidence from application",
        "confidence": 0.0-1.0
      }
    ],
    "softSkills": [
      {
        "skill": "exact skill text",
        "score": 0-100,
        "evidence": "specific evidence from application"
      }
    ]
  }
}

IMPORTANT RULES:
- Status is "QUALIFIED" ONLY if ALL mandatory criteria are matched
- Status is "UNQUALIFIED" if any mandatory criteria is not matched
- Status is "WAITLISTED" if criteria are borderline or need clarification
- Score should reflect overall fit (mandatory criteria + soft skills + screening answers)
- Provide specific evidence from the documents/answers
- Be thorough but fair in your assessment
- Return ONLY the JSON object, no additional text`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
      status: analysis.status || "PENDING",
      title: analysis.title || "Analysis Complete",
      description: analysis.description || "",
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
      model: "gemini-2.5-flash",
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
      model: "gemini-2.5-flash",
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
