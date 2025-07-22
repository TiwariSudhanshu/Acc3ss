import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/connectDB";
import Event from "@/models/Event.models";

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
}
interface IPFSMetadata {
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
}

const convertIPFSToHTTP = (ipfsUri: string): string => {
  if (ipfsUri?.startsWith("ipfs://")) {
    return ipfsUri.replace(
      "ipfs://",
      "https://lavender-tremendous-deer-798.mypinata.cloud/ipfs/"
    );
  }
  return ipfsUri || "/placeholder.svg";
};

const fetchIPFSMetadata = async (
  baseURI: string
): Promise<IPFSMetadata | null> => {
  try {
    const httpUrl = convertIPFSToHTTP(baseURI);
    const response = await fetch(httpUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    const metadata: IPFSMetadata = await response.json();
    return metadata;
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
    return { date: dateStr, time: timeStr };
  } catch (error) {
    return { date: "TBD", time: "TBD" };
  }
};
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const events = await Event.find({});

    if (!events || events.length === 0) {
      return NextResponse.json(
        { message: "No events found." },
        { status: 404 }
      );
    }

    const formattedEvents = await Promise.all(
      events.map(async (event) => {
        const metadata = await fetchIPFSMetadata(event.tokenUrl);
        if (!metadata) {
          return null;
        }

        const { date: startDate, time: startTime } = formatDateTime(
          event.startDateTime
        );
        const { date: endDate, time: endTime } = formatDateTime(
          event.endDateTime
        );

        const fullEvent: EventData = {
          eventId: event.eventId,
          hash: event.hash,
          organizer: event.organizer,
          chainId: event.chainId,
          ticketPrice: event.ticketPrice,
          eventName: metadata.eventName,
          description: metadata.description,
          category: metadata.category,
          image: convertIPFSToHTTP(metadata.image),
          location: metadata.location,
          startDateTime: `${startDate} at ${startTime}`,
          endDateTime: `${endDate} at ${endTime}`,
          organizedBy: metadata.organizedBy || "TBD",
          requirementsToAttend: metadata.requirementsToAttend || "TBD",
          whatsIncluded: metadata.whatsIncluded || "TBD",
          agenda: metadata.agenda || "TBD",
        };

        return fullEvent;
      })
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
    const event = await Event.findOne({ eventId: eventId });
    if (!event) {
      return NextResponse.json(
        { message: "Event not found." },
        { status: 404 }
      );
    }

    const metadata = await fetchIPFSMetadata(event.tokenUrl);
    if (!metadata) {
      return NextResponse.json(
        { message: "Metadata not found." },
        { status: 404 }
      );
    }
    const { date: startDate, time: startTime } = formatDateTime(
      event.startDateTime
    );
    const { date: endDate, time: endTime } = formatDateTime(event.endDateTime);
    const fullEvent: EventData = {
      eventId: event.eventId,
      hash: event.hash,
      organizer: event.organizer,
      chainId: event.chainId,
      ticketPrice: event.ticketPrice,
      eventName: metadata.eventName,
      description: metadata.description,
      category: metadata.category,
      image: convertIPFSToHTTP(metadata.image),
      location: metadata.location,
      startDateTime: `${startDate} at ${startTime}`,
      endDateTime: `${endDate} at ${endTime}`,
      organizedBy: metadata.organizedBy || "TBD",
      requirementsToAttend: metadata.requirementsToAttend || "TBD",
      whatsIncluded: metadata.whatsIncluded || "TBD",
      agenda: metadata.agenda || "TBD",
    };
    return NextResponse.json(fullEvent, { status: 200 });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching event details." },
      { status: 500 }
    );
  }
}
