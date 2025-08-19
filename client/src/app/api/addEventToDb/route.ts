import Event from "@/models/Event.models";

import connectDB from "@/libs/connectDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User.models";

export async function POST(request: NextRequest) {
  try{
    await connectDB();
    const { eventId, tokenUrl, hash, organizer, chainId, ticketPrice } = await request.json();
    console.log("Received data:", { eventId, tokenUrl, hash, organizer, chainId, ticketPrice });
    if (!eventId || !tokenUrl || !hash || !organizer || !chainId || !ticketPrice) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const newEvent = {
      eventId,
      tokenUrl,
      hash,
      organizer,
      chainId,
      ticketPrice,
      approved: false, 
    };

    const createdEvent = await Event.create(newEvent);

    // Add created event to user profile
    const user = await User.findOne({walletAddress:organizer});
    if(!user){
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    user.eventsCreated.push(eventId);
    await user.save();

    return NextResponse.json({ message: "Event added successfully", event: createdEvent }, { status: 201 });
  }catch(e){
    return NextResponse.json({ error: e || "An error occurred while processing your request." }, { status: 500 });
  }
}