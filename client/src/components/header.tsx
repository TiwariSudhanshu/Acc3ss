import { Wallet } from "lucide-react"
import Image from "next/image"
export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-bold text-white">
            <Image 
            src="/logo.png"
             alt="logo"
             width={200}
             height={50}
             ></Image>
          </div>
          <nav className="hidden md:flex space-x-6">
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
        </div>
        <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </button>
      </div>
    </header>
  )
}
