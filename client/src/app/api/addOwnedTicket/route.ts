import User from "@/models/User.models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { ticketId, eventId, walletAddress } = await request.json();
    console.log("Received data:", { ticketId, walletAddress });
    await User.findOneAndUpdate(
      { walletAddress },
      { $addToSet: { ticketsOwned: ticketId, eventTicketPurchased: eventId }},
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: "Ticket added to user successfully",
    });
  } catch (error) {
    console.error("Error in POST request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
