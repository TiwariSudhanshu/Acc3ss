"use client";

import Header from "@/components/header"
import EventDetails from "@/components/event-details"
import Footer from "@/components/footer"
import { useEffect } from "react";
import { checkCorrectNetwork } from "@/contract/checkNetwork";
import { toast } from "sonner";

export default function EventDetailPage() {
  useEffect(() => {
  const check = async () => {
    const isCorrect = await checkCorrectNetwork();
    if (!isCorrect) {
      toast.warning("Please switch to Sepolia Testnet in MetaMask.",{
          duration: Infinity,
          dismissible: false,
        });

      
    }
  };

  check();
}, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-16">
        <EventDetails />
      </div>
      <Footer/>
    </div>
  )
}
