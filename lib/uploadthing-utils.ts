import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

// Helper to delete file from UploadThing
export async function deleteFileFromUT(fileUrl: string) {
  try {
    // Extract file key from URL
    // UploadThing URLs are like: https://utfs.io/f/[fileKey]
    const fileKey = fileUrl.split("/f/")[1];
    if (fileKey) {
      await utapi.deleteFiles(fileKey);
      console.log("Deleted file from UploadThing:", fileKey);
    }
  } catch (error) {
    console.error("Error deleting file from UploadThing:", error);
    // Don't throw - we don't want to block the upload if deletion fails
  }
}
