"use client"
import { useState } from "react"
import { Calendar, MapPin, Users, Ticket, Plus, Edit, Settings, Trophy, Star } from "lucide-react"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

interface Event {
  id: number
  title: string
  image: string
  date: string
  location: string
  price: string
  attendees: number
  category: string
  status: string
}

interface OwnedTicket {
  id: number
  eventId: number
  eventTitle: string
  eventImage: string
  eventDate: string
  eventLocation: string
  ticketType: string
  purchaseDate: string
  price: string
  status: "Active" | "Used" | "Expired"
}

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<"attended" | "created" | "tickets">("attended")
   const userReal = useSelector((state: RootState) => state.user);
  // Mock user data
  const user = {
    name: userReal.name,
    email: userReal.email,
    avatar: userReal.profilePicture,
    walletAddress: userReal.walletAddress ,
    joinDate: "March 2023",
    totalEvents: 12,
    totalTickets: 8,
    eventsCreated: 3,
  }

  // Mock events attended
  const eventsAttended: Event[] = [
    {
      id: 1,
      title: "Web3 Summit 2024",
      image: "https://i.pinimg.com/736x/25/f6/66/25f666ddb218a20d09534fe0d01494af.jpg",
      date: "Dec 15, 2024",
      location: "San Francisco, CA",
      price: "0.05 ETH",
      attendees: 1250,
      category: "Conference",
      status: "Completed",
    },
    {
      id: 2,
      title: "NFT Art Gallery Opening",
      image: "https://i.pinimg.com/736x/fc/2d/e9/fc2de95d90362735b9c3ffd8620b6ae7.jpg",
      date: "Nov 20, 2024",
      location: "New York, NY",
      price: "0.02 ETH",
      attendees: 300,
      category: "Art",
      status: "Completed",
    },
    {
      id: 3,
      title: "Blockchain Developer Meetup",
      image: "https://i.pinimg.com/736x/70/c8/3c/70c83c57dbf1514e7dd8b363a63327fe.jpg",
      date: "Oct 22, 2024",
      location: "Austin, TX",
      price: "Free",
      attendees: 150,
      category: "Meetup",
      status: "Completed",
    },
  ]

  // Mock events created
  const eventsCreated: Event[] = [
    {
      id: 4,
      title: "DeFi Workshop Series",
      image: "https://i.pinimg.com/736x/61/e4/26/61e4267351408e43a921b454f3e4f72e.jpg",
      date: "Jan 15, 2025",
      location: "Miami, FL",
      price: "0.03 ETH",
      attendees: 85,
      category: "Workshop",
      status: "Live",
    },
    {
      id: 5,
      title: "Crypto Trading Bootcamp",
      image: "https://i.pinimg.com/736x/ef/ba/33/efba333ded8fc05578cf0ddda18f0b5e.jpg",
      date: "Feb 10, 2025",
      location: "Online",
      price: "0.08 ETH",
      attendees: 200,
      category: "Education",
      status: "Selling",
    },
  ]

  // Mock owned tickets
  const ownedTickets: OwnedTicket[] = [
    {
      id: 1,
      eventId: 1,
      eventTitle: "Web3 Summit 2024",
      eventImage: "https://i.pinimg.com/736x/25/f6/66/25f666ddb218a20d09534fe0d01494af.jpg",
      eventDate: "Dec 15, 2024",
      eventLocation: "San Francisco, CA",
      ticketType: "General Admission",
      purchaseDate: "Nov 10, 2024",
      price: "0.05 ETH",
      status: "Used",
    },
    {
      id: 2,
      eventId: 2,
      eventTitle: "NFT Art Gallery Opening",
      eventImage: "https://i.pinimg.com/736x/fc/2d/e9/fc2de95d90362735b9c3ffd8620b6ae7.jpg",
      eventDate: "Dec 20, 2024",
      eventLocation: "New York, NY",
      ticketType: "VIP Access",
      purchaseDate: "Nov 15, 2024",
      price: "0.02 ETH",
      status: "Active",
    },
    {
      id: 3,
      eventId: 6,
      eventTitle: "Web3 Gaming Tournament",
      eventImage: "https://i.pinimg.com/736x/92/2b/a7/922ba77ac539f1f89550b5e61507f19c.jpg",
      eventDate: "Jan 18, 2025",
      eventLocation: "Las Vegas, NV",
      ticketType: "Player Pass",
      purchaseDate: "Dec 1, 2024",
      price: "0.03 ETH",
      status: "Active",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Used":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "Expired":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Live":
        return "bg-green-500 text-white"
      case "Selling":
        return "bg-orange-500 text-white"
      case "Completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 sticky top-8">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-orange-500/30"
                  />
                  <button className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-gray-400 text-sm mb-3">{user.email}</p>
                <div className="bg-gray-700/50 rounded-lg p-2 mb-3">
                  <p className="text-[11px] text-gray-300 font-mono">
                    {user.walletAddress}
                  </p>
                </div>
                <p className="text-gray-500 text-sm">Member since {user.joinDate}</p>
              </div>

              {/* Stats */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Events Attended</span>
                  <span className="text-white font-semibold">{user.totalEvents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Tickets Owned</span>
                  <span className="text-white font-semibold">{user.totalTickets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Events Created</span>
                  <span className="text-white font-semibold">{user.eventsCreated}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>

          {/* Right Content - Main Dashboard */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-300">Manage your events, tickets, and profile</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
              <button
                onClick={() => setActiveTab("attended")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "attended"
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                Events Attended
              </button>
              <button
                onClick={() => setActiveTab("created")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "created"
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                Events Created
              </button>
              <button
                onClick={() => setActiveTab("tickets")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "tickets"
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                Owned Tickets
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Events Attended */}
              {activeTab === "attended" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-orange-400" />
                      Events Attended ({eventsAttended.length})
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {eventsAttended.map((event) => (
                      <div
                        key={event.id}
                        className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-orange-500/50 transition-all duration-300"
                      >
                        <div className="relative">
                          <img
                            src={event.image || "/placeholder.svg"}
                            alt={event.title}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
                            >
                              {event.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-white mb-2">{event.title}</h3>
                          <div className="space-y-1 text-sm text-gray-300">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                              {event.date}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events Created */}
              {activeTab === "created" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <Star className="w-5 h-5 mr-2 text-orange-400" />
                      Events Created ({eventsCreated.length})
                    </h2>
                    <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Event
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {eventsCreated.map((event) => (
                      <div
                        key={event.id}
                        className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-orange-500/50 transition-all duration-300"
                      >
                        <div className="relative">
                          <img
                            src={event.image || "/placeholder.svg"}
                            alt={event.title}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
                            >
                              {event.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-white mb-2">{event.title}</h3>
                          <div className="space-y-1 text-sm text-gray-300 mb-3">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                              {event.date}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                              {event.location}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2 text-orange-400" />
                              {event.attendees} registered
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm transition-colors">
                              Edit
                            </button>
                            <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded text-sm transition-colors">
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Owned Tickets */}
              {activeTab === "tickets" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <Ticket className="w-5 h-5 mr-2 text-orange-400" />
                      Owned Tickets ({ownedTickets.length})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {ownedTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-gray-800/50 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-all duration-300 p-4"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={ticket.eventImage || "/placeholder.svg"}
                            alt={ticket.eventTitle}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-white">{ticket.eventTitle}</h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}
                              >
                                {ticket.status}
                              </span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                              <div>
                                <div className="flex items-center mb-1">
                                  <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                                  {ticket.eventDate}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                                  {ticket.eventLocation}
                                </div>
                              </div>
                              <div>
                                <div className="mb-1">
                                  <span className="text-gray-400">Ticket Type:</span> {ticket.ticketType}
                                </div>
                                <div className="mb-1">
                                  <span className="text-gray-400">Purchased:</span> {ticket.purchaseDate}
                                </div>
                                <div>
                                  <span className="text-gray-400">Price:</span>{" "}
                                  <span className="text-white font-semibold">{ticket.price}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                              View Ticket
                            </button>
                            {ticket.status === "Active" && (
                              <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                                Transfer
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
