"use client"
import { Wallet } from "lucide-react"
import Image from "next/image"
import { useAccount, useConnect, useDisconnect } from "wagmi"

export default function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <button onClick={() => { window.location.href = "/" }} className="cursor-pointer">
          <Image
            src="/logo.png"
            alt="logo"
            width={200}
            height={50}
          />
        </button>

        {/* Right: Wallet */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-lg font-medium transition-all duration-200 flex items-center text-xs sm:text-sm">
            <Wallet className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {isConnected ? (
              <span className="flex items-center">
                <button
                  onClick={() => disconnect()}
                  className="ml-2 text-xs sm:text-sm text-gray-300 hover:text-white"
                >
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </button>
              </span>
            ) : (
              <span>
                <button onClick={() => connect({ connector: connectors[0] })}>
                  {isPending ? "Connecting..." : "Connect Wallet"}
                </button>
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
