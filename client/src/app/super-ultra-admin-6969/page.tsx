"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface User {
  _id: string
  name: string
  email: string
  walletAddress: string
  createdAt: string
}

interface Event {
  eventId: string
  hash: string
  organizer: string
  chainId: string
  ticketPrice: string
  approved: boolean
  isActive: boolean
  eventName: string
  description: string
  category: string
  image: string
  location: string
  startDateTime: string | { date: string; time: string }
  endDateTime: string | { date: string; time: string }
  organizedBy: string
}

// Helper function to format date/time
const formatDateTime = (dateTime: string | { date: string; time: string }) => {
  if (typeof dateTime === 'string') {
    return dateTime
  }
  if (typeof dateTime === 'object' && dateTime.date && dateTime.time) {
    return `${dateTime.date} ${dateTime.time}`
  }
  return 'TBD'
}

// Circular Loader Component
const CircularLoader = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4500]"></div>
  </div>
)

// Login Component
const AdminLogin = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    passkey: "",
    founderCar: "",
    birthday: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Frontend validation against environment variables
    const correctPasskey = process.env.NEXT_PUBLIC_ADMIN_PASSKEY || "admin123"
    const correctCar = process.env.NEXT_PUBLIC_FOUNDER_CAR || "tesla"
    const correctBirthday = process.env.NEXT_PUBLIC_FOUNDER_BIRTHDAY || "15081995"

    // Simulate loading time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (
      formData.passkey.toLowerCase() === correctPasskey.toLowerCase() &&
      formData.founderCar.toLowerCase() === correctCar.toLowerCase() &&
      formData.birthday === correctBirthday
    ) {
      toast.success("Login successful! Welcome to Admin Dashboard")
      onLoginSuccess()
    } else {
      toast.error("Invalid credentials. Please check your answers.")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center px-4">
      <div className="bg-[#1a2332] border border-[#2a3441] rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-gray-400">Please answer the security questions to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Passkey Question */}
          <div>
            <label htmlFor="passkey" className="block text-sm font-medium text-gray-300 mb-2">
              What is the admin passkey?
            </label>
            <input
              type="password"
              id="passkey"
              value={formData.passkey}
              onChange={(e) => handleInputChange("passkey", e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#2a3441] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4500] transition-colors"
              placeholder="Enter passkey"
              required
            />
          </div>

          {/* Founder's Car Question */}
          <div>
            <label htmlFor="founderCar" className="block text-sm font-medium text-gray-300 mb-2">
              What is the founder's favorite car?
            </label>
            <input
              type="text"
              id="founderCar"
              value={formData.founderCar}
              onChange={(e) => handleInputChange("founderCar", e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#2a3441] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4500] transition-colors"
              placeholder="Enter car name"
              required
            />
          </div>

          {/* Birthday Question */}
          <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-gray-300 mb-2">
              What is the founder's birthday? (DDMMYYYY format)
            </label>
            <input
              type="text"
              id="birthday"
              value={formData.birthday}
              onChange={(e) => handleInputChange("birthday", e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#2a3441] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4500] transition-colors"
              placeholder="e.g., 15081995"
              pattern="[0-9]{8}"
              maxLength={8}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#ff4500] hover:bg-[#ff6b35] disabled:bg-[#ff4500]/50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Verifying...
              </>
            ) : (
              "Access Dashboard"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">All answers are case-insensitive except birthday</p>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { address, isConnecting } = useAccount()
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"users" | "events">("users")

  useEffect(() => {
    if (!address && !isConnecting) {
      router.push("/")
    } else {
      setCheckingAuth(false)
    }
  }, [address, isConnecting, router])

  useEffect(() => {
    if (address && !checkingAuth && isLoggedIn) {
      fetchData()
    }
  }, [address, checkingAuth, isLoggedIn])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin")
      const data = await response.json()
      setUsers(data.users || [])
      setEvents(data.events || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const toggleEventStatus = async (eventId: string) => {
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      })
      if (response.ok) {
        // Find the event to show appropriate message
        const event = events.find((e) => e.eventId === eventId)
        const newStatus = event ? !event.approved : true
        toast.success(newStatus ? "Event is now visible on web" : "Event is now hidden from web")
        fetchData() // Refresh data
      } else {
        toast.error("Failed to update event status")
      }
    } catch (error) {
      console.error("Error updating event:", error)
      toast.error("Failed to update event status")
    }
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  // Show wallet connection loading
  if (checkingAuth || !address) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1c] text-white">
        <CircularLoader />
        <div className="text-xl mt-4">Connecting wallet...</div>
      </div>
    )
  }

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />
  }

  // Show data loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1c] text-white">
        <CircularLoader />
        <div className="text-xl mt-4">Loading admin data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      {/* Header */}
      <div className="bg-[#1a2332] border-b border-[#2a3441]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <button
                onClick={() => setIsLoggedIn(false)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a2332] border border-[#2a3441] rounded-lg p-6">
            <div className="text-2xl font-bold text-white">{users.length}</div>
            <div className="text-gray-400">Total Users</div>
          </div>
          <div className="bg-[#1a2332] border border-[#2a3441] rounded-lg p-6">
            <div className="text-2xl font-bold text-white">{events.length}</div>
            <div className="text-gray-400">Total Events</div>
          </div>
          <div className="bg-[#1a2332] border border-[#2a3441] rounded-lg p-6">
            <div className="text-2xl font-bold text-white">{events.filter((e) => e.approved).length}</div>
            <div className="text-gray-400">Approved Events</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "users"
                ? "bg-[#ff4500] text-white"
                : "bg-[#1a2332] text-gray-400 hover:text-white border border-[#2a3441] hover:border-[#ff4500]/30"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "events"
                ? "bg-[#ff4500] text-white"
                : "bg-[#1a2332] text-gray-400 hover:text-white border border-[#2a3441] hover:border-[#ff4500]/30"
            }`}
          >
            Events ({events.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">Users Management</h2>
              <div className="text-sm text-gray-400">{users.length} total users</div>
            </div>
            {users.length === 0 ? (
              <div className="bg-[#1a2332] border border-[#2a3441] rounded-lg p-12 text-center">
                <div className="text-gray-400 text-lg">No users found</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user, index) => (
                  <div
                    key={user._id}
                    className="bg-[#1a2332] border border-[#2a3441] rounded-lg p-6 hover:border-[#ff4500]/50 transition-colors"
                  >
                    {/* User Avatar */}
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#ff4500] to-[#ff6b35] rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.name
                          ? user.name.charAt(0).toUpperCase()
                          : user.walletAddress
                            ? user.walletAddress.charAt(2).toUpperCase()
                            : (index + 1).toString()}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-white">{user.name || `User ${index + 1}`}</h3>
                        <p className="text-sm text-gray-400">
                          Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                        </p>
                      </div>
                    </div>
                    {/* User Details */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Email</div>
                        <div className="text-sm text-gray-300">{user.email || "Not provided"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Wallet Address</div>
                        <div className="text-sm text-gray-300 font-mono bg-[#0a0f1c]/50 p-2 rounded border border-[#2a3441]">
                          {user.walletAddress ? (
                            <div className="flex items-center justify-between">
                              <span>
                                {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(user.walletAddress)
                                  toast.success("Address copied to clipboard")
                                }}
                                className="text-xs text-[#ff4500] hover:text-[#ff6b35] ml-2"
                              >
                                Copy
                              </button>
                            </div>
                          ) : (
                            "Not connected"
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">User ID</div>
                        <div className="text-xs text-gray-500 font-mono">{user._id}</div>
                      </div>
                    </div>
                    {/* User Actions */}
                    <div className="mt-4 pt-4 border-t border-[#2a3441]">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(user._id)
                            toast.success("User ID copied to clipboard")
                          }}
                          className="flex-1 px-3 py-2 bg-[#2a3441] hover:bg-[#3a4551] text-white rounded text-sm font-medium transition-colors"
                        >
                          Copy ID
                        </button>
                        <button
                          onClick={() => {
                            if (user.walletAddress) {
                              window.open(`https://sepolia.etherscan.io/address/${user.walletAddress}`, "_blank")
                            } else {
                              toast.error("No wallet address available")
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-[#ff4500] hover:bg-[#ff6b35] text-white rounded text-sm font-medium transition-colors"
                        >
                          View on Explorer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">Events Management</h2>
              <div className="text-sm text-gray-400">
                {events.filter((e) => e.approved).length} approved of {events.length} total
              </div>
            </div>
            {events.length === 0 ? (
              <div className="bg-[#1a2332] border border-[#2a3441] rounded-lg p-12 text-center">
                <div className="text-gray-400 text-lg">No events found</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div
                    key={event.eventId}
                    className="bg-[#1a2332] border border-[#2a3441] rounded-lg overflow-hidden hover:border-[#ff4500]/50 transition-colors"
                  >
                    {/* Event Image */}
                    <div className="relative h-48 bg-[#0a0f1c]">
                      <img
                        src={event.image || "/placeholder.svg?height=200&width=400"}
                        alt={event.eventName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=400&text=Event+Image"
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            event.approved
                              ? "bg-green-900/80 text-green-200 border border-green-700"
                              : "bg-red-900/80 text-red-200 border border-red-700"
                          }`}
                        >
                          {event.approved ? "Visible on web" : "Hidden"}
                        </span>
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#0a0f1c]/80 text-white border border-[#2a3441]">
                          {event.category || "General"}
                        </span>
                      </div>
                    </div>
                    {/* Event Content */}
                    <div className="p-6">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                          {event.eventName || "Untitled Event"}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {event.description || "No description available"}
                        </p>
                      </div>
                      {/* Event Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-300">
                          <span className="w-16 text-gray-400">Date:</span>
                          <span>{formatDateTime(event.startDateTime)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <span className="w-16 text-gray-400">Location:</span>
                          <span className="truncate">{event.location || "TBD"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <span className="w-16 text-gray-400">Price:</span>
                          <span className="text-[#ff4500] font-medium">
                            {event.ticketPrice ? `${event.ticketPrice} ETH` : "Free"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <span className="w-16 text-gray-400">By:</span>
                          <span className="truncate">{event.organizedBy || "Unknown"}</span>
                        </div>
                      </div>
                      {/* Organizer Info */}
                      <div className="mb-4 p-3 bg-[#0a0f1c]/50 rounded-lg border border-[#2a3441]">
                        <div className="text-xs text-gray-400 mb-1">Organizer Address</div>
                        <div className="text-sm text-gray-300 font-mono">
                          {event.organizer ? `${event.organizer.slice(0, 6)}...${event.organizer.slice(-4)}` : "N/A"}
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleEventStatus(event.eventId)}
                          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            event.approved
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-[#ff4500] hover:bg-[#ff6b35] text-white"
                          }`}
                        >
                          {event.approved ? "Hide" : "Show on web"}
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(event.eventId)
                            toast.success("Event ID copied to clipboard")
                          }}
                          className="px-4 py-2 bg-[#2a3441] hover:bg-[#3a4551] text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Copy ID
                        </button>
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
  )
}