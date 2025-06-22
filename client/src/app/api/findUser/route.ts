import connectDB from "@/libs/connectDB";
import User from "@/models/User.models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { walletAddress } = await req.json();
    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: "Wallet address is required" }),
        { status: 400 }
      );
    }
    let userFound = false;

    const user = await User.findOne({ walletAddress });

    if (user) {
      userFound = true;
    }

    return new NextResponse(
      JSON.stringify({ message: "User found", user, userFound }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in findUser route:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
