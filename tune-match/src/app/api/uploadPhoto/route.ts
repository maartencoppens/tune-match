import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const { image } = (await request.json()) as { image?: string };

    if (!image) {
      return NextResponse.json(
        { error: "Geen afbeelding ontvangen" },
        { status: 400 },
      );
    }

    // Validate image is base64 string with correct format
    if (typeof image !== "string" || !image.startsWith("data:image")) {
      return NextResponse.json(
        { error: "Invalid image format. Must be base64 encoded." },
        { status: 400 },
      );
    }

    // Validate image size
    if (image.length > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Afbeelding te groot (max 10MB)" },
        { status: 413 },
      );
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "tunematch-photos",
    });

    const downloadUrl = cloudinary.url(uploadResult.public_id, {
      secure: true,
      flags: "attachment",
      resource_type: "image",
    });

    return NextResponse.json({
      imageUrl: uploadResult.secure_url,
      downloadUrl,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("[UPLOAD API] Error uploading photo:", {
      message: errorMessage,
      stack: errorStack,
    });

    // Check for specific error types
    if (errorMessage.includes("timeout")) {
      return NextResponse.json(
        { error: "Upload timeout. Please try again." },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { error: "Upload naar Cloudinary mislukt. Probeer later opnieuw." },
      { status: 500 },
    );
  }
}
