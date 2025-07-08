"use client"

import { X, Calendar, MapPin, Users } from "lucide-react"
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

interface ManageEventModalProps {
  isOpen: boolean
  onClose: () => void
  selectedEvent: Event | null
  handleWithdraw: (eventId: number) => void
  withdrawalLoading: { [key: number]: boolean }
  withdrawnEvents: Set<number>
}

export default function ManageEventModal({
  isOpen,
  onClose,
  selectedEvent,
  handleWithdraw,
  withdrawalLoading,
  withdrawnEvents,
}: ManageEventModalProps) {
  const router = useRouter()

  if (!isOpen || !selectedEvent) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Manage Event</h2>
          <button
            onClick={onClose}
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
                  onClose()
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
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
