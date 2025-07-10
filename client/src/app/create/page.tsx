"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import CreateEventForm from "@/components/create-event-form";
import Footer from "@/components/footer";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { checkCorrectNetwork } from "@/contract/checkNetwork";
import { toast } from "sonner";

export default function CreateEventPage() {
  const { address, isConnecting } = useAccount();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!address && !isConnecting) {
      router.push('/');
    } else {
      setCheckingAuth(false);
    }
  }, [address, isConnecting, router]);

  useEffect(() => {
  const check = async () => {
    const isCorrect = await checkCorrectNetwork();
    if (!isCorrect) {
      toast.warning("Please switch to Sepolia Testnet in MetaMask.", {
          duration: Infinity,
          dismissible: false,
        });
    }
  };

  check();
}, []);

  if (checkingAuth || !address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0505] text-white">
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-16">
        <CreateEventForm />
      </div>
      <Footer />
    </div>
  );
}
