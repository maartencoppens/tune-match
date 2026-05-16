import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Geen afbeelding ontvangen" },
        { status: 400 },
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
    console.error(error);

    return NextResponse.json(
      { error: "Upload naar Cloudinary mislukt" },
      { status: 500 },
    );
  }
}
