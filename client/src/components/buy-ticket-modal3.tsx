"use client"
import { useState } from "react"
import { Calendar, MapPin, Users, X, Clock, Tag, Wallet } from "lucide-react"

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

interface BuyTicketModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
}

export default function BuyTicketModal({ event, isOpen, onClose }: BuyTicketModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen || !event) return null

  const handleBuyTicket = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    // Here you would integrate with actual payment/blockchain logic
    alert(`Successfully purchased ${quantity} ticket(s) for ${event.title}!`)
    onClose()
  }

  const calculateTotal = () => {
    if (event.price === "Free") return "Free"
    const priceValue = Number.parseFloat(event.price.replace(" ETH", ""))
    return `${(priceValue * quantity).toFixed(3)} ETH`
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="relative">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-64 object-cover rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
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
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">{event.title}</h2>
            <div className="flex items-center text-orange-400 text-sm">
              <Tag className="w-4 h-4 mr-2" />
              {event.category}
            </div>
          </div>

          {/* Event Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <Calendar className="w-5 h-5 mr-3 text-orange-400" />
                <div>
                  <div className="font-medium">{event.date}</div>
                  <div className="text-sm text-gray-400">Date</div>
                </div>
              </div>

              <div className="flex items-center text-gray-300">
                <Clock className="w-5 h-5 mr-3 text-orange-400" />
                <div>
                  <div className="font-medium">{event.time}</div>
                  <div className="text-sm text-gray-400">Time</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-3 text-orange-400" />
                <div>
                  <div className="font-medium">{event.location}</div>
                  <div className="text-sm text-gray-400">Location</div>
                </div>
              </div>

              <div className="flex items-center text-gray-300">
                <Users className="w-5 h-5 mr-3 text-orange-400" />
                <div>
                  <div className="font-medium">{event.attendees.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Attendees</div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-3">About This Event</h3>
            <p className="text-gray-300 leading-relaxed">
              Join us for an incredible {event.category.toLowerCase()} experience! This event brings together the best
              minds in the Web3 space for networking, learning, and innovation. Don't miss out on this opportunity to be
              part of the future of decentralized technology.
            </p>
          </div>

          {/* Ticket Selection */}
          {event.price !== "Free" && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Select Tickets</h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-white font-medium">General Admission</div>
                    <div className="text-gray-400 text-sm">Full access to the event</div>
                  </div>
                  <div className="text-2xl font-bold text-white">{event.price}</div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Quantity:</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <span className="text-white font-medium w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Total and Buy Button */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-300">
                <div className="text-sm">
                  Total ({quantity} ticket{quantity !== 1 ? "s" : ""})
                </div>
                <div className="text-3xl font-bold text-white">{calculateTotal()}</div>
              </div>
              <div className="flex items-center text-gray-400">
                <Wallet className="w-5 h-5 mr-2" />
                <span className="text-sm">Secure Web3 Payment</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-lg font-medium transition-colors border border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleBuyTicket}
                disabled={isProcessing}
                className="flex-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 px-8 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2" />
                    {event.price === "Free" ? "Register Now" : "Buy Tickets"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400">
              🔒 Your transaction is secured by blockchain technology. Tickets are issued as NFTs and stored in your
              wallet.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
