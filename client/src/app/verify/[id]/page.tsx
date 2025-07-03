"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Search,
  QrCode,
  Users,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  MapPin,
  Ticket,
  Filter,
  Download,
  UserCheck,
  UserX,
} from "lucide-react"
import { toast } from "sonner"
import { getContract } from "@/contract/contract"

interface TicketEntry {
  ticketId: string
  email: string
  name: string
  profilePicture: string
  walletAddress: string
  verified?: boolean
  verifiedAt?: string
  checkInTime?: string
}

interface Attendee {
  email: string
  name: string
  profilePicture: string
  ticketsOwned: string[]
  walletAddress: string
}

interface EventDetails {
  id: number
  title: string
  banner: string
  date: string
  time: string
  location: string
  organizer: {
    name: string
    address: string
  }
  totalSupply: number
  sold: number
  category: string
  status: string
}

export default function VerifyEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null)
  const [ticketEntries, setTicketEntries] = useState<TicketEntry[]>([])
  const [filteredTicketEntries, setFilteredTicketEntries] = useState<TicketEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "pending">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketEntry | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
  })

  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    if (!isScannerOpen) {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch((err) => console.error("Failed to stop scanner:", err))
      }
      return
    }

    const html5QrCode = new Html5Qrcode("qr-reader")
    scannerRef.current = html5QrCode

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          const cameraId = devices[0].id
          html5QrCode
            .start(
              cameraId,
              { fps: 10, qrbox: { width: 250, height: 250 } },
              (decodedText: string, _decodedResult) => {
                handleQRScan(decodedText)
                setIsScannerOpen(false)
                html5QrCode
                  .stop()
                  .then(() => html5QrCode.clear())
                  .catch((err) => console.error("Failed to clear scanner:", err))
              },
              (errorMessage: string) => {
                // console.warn("QR error:", errorMessage);
              },
            )
            .catch((err) => console.error("Start camera error:", err))
        }
      })
      .catch((err) => {
        console.error("Camera permission error:", err)
      })

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch((err) => console.error("Cleanup error:", err))
      }
    }
  }, [isScannerOpen])

  // Get event data from localStorage
  const getEventFromCache = () => {
    try {
      const cached = localStorage.getItem("events")
      if (cached) {
        const cachedEvents: EventDetails[] = JSON.parse(cached)
        const event = cachedEvents.find((e) => e.id === Number(eventId))
        if (event) {
          setEventDetails(event)
          return true
        }
      }
    } catch (error) {
      console.error("Error getting event from cache:", error)
    }
    return false
  }

  const handleGetAttendees = async () => {
    try {
      const contract = await getContract()
      const lastTicketId = await contract.nextTokenId()
      const matchedTickets = []

      for (let i = 0; i < lastTicketId; i++) {
        const thisEvent = await contract.tokenToEvent(i)
        if (thisEvent.toString() === eventId.toString()) {
          matchedTickets.push(i)
        }
      }

      const res = await fetch("/api/getAttendees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketIds: matchedTickets,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Transform attendees data to individual ticket entries
        const ticketEntriesData: TicketEntry[] = []
        data.attendees.forEach((attendee: Attendee) => {
          attendee.ticketsOwned.forEach((ticketId: string) => {
            ticketEntriesData.push({
              ticketId,
              email: attendee.email,
              name: attendee.name,
              profilePicture: attendee.profilePicture,
              walletAddress: attendee.walletAddress,
              verified: false,
            })
          })
        })

        setTicketEntries(ticketEntriesData)
        setFilteredTicketEntries(ticketEntriesData)

        // Update stats
        setStats({
          total: ticketEntriesData.length,
          verified: 0,
          pending: ticketEntriesData.length,
        })
      } else {
        console.error("Error fetching attendees:", data.error)
        toast.error("Failed to fetch attendees")
      }
    } catch (error) {
      console.error("Error in handleGetAttendees:", error)
      toast.error("Failed to fetch attendees")
    }
  }

  const applyFilters = (ticketList: TicketEntry[]) => {
    let filtered = ticketList

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((ticket) => (filterStatus === "verified" ? ticket.verified : !ticket.verified))
    }

    return filtered
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = applyFilters(ticketEntries)
    setFilteredTicketEntries(filtered)
  }

  const handleStatusFilter = (status: "all" | "verified" | "pending") => {
    setFilterStatus(status)
    const filtered = applyFilters(ticketEntries)
    setFilteredTicketEntries(filtered)
  }

  const handleQRScan = async (data: string) => {
    try {
      const contract = await getContract()
      // Parse QR code data (assuming it contains wallet address or ticket info)
      const ticketData = JSON.parse(data)
      const ticket = ticketEntries.find(
        (t) => t.walletAddress === ticketData.walletAddress || t.ticketId === ticketData.ticketId,
      )

      if (ticket) {
        const owner = await contract.ownerOf(ticket.ticketId)
        if (owner.toLowerCase() === ticketData.walletAddress.toLowerCase()) {
          // Open verification modal instead of just showing toast
          setSelectedTicket(ticket)
          setIsVerificationModalOpen(true)
        } else {
          toast.error("Ticket ownership verification failed!")
        }
      } else {
        toast.error("Invalid ticket or ticket not found!")
      }
    } catch (error) {
      toast.error("Invalid QR code format!")
    }
    setIsScannerOpen(false)
  }

  const handleVerifyClick = (ticket: TicketEntry) => {
    setSelectedTicket(ticket)
    setIsVerificationModalOpen(true)
  }

  const handleGrantAccess = async () => {
    if (!selectedTicket) return

    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      const updatedTickets = ticketEntries.map((ticket) =>
        ticket.ticketId === selectedTicket.ticketId
          ? {
              ...ticket,
              verified: true,
              verifiedAt: new Date().toISOString(),
              checkInTime: new Date().toLocaleTimeString(),
            }
          : ticket,
      )

      setTicketEntries(updatedTickets)
      const filtered = applyFilters(updatedTickets)
      setFilteredTicketEntries(filtered)

      // Update stats
      setStats((prev) => ({
        ...prev,
        verified: prev.verified + 1,
        pending: prev.pending - 1,
      }))

      toast.success("Access granted successfully!")
      setIsVerificationModalOpen(false)
      setSelectedTicket(null)
    } catch (error) {
      console.error("Error granting access:", error)
      toast.error("Failed to grant access")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectAccess = () => {
    toast.info("Access rejected")
    setIsVerificationModalOpen(false)
    setSelectedTicket(null)
  }

  const exportAttendees = () => {
    const csvContent = [
      ["Name", "Email", "Wallet Address", "Ticket ID", "Status", "Check-in Time"].join(","),
      ...filteredTicketEntries.map((ticket) =>
        [
          ticket.name,
          ticket.email,
          ticket.walletAddress,
          ticket.ticketId,
          ticket.verified ? "Verified" : "Pending",
          ticket.checkInTime || "Not checked in",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${eventDetails?.title.replace(/\s+/g, "-").toLowerCase()}-tickets.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Ticket list exported successfully!")
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      // Get event data from localStorage
      const eventFound = getEventFromCache()
      if (!eventFound) {
        toast.error("Event not found in cache")
        setIsLoading(false)
        return
      }

      // Get attendees data
      await handleGetAttendees()
      setIsLoading(false)
    }

    if (eventId) {
      loadData()
    }
  }, [eventId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!eventDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
          <p className="text-gray-400 mb-4">The event you're looking for doesn't exist in cache.</p>
          <button
            onClick={() => router.back()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Verify Attendees</h1>
              <p className="text-gray-300">{eventDetails.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportAttendees}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Scan QR Code
            </button>
          </div>
        </div>

        {/* Event Info Card */}
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 mb-8">
          <div className="flex items-start space-x-6">
            <img
              src={eventDetails.banner || "/placeholder.svg"}
              alt={eventDetails.title}
              className="w-32 h-32 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-4">{eventDetails.title}</h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                  {eventDetails.date} at {eventDetails.time}
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                  {eventDetails.location}
                </div>
                <div className="flex items-center text-gray-300">
                  <User className="w-4 h-4 mr-2 text-orange-400" />
                  {eventDetails.organizer.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Attendees</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Verified</p>
                <p className="text-3xl font-bold text-green-400">{stats.verified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-3xl font-bold text-orange-400">{stats.pending}</p>
              </div>
              <Ticket className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, wallet address, or ticket ID..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Filters:</span>
              </div>
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilter(e.target.value as "all" | "verified" | "pending")}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
              {/* Clear Filters */}
              {(searchQuery || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setFilterStatus("all")
                    setFilteredTicketEntries(ticketEntries)
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Attendees List */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Ticket className="w-5 h-5 mr-2 text-orange-400" />
              Tickets ({filteredTicketEntries.length} of {ticketEntries.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-700">
            {filteredTicketEntries.length === 0 ? (
              <div className="p-8 text-center">
                <Ticket className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No tickets found matching your criteria</p>
              </div>
            ) : (
              filteredTicketEntries.map((ticket) => (
                <div key={ticket.ticketId} className="p-6 hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={ticket.profilePicture || "/placeholder.svg"}
                        alt={ticket.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-white text-lg">{ticket.name}</h4>
                          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/30">
                            Ticket #{ticket.ticketId}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-300 flex items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                            {ticket.email}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center">
                            <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                            Wallet: {ticket.walletAddress.slice(0, 8)}...{ticket.walletAddress.slice(-6)}
                          </p>
                          {ticket.checkInTime && (
                            <p className="text-xs text-green-400 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Checked in at {ticket.checkInTime}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {ticket.verified ? (
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="flex items-center text-green-400 text-sm font-medium">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verified
                            </div>
                            {ticket.verifiedAt && (
                              <p className="text-xs text-gray-500">{new Date(ticket.verifiedAt).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="flex items-center text-orange-400 text-sm font-medium">
                              <XCircle className="w-4 h-4 mr-1" />
                              Pending
                            </div>
                          </div>
                          <button
                            onClick={() => handleVerifyClick(ticket)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
                          >
                            Verify
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Scan QR Code</h2>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <QrCode className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">QR Scanner</h3>
                <p className="text-gray-400 mb-4">Position the QR code within the frame to scan</p>
                {/* Actual QR scanner will mount here */}
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div id="qr-reader" className="aspect-square bg-gray-600 rounded-lg" />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsScannerOpen(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {isVerificationModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Verify Attendee</h2>
              <button
                onClick={() => setIsVerificationModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <img
                  src={selectedTicket.profilePicture || "/placeholder.svg"}
                  alt={selectedTicket.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-600 mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-white mb-2">{selectedTicket.name}</h3>
                <p className="text-gray-400 text-sm mb-1">{selectedTicket.email}</p>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Ticket #{selectedTicket.ticketId}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Wallet: {selectedTicket.walletAddress.slice(0, 12)}...{selectedTicket.walletAddress.slice(-8)}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleRejectAccess}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Reject
                </button>
                <button
                  onClick={handleGrantAccess}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-5 h-5 mr-2" />
                      Grant Access
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
