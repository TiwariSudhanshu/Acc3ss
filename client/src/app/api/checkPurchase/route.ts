import { NextResponse, NextRequest } from "next/server";
import User from "@/models/User.models";
import connectDB from "@/libs/connectDB";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const {walletAddress, eventId} = await req.json();
        if (!walletAddress || !eventId) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }
        const user = await User.findOne({ walletAddress: walletAddress });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const hasPurchased = user.eventTicketPurchased.includes(eventId);
        return NextResponse.json({ hasPurchased }, { status: 200 });
    } catch (error) {
        console.error("Error checking purchase:", error);
        return NextResponse.json({ error: "Failed to check purchase" }, { status: 500 });
    }
}