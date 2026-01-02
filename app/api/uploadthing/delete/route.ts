import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(request: Request) {
  try {
    const { fileUrl } = await request.json();

    if (!fileUrl) {
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 });
    }

    // Extract file key from URL
    // UploadThing URLs are like: https://utfs.io/f/[fileKey]
    const fileKey = fileUrl.split("/f/")[1];
    
    if (fileKey) {
      await utapi.deleteFiles(fileKey);
      return NextResponse.json({ success: true, message: "File deleted" });
    }

    return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
