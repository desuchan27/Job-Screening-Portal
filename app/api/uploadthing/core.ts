import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // PDF uploader for documents
  pdfUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      console.log("PDF uploaded:", file.url);
      return { url: file.url };
    }),

  // Image uploader for 1x1 photo
  imageUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      console.log("Image uploaded:", file.url);
      return { url: file.url };
    }),

  // Multiple certificates uploader
  certificatesUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 10 } })
    .onUploadComplete(async ({ file }) => {
      console.log("Certificate uploaded:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
