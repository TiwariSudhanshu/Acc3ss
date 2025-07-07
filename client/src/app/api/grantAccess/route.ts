import { NextResponse, NextRequest } from "next/server";
import User from "@/models/User.models";
import connectDB from "@/libs/connectDB";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { ticketId, walletAddress } = await req.json();

    const user = await User.findOne({ walletAddress: walletAddress });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
if (!Array.isArray(user.eventsAttended)) {
  user.eventsAttended = [];
}

    if (user.eventsAttended.includes(ticketId)) {
      return NextResponse.json(
        { message: "Access already granted" },
        { status: 400 }
      );
    }

    user.eventsAttended.push(ticketId);
    await user.save();

    return NextResponse.json(
      { message: "Access granted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
