"use client"

import { getContract } from "@/contract/contract"
import { Calendar, MapPin, Users, Clock, Share2, Shield, Zap, Trophy, Mail } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { formatEther } from "ethers"
import ShareModal from "./share-model"
import BuyTicketModal from "./buy-ticket-modal"
import { useAccount } from "wagmi"

interface Speaker {
  id: string
  name: string
  description: string
  email: string
  hasImage?: boolean
  imageUrl?: string
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

interface EventData {
  id: number
  title: string
  banner: string
  description?: string
  longDescription?: string
  date: string
  time: string
  endDate?: string
  location: string
  price: string
  priceUSD?: string
  totalSupply: number
  sold: number
  maxPerWallet?: number
  category: string
  status: string
  organizer: OrganizerDetails
  speakers?: Speaker[]
  agenda?: AgendaItem[]
  perks?: string[]
  requirements?: string[]
  organizedBy?: "solo" | "community"
  communityName?: string
  requirementsToAttend?: string
  whatsIncluded?: string
  startDateTime?: string
  endDateTime?: string
}

interface IPFSMetadata {
  eventName?: string
  description?: string
  category?: string
  image?: string
  location?: string
  startDateTime?: string
  endDateTime?: string
  speakers?: Speaker[]
  organizedBy?: "solo" | "community"
  communityName?: string
  requirementsToAttend?: string
  whatsIncluded?: string
  agenda?: string | AgendaItem[]
}

export default function EventDetails() {
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [organizerLoading, setOrganizerLoading] = useState(false)
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [buyTicketModalOpen, setBuyTicketModalOpen] = useState(false)
  const { address } = useAccount()
  const [purchaseStatus, setPurchaseStatus] = useState(false)
  const [checkingPurchase, setCheckingPurchase] = useState(false)

  // Convert IPFS URI to HTTP URL
  const convertIPFSToHTTP = (ipfsUri: string): string => {
    if (ipfsUri?.startsWith("ipfs://")) {
      return ipfsUri.replace("ipfs://", "https://lavender-tremendous-deer-798.mypinata.cloud/ipfs/")
    }
    return ipfsUri || "/placeholder.svg"
  }

  const getOrganiserDetail = async (walletAddress: string): Promise<OrganizerDetails | null> => {
    setOrganizerLoading(true)
    try {
      const res = await fetch("/api/returnProfile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      })
      if (!res.ok) {
        throw new Error("Failed to fetch organizer details")
      }
      const data = await res.json()
      return {
        name: data.profile.name || "Event Organizer",
        email: data.profile.email,
        profilePicture: data.profile.profilePicture,
        verified: true,
        address: walletAddress,
      }
    } catch (error) {
      console.error("Error fetching organizer details:", error)
      toast.error("Failed to load organizer details")
      return null
    } finally {
      setOrganizerLoading(false)
    }
  }

  // Modified checkPurchase function - separated logic for initial check vs button click
  const checkPurchaseStatus = async (openModalIfNotPurchased = false) => {
    if (!address) return false

    setCheckingPurchase(true)
    try {
      const res = await fetch("/api/checkPurchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: address, eventId: id }),
      })
      if (!res.ok) {
        throw new Error("Failed to check purchase")
      }
      const data = await res.json()

      if (!data.hasPurchased) {
        setPurchaseStatus(false)
        if (openModalIfNotPurchased) {
          setBuyTicketModalOpen(true)
        }
        return false
      } else {
        setPurchaseStatus(true)
        if (openModalIfNotPurchased) {
          toast.success("You have already purchased a ticket for this event!")
        }
        return true
      }
    } catch (error) {
      console.error("Error checking purchase:", error)
      if (openModalIfNotPurchased) {
        toast.error("Failed to check purchase status")
      }
      return false
    } finally {
      setCheckingPurchase(false)
    }
  }

  // Function to handle buy ticket button click
  const handleBuyTicketClick = () => {
    checkPurchaseStatus(true)
  }

  // Fetch IPFS metadata
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

  // Format date and time from ISO string
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

  // Determine event status
  const getEventStatus = (startDateTime?: string, endDateTime?: string, totalSold?: number, maxTickets?: number) => {
    if (!startDateTime) return "Coming Soon"
    const now = new Date()
    const start = new Date(startDateTime)
    const end = endDateTime ? new Date(endDateTime) : null
    if (now >= start && (!end || now <= end)) {
      return "Live"
    } else if (end && now > end) {
      return "Ended"
    } else if (maxTickets && totalSold && totalSold >= maxTickets) {
      return "Sold Out"
    } else {
      return "Selling"
    }
  }

  // Parse agenda from string or return as is if already array
  const parseAgenda = (agenda: string | AgendaItem[] | undefined): AgendaItem[] => {
    if (!agenda) return []
    if (Array.isArray(agenda)) return agenda
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(agenda)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // If not JSON, try to parse as simple text format
      const lines = agenda.split("\n").filter((line) => line.trim())
      return lines.map((line, index) => {
        const parts = line.split(" - ")
        return {
          time: parts[0] || `${9 + index}:00 AM`,
          title: parts[1] || line,
          speaker: parts[2] || "",
        }
      })
    }
    return []
  }

