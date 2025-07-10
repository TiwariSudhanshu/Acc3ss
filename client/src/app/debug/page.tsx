"use client";
import { useEffect } from "react";
import { ethers } from "ethers";
import accessJson from "@/contract/Access.json";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const AccessABI = accessJson.abi;

export default function DebugPage() {
  useEffect(() => {
    const debug = async () => {
      try {
        if (typeof window === "undefined" || !window.ethereum) {
          console.log("🚫 MetaMask not detected.");
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        console.log("🔌 Connected Wallet:", await signer.getAddress());

        const network = await provider.getNetwork();
        console.log("🌐 Network:", network);

        console.log("🏠 Contract Address:", contractAddress);

        const contract = new ethers.Contract(
          contractAddress || "",
          AccessABI,
          signer
        );

if (!contractAddress) {
  console.error("🚫 Contract address is undefined. Check your env vars!");
  return;
}
console.log("🌐 Loaded contract address:", contractAddress);

const code = await provider.getCode(contractAddress);

        console.log("🧠 Contract Bytecode:", code);

        if (code === "0x") {
          console.warn("⚠️ No contract found at this address!");
        }

        const id = await contract.nextEventId();
        console.log("🎯 nextEventId():", id.toString());
      } catch (err) {
        console.error("❌ Error in debug check:", err);
      }
    };

    debug();
  }, []);

  return (
    <div className="p-6 text-white bg-black h-screen">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug Page</h1>
      <p>Open your browser console (F12) to see contract logs.</p>
    </div>
  );
}
