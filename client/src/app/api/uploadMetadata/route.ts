import { NextRequest, NextResponse } from "next/server";
import { pinata } from "@/libs/pinata";

function cleanMetadata(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
    )
  );
}


export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("bannerImage") as File;
    const eventName = data.get("eventName") as string;
    const description = data.get("description") as string;
    const category = data.get("category") as string;
    const location = data.get("location") as string;
    const startDateTime = data.get("startDateTime") as string;
    const endDateTime = data.get("endDateTime") as string;
    const speakers = JSON.parse(data.get("speakers") as string);
    const organizedBy = data.get("organizedBy") as string;
    const communityName = data.get("communityName") as string;
    const requirementsToAttend = data.get("requirementsToAttend") as string;
    const whatsIncluded = data.get("whatsIncluded") as string;
    const agenda = data.get("agenda") as string;

    // Upload the banner image to Pinata
    const { cid: imageCID } = await pinata.upload.public.file(file);
    const imageUrl = `ipfs://${imageCID}`;
    const metadata = cleanMetadata({
      eventName,
      description,
      category,
      bannerImage: imageUrl,
      location,
      startDateTime,
      endDateTime,
      speakers,
      organizedBy,
      communityName: organizedBy === "community" ? communityName : undefined,
      requirementsToAttend,
      whatsIncluded,
      agenda,
    });

    const { cid: metadataCID } = await pinata.upload.public.json(metadata);
    const metadataUrl = await pinata.gateways.public.convert(metadataCID);

    return NextResponse.json({ metadataUrl }, { status: 200 });
  } catch (e) {
    console.error("Metadata upload error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