  // Parse requirements/perks from string
  const parseListItems = (items: string | undefined): string[] => {
    if (!items) return []
    return items
      .split("\n")
      .filter((item) => item.trim())
      .map((item) => item.replace(/^[-•*]\s*/, ""))
  }

  const getEventData = async (eventId: string) => {
    setLoading(true)
    // Try getting event from cache
    const cached = localStorage.getItem("events")
    const cachedEvents: EventData[] = cached ? JSON.parse(cached) : []
    const cachedEvent = cachedEvents.find((e) => e.id === Number(eventId))
    if (cachedEvent) {
      setEventData(cachedEvent)
    }

    try {
      const contract = await getContract()
      const eventDetails = await contract.getEventDetails(eventId)
      const [name, ticketPrice, maxTickets, totalTicketsSold, baseURI, organizer] = eventDetails
      const metadata = await fetchIPFSMetadata(baseURI)

      if (metadata) {
        const startDate = metadata.startDateTime ? formatDateTime(metadata.startDateTime) : { date: "TBD", time: "TBD" }
        const endDate = metadata.endDateTime ? formatDateTime(metadata.endDateTime) : null
        const priceInETH = formatEther(ticketPrice)
        const priceDisplay = priceInETH === "0.0" ? "Free" : `${priceInETH} ETH`
        const status = getEventStatus(
          metadata.startDateTime,
          metadata.endDateTime,
          Number(totalTicketsSold),
          Number(maxTickets),
        )

        const parsedAgenda = parseAgenda(metadata.agenda)
        const requirements = parseListItems(metadata.requirementsToAttend)
        const perks = parseListItems(metadata.whatsIncluded)

        // Process speakers with image URLs
        const processedSpeakers =
          metadata.speakers?.map((speaker, index) => ({
            ...speaker,
            imageUrl: speaker.hasImage ? convertIPFSToHTTP(`speaker_${index}_image_url_from_metadata`) : undefined,
          })) || []

        const completeEventData: EventData = {
          id: Number(eventId),
          title: metadata.eventName || name,
          banner: convertIPFSToHTTP(metadata.image || ""),
          description: metadata.description,
          date: startDate.date,
          time: startDate.time,
          endDate: endDate?.date,
          location: metadata.location || "TBD",
          price: priceDisplay,
          totalSupply: Number(maxTickets),
          sold: Number(totalTicketsSold),
          category: metadata.category || "General",
          status,
          organizer: {
            name:
              metadata.organizedBy === "community" && metadata.communityName
                ? metadata.communityName
                : "Event Organizer",
            address: organizer,
            verified: true,
          },
          speakers: processedSpeakers,
          agenda: parsedAgenda,
          perks: perks.length > 0 ? perks : undefined,
          requirements: requirements.length > 0 ? requirements : undefined,
          organizedBy: metadata.organizedBy,
          communityName: metadata.communityName,
          startDateTime: metadata.startDateTime,
          endDateTime: metadata.endDateTime,
        }

        setEventData(completeEventData)
        // Replace or append to cachedEvents
        const updatedEvents = [...cachedEvents.filter((e) => e.id !== Number(eventId)), completeEventData]
        localStorage.setItem("events", JSON.stringify(updatedEvents))

        const organizerDetails = await getOrganiserDetail(organizer)
        if (organizerDetails) {
          setEventData((prev) =>
            prev
              ? {
                  ...prev,
                  organizer: {
                    ...organizerDetails,
                    name:
                      metadata.organizedBy === "community" && metadata.communityName
                        ? metadata.communityName
                        : organizerDetails.name,
                  },
                }
              : null,
          )
        }

        toast.success("Event data loaded successfully!")
      } else {
        const fallbackData: EventData = {
          id: Number(eventId),
          title: name,
          banner: "/placeholder.svg?height=500&width=1200",
          date: "TBD",
          time: "TBD",
          location: "TBD",
          price: formatEther(ticketPrice) === "0.0" ? "Free" : `${formatEther(ticketPrice)} ETH`,
          totalSupply: Number(maxTickets),
          sold: Number(totalTicketsSold),
          category: "General",
          status: "Coming Soon",
          organizer: {
            name: "Event Organizer",
            address: organizer,
            verified: false,
          },
        }
        setEventData(fallbackData)

        const organizerDetails = await getOrganiserDetail(organizer)
        if (organizerDetails) {
          setEventData((prev) =>
            prev
              ? {
                  ...prev,
                  organizer: organizerDetails,
                }
              : null,
          )
        }

        // Add fallback to cache too
        const updatedEvents = [...cachedEvents.filter((e) => e.id !== Number(eventId)), fallbackData]
        localStorage.setItem("events", JSON.stringify(updatedEvents))
        toast.warning("Event loaded with limited data")
      }
    } catch (error) {
      console.error("Error fetching event data:", error)
      toast.error("Failed to load event data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      getEventData(id)
    }
  }, [id])

