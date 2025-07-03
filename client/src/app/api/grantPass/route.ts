import User from "@/models/User.models";
import { NextRequest, NextResponse } from "next/server";

export async function POST ( req: NextRequest){
    try {
       const {eventId, walletAddress} = await req.json();
         if (!eventId || !walletAddress) {
              return NextResponse.json({error: "Invalid request data"}, {status: 400});
         }

         const user = await User.findOne({
             walletAddress: walletAddress.toLowerCase(),
         });
         if (!user) {
                return NextResponse.json({error: "User not found"}, {status: 404});
            }
            if (user.eventsAttended.includes(eventId)) {
                return NextResponse.json({error: "User has already attended this event"}, {status: 400});
            }
            user.eventsAttended.push(eventId);
            await user.save();
            return NextResponse.json({message: "Access Pass granted to User"}, {status: 200});

    } catch (error) {
        console.error("Error verifying user:", error);
        return NextResponse.json({error: "Failed to verify user"}, {status: 500});
    }
}