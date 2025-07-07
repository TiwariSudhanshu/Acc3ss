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
    const speakersData = data.get("speakers") as string;
    const organizedBy = data.get("organizedBy") as string;
    const communityName = data.get("communityName") as string;
    const requirementsToAttend = data.get("requirementsToAttend") as string;
    const whatsIncluded = data.get("whatsIncluded") as string;
    const agenda = data.get("agenda") as string;

    const { cid: imageCID } = await pinata.upload.public.file(file);
    const imageUrl = `ipfs://${imageCID}`;

    let speakers = [];
    try {
      speakers = JSON.parse(speakersData);
    } catch (e) {
      console.error("Error parsing speakers data:", e);
      speakers = [];
    }

const processedSpeakers = await Promise.all(
  speakers.map(async (speaker: any) => {
    const speakerImageKey = `speakerImage_${speaker.id}`;
    const speakerImageFile = data.get(speakerImageKey) as File;

    if (speakerImageFile && speakerImageFile.size > 0) {
      try {
        const { cid: speakerImageCID } = await pinata.upload.public.file(speakerImageFile);
        const speakerImageUrl = `ipfs://${speakerImageCID}`;
        
        return {
          ...speaker,
          avatar: speakerImageUrl
        };
      } catch (error) {
        console.error(`Error uploading speaker image for ${speaker.id}:`, error);
      }
    }

    return {
      ...speaker,
      avatar: speaker.avatar || ''
    };
  })
);


    const metadata = cleanMetadata({
      eventName,
      description,
      category,
      bannerImage: imageUrl,
      location,
      startDateTime,
      endDateTime,
      speakers: processedSpeakers,
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