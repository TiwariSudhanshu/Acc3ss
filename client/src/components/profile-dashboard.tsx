"use client"
import { useEffect, useState } from "react"

import { Calendar, MapPin, Users, Ticket, Plus, Settings, Trophy, Star, X, Download } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import SettingsModal from "./settings-modal"
import { getContract } from "@/contract/contract"
import { toast } from "sonner"
import TicketComponent from "./ticket"
import { useRouter } from "next/navigation"

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
  organizer: string
  ticketId?: number 
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
interface Speaker {
  name: string
  role: string
  avatar?: string
}

interface AgendaItem {
  time: string
  title: string
  speaker?: string
}

interface OrganizerDetails {
  name: string
  email?: string
  profilePicture?: string
  verified: boolean
  address: string
}
interface IPFSMetadata {
  eventName?: string
  description?: string
  category?: string
  bannerImage?: string
  location?: string
  startDateTime?: string
  endDateTime?: string
  speakers?: Speaker[]
  organizedBy?: "solo" | "community"
  communityName?: string
  requirementsToAttend?: string
  whatsIncluded?: string
  agenda?: string | AgendaItem[]
  organizerName?: string
}

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<"attended" | "created" | "tickets">("attended")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [eventsCreated, setEventsCreated] = useState<Event[]>([])
  const [ticketsOwned, setTicketsOwned] = useState<Event[]>([])
  const [isLoadingCreated, setIsLoadingCreated] = useState(false)
  const [isLoadingTickets, setIsLoadingTickets] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Event | null>(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [isViewingEvent, setIsViewingEvent] = useState<number | null>(null)
  const [withdrawalLoading, setWithdrawalLoading] = useState<{ [key: number]: boolean }>({})
  const [withdrawnEvents, setWithdrawnEvents] = useState<Set<number>>(new Set())

  const router = useRouter()
  const convertIPFSToHTTP = (ipfsUri: string): string => {
    if (ipfsUri?.startsWith("ipfs://")) {
      return ipfsUri.replace("ipfs://", "https://lavender-tremendous-deer-798.mypinata.cloud/ipfs/")
    }
    return ipfsUri || "/placeholder.svg"
  }
  const fetchIPFSMetadata = async (baseURI: string): Promise<IPFSMetadata | null> => {
    try {
      const httpUrl = convertIPFSToHTTP(baseURI)
      const response = await fetch(httpUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`)
      }
      const metadata: IPFSMetadata = await response.json()
      return metadata
    } catch (error) {
      console.error("Error fetching IPFS metadata:", error)
      return null
    }
  }

  const currentUser = useSelector((state: RootState) => state.user)

  const user = {
    name: currentUser.name,
    email: currentUser.email,
    avatar: currentUser.profilePicture,
    walletAddress: currentUser.walletAddress,
    joinDate: "March 2023",
    totalEvents: currentUser.eventsCreated.length,
    totalTickets: currentUser.ticketsOwned.length,
    eventsCreated: currentUser.eventsCreated.length,
    totalAttended: 0,
  }

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const dateStr = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      return { date: dateStr, time: timeStr }
    } catch (error) {
      return { date: "TBD", time: "TBD" }
    }
  }
  const getCreatedEvents = async () => {
    try {
      setIsLoadingCreated(true)
      setEventsCreated([])
      const contract = await getContract()
      const events: Event[] = []

      for (const eventId of currentUser.eventsCreated) {
        console.log("Fetching event details for ID:", eventId)
        const event = await contract.getEventDetails(eventId.toString())
        const metadata = await fetchIPFSMetadata(event.baseURI)
        const dateTime = metadata?.startDateTime ? formatDateTime(metadata.startDateTime) : { date: "TBD", time: "TBD" }

        events.push({
          id: Number.parseInt(eventId),
          title: metadata?.eventName || event.name,
          image: metadata?.bannerImage ? convertIPFSToHTTP(metadata.bannerImage) : "/placeholder.svg",
          date: dateTime.date,
          time: dateTime.time,
          location: metadata?.location || "TBD",
          price: event.ticketPrice.toString() === "0" ? "Free" : `${(Number(event.ticketPrice) / 1e18).toFixed(3)} ETH`,
          attendees: Number(event.totalTicketsSold),
          category: metadata?.category || "General",
          status: Number(event.totalTicketsSold) >= Number(event.maxTickets) ? "Sold Out" : "Selling",
          organizer: metadata?.organizerName || metadata?.communityName || "Event Organizer",
        })
      }

      setEventsCreated(events)
    } catch (error) {
      console.error("Error fetching created events:", error)
      toast.error("Failed to load created events. Please try again later.")
    } finally {
      setIsLoadingCreated(false)
    }
  }

  const getOwnedTickets = async () => {
    try {
      setIsLoadingTickets(true)
      setTicketsOwned([]) 
      const contract = await getContract()
      const tickets: Event[] = []

      for (const ticket of currentUser.ticketsOwned) {
        const eventId = await contract.tokenToEvent(ticket.toString())
        const event = await contract.getEventDetails(eventId.toString())
        const metadata = await fetchIPFSMetadata(event.baseURI)
        const dateTime = metadata?.startDateTime ? formatDateTime(metadata.startDateTime) : { date: "TBD", time: "TBD" }

        tickets.push({
          id: Number.parseInt(eventId),
          title: metadata?.eventName || event.name,
          ticketId: Number(ticket),
          image: metadata?.bannerImage ? convertIPFSToHTTP(metadata.bannerImage) : "/placeholder.svg",
          date: dateTime.date,
          time: dateTime.time,
          location: metadata?.location || "TBD",
          price: event.ticketPrice.toString() === "0" ? "Free" : `${(Number(event.ticketPrice) / 1e18).toFixed(3)} ETH`,
          attendees: Number(event.totalTicketsSold),
          category: metadata?.category || "General",
          status: "Active", // Assuming owned tickets are active
          organizer: metadata?.organizerName || metadata?.communityName || "Event Organizer",
        })
      }

      setTicketsOwned(tickets)
    } catch (error) {
      console.error("Error fetching owned tickets:", error)
      toast.error("Failed to load owned tickets. Please try again later.")
    } finally {
      setIsLoadingTickets(false)
    }
  }

  const openTicketModal = (ticket: Event) => {
    setSelectedTicket(ticket)
    setIsTicketModalOpen(true)
  }

  const closeTicketModal = () => {
    setIsTicketModalOpen(false)
    setSelectedTicket(null)
  }

  const openManageModal = (event: Event) => {
    setSelectedEvent(event)
    setIsManageModalOpen(true)
  }

  const closeManageModal = () => {
    setIsManageModalOpen(false)
    setSelectedEvent(null)
  }

  const handleViewEvent = (eventId: number) => {
    setIsViewingEvent(eventId)
    router.push(`/event/${eventId}`)
  }

  const handleWithdraw = async (eventId: number) => {
    try {
      setWithdrawalLoading((prev) => ({ ...prev, [eventId]: true }))
      const contract = await getContract()
      const tx = await contract.withdrawForEvent(eventId.toString())
      await tx.wait()

      // Update withdrawn events set
      setWithdrawnEvents((prev) => new Set([...prev, eventId]))

      toast.success("Withdrawal completed successfully!")
      closeManageModal()
    } catch (error) {
      console.error("Withdrawal error:", error)
      toast.error("Failed to withdraw. Please try again.")
    } finally {
      setWithdrawalLoading((prev) => ({ ...prev, [eventId]: false }))
    }
  }

  // Mock events attended
  const eventsAttended: Event[] = [
    {
      id: 1,
      title: "Web3 Summit 2024",
      image: "https://i.pinimg.com/736x/25/f6/66/25f666ddb218a20d09534fe0d01494af.jpg",
      date: "Dec 15, 2024",
      time: "9:00 AM",
      location: "San Francisco, CA",
      price: "0.05 ETH",
      attendees: 1250,
      category: "Conference",
      status: "Completed",
      organizer: "Web3 Foundation",
    },
    {
      id: 2,
      title: "NFT Art Gallery Opening",
      image: "https://i.pinimg.com/736x/fc/2d/e9/fc2de95d90362735b9c3ffd8620b6ae7.jpg",
      date: "Nov 20, 2024",
      time: "6:00 PM",
      location: "New York, NY",
      price: "0.02 ETH",
      attendees: 300,
      category: "Art",
      status: "Completed",
      organizer: "Digital Art Collective",
    },
    {
      id: 3,
      title: "Blockchain Developer Meetup",
      image: "https://i.pinimg.com/736x/70/c8/3c/70c83c57dbf1514e7dd8b363a63327fe.jpg",
      date: "Oct 22, 2024",
      time: "7:00 PM",
      location: "Austin, TX",
      price: "Free",
      attendees: 150,
      category: "Meetup",
      status: "Completed",
      organizer: "Austin Blockchain Group",
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

  useEffect(() => {
    getCreatedEvents()
    getOwnedTickets()
  }, [])

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
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-gray-400 text-sm mb-3">{user.email}</p>
                <div className="bg-gray-700/50 rounded-lg p-2 mb-3">
                  <p className="text-[9px] text-gray-300 font-mono">{user.walletAddress}</p>
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
                <button
                  onClick={() => {
                    setIsCreatingEvent(true)
                    router.push("/create")
                  }}
                  disabled={isCreatingEvent}
                  className={`w-full ${isCreatingEvent ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isCreatingEvent ? "Creating..." : "Create Event"}
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
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
                    <button
                      onClick={() => {
                        setIsCreatingEvent(true)
                        router.push("/create")
                      }}
                      disabled={isCreatingEvent}
                      className={`${isCreatingEvent ? "opacity-50 cursor-not-allowed" : ""} bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isCreatingEvent ? "Creating..." : "Create New Event"}
                    </button>
                  </div>

                  {isLoadingCreated ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 animate-pulse"
                        >
                          <div className="w-full h-32 bg-gray-700"></div>
                          <div className="p-4 space-y-3">
                            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
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
                              <button
                                onClick={() => openManageModal(event)}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm transition-colors"
                              >
                                Manage
                              </button>
                              <button
                                onClick={() => handleViewEvent(event.id)}
                                disabled={isViewingEvent === event.id}
                                className={`flex-1 ${isViewingEvent === event.id ? "opacity-50 cursor-not-allowed" : ""} bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded text-sm transition-colors`}
                              >
                                {isViewingEvent === event.id ? "Loading..." : "View"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Owned Tickets */}
              {activeTab === "tickets" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <Ticket className="w-5 h-5 mr-2 text-orange-400" />
                      Owned Tickets ({ticketsOwned.length})
                    </h2>
                  </div>

                  {isLoadingTickets ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 animate-pulse">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                              <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                              <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                            </div>
                            <div className="w-24 h-8 bg-gray-700 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
                      {ticketsOwned.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="bg-gray-800/50 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-all duration-300 p-4"
                        >
                          <div className="flex items-start space-x-4">
                            <img
                              src={ticket.image || "/placeholder.svg"}
                              alt={ticket.title}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-white text-lg truncate pr-2">{ticket.title}</h3>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(ticket.status)}`}
                                >
                                  {ticket.status}
                                </span>
                              </div>
                              <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" />
                                  <span className="truncate">{ticket.date}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" />
                                  <span className="truncate">{ticket.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-gray-400 mr-2">Price:</span>
                                  <span className="text-white font-semibold">{ticket.price}</span>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => openTicketModal(ticket)}
                                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex-1"
                                >
                                  Open Ticket
                                </button>
                                {/* {ticket.status === "Active" && (
                                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex-1">
                                    Transfer
                                  </button>
                                )} */}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} />

      {/* Custom Ticket Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Event Ticket</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Create a download functionality for the ticket
                    const ticketData = {
                      eventTitle: selectedTicket?.title,
                      eventDate: selectedTicket?.date,
                      eventTime: selectedTicket?.time,
                      location: selectedTicket?.location,
                      userName: user.name,
                      userWallet: user.walletAddress,
                    }

                    // Convert ticket data to JSON and download
                    const dataStr = JSON.stringify(ticketData, null, 2)
                    const dataBlob = new Blob([dataStr], { type: "application/json" })
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement("a")
                    link.href = url
                    link.download = `ticket-${selectedTicket?.title?.replace(/\s+/g, "-").toLowerCase()}.json`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(url)
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                  title="Download Ticket"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={closeTicketModal}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {selectedTicket && (
                <TicketComponent
                  eventId={selectedTicket.ticketId?.toString()}
                  eventTitle={selectedTicket.title}
                  eventBanner={selectedTicket.image}
                  eventDate={selectedTicket.date}
                  eventTime={selectedTicket.time}
                  location={selectedTicket.location}
                  organizerName={selectedTicket.organizer}
                  price={selectedTicket.price}
                  userName={user.name}
                  userWallet={user.walletAddress}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manage Event Modal */}
      {isManageModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Manage Event</h2>
              <button
                onClick={closeManageModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Event Details */}
                <div className="flex items-start space-x-4">
                  <img
                    src={selectedEvent.image || "/placeholder.svg"}
                    alt={selectedEvent.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{selectedEvent.title}</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                        {selectedEvent.date} at {selectedEvent.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                        {selectedEvent.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-orange-400" />
                        {selectedEvent.attendees} registered
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="text-2xl font-bold text-white">{selectedEvent.attendees}</div>
                    <div className="text-sm text-gray-400">Total Attendees</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="text-2xl font-bold text-white">{selectedEvent.price}</div>
                    <div className="text-sm text-gray-400">Ticket Price</div>
                  </div>
                </div>

                {/* Revenue Section */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-3">Revenue</h4>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Total Revenue:</span>
                    <span className="text-xl font-bold text-green-400">
                      {selectedEvent.price === "Free"
                        ? "Free Event"
                        : `${(Number(selectedEvent.price.replace(" ETH", "")) * selectedEvent.attendees).toFixed(3)} ETH`}
                    </span>
                  </div>
                  {selectedEvent.price !== "Free" && (
                    <>
                      {withdrawnEvents.has(selectedEvent.id) ? (
                        <div className="w-full bg-gray-600 text-gray-300 py-2 px-4 rounded-lg font-medium text-center border border-gray-500">
                          ✓ Already Withdrawn
                        </div>
                      ) : (
                        <button
                          onClick={() => handleWithdraw(selectedEvent.id)}
                          disabled={withdrawalLoading[selectedEvent.id]}
                          className={`w-full ${
                            withdrawalLoading[selectedEvent.id]
                              ? "bg-green-500 cursor-not-allowed opacity-75"
                              : "bg-green-600 hover:bg-green-700"
                          } text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center`}
                        >
                          {withdrawalLoading[selectedEvent.id] ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing Withdrawal...
                            </>
                          ) : (
                            "Withdraw Balance"
                          )}
                        </button>
                      )}
                    </>
                  )}
                  {selectedEvent.price === "Free" && (
                    <button
                      disabled
                      className="w-full bg-gray-600 cursor-not-allowed text-gray-400 py-2 px-4 rounded-lg font-medium"
                    >
                      No Balance to Withdraw (Free Event)
                    </button>
                  )}
                </div>

                {/* Verify Attendee Section */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-3">Event Management</h4>
                  <button
                    onClick={() => {
                      closeManageModal()
                      router.push(`/verify/${selectedEvent.id}`)
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Verify Attendee
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end">
                  <button
                    onClick={closeManageModal}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
