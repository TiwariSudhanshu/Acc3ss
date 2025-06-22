import connectDB from "@/libs/connectDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User.models";

export async function POST(req: NextRequest){
    try{
       await connectDB();
       const{name, walletAddress, email} = await req.json();
       console.log("Received data:", {name, walletAddress, email});
         if(!name || !walletAddress || !email){
              return new NextResponse(JSON.stringify({error: "Name, email and wallet address are required"}), {status: 400});
         }

         const existingUser = await User.findOne({ 
            $or: [
                { walletAddress: walletAddress },
                { email: email }
            ]
          });
         if(existingUser){
                return new NextResponse(JSON.stringify({error: "User already exists"}), {status: 400});
            }
            const newUser = await User.create({ name, walletAddress, email });

            return new NextResponse(JSON.stringify({message: "User registered successfully", user: newUser}), {status: 201});
    }
    catch(error){
        console.error("Database connection error:", error);
        return new NextResponse(JSON.stringify({error: "Database connection failed"}), {status: 500});
    }
}