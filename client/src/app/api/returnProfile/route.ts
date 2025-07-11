import User from "@/models/User.models";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req: NextRequest){
    try {
        const {walletAddress} = await req.json();
        if (!walletAddress) {
            return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
        }

        const user = await User.find({ walletAddress });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ profile: user }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}