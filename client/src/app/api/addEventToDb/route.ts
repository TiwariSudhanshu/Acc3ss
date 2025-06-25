import User from "@/models/User.models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const {eventId, walletAddress} = await request.json();

        await User.findOneAndUpdate(
            { walletAddress: walletAddress },
            { $addToSet: { eventsCreated: eventId } },
            { new: true, upsert: true }
        );
        return new NextResponse("Event added to user successfully", { status: 200 });

    } catch (error) {
        console.error("Error in POST request:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
        
    }
}