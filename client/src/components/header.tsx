"use client"
import { Wallet, Menu, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }
  const { address, isConnected } = useAccount();
  const {connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  
  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
          {/* Left: Logo */}
          <button onClick={() => { window.location.href = "/" }} className="cursor-pointer">
            <Image
              src="/logo.png"
              alt="logo"
              width={200}
              height={50}
            />
          </button>

          <nav className="hidden md:flex space-x-15 absolute left-1/2 transform -translate-x-1/2">
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">
              About
            </a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </a>
          </nav>

          {/* Right: Wallet and mobile menu */}
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
              ):(
                <span ><button
                onClick={() => connect({connector: connectors[0]})}
                >
                  {isPending ? "Connecting..." : "Connect Wallet"}
                  </button></span>
              )}
            </button>

            <button
              onClick={toggleMobileMenu}
              className="lg:hidden text-gray-300 hover:text-white transition-colors p-1"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-md border-t border-gray-800">
          <nav className="container mx-auto px-3 sm:px-4 py-4 flex flex-col space-y-4">
            <a
              href="#about"
              className="text-gray-300 hover:text-white transition-colors text-base py-2 border-b border-gray-800/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#how-it-works"
              className="text-gray-300 hover:text-white transition-colors text-base py-2 border-b border-gray-800/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition-colors text-base py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}