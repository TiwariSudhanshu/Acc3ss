import { Calendar, MapPin, Users, Clock, Share2, Heart, ExternalLink, Shield, Zap, Trophy } from "lucide-react"

export default function EventDetails() {
  const eventData = {
    id: 1,
    title: "Web3 Summit 2024",
    banner: "https://i.pinimg.com/736x/26/b4/c6/26b4c6d1cc786d1a560f51406c3b6173.jpg",
    description:
      "Join us for the most anticipated Web3 event of the year! Web3 Summit 2024 brings together industry leaders, developers, and enthusiasts to explore the future of decentralized technology. Experience cutting-edge presentations, hands-on workshops, and networking opportunities that will shape the next decade of blockchain innovation.",
    longDescription:
      "Web3 Summit 2024 is more than just a conference—it's a convergence of minds that are building the decentralized future. Over three days, you'll dive deep into the latest developments in blockchain technology, DeFi protocols, NFT ecosystems, and the metaverse. Our carefully curated lineup of speakers includes founders of major Web3 projects, leading researchers, and visionary entrepreneurs who are pushing the boundaries of what's possible in the decentralized world.",
    date: "December 15, 2024",
    time: "10:00 AM - 6:00 PM PST",
    endDate: "December 17, 2024",
    location: "Moscone Center, San Francisco, CA",
    price: "0.05 ETH",
    priceUSD: "$125",
    totalSupply: 2000,
    sold: 1250,
    maxPerWallet: 5,
    category: "Conference",
    status: "Live",
    organizer: {
      name: "Web3 Foundation",
      avatar: "/placeholder.svg?height=60&width=60",
      verified: true,
      events: 12,
    },
    speakers: [
      { name: "Vitalik Buterin", role: "Ethereum Founder", avatar: "https://i.pinimg.com/736x/19/0a/fc/190afc31e3dd8e7804652d509272edbc.jpg" },
      { name: "Gavin Wood", role: "Polkadot Founder", avatar: "https://i.pinimg.com/736x/f2/62/90/f2629045d241e0f038c106bc821773b8.jpg" },
      { name: "Stani Kulechov", role: "Aave Founder", avatar: "https://i.pinimg.com/736x/ce/48/07/ce4807ce92179037dd5f140d3b809fd7.jpg" },
      { name: "Mark Zuckerberg", role: "Meta Founder", avatar: "https://i.pinimg.com/736x/e9/3b/0a/e93b0abbdfb8ed32c0c20f85036e2a13.jpg" },
    ],
    agenda: [
      { time: "10:00 AM", title: "Opening Keynote: The Future of Web3", speaker: "Vitalik Buterin" },
      { time: "11:00 AM", title: "DeFi 2.0: Beyond Yield Farming", speaker: "Stani Kulechov" },
      { time: "12:00 PM", title: "Lunch & Networking", speaker: "" },
      { time: "1:30 PM", title: "Building Interoperable Blockchains", speaker: "Gavin Wood" },
      { time: "2:30 PM", title: "The Evolution of DEXs", speaker: "Hayden Adams" },
      { time: "3:30 PM", title: "Panel: NFTs and Digital Ownership", speaker: "Multiple Speakers" },
      { time: "4:30 PM", title: "Workshop: Smart Contract Security", speaker: "Security Experts" },
      { time: "5:30 PM", title: "Closing Remarks & Networking", speaker: "" },
    ],
    perks: [
      "Exclusive NFT Badge for Attendees",
      "Access to VIP Networking Events",
      "Workshop Materials & Resources",
      "Lunch & Refreshments Included",
      "Recording Access for 30 Days",
    ],
    requirements: [
      "Valid Web3 wallet required for entry",
      "Government-issued ID for verification",
      "Smartphone for QR code scanning",
      "Professional attire recommended",
    ],
  }

  const progressPercentage = (eventData.sold / eventData.totalSupply) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Hero Banner */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={eventData.banner || "/placeholder.svg"}
          alt={eventData.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  eventData.status === "Live" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                }`}
              >
                {eventData.status}
              </span>
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-800/80 text-white">
                {eventData.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{eventData.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-200">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-400" />
                {eventData.date}
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-400" />
                {eventData.time}
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-400" />
                {eventData.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-6">About This Event</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">{eventData.description}</p>
              <p className="text-gray-300 leading-relaxed">{eventData.longDescription}</p>
            </div>

            {/* Speakers */}
            <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-8">Featured Speakers</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {eventData.speakers.map((speaker, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-2xl">
                    <img
                      src={speaker.avatar || "/placeholder.svg"}
                      alt={speaker.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white">{speaker.name}</h3>
                      <p className="text-gray-300">{speaker.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agenda */}
            <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-8">Event Agenda</h2>
              <div className="space-y-4">
                {eventData.agenda.map((item, index) => (
                  <div key={index} className="flex items-start space-x-6 p-4 bg-gray-700/20 rounded-xl">
                    <div className="text-orange-400 font-bold text-lg min-w-[100px]">{item.time}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                      {item.speaker && <p className="text-gray-300">{item.speaker}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Perks & Requirements */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Trophy className="w-6 h-6 mr-3 text-orange-400" />
                  What's Included
                </h2>
                <ul className="space-y-3">
                  {eventData.perks.map((perk, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-300">{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-orange-400" />
                  Requirements
                </h2>
                <ul className="space-y-3">
                  {eventData.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-300">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Ticket Purchase */}
            <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50 sticky top-24">
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-white mb-2">{eventData.price}</div>
                <div className="text-gray-300 text-lg">{eventData.priceUSD}</div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>{eventData.sold} sold</span>
                  <span>{eventData.totalSupply} total</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-center text-sm text-gray-400 mt-2">{Math.round(progressPercentage)}% sold</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-300">
                  <span>Max per wallet:</span>
                  <span>{eventData.maxPerWallet}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Network:</span>
                  <span>Ethereum</span>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200">
                  Buy Ticket
                </button>
                <div className="flex space-x-3">
                  <button className="flex-1 border border-gray-600 text-white hover:bg-gray-800 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Save
                  </button>
                  <button className="flex-1 border border-gray-600 text-white hover:bg-gray-800 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-6">Organized by</h3>
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={eventData.organizer.avatar || "/placeholder.svg"}
                  alt={eventData.organizer.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-bold text-white">{eventData.organizer.name}</h4>
                    {eventData.organizer.verified && <Shield className="w-5 h-5 text-blue-400" />}
                  </div>
                  <p className="text-gray-300">{eventData.organizer.events} events hosted</p>
                </div>
              </div>
              <button className="w-full border border-gray-600 text-white hover:bg-gray-800 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 mr-2" />
                View Profile
              </button>
            </div>

            {/* Event Stats */}
            <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-6">Event Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300">Attending</span>
                  </div>
                  <span className="text-white font-bold">{eventData.sold.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300">Interest</span>
                  </div>
                  <span className="text-white font-bold">2.4k</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300">Saved</span>
                  </div>
                  <span className="text-white font-bold">892</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
