"use client";

import { X, Download, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/buttons/button";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileType: "pdf" | "image";
}

export function FilePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileType,
}: FilePreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {fileType === "pdf" ? (
              <FileText className="w-5 h-5 text-red-600" />
            ) : (
              <ImageIcon className="w-5 h-5 text-blue-600" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">{fileName}</h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Button variant="ghost" size="sm" iconOnly>
                <Download className="w-4 h-4" />
              </Button>
            </a>
            <Button variant="ghost" size="sm" iconOnly onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {fileType === "pdf" ? (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                fileUrl
              )}&embedded=true`}
              className="w-full h-full min-h-[600px] rounded-lg bg-white"
              title={fileName}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            Open in new tab
          </a>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
