import User from "@/models/User.models";
import {NextResponse, NextRequest} from "next/server";

export async function POST(req: NextRequest){
    try {
        
        const {ticketIds} = await req.json();
        if (!ticketIds || !Array.isArray(ticketIds)) {
            return NextResponse.json({error: "Invalid request data"}, {status: 400});
        }

        const users = await User.find({
            ticketsOwned: {
                $in: ticketIds
            }
        });

        if (!users || users.length === 0) {
            return NextResponse.json({error: "No attendees found"}, {status: 404});
        }
        const attendees = users.map(user => ({
            name: user.name,
            email: user.email,
            walletAddress: user.walletAddress,
            profilePicture: user.profilePicture,
            ticketsOwned: user.ticketsOwned
        }));

        return NextResponse.json({attendees}, {status: 200});

    } catch (error) {
        console.error("Error fetching attendees:", error);
        return NextResponse.json({error: "Failed to fetch attendees"}, {status: 500});        
    }
}