import connectDB from "@/libs/connectDB";
import Event from "@/models/Event.models";
import User from "@/models/User.models";
import { NextRequest, NextResponse } from "next/server";

// Same helpers from your previous route
const convertIPFSToHTTP = (ipfsUri: string): string => {
  if (ipfsUri?.startsWith("ipfs://")) {
    return ipfsUri.replace(
      "ipfs://",
      "https://lavender-tremendous-deer-798.mypinata.cloud/ipfs/"
    );
  }
  return ipfsUri || "/placeholder.svg";
};

const fetchIPFSMetadata = async (baseURI: string) => {
  try {
    const httpUrl = convertIPFSToHTTP(baseURI);
    const response = await fetch(httpUrl);
    if (!response.ok) throw new Error("IPFS fetch failed");
    return await response.json();
  } catch (error) {
    console.error("Error fetching IPFS metadata:", error);
    return null;
  }
};

const formatDateTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${dateStr} at ${timeStr}`;
  } catch {
    return "TBD";
  }
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const users = await User.find();
    const events = await Event.find();

    const formattedEvents = await Promise.all(
      events.map(async (event) => {
        const metadata = await fetchIPFSMetadata(event.tokenUrl);
        if (!metadata) return null;

        return {
          eventId: event.eventId,
          hash: event.hash,
          organizer: event.organizer,
          chainId: event.chainId,
          ticketPrice: event.ticketPrice,
          approved: event.approved,
          isActive: event.isActive,
          eventName: metadata.eventName,
          description: metadata.description,
          category: metadata.category,
          image: convertIPFSToHTTP(metadata.image),
          location: metadata.location,
          startDateTime: formatDateTime(event.startDateTime),
          endDateTime: formatDateTime(event.endDateTime),
          organizedBy: metadata.organizedBy || "TBD",
        };
      })
    );

    const filteredEvents = formattedEvents.filter(
      (e): e is NonNullable<typeof e> => e !== null
    );

    return NextResponse.json({ events: filteredEvents, users }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST (req: NextRequest){
    try{
        await connectDB();
        const {eventId} = await req.json();
        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        event.approved = !event.approved; 
        await event.save({ validateBeforeSave: false });
        return NextResponse.json({ message: "Event status updated successfully" }, { status: 200 });
    }catch (error) {
        console.error("Error : ", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

