"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Search,
  QrCode,
  Users,
  CheckCircle,
  XCircle,
  Camera,
  User,
  Calendar,
  MapPin,
  Ticket,
  Filter,
  Download,
} from "lucide-react"
import { toast } from "sonner"

interface Attendee {
  id: string
  name: string
  email: string
  ticketId: string
  verified: boolean
  verifiedAt?: string
  avatar?: string
  ticketType: "VIP" | "General" | "Student"
  checkInTime?: string
}

interface EventDetails {
  id: number
  title: string
  image: string
  date: string
  time: string
  location: string
  organizer: string
  totalAttendees: number
}

export default function VerifyEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "pending">("all")
  const [filterTicketType, setFilterTicketType] = useState<"all" | "VIP" | "General" | "Student">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [verifyingTicket, setVerifyingTicket] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
  })

  // Mock event data
  const mockEventDetails: EventDetails = {
    id: Number(eventId),
    title: "Web3 Developer Conference 2024",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    date: "March 15, 2024",
    time: "9:00 AM",
    location: "San Francisco Convention Center",
    organizer: "Tech Events Inc.",
    totalAttendees: 150,
  }

  // Generate mock attendees
  const generateMockAttendees = (): Attendee[] => {
    const names = [
      "Alice Johnson",
      "Bob Smith",
      "Charlie Brown",
      "Diana Prince",
      "Ethan Hunt",
      "Fiona Green",
      "George Wilson",
      "Hannah Davis",
      "Ian Malcolm",
      "Julia Roberts",
      "Kevin Hart",
      "Luna Lovegood",
      "Mike Ross",
      "Nina Patel",
      "Oscar Wilde",
      "Penny Lane",
      "Quinn Fabray",
      "Rachel Green",
      "Sam Winchester",
      "Tina Fey",
      "Uma Thurman",
      "Victor Hugo",
      "Wendy Darling",
      "Xavier Charles",
      "Yara Greyjoy",
      "Zoe Saldana",
      "Aaron Paul",
      "Bella Swan",
      "Chris Evans",
      "Daisy Johnson",
    ]

    const ticketTypes: ("VIP" | "General" | "Student")[] = ["VIP", "General", "Student"]

    return names.map((name, i) => ({
      id: `attendee-${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
      ticketId: `TKT-${eventId}-${String(i + 1).padStart(3, "0")}`,
      verified: Math.random() > 0.6, // 40% already verified
      verifiedAt: Math.random() > 0.6 ? new Date(Date.now() - Math.random() * 86400000).toISOString() : undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      ticketType: ticketTypes[Math.floor(Math.random() * ticketTypes.length)],
      checkInTime:
        Math.random() > 0.6 ? new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString() : undefined,
    }))
  }

  const applyFilters = (attendeeList: Attendee[]) => {
    let filtered = attendeeList

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (attendee) =>
          attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attendee.ticketId.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((attendee) => (filterStatus === "verified" ? attendee.verified : !attendee.verified))
    }

    // Apply ticket type filter
    if (filterTicketType !== "all") {
      filtered = filtered.filter((attendee) => attendee.ticketType === filterTicketType)
    }

    return filtered
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = applyFilters(attendees)
    setFilteredAttendees(filtered)
  }

  const handleStatusFilter = (status: "all" | "verified" | "pending") => {
    setFilterStatus(status)
    const filtered = applyFilters(attendees)
    setFilteredAttendees(filtered)
  }

  const handleTicketTypeFilter = (type: "all" | "VIP" | "General" | "Student") => {
    setFilterTicketType(type)
    const filtered = applyFilters(attendees)
    setFilteredAttendees(filtered)
  }

  const handleVerifyAttendee = async (attendeeId: string) => {
    setVerifyingTicket(attendeeId)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      const updatedAttendees = attendees.map((attendee) =>
        attendee.id === attendeeId
          ? {
              ...attendee,
              verified: true,
              verifiedAt: new Date().toISOString(),
              checkInTime: new Date().toLocaleTimeString(),
            }
          : attendee,
      )

      setAttendees(updatedAttendees)

      const filtered = applyFilters(updatedAttendees)
      setFilteredAttendees(filtered)

      // Update stats
      setStats((prev) => ({
        ...prev,
        verified: prev.verified + 1,
        pending: prev.pending - 1,
      }))

      toast.success("Attendee verified successfully!")
    } catch (error) {
      console.error("Error verifying attendee:", error)
      toast.error("Failed to verify attendee")
    } finally {
      setVerifyingTicket(null)
    }
  }

  const handleUnverifyAttendee = async (attendeeId: string) => {
    setVerifyingTicket(attendeeId)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      const updatedAttendees = attendees.map((attendee) =>
        attendee.id === attendeeId
          ? {
              ...attendee,
              verified: false,
              verifiedAt: undefined,
              checkInTime: undefined,
            }
          : attendee,
      )

      setAttendees(updatedAttendees)

      const filtered = applyFilters(updatedAttendees)
      setFilteredAttendees(filtered)

      // Update stats
      setStats((prev) => ({
        ...prev,
        verified: prev.verified - 1,
        pending: prev.pending + 1,
      }))

      toast.success("Attendee unverified successfully!")
    } catch (error) {
      console.error("Error unverifying attendee:", error)
      toast.error("Failed to unverify attendee")
    } finally {
      setVerifyingTicket(null)
    }
  }

  const handleQRScan = (data: string) => {
    try {
      // Parse QR code data (assuming it contains ticket info)
      const ticketData = JSON.parse(data)
      const attendee = attendees.find((a) => a.ticketId === ticketData.ticketId)

      if (attendee) {
        if (!attendee.verified) {
          handleVerifyAttendee(attendee.id)
        } else {
          toast.info("This attendee is already verified!")
        }
      } else {
        toast.error("Invalid ticket or attendee not found!")
      }
    } catch (error) {
      toast.error("Invalid QR code format!")
    }

    setIsScannerOpen(false)
  }

  const exportAttendees = () => {
    const csvContent = [
      ["Name", "Email", "Ticket ID", "Ticket Type", "Status", "Check-in Time"].join(","),
      ...filteredAttendees.map((attendee) =>
        [
          attendee.name,
          attendee.email,
          attendee.ticketId,
          attendee.ticketType,
          attendee.verified ? "Verified" : "Pending",
          attendee.checkInTime || "Not checked in",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${eventDetails?.title.replace(/\s+/g, "-").toLowerCase()}-attendees.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success("Attendee list exported successfully!")
  }

  const getTicketTypeColor = (type: string) => {
    switch (type) {
      case "VIP":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "General":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Student":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setEventDetails(mockEventDetails)
      const mockAttendees = generateMockAttendees()
      setAttendees(mockAttendees)
      setFilteredAttendees(mockAttendees)

      // Calculate stats
      const verified = mockAttendees.filter((a) => a.verified).length
      setStats({
        total: mockAttendees.length,
        verified,
        pending: mockAttendees.length - verified,
      })

      setIsLoading(false)
    }, 1000)
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
          <p className="text-gray-400 mb-4">The event you're looking for doesn't exist.</p>
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
              src={eventDetails.image || "/placeholder.svg"}
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
                  {eventDetails.organizer}
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
                placeholder="Search by name, email, or ticket ID..."
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

              {/* Ticket Type Filter */}
              <select
                value={filterTicketType}
                onChange={(e) => handleTicketTypeFilter(e.target.value as "all" | "VIP" | "General" | "Student")}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Types</option>
                <option value="VIP">VIP</option>
                <option value="General">General</option>
                <option value="Student">Student</option>
              </select>

              {/* Clear Filters */}
              {(searchQuery || filterStatus !== "all" || filterTicketType !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setFilterStatus("all")
                    setFilterTicketType("all")
                    setFilteredAttendees(attendees)
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
              <Users className="w-5 h-5 mr-2 text-orange-400" />
              Attendees ({filteredAttendees.length} of {attendees.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-700">
            {filteredAttendees.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No attendees found matching your criteria</p>
              </div>
            ) : (
              filteredAttendees.map((attendee) => (
                <div key={attendee.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={attendee.avatar || "/placeholder.svg"}
                        alt={attendee.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-white">{attendee.name}</h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getTicketTypeColor(attendee.ticketType)}`}
                          >
                            {attendee.ticketType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{attendee.email}</p>
                        <p className="text-xs text-gray-500">Ticket: {attendee.ticketId}</p>
                        {attendee.checkInTime && (
                          <p className="text-xs text-green-400">Checked in at {attendee.checkInTime}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {attendee.verified ? (
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="flex items-center text-green-400 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verified
                            </div>
                            {attendee.verifiedAt && (
                              <p className="text-xs text-gray-500">{new Date(attendee.verifiedAt).toLocaleString()}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleUnverifyAttendee(attendee.id)}
                            disabled={verifyingTicket === attendee.id}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            {verifyingTicket === attendee.id ? "Processing..." : "Unverify"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="flex items-center text-orange-400 text-sm">
                              <XCircle className="w-4 h-4 mr-1" />
                              Pending
                            </div>
                          </div>
                          <button
                            onClick={() => handleVerifyAttendee(attendee.id)}
                            disabled={verifyingTicket === attendee.id}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            {verifyingTicket === attendee.id ? "Processing..." : "Verify"}
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

                {/* Mock Scanner Interface */}
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="aspect-square bg-gray-600 rounded-lg flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // Mock successful scan
                      const unverifiedAttendee = filteredAttendees.find((a) => !a.verified)
                      if (unverifiedAttendee) {
                        const mockTicketData = {
                          ticketId: unverifiedAttendee.ticketId,
                        }
                        handleQRScan(JSON.stringify(mockTicketData))
                      } else {
                        toast.info("All visible attendees are already verified!")
                        setIsScannerOpen(false)
                      }
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Mock Scan Success
                  </button>
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
    </div>
  )
}
