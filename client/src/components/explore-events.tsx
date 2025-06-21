"use client"
import { Calendar, MapPin, Users, Search, Filter } from "lucide-react"
import { useState } from "react"
import BuyTicketModal from "./buy-ticket-modal"

interface Event {
  id: number
  title: string
  image: string
  date: string
  time: string
  location: string
  price: string
  attendees: number
  category: string
  status: string
}

export default function ExploreEvents() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const events: Event[] = [
    {
      id: 1,
      title: "Web3 Summit 2024",
      image: "https://i.pinimg.com/736x/25/f6/66/25f666ddb218a20d09534fe0d01494af.jpg",
      date: "Dec 15, 2024",
      time: "10:00 AM",
      location: "San Francisco, CA",
      price: "0.05 ETH",
      attendees: 1250,
      category: "Conference",
      status: "Live",
    },
    {
      id: 2,
      title: "NFT Art Gallery Opening",
      image: "https://i.pinimg.com/736x/fc/2d/e9/fc2de95d90362735b9c3ffd8620b6ae7.jpg",
      date: "Dec 20, 2024",
      time: "7:00 PM",
      location: "New York, NY",
      price: "0.02 ETH",
      attendees: 300,
      category: "Art",
      status: "Selling",
    },
    {
      id: 3,
      title: "Blockchain Developer Meetup",
      image: "https://i.pinimg.com/736x/70/c8/3c/70c83c57dbf1514e7dd8b363a63327fe.jpg",
      date: "Dec 22, 2024",
      time: "6:00 PM",
      location: "Austin, TX",
      price: "Free",
      attendees: 150,
      category: "Meetup",
      status: "Selling",
    },
    {
      id: 4,
      title: "DeFi Conference 2024",
      image: "https://i.pinimg.com/736x/61/e4/26/61e4267351408e43a921b454f3e4f72e.jpg",
      date: "Jan 5, 2025",
      time: "9:00 AM",
      location: "Miami, FL",
      price: "0.08 ETH",
      attendees: 800,
      category: "Conference",
      status: "Coming Soon",
    },
    {
      id: 5,
      title: "Crypto Music Festival",
      image: "https://i.pinimg.com/736x/ef/ba/33/efba333ded8fc05578cf0ddda18f0b5e.jpg",
      date: "Jan 12, 2025",
      time: "2:00 PM",
      location: "Los Angeles, CA",
      price: "0.15 ETH",
      attendees: 5000,
      category: "Festival",
      status: "Coming Soon",
    },
    {
      id: 6,
      title: "Web3 Gaming Tournament",
      image: "https://i.pinimg.com/736x/92/2b/a7/922ba77ac539f1f89550b5e61507f19c.jpg",
      date: "Jan 18, 2025",
      time: "12:00 PM",
      location: "Las Vegas, NV",
      price: "0.03 ETH",
      attendees: 500,
      category: "Gaming",
      status: "Coming Soon",
    },
  ]

  // Filter events based on search term
  const filteredEvents = events.filter((event) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      event.category.toLowerCase().includes(searchLower) ||
      event.date.toLowerCase().includes(searchLower)
    )
  })

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Explore Events
          </h1>
          <p className="text-xl text-gray-300">Discover amazing Web3 events happening around the world</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
            <button className="flex items-center px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {["All", "Conference", "Concert", "Meetup", "Festival", "Workshop", "Art", "Gaming"].map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === "All"
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-6">
            <p className="text-gray-300">
              {filteredEvents.length === 0
                ? `No events found for "${searchTerm}"`
                : `Found ${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""} for "${searchTerm}"`}
            </p>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => handleEventClick(event)}
              className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-orange-500/50 transition-all duration-300 group cursor-pointer"
            >
              <div className="relative">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === "Live"
                        ? "bg-green-500 text-white"
                        : event.status === "Selling"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-600 text-gray-200"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/50 text-white">
                    {event.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                  {event.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-300 text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Users className="w-4 h-4 mr-2 text-orange-400" />
                    {event.attendees.toLocaleString()} attending
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-white">{event.price}</div>
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200">
                    {event.price === "Free" ? "Register" : "Buy Ticket"}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* No Results Message */}
        {filteredEvents.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No events found matching your search</div>
            <button
              onClick={() => setSearchTerm("")}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              Clear search to see all events
            </button>
          </div>
        )}

        {/* Load More - only show if there are results and no search */}
        {filteredEvents.length > 0 && !searchTerm && (
          <div className="text-center mt-12">
            <button className="border border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg bg-transparent rounded-lg font-medium transition-all duration-200">
              Load More Events
            </button>
          </div>
        )}
      </div>

      {/* Buy Ticket Modal */}
      <BuyTicketModal event={selectedEvent} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
}
