import connectDB from "@/libs/connectDB";
import User from "@/models/User.models";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const {name, email, walletAddress} = await request.json();
        if (!name || !email || !walletAddress) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        await connectDB();
        const user = await User.findOneAndUpdate(
            { walletAddress },
            { name, email },
            { new: true }
        );
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, user }, { status: 200 });
    } catch (error) {
        console.error("Error in updateDetails route:", error);
        return NextResponse.json({ error: "Failed to update details" }, { status: 500 });
    }
}