"use client";

import { Upload, FileText, X, CheckCircle2, Eye } from "lucide-react";
import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/buttons/button";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";
import type {
  Step1Data,
  JobRequirement,
  ExtractedPersonalData,
} from "@/lib/types";

interface Step1Props {
  data: Step1Data;
  updateData: (data: Partial<Step1Data>) => void;
  requirements: JobRequirement[];
  onExtractedData: (data: ExtractedPersonalData) => void;
}

export default function Step1Documents({
  data,
  updateData,
  requirements,
  onExtractedData,
}: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Required Documents
        </h2>
        <p className="text-gray-600">
          Please upload all required documents. Files marked with * are
          mandatory.
        </p>
      </div>

      {/* Applicant Photo - Always first */}
      <ApplicantImageUpload
        value={data.applicantImage}
        onChange={(url) => updateData({ applicantImage: url })}
      />

      {/* Dynamic Requirements */}
      {requirements.map((requirement) => (
        <DynamicFileUpload
          key={requirement.id}
          requirement={requirement}
          value={data.requirements[requirement.id]}
          onChange={(value) =>
            updateData({
              requirements: {
                ...data.requirements,
                [requirement.id]: value,
              },
            })
          }
          onUploadComplete={(url) => {
             console.log("Upload complete for:", requirement.name, url);
             // Check if this is a resume or cv to trigger extraction
             if (
               requirement.name.toLowerCase().includes("resume") ||
               requirement.name.toLowerCase().includes("cv") ||
               requirement.name.toLowerCase().includes("curriculum vitae")
             ) {
                console.log("Triggering analysis for:", requirement.name);
                // Determine type for hint
                // Determine type for hint
                const typeHint = requirement.file_type || "pdf"; 
                analyzeDocuments([url], onExtractedData, typeHint);
             }
          }}
        />
      ))}
    </div>
  );
}

// Applicant Image Upload Component
interface ApplicantImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

function ApplicantImageUpload({ value, onChange }: ApplicantImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { startUpload } = useUploadThing("imageUploader");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Delete old file if exists
      if (value) {
        await fetch("/api/uploadthing/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl: value }),
        });
      }

      const result = await startUpload([file]);
      if (result && result[0]) {
        onChange(result[0].url);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
      <label className="text-sm font-semibold text-blue-900">
        Applicant Photo (1x1 or 2x2)
        <span className="text-red-500 ml-1">*</span>
      </label>
      <p className="text-xs text-blue-700 mb-2">
        Please upload a recent 1x1 photo
      </p>

      {value ? (
        // Success State - Only show uploaded photo with actions
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-green-300">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-green-400">
            <img
              src={value}
              alt="Applicant"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm font-semibold text-green-900">
                Photo uploaded successfully
              </p>
            </div>
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                  <Upload className="w-3 h-3" />
                  Change Photo
                </span>
              </label>
              <button
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                type="button"
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Upload State
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition-colors bg-white">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <>
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-700">
                Uploading your photo...
              </p>
              <p className="text-xs text-gray-500 mt-1">Please wait</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-blue-400 mb-3" />
              <p className="text-sm font-semibold text-gray-900">
                Click to upload your photo
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Image files (Max 2MB)
              </p>
            </>
          )}
        </label>
      )}

      {showPreview && value && (
        <FilePreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          fileUrl={value}
          fileName="Applicant Photo"
          fileType="image"
        />
      )}
    </div>
  );
}

// Dynamic File Upload Component
interface DynamicFileUploadProps {
  requirement: JobRequirement;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  onUploadComplete?: (url: string) => void;
}

