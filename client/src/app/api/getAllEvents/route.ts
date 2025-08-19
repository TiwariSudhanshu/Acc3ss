import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/connectDB";
import Event from "@/models/Event.models";
import {
  fetchIPFSMetadata,
  convertIPFSToHTTP,
  formatDateTime,
} from "@/libs/event-utils";

interface Speaker {
  id: string;
  name: string;
  description: string;
  email?: string;
  avatar?: string;
}

interface EventData {
  eventId: number;
  hash: string;
  organizer: string;
  chainId: string;
  ticketPrice: string;
  eventName: string;
  description: string;
  category: string;
  image: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  organizedBy: string;
  requirementsToAttend: string;
  whatsIncluded: string;
  agenda: string;
  speakers?: Speaker[];
  communityName?: string;
  communityImage?: string;
}

const buildFullEventData = async (event: any): Promise<EventData | null> => {
  const metadata = await fetchIPFSMetadata(event.tokenUrl);
  if (!metadata) return null;

  const { date: startDate, time: startTime } = formatDateTime(
    metadata.startDateTime
  );
  const { date: endDate, time: endTime } = formatDateTime(
    metadata.endDateTime
  );

  const speakers: Speaker[] = Array.isArray(metadata.speakers)
    ? metadata.speakers.map((s: any) => ({
        id: s.id || "",
        name: s.name || "Unnamed",
        description: s.description || "",
        email: s.email || "",
        avatar: convertIPFSToHTTP(s.avatar || ""),
      }))
    : [];

  const isCommunityOrganized =
    metadata.organizedBy?.toLowerCase() === "community";

  return {
    eventId: event.eventId,
    hash: event.hash,
    organizer: event.organizer,
    chainId: event.chainId,
    ticketPrice: event.ticketPrice,
    eventName: metadata.eventName || "Untitled Event",
    description: metadata.description || "No description provided.",
    category: metadata.category || "General",
    image: convertIPFSToHTTP(metadata.image || ""),
    location: metadata.location || "TBD",
    startDateTime: `${startDate} at ${startTime}`,
    endDateTime: `${endDate} at ${endTime}`,
    organizedBy: metadata.organizedBy || "TBD",
    requirementsToAttend: metadata.requirementsToAttend || "Not specified",
    whatsIncluded: metadata.whatsIncluded || "Details not available",
    agenda: metadata.agenda || "To be announced",
    speakers,
    communityName: isCommunityOrganized
      ? metadata.communityName || "Unnamed Community"
      : undefined,
    communityImage: isCommunityOrganized
      ? convertIPFSToHTTP(metadata.communityImage || "")
      : undefined,
  };
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const events = await Event.find({ approved: true });
    if (!events?.length) {
      return NextResponse.json({ message: "No events found." }, { status: 404 });
    }

    const formattedEvents = await Promise.all(
      events.map((event) => buildFullEventData(event))
    );

    const filteredEvents = formattedEvents.filter(
      (e): e is EventData => e !== null
    );

    return NextResponse.json(filteredEvents, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching events." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json();
    await connectDB();

    const event = await Event.findOne({ eventId, approved:true });
    if (!event) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    const fullEvent = await buildFullEventData(event);
    if (!fullEvent) {
      return NextResponse.json(
        { message: "Metadata not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(fullEvent, { status: 200 });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching event details." },
      { status: 500 }
    );
  }
}
