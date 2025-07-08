"use client";
import { ArrowRight, Ticket } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useConnect } from "wagmi";
import RegisterModal from "./register-model";
import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hook";
import { setUser } from "@/store/userSlice";
import { useRouter } from "next/navigation";

export default function Hero() {
  const { isConnected, address } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const dispatch = useAppDispatch();;
  const [loader, setLoader] = useState(false);
const router = useRouter();
async function handleGetStarted() {
  setLoader(true);
  let walletAddress = address;

  try {
    if (!isConnected || !address) {
      const result = await connectAsync({ connector: connectors[0] });
      walletAddress = result.accounts[0]; 
    }

    const response = await fetch("/api/findUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      toast.error("Failed to find user. Please try again.");
      return;
    }

    const data = await response.json();

    if (!data.userFound) {
      toast.error("User not found. Please register first.");
      setRegisterModalOpen(true);
    } else {
          dispatch(setUser({
          name: data.user.name,
          email: data.user.email,
          walletAddress: data.user.walletAddress,
          profilePicture: data.user.profilePicture || "https://i.pinimg.com/736x/c7/e5/3b/c7e53b9868b5e924b4f7bb19993ce2d7.jpg",
          ticketsOwned: data.user.ticketsOwned || [],
          eventsCreated: data.user.eventsCreated || [],
          eventsAttended: data.user.eventsAttended || [],
        }));
      router.push("/explore");
    }

  } catch (error) {
    console.error("Connection error:", error);
    toast.error("Something went wrong. Please try again.");
  } finally {
    setLoader(false);
  }
}


  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-red-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/30 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 mb-8">
            <Ticket className="w-4 h-4 mr-2 text-orange-400" />
            <span className="text-sm text-gray-300">
              Web3 Event Ticketing Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Access Isn’t Given. It’s {" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Minted.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
           Experience events like never before — with true ownership, transparency, and security powered by NFTs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="cursor-pointer bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 px-8 py-3 sm:px-12 text-lg rounded-lg font-medium transition-all duration-200 flex items-center"
            >
              {loader ? (
                <>Loading...</>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </section>
  );
}
