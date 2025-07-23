"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { checkCorrectNetwork } from "@/contract/checkNetwork"
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
  startDateTime: string
  endDateTime: string
  organizedBy: string
}

export default function AdminPage() {
  const { address, isConnecting } = useAccount()
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"users" | "events">("users")

  useEffect(() => {
    const check = async () => {
      const isCorrect = await checkCorrectNetwork()
      if (!isCorrect) {
        toast.warning("Please switch to Sepolia Testnet in MetaMask.", {
          duration: Number.POSITIVE_INFINITY,
          dismissible: false,
        })
      }
    }
    check()
  }, [])

  useEffect(() => {
    if (!address && !isConnecting) {
      router.push("/")
    } else {
      setCheckingAuth(false)
    }
  }, [address, isConnecting, router])

  useEffect(() => {
    if (address && !checkingAuth) {
      fetchData()
    }
  }, [address, checkingAuth])

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
        toast.success("Event status updated successfully")
        fetchData() // Refresh data
      } else {
        toast.error("Failed to update event status")
      }
    } catch (error) {
      console.error("Error updating event:", error)
      toast.error("Failed to update event status")
    }
  }

  if (checkingAuth || !address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0505] text-white">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-xl">Loading admin data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-[#0b0505] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <div className="text-sm text-gray-400">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#0b0505] border border-gray-800 rounded-lg p-6">
            <div className="text-2xl font-bold text-white">{users.length}</div>
            <div className="text-gray-400">Total Users</div>
          </div>
          <div className="bg-[#0b0505] border border-gray-800 rounded-lg p-6">
            <div className="text-2xl font-bold text-white">{events.length}</div>
            <div className="text-gray-400">Total Events</div>
          </div>
          <div className="bg-[#0b0505] border border-gray-800 rounded-lg p-6">
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
                ? "bg-white text-black"
                : "bg-[#0b0505] text-gray-400 hover:text-white border border-gray-800"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "events"
                ? "bg-white text-black"
                : "bg-[#0b0505] text-gray-400 hover:text-white border border-gray-800"
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
              <div className="bg-[#0b0505] border border-gray-800 rounded-lg p-12 text-center">
                <div className="text-gray-400 text-lg">No users found</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user, index) => (
                  <div
                    key={user._id}
                    className="bg-[#0b0505] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                  >
                    {/* User Avatar */}
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
                        <div className="text-sm text-gray-300 font-mono bg-black/30 p-2 rounded">
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
                                className="text-xs text-blue-400 hover:text-blue-300 ml-2"
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
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(user._id)
                            toast.success("User ID copied to clipboard")
                          }}
                          className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
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
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
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
              <div className="bg-[#0b0505] border border-gray-800 rounded-lg p-12 text-center">
                <div className="text-gray-400 text-lg">No events found</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div
                    key={event.eventId}
                    className="bg-[#0b0505] border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
                  >
                    {/* Event Image */}
                    <div className="relative h-48 bg-gray-900">
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
                            event.approved ? "bg-green-900 text-green-200" : "bg-yellow-900 text-yellow-200"
                          }`}
                        >
                          {event.approved ? "Approved" : "Pending"}
                        </span>
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-black/70 text-white">
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
                          <span>{event.startDateTime}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <span className="w-16 text-gray-400">Location:</span>
                          <span className="truncate">{event.location || "TBD"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <span className="w-16 text-gray-400">Price:</span>
                          <span>{event.ticketPrice ? `${event.ticketPrice} ETH` : "Free"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <span className="w-16 text-gray-400">By:</span>
                          <span className="truncate">{event.organizedBy || "Unknown"}</span>
                        </div>
                      </div>

                      {/* Organizer Info */}
                      <div className="mb-4 p-3 bg-black/30 rounded-lg">
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
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                        >
                          {event.approved ? "Reject" : "Approve"}
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(event.eventId)
                            toast.success("Event ID copied to clipboard")
                          }}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
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