function DynamicFileUpload({
  requirement,
  value,
  onChange,
  onUploadComplete,
}: DynamicFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Determine endpoint based on file type
  let endpoint = "pdfUploader";
  if (requirement.file_type === "image") {
    endpoint = requirement.accepts_multiple
      ? "multipleImageUploader"
      : "imageUploader";
  } else {
    // pdf (or default)
    endpoint = requirement.accepts_multiple
      ? "certificatesUploader"
      : "pdfUploader";
  }

  const { startUpload } = useUploadThing(endpoint as any);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Delete old file if replacing single file
      if (!requirement.accepts_multiple && typeof value === "string" && value) {
        await fetch("/api/uploadthing/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl: value }),
        });
      }

      const result = await startUpload(files);
      if (!result) return;

      if (requirement.accepts_multiple) {
        // Add to existing array
        const currentUrls = Array.isArray(value) ? value : [];
        const newUrls = result.map((r) => r.url);
        onChange([...currentUrls, ...newUrls]);
        // Trigger completion for the last uploaded file (or all if we supported batched analysis)
        if (onUploadComplete && result.length > 0) {
           onUploadComplete(result[result.length - 1].url);
        }
      } else {
        // Single file
        onChange(result[0].url);
        if (onUploadComplete) {
           onUploadComplete(result[0].url);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (index?: number) => {
    if (requirement.accepts_multiple && typeof index === "number") {
      const currentUrls = Array.isArray(value) ? value : [];
      const urlToDelete = currentUrls[index];

      // Delete from UploadThing
      if (urlToDelete) {
        await fetch("/api/uploadthing/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl: urlToDelete }),
        });
      }

      onChange(currentUrls.filter((_, i) => i !== index));
    } else if (typeof value === "string") {
      // Delete single file
      await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: value }),
      });
      onChange(requirement.accepts_multiple ? [] : "");
    }
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setShowPreview(true);
  };

  const fileType = requirement.file_type || "pdf";

  const accept = fileType === "image" ? "image/*" : ".pdf";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {requirement.name}
        {requirement.is_mandatory && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      {/* Display uploaded files */}
      {requirement.accepts_multiple ? (
        // Multiple files display
        <div className="space-y-3">
          {/* Add Files Button - Always on top */}
          <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <input
              type="file"
              accept={accept}
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-600">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {value && Array.isArray(value) && value.length > 0
                    ? "Add more files"
                    : "Click to upload files"}
                </span>
              </>
            )}
          </label>

          {/* List of uploaded files */}
          {Array.isArray(value) && value.length > 0 && (
            <div className="space-y-2">
              {value.map((url, index) => {
                // Extract filename from URL
                const filename = url.split("/").pop() || `File ${index + 1}`;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {requirement.name} {index + 1}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {filename}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept={accept}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setIsUploading(true);
                            try {
                              // Delete old file
                              await fetch("/api/uploadthing/delete", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ fileUrl: url }),
                              });

                              // Upload new file
                              const result = await startUpload([file]);
                              if (result && result[0]) {
                                const currentUrls = Array.isArray(value)
                                  ? value
                                  : [];
                                const newUrls = [...currentUrls];
                                newUrls[index] = result[0].url;
                                onChange(newUrls);
                                
                                if (onUploadComplete) {
                                   onUploadComplete(result[0].url);
                                }
                              }
                            } catch (error) {
                              console.error("Upload error:", error);
                              alert("Failed to upload file. Please try again.");
                            } finally {
                              setIsUploading(false);
                            }
                          }}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                          <Upload className="w-3 h-3" />
                          Change
                        </span>
                      </label>
                      <button
                        onClick={() => handlePreview(url)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                        type="button"
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleRemove(index)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                        type="button"
                      >
                        <X className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Single file display
        <>
          {typeof value === "string" && value ? (
            // Success State
            <div className="flex items-center gap-3 p-4 bg-white border-2 border-green-300 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-900 mb-2">
                  File uploaded successfully
                </p>
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept={accept}
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                      <Upload className="w-3 h-3" />
                      Change File
                    </span>
                  </label>
                  <button
                    onClick={() => handlePreview(value)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    type="button"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Upload State
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <input
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <>
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload file
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {fileType === "image" ? "Image files" : "PDF"} (Max 4MB)
                  </p>
                </>
              )}
            </label>
          )}
        </>
      )}

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <FilePreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          fileUrl={previewUrl}
          fileName={requirement.name}
          fileType={fileType}
        />
      )}
    </div>
  );
}

// Helper function to analyze documents
async function analyzeDocuments(
  fileUrls: string[],
  onExtractedData: (data: ExtractedPersonalData) => void,
  typeHint: string = "pdf"
) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_AI_SCREENING_API_URL || "http://localhost:3000";

  try {
    console.log("Analyzing documents:", fileUrls);
    // Process the first file (assuming resume is first or you iterate)
    const fileUrl = fileUrls[0];
    if (!fileUrl) return;

    // WORKAROUND: External API requires .pdf or image extension in URL string
    // Append a dummy fragment to satisfy the check without breaking the URL
    let finalUrl = fileUrl;
    if (typeHint === "pdf" && !fileUrl.toLowerCase().includes(".pdf")) {
        finalUrl += "#.pdf";
    } else if (typeHint === "image" && !fileUrl.match(/\.(jpg|jpeg|png|webp)/i)) {
        finalUrl += "#.jpg";
    }

    console.log("Fetching extraction from:", `${API_BASE_URL}/api/external/extract-personal-data`, "with URL:", finalUrl);
    
    const response = await fetch(
      `${API_BASE_URL}/api/external/extract-personal-data`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: finalUrl }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        onExtractedData(result.data);
      }
    } else {
        const errorText = await response.text();
        console.error("External API extraction failed:", response.status, errorText);
    }
  } catch (error) {
    console.error("Document analysis error:", error);
    // Silently fail - don't disrupt user experience
  }
}