  // Check purchase status when component mounts and address is available
  useEffect(() => {
    if (address && eventData && !loading) {
      checkPurchaseStatus(false) // Don't open modal on initial check
    }
  }, [address, eventData, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Event not found</p>
        </div>
      </div>
    )
  }

  const progressPercentage = (eventData.sold / eventData.totalSupply) * 100

  // Determine button state and text
  const getButtonState = () => {
    if (eventData.status === "Sold Out" || eventData.status === "Ended") {
      return {
        disabled: true,
        text: eventData.status === "Sold Out" ? "Sold Out" : "Event Ended",
        className: "bg-gray-600 text-gray-400 cursor-not-allowed",
      }
    }

    if (purchaseStatus) {
      return {
        disabled: true,
        text: "Purchased",
        className: "bg-gray-600 text-white cursor-not-allowed",
      }
    }

    if (checkingPurchase) {
      return {
        disabled: true,
        text: "Checking...",
        className: "bg-gray-600 text-gray-400 cursor-not-allowed",
      }
    }

    return {
      disabled: false,
      text: "Buy Ticket",
      className: "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white",
    }
  }

  const buttonState = getButtonState()

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
                  eventData.status === "Live"
                    ? "bg-green-500 text-white"
                    : eventData.status === "Selling"
                      ? "bg-orange-500 text-white"
                      : eventData.status === "Sold Out"
                        ? "bg-red-500 text-white"
                        : "bg-gray-600 text-white"
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
              {eventData.description ? (
                <p className="text-gray-300 text-lg leading-relaxed">{eventData.description}</p>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">Event description not available</p>
                  <p className="text-gray-500 text-sm mt-1">More details will be shared soon</p>
                </div>
              )}
            </div>

            {/* Speakers */}
            <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-8">Featured Speakers</h2>
              {eventData.speakers && eventData.speakers.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {eventData.speakers.map((speaker, index) => (
                    <div
                      key={speaker.id || index}
                      className="flex items-start space-x-4 p-6 bg-gray-700/30 rounded-2xl"
                    >
                      <img
                        src="https://i.pinimg.com/736x/96/51/60/9651605860388437ea779e0a51ab5649.jpg"
                        alt={speaker.name}
                        className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{speaker.name}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{speaker.description}</p>
                        {speaker.email && <p className="text-gray-400 text-xs mt-2">{speaker.email}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg">Speakers not disclosed yet</p>
                  <p className="text-gray-500 text-sm mt-2">Speaker lineup will be announced soon</p>
                </div>
              )}
            </div>

            {/* Agenda */}
            <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-8">Event Agenda</h2>
              {eventData.agenda && eventData.agenda.length > 0 ? (
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
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg">Agenda not available yet</p>
                  <p className="text-gray-500 text-sm mt-2">Detailed schedule will be shared closer to the event</p>
                </div>
              )}
            </div>

            {/* Perks & Requirements */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Trophy className="w-6 h-6 mr-3 text-orange-400" />
                  What's Included
                </h2>
                {eventData.perks && eventData.perks.length > 0 ? (
                  <ul className="space-y-3">
                    {eventData.perks.map((perk, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-300">{perk}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Details not specified</p>
                    <p className="text-gray-500 text-sm mt-1">Event inclusions will be updated</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-orange-400" />
                  Requirements
                </h2>
                {eventData.requirements && eventData.requirements.length > 0 ? (
                  <ul className="space-y-3">
                    {eventData.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-300">{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">No specific requirements</p>
                    <p className="text-gray-500 text-sm mt-1">Standard event entry applies</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Ticket Purchase */}
            <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50">
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-white mb-2">{eventData.price}</div>
                {eventData.priceUSD && <div className="text-gray-300 text-lg">{eventData.priceUSD}</div>}
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
                  <span>Network:</span>
                  <span>Ethereum Sepolia</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleBuyTicketClick}
                  disabled={buttonState.disabled}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${buttonState.className}`}
                >
                  {buttonState.text}
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShareModalOpen(true)}
                    className="flex-1 border border-gray-600 text-white hover:bg-gray-800 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-6">Organized by</h3>
              {organizerLoading ? (
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-24"></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={eventData.organizer.profilePicture || "/placeholder.svg"}
                    alt={eventData.organizer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-bold text-white">{eventData.organizer.name}</h4>
                      {eventData.organizer.verified && <Shield className="w-5 h-5 text-blue-400" />}
                    </div>
                    {eventData.organizer.email && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-300 text-sm">{eventData.organizer.email}</p>
                      </div>
                    )}
                    <p className="text-gray-400 text-xs mt-1">
                      {eventData.organizer.address.slice(0, 6)}...{eventData.organizer.address.slice(-4)}
                    </p>
                  </div>
                </div>
              )}
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
                    <span className="text-gray-300">Capacity</span>
                  </div>
                  <span className="text-white font-bold">{eventData.totalSupply.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} eventTitle={eventData.title} />

      {/* Buy Ticket Modal */}
      <BuyTicketModal isOpen={buyTicketModalOpen} onClose={() => setBuyTicketModalOpen(false)} eventData={eventData} />
    </div>
  )
}
