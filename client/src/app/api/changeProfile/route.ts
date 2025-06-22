import { NextResponse, NextRequest } from "next/server";
import cloudinary from "@/libs/cloudinary";
import{ v4 as uuidv4 } from "uuid";
import User from "@/models/User.models";
import connectDB from "@/libs/connectDB";

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    await connectDB();
    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
        const res = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            public_id: uuidv4(),
          },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });

    const url = (res as any).secure_url;
    if (!url) {
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    const walletAddress = formData.get("walletAddress") as string;
    if (!walletAddress) {
        return NextResponse.json({ error: "No wallet address provided" }, { status: 400 });
    }

    await User.findOneAndUpdate(
        { walletAddress },
        { profilePicture: url },
        { new: true }
    );

    return NextResponse.json({ success: true , url});
        
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
        
    }
}