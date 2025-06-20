import { Shield, Zap, Users } from "lucide-react"

export default function About() {
  return (
    <section id="about" className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            The Future of Event Ticketing
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            Acc3ss revolutionizes event management by leveraging blockchain technology to create secure, verifiable, and
            transferable NFT tickets that attendees truly own.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-700">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Secure & Verifiable</h3>
            <p className="text-gray-300">
              Every ticket is an NFT on the blockchain, making it impossible to counterfeit and easy to verify at entry.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-700">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Instant Access</h3>
            <p className="text-gray-300">
              Quick wallet-based verification at event gates using our scanner technology for seamless entry.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-700">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Community Owned</h3>
            <p className="text-gray-300">
              Attendees truly own their tickets as NFTs, enabling resale, trading, and building event communities.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
