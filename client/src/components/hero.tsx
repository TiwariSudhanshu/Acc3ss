import { ArrowRight, Ticket } from "lucide-react"

export default function Hero() {
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
            <span className="text-sm text-gray-300">Web3 Event Ticketing Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Events that people{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">own</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create unforgettable events with NFT-based tickets. Secure, verifiable, and truly owned by your attendees.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 px-8 py-3 text-lg rounded-lg font-medium transition-all duration-200 flex items-center">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button className="border border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg bg-transparent rounded-lg font-medium transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
