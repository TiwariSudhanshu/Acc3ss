"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProfileDashboard from "@/components/profileComponents/profile-dashboard";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ExplorePage() {
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
        <ProfileDashboard />
      </div>
      <Footer />
    </div>
  );
}
